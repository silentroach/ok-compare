import {
  createMarkdownDocument,
  parseMarkdownFragment,
  serializeMarkdownDocument,
  md,
} from '@shelkovo/markdown';

type MarkdownNode = ReturnType<typeof parseMarkdownFragment>[number];

const LINE_BREAK = '\n';
const HEADING = /^#{1,6} /u;

const parseBlock = (lines: readonly string[]): readonly MarkdownNode[] =>
  lines.length > 0 ? parseMarkdownFragment(lines.join(LINE_BREAK)) : [];

export const serializeMarkdownLineDocument = (
  lines: readonly string[],
  sectionTitles: ReadonlySet<string>,
): string => {
  const children: MarkdownNode[] = [];
  let blockLines: string[] = [];

  const flushBlock = () => {
    children.push(...parseBlock(blockLines));
    blockLines = [];
  };

  lines.forEach((line, index) => {
    if (HEADING.test(line)) {
      flushBlock();
      children.push(...parseMarkdownFragment(line));
      return;
    }

    if (index === 0 || sectionTitles.has(line)) {
      flushBlock();
      children.push(md.heading(index === 0 ? 1 : 2, line));
      return;
    }

    blockLines.push(line);
  });

  flushBlock();

  return serializeMarkdownDocument(createMarkdownDocument({ children }));
};
