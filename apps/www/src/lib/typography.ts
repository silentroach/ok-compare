import Typograf from 'typograf';

interface HastNode {
  readonly type: string;
  readonly tagName?: string;
  value?: string;
  readonly children?: readonly HastNode[];
}

const TYPOGRAPHY_SKIP_TAGS = new Set([
  'code',
  'kbd',
  'math',
  'pre',
  'samp',
  'script',
  'style',
  'textarea',
]);

const typograf = new Typograf({
  locale: ['ru', 'en-US'],
  processingSeparateParts: true,
});

function safeTagPattern(tag: string): RegExp {
  return new RegExp(`<${tag}(?:\\s[^>]*)?>[\\s\\S]*?<\\/${tag}>`, 'gi');
}

for (const tag of TYPOGRAPHY_SKIP_TAGS) {
  typograf.addSafeTag(safeTagPattern(tag));
}

const hasText = (value: string): boolean => /\S/u.test(value);

function visitText(node: HastNode, readonlyParents: readonly string[]): void {
  if (node.type === 'text' && typeof node.value === 'string') {
    if (
      readonlyParents.some((tag) => TYPOGRAPHY_SKIP_TAGS.has(tag)) ||
      !hasText(node.value)
    ) {
      return;
    }

    node.value = typograf.execute(node.value);
    return;
  }

  if (!node.children || node.children.length === 0) {
    return;
  }

  const parents =
    typeof node.tagName === 'string'
      ? [...readonlyParents, node.tagName.toLowerCase()]
      : readonlyParents;

  for (const child of node.children) {
    visitText(child, parents);
  }
}

export function rehypeTypograf() {
  return (tree: HastNode): void => {
    visitText(tree, []);
  };
}

export const formatDynamicHtml = (html: string): string =>
  typograf.execute(html);
