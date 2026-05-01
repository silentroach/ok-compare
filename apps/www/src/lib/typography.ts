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

const SHELKOVO_PART_RULE = 'ru/nbsp/shelkovoPartName';

if (!Typograf.getRule(SHELKOVO_PART_RULE)) {
  Typograf.addRule({
    name: SHELKOVO_PART_RULE,
    // Keep brand compounds like "Шелково Ривер" on one line.
    handler: (text) => text.replace(/Шелково (?=[A-ZА-ЯЁ])/gu, 'Шелково\u00A0'),
  });
}

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

const edge = (value: string, pattern: RegExp): string =>
  value.match(pattern)?.[0] ?? '';

function formatTextNode(value: string): string {
  const prefix = edge(value, /^\s+/u);
  const suffix = edge(value, /\s+$/u);
  const start = prefix.length;
  const end = value.length - suffix.length;
  const core = value.slice(start, end);

  return core ? `${prefix}${typograf.execute(core)}${suffix}` : value;
}

function visitText(node: HastNode, readonlyParents: readonly string[]): void {
  if (node.type === 'text' && typeof node.value === 'string') {
    if (
      readonlyParents.some((tag) => TYPOGRAPHY_SKIP_TAGS.has(tag)) ||
      !hasText(node.value)
    ) {
      return;
    }

    node.value = formatTextNode(node.value);
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
