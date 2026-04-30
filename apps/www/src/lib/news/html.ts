import { marked } from 'marked';
import { formatDynamicHtml } from '../typography';

marked.setOptions({
  gfm: true,
  breaks: false,
});

export function renderNewsMarkdown(markdown: string): string {
  return formatDynamicHtml(marked.parse(markdown, { async: false }) as string);
}
