import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

import { personMarkdownUrl, personUrl } from './routes';

const parser = unified().use(remarkParse).use(remarkGfm);
const SLUG_START = /[a-z0-9]/u;
const SLUG_CHAR = /[a-z0-9-]/u;
const BLOCKED_PREFIX = /[\p{L}\p{N}_]/u;
const ASCII_ALPHANUMERIC = /[A-Za-z0-9]/u;
const TOKEN_DELIMITER = /[\s,;:!?)}\]>'"«»]/u;
const SKIPPED_NODE_TYPES = new Set([
  'code',
  'definition',
  'html',
  'image',
  'imageReference',
  'inlineCode',
  'link',
  'linkReference',
  'yaml',
]);

interface MarkdownPositionPoint {
  readonly offset?: number;
}

interface MarkdownPosition {
  readonly start?: MarkdownPositionPoint;
  readonly end?: MarkdownPositionPoint;
}

interface MarkdownNode {
  readonly type: string;
  readonly children?: readonly MarkdownNode[];
  readonly position?: MarkdownPosition;
}

interface MentionReplacement {
  readonly start: number;
  readonly end: number;
  readonly target: PersonMentionTarget;
}

export interface PersonMentionTarget {
  readonly slug: string;
  readonly name: string;
  readonly html_url: string;
  readonly markdown_url: string;
}

export type PeopleMentionRegistry = ReadonlyMap<string, PersonMentionTarget>;

export interface NormalizedPeopleMentions {
  readonly markdown: string;
  readonly mentions: readonly PersonMentionTarget[];
}

const escapeLinkText = (value: string): string =>
  value.replace(/([\\\[\]])/gu, '\\$1');

const mentionLink = (target: PersonMentionTarget): string =>
  `[${escapeLinkText(target.name)}](${target.html_url})`;

const token = (segment: string, start: number): string => {
  let end = start + 1;

  while (end < segment.length && !TOKEN_DELIMITER.test(segment[end])) {
    end += 1;
  }

  return segment.slice(start, end);
};

const failMention = (context: string, message: string): never => {
  throw new Error(`${context} ${message}`);
};

const absoluteOffsets = (
  node: MarkdownNode,
  context: string,
): {
  readonly start: number;
  readonly end: number;
} => {
  const start = node.position?.start?.offset;
  const end = node.position?.end?.offset;

  if (start === undefined || end === undefined) {
    throw new Error(`${context} is missing markdown source offsets`);
  }

  return { start, end };
};

function collectTextNodes(
  node: MarkdownNode,
  context: string,
): readonly {
  readonly node: MarkdownNode;
  readonly start: number;
  readonly end: number;
}[] {
  if (SKIPPED_NODE_TYPES.has(node.type)) {
    return [];
  }

  if (node.type === 'text') {
    const { start, end } = absoluteOffsets(node, context);

    return [{ node, start, end }];
  }

  return (node.children ?? []).flatMap((child) =>
    collectTextNodes(child, context),
  );
}

const invalidMentionTail = (
  tail: string | undefined,
  next: string | undefined,
) =>
  tail === '_' ||
  tail === '/' ||
  tail === '@' ||
  tail === '\\' ||
  (tail === '.' && next !== undefined && ASCII_ALPHANUMERIC.test(next));

function mentionReplacements(
  segment: string,
  absoluteStart: number,
  context: string,
  registry: PeopleMentionRegistry,
): readonly MentionReplacement[] {
  const replacements: MentionReplacement[] = [];

  for (let index = 0; index < segment.length; index += 1) {
    if (segment[index] !== '@') {
      continue;
    }

    const previous = index > 0 ? segment[index - 1] : undefined;

    if (
      previous === '\\' ||
      previous === '/' ||
      (previous !== undefined && BLOCKED_PREFIX.test(previous))
    ) {
      continue;
    }

    const start = index + 1;
    const head = segment[start];

    if (!head) {
      failMention(context, 'contains empty person mention "@"');
    }

    if (!SLUG_START.test(head)) {
      failMention(
        context,
        `contains invalid person mention "${token(segment, index)}"`,
      );
    }

    let end = start;

    while (end < segment.length && SLUG_CHAR.test(segment[end])) {
      end += 1;
    }

    const slug = segment.slice(start, end);
    const tail = segment[end];
    const next = segment[end + 1];

    if (invalidMentionTail(tail, next)) {
      failMention(
        context,
        `contains invalid person mention "${token(segment, index)}"`,
      );
    }

    const target = registry.get(slug);

    if (target === undefined) {
      failMention(context, `contains unknown person mention "@${slug}"`);
    }

    replacements.push({
      start: absoluteStart + index,
      end: absoluteStart + end,
      target: target!,
    });

    index = end - 1;
  }

  return replacements;
}

export const createPersonMentionTarget = (
  slug: string,
  name: string,
): PersonMentionTarget => ({
  slug,
  name,
  html_url: personUrl(slug),
  markdown_url: personMarkdownUrl(slug),
});

export const normalizePeopleMentions = (input: {
  readonly markdown: string;
  readonly context: string;
  readonly registry: PeopleMentionRegistry;
}): NormalizedPeopleMentions => {
  if (!input.markdown.includes('@')) {
    return {
      markdown: input.markdown,
      mentions: [],
    };
  }

  const tree = parser.parse(input.markdown) as MarkdownNode;
  const replacements = collectTextNodes(tree, input.context)
    .flatMap(({ start, end }) =>
      mentionReplacements(
        input.markdown.slice(start, end),
        start,
        input.context,
        input.registry,
      ),
    )
    .sort((a, b) => a.start - b.start || a.end - b.end);

  if (replacements.length === 0) {
    return {
      markdown: input.markdown,
      mentions: [],
    };
  }

  let cursor = 0;
  let markdown = '';
  const mentions = new Map<string, PersonMentionTarget>();

  for (const replacement of replacements) {
    markdown += `${input.markdown.slice(cursor, replacement.start)}${mentionLink(replacement.target)}`;
    cursor = replacement.end;

    if (!mentions.has(replacement.target.slug)) {
      mentions.set(replacement.target.slug, replacement.target);
    }
  }

  markdown += input.markdown.slice(cursor);

  return {
    markdown,
    mentions: [...mentions.values()],
  };
};
