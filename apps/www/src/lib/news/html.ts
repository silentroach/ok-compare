import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: false,
});

export function renderNewsMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}
