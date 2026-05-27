import { count } from '@shelkovo/format';

import {
  llmsSection,
  markdownList,
  serializeLlmsDocument,
} from '@/lib/markdown/llms-document';
import { absoluteUrl } from '../site';
import { loadMeetingsData } from './load';
import {
  meetingsDataPath,
  meetingsDataUrl,
  meetingsLlmsFullUrl,
  meetingsLlmsUrl,
  meetingsUrl,
} from './routes';

const MEETING_HTML_PATTERN = '/meetings/YYYY-MM-DD/[slug]/';
const MEETING_MARKDOWN_PATTERN = '/meetings/YYYY-MM-DD/[slug]/index.md';

export async function build(kind: 'short' | 'full'): Promise<string> {
  const data = await loadMeetingsData();
  const meeting = data.meetings[0];
  const counts = count(data.meetings.length, ['запись', 'записи', 'записей']);
  const home = absoluteUrl(meetingsUrl());
  const feed = absoluteUrl(meetingsDataUrl());
  const short = absoluteUrl(meetingsLlmsUrl());
  const full = absoluteUrl(meetingsLlmsFullUrl());
  const meetingHtml = meeting?.canonical ?? MEETING_HTML_PATTERN;
  const meetingMarkdown = meeting
    ? absoluteUrl(meeting.markdownUrl)
    : MEETING_MARKDOWN_PATTERN;

  return kind === 'short'
    ? serializeLlmsDocument({
        title: 'Встречи Шелково',
        file: 'llms.txt',
        sections: [
          llmsSection('Описание', [
            markdownList([
              `Раздел встреч хранит публичный архив встреч, созвонов, эфиров и письменных ответов по КП Шелково; сейчас в разделе ${counts}.`,
              'Раздел публичный, но не пункт главного меню: основной редакционный вход для жителей остается в новостях.',
              'Для массового чтения используйте JSON-ленту; HTML и Markdown удобнее для одной встречи и ссылок на доказательные фрагменты.',
              'Расшифровка может отсутствовать; это не ошибка и не признак неполной публикации.',
            ]),
          ]),
          llmsSection('Главные URL', [
            markdownList([
              `Архив встреч: ${home}`,
              `Основной JSON-файл: ${feed}`,
              `Короткий обзор llms.txt: ${short}`,
              `Расширенная версия этого текста: ${full}`,
              `Пример HTML-страницы встречи: ${meetingHtml}`,
              `Пример Markdown-страницы встречи: ${meetingMarkdown}`,
            ]),
          ]),
          llmsSection('Как читать раздел', [
            markdownList([
              'Сначала используйте JSON-ленту для обнаружения встреч и выбора нужной записи.',
              'Для одной встречи открывайте HTML-страницу или соседний Markdown-файл `index.md`.',
              'Для проверки цитат используйте transcript-сегменты и якоря вида `#t-HH-MM-SS`, если transcript есть.',
            ]),
          ]),
        ],
      })
    : serializeLlmsDocument({
        title: 'Встречи Шелково',
        file: 'llms-full.txt',
        sections: [
          llmsSection('Проект', [
            markdownList([
              `Архив встреч - публичная доказательная поверхность для встреч, созвонов, эфиров и письменных ответов по КП Шелково; сейчас в разделе ${counts}.`,
              'Раздел `/meetings/` публичный, но не пункт главного меню.',
              'Маршруты доступны только для чтения и отражают состояние на момент сборки сайта.',
            ]),
          ]),
          llmsSection('Канонические URL', [
            markdownList([
              `HTML-индекс: ${home}`,
              `Короткий обзор llms.txt: ${short}`,
              `Подробный обзор llms-full.txt: ${full}`,
              `Основной JSON-файл: ${feed}`,
              `Пример HTML-страницы встречи: ${meetingHtml}`,
              `Пример Markdown-страницы встречи: ${meetingMarkdown}`,
            ]),
          ]),
          llmsSection('URL patterns', [
            markdownList([
              `HTML-индекс: \`${meetingsUrl()}\``,
              `HTML-страница встречи: \`${MEETING_HTML_PATTERN}\``,
              `Markdown-версия встречи: \`${MEETING_MARKDOWN_PATTERN}\``,
              `JSON-лента: \`${meetingsDataPath()}\``,
            ]),
          ]),
          llmsSection('Описание meetings.json', [
            markdownList([
              'Корневой объект содержит `schemaVersion`, `generatedAt`, `updatedAt`, `totalCount` и массив `meetings`.',
              '`meetings[]` содержит `id`, `date`, `slug`, `title`, `summary`, `htmlUrl` и `markdownUrl`.',
              'Опциональные поля встречи: `format`, `sourceUrl`, `recordingUrl`, `highlights`, `agenda`, `decisions`, `actionItems`, `questions`, `participants`, `documents`, `bodyMarkdown` и `transcript`.',
              '`meetings[].transcript.segments[].anchor` дает устойчивый якорь фрагмента для проверки цитат и ссылок на таймкод.',
            ]),
          ]),
          llmsSection('Рекомендуемый порядок чтения', [
            markdownList([
              'Сначала используйте JSON-ленту для обнаружения и фильтрации встреч.',
              'Затем откройте HTML-страницу или Markdown companion одной встречи для контекста.',
              'После этого проверяйте конкретные цитаты по transcript-сегментам и якорям, если transcript есть.',
            ]),
          ]),
          llmsSection('Ограничения', [
            markdownList([
              'Расшифровка может отсутствовать; это не ошибка и не значит, что встреча опубликована некорректно.',
              'Transcript-сегменты нужны для проверки, но не заменяют summary, решения и открытые вопросы.',
              'Видео сейчас публикуется обычной ссылкой на запись; iframe-встраивание не заявлено до отдельного allowlist и CSP-решения.',
            ]),
          ]),
        ],
      });
}
