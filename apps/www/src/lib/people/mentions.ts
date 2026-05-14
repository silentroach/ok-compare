import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

import {
  isPersonNameCase,
  PERSON_DEFAULT_NAME_CASE,
  type PersonAlternateNameCase,
  type PersonNameCase,
  type PersonNameCaseForms,
} from './name-cases';
import { personMarkdownUrl, personUrl } from './routes';

const parser = unified().use(remarkParse).use(remarkGfm);
const SLUG_START = /[a-z0-9]/u;
const SLUG_CHAR = /[a-z0-9-]/u;
const CASE_CHAR = /[a-z]/u;
const BLOCKED_PREFIX = /[\p{L}\p{N}_]/u;
const ASCII_ALPHANUMERIC = /[A-Za-z0-9]/u;
const TOKEN_DELIMITER = /[\s,;!?)}\]>'"«»]/u;
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
  readonly url?: string;
}

interface MentionReplacement {
  readonly start: number;
  readonly end: number;
  readonly markdown: string;
  readonly target: PersonMentionTarget;
}

export interface PersonMentionTarget {
  readonly slug: string;
  readonly name: string;
  readonly name_cases?: PersonNameCaseForms;
  readonly company?: string;
  readonly position?: string;
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

const escapeLinkTitle = (value: string): string =>
  value.replace(/([\\"])/gu, '\\$1');

const mentionTitle = (target: PersonMentionTarget): string | undefined => {
  const parts = [target.position, target.company].filter(
    (item): item is string => item !== undefined,
  );

  return parts.length > 0 ? parts.join(', ') : undefined;
};

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

const mentionName = (
  target: PersonMentionTarget,
  nameCase: PersonNameCase,
  context: string,
): string => {
  if (nameCase === PERSON_DEFAULT_NAME_CASE) {
    return target.name;
  }

  const alternateNameCase: PersonAlternateNameCase = nameCase;
  const name = target.name_cases?.[alternateNameCase];

  return (
    name ??
    failMention(
      context,
      `contains person mention "@${target.slug}:${nameCase}", but person "${target.slug}" has no "${nameCase}" name case`,
    )
  );
};

const mentionLink = (
  target: PersonMentionTarget,
  nameCase: PersonNameCase,
  context: string,
): string => {
  const title = mentionTitle(target);
  const titlePart = title ? ` "${escapeLinkTitle(title)}"` : '';

  return `[${escapeLinkText(mentionName(target, nameCase, context))}](${target.html_url}${titlePart})`;
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

const labelledMentionSlug = (
  url: string,
  context: string,
): string | undefined => {
  if (url[0] !== '@') {
    return undefined;
  }

  const slug = url.slice(1);

  for (let index = 0; index < slug.length; index += 1) {
    if (
      slug[index] === ':' &&
      index > 0 &&
      CASE_CHAR.test(slug[index + 1] ?? '')
    ) {
      failMention(
        context,
        `contains unsupported labelled person mention "@${slug}"; write the needed grammar in the visible link text`,
      );
    }
  }

  return slug.length > 0 &&
    SLUG_START.test(slug[0] ?? '') &&
    [...slug].every((char) => SLUG_CHAR.test(char))
    ? slug
    : undefined;
};

const linkDestinationOffsets = (
  markdown: string,
  node: MarkdownNode,
  context: string,
): {
  readonly start: number;
  readonly end: number;
} => {
  const { start, end } = absoluteOffsets(node, context);
  const source = markdown.slice(start, end);
  const destinationStartMarker = source.lastIndexOf('](');

  if (destinationStartMarker === -1) {
    throw new Error(
      `${context} contains a labelled person mention with unsupported link syntax`,
    );
  }

  const destinationStart = destinationStartMarker + 2;
  const isAngleWrapped = source[destinationStart] === '<';
  const urlStart = start + destinationStart + (isAngleWrapped ? 1 : 0);

  return {
    start: urlStart,
    end: urlStart + (node.url?.length ?? 0),
  };
};

function collectLabelledMentionReplacements(
  node: MarkdownNode,
  markdown: string,
  context: string,
  registry: PeopleMentionRegistry,
): readonly MentionReplacement[] {
  if (SKIPPED_NODE_TYPES.has(node.type) && node.type !== 'link') {
    return [];
  }

  if (node.type === 'link' && node.url !== undefined) {
    const slug = labelledMentionSlug(node.url, context);

    if (slug === undefined) {
      return [];
    }

    const target =
      registry.get(slug) ??
      failMention(context, `contains unknown person mention "@${slug}"`);

    return [
      {
        ...linkDestinationOffsets(markdown, node, context),
        markdown: target.html_url,
        target,
      },
    ];
  }

  return (node.children ?? []).flatMap((child) =>
    collectLabelledMentionReplacements(child, markdown, context, registry),
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
  tail === '-' ||
  (tail === ':' && next !== undefined && !/\s/u.test(next)) ||
  (tail !== undefined && BLOCKED_PREFIX.test(tail)) ||
  (tail === '.' && next !== undefined && ASCII_ALPHANUMERIC.test(next));

const mentionCase = (
  segment: string,
  mentionStart: number,
  slugEnd: number,
  context: string,
): {
  readonly name_case: PersonNameCase;
  readonly end: number;
} => {
  if (segment[slugEnd] !== ':' || !CASE_CHAR.test(segment[slugEnd + 1] ?? '')) {
    return {
      name_case: PERSON_DEFAULT_NAME_CASE,
      end: slugEnd,
    };
  }

  let end = slugEnd + 1;

  while (end < segment.length && CASE_CHAR.test(segment[end])) {
    end += 1;
  }

  const nameCase = segment.slice(slugEnd + 1, end);

  if (isPersonNameCase(nameCase)) {
    return {
      name_case: nameCase,
      end,
    };
  }

  return failMention(
    context,
    `contains invalid person mention "${token(segment, mentionStart)}"`,
  );
};

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
    const nameCase = mentionCase(segment, index, end, context);
    const tail = segment[nameCase.end];
    const next = segment[nameCase.end + 1];

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
      end: absoluteStart + nameCase.end,
      markdown: mentionLink(target!, nameCase.name_case, context),
      target: target!,
    });

    index = nameCase.end - 1;
  }

  return replacements;
}

export const createPersonMentionTarget = (
  slug: string,
  name: string,
  name_cases?: PersonNameCaseForms,
  company?: string,
  position?: string,
): PersonMentionTarget => ({
  slug,
  name,
  ...(name_cases ? { name_cases } : {}),
  ...(company ? { company } : {}),
  ...(position ? { position } : {}),
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
  const replacements = [
    ...collectTextNodes(tree, input.context).flatMap(({ start, end }) =>
      mentionReplacements(
        input.markdown.slice(start, end),
        start,
        input.context,
        input.registry,
      ),
    ),
    ...collectLabelledMentionReplacements(
      tree,
      input.markdown,
      input.context,
      input.registry,
    ),
  ].sort((a, b) => a.start - b.start || a.end - b.end);

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
    markdown += `${input.markdown.slice(cursor, replacement.start)}${replacement.markdown}`;
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
