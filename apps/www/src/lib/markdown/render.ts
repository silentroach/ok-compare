import { render } from '@shelkovo/markdown';

import { normalizeEntityMentions } from '../mentions';
import type {
  EntityMentionSourceEntity,
  SiteMentionRegistry,
} from '../mentions';
import type {
  PreprocessedSiteMarkdown,
  RenderSiteMarkdownOptions,
} from './render.types';
import {
  normalizeContentDiffMarkdown,
  renderContentDiffBlocks,
} from './content-diff';
import { renderFileLinks } from './file-links';

const FENCED_CODE_BLOCK_LINE = /^[ \t]{0,3}(`{3,}|~{3,})/;
const HYPHENATED_ORDERED_LIST_ITEM_LINE = /^([ \t]*)-\s+(\d+)([.)])(\s+)/;
const MARKDOWN_SECTION_BOUNDARY_LINE = /^[ \t]{0,3}(?:#{1,6}\s|[-*_]{3,}\s*$)/;
const TOP_LEVEL_ORDERED_LIST_ITEM_LINE = /^([ \t]{0,3})(\d+)\.(\s+)/;
const LEGAL_SUBCLAUSE_LINE = /^[ \t]{0,3}(\d+)\.\d+(?:\.\d+)*\.\s+/;

const normalizeHyphenatedOrderedListMarkdown = (markdown: string): string => {
  let fenceMarker: string | undefined;
  let fenceLength = 0;

  return markdown
    .split('\n')
    .map((line) => {
      const fence = FENCED_CODE_BLOCK_LINE.exec(line)?.[1];

      if (fence) {
        const marker = fence[0];

        if (!fenceMarker) {
          fenceMarker = marker;
          fenceLength = fence.length;

          return line;
        }

        if (marker === fenceMarker && fence.length >= fenceLength) {
          fenceMarker = undefined;
          fenceLength = 0;
        }

        return line;
      }

      return fenceMarker
        ? line
        : line.replace(HYPHENATED_ORDERED_LIST_ITEM_LINE, '$1$2$3$4');
    })
    .join('\n');
};

const hasMatchingLegalSubclause = (
  lines: readonly string[],
  startIndex: number,
  prefix: string,
): boolean => {
  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index] ?? '';

    if (
      FENCED_CODE_BLOCK_LINE.test(line) ||
      MARKDOWN_SECTION_BOUNDARY_LINE.test(line)
    ) {
      return false;
    }

    if (TOP_LEVEL_ORDERED_LIST_ITEM_LINE.test(line)) {
      return false;
    }

    if (LEGAL_SUBCLAUSE_LINE.exec(line)?.[1] === prefix) {
      return true;
    }
  }

  return false;
};

const escapeLegalOutlineTopLevelMarkers = (markdown: string): string => {
  let fenceMarker: string | undefined;
  let fenceLength = 0;
  const lines = markdown.split('\n');

  return lines
    .map((line, index) => {
      const fence = FENCED_CODE_BLOCK_LINE.exec(line)?.[1];

      if (fence) {
        const marker = fence[0];

        if (!fenceMarker) {
          fenceMarker = marker;
          fenceLength = fence.length;

          return line;
        }

        if (marker === fenceMarker && fence.length >= fenceLength) {
          fenceMarker = undefined;
          fenceLength = 0;
        }

        return line;
      }

      if (fenceMarker) {
        return line;
      }

      const topLevelMarker = TOP_LEVEL_ORDERED_LIST_ITEM_LINE.exec(line);

      return topLevelMarker &&
        hasMatchingLegalSubclause(lines, index + 1, topLevelMarker[2] ?? '')
        ? line.replace(TOP_LEVEL_ORDERED_LIST_ITEM_LINE, '$1$2\\.$3')
        : line;
    })
    .join('\n');
};

export type {
  PreprocessedSiteMarkdown,
  PreprocessedSiteMarkdownBody,
  RenderEntityMentionsOptions,
  RenderSiteMarkdownOptions,
} from './render.types';

export const preprocessSiteMarkdown = (
  markdown: string,
  options?: RenderSiteMarkdownOptions,
): PreprocessedSiteMarkdown => {
  const normalizedMarkdown = escapeLegalOutlineTopLevelMarkers(
    normalizeHyphenatedOrderedListMarkdown(markdown),
  );

  if (!options?.mentions) {
    return {
      markdown: normalizedMarkdown,
      mentions: [],
    };
  }

  return normalizeEntityMentions({
    markdown: normalizedMarkdown,
    context: options.mentions.context,
    registry: options.mentions.registry,
    sourceEntity: options.mentions.sourceEntity,
  });
};

export const preprocessSiteMarkdownContent = (
  markdown: string,
  context: string,
  registry: SiteMentionRegistry,
  sourceEntity?: EntityMentionSourceEntity,
): PreprocessedSiteMarkdown => {
  const body = markdown.trimEnd();

  return body.trim().length > 0
    ? preprocessSiteMarkdown(body, {
        mentions: {
          context,
          registry,
          sourceEntity,
        },
      })
    : {
        markdown: '',
        mentions: [],
      };
};

export const renderMarkdown = (
  markdown: string,
  options?: RenderSiteMarkdownOptions,
): string => {
  const preprocessed = preprocessSiteMarkdown(markdown, options).markdown;

  return renderFileLinks(
    renderContentDiffBlocks(render(normalizeContentDiffMarkdown(preprocessed))),
  );
};
