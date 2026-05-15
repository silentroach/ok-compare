const TABLE_NODE_TYPES = new Set(['table', 'tableCell', 'tableRow']);

export type MarkdownTreeNode = {
  readonly type: string;
  readonly children?: readonly MarkdownTreeNode[];
};

export const assertNoMarkdownTables = (node: MarkdownTreeNode): void => {
  if (TABLE_NODE_TYPES.has(node.type)) {
    throw new Error('Markdown tables are not supported; use lists.');
  }

  node.children?.forEach(assertNoMarkdownTables);
};
