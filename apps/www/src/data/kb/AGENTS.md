# AGENTS.md

Короткие правила для `apps/www/src/data/kb`. Подробное решение: `docs/decisions/015-markdown-first-knowledge-base.md`.

- Markdown-файлы базы знаний лежат в этой папке; корень раздела — `index.md`.
- В frontmatter разрешены `title` и опциональный `flags`; сейчас поддержан только флаг `noindex`.
- `flags: [noindex]` не добавляет страницу в sitemap и ставит на HTML-страницу `robots: noindex, follow`.
- URL строится из пути: `index.md` дает `/kb/`, `services/internet.md` дает `/kb/services/internet/`, `services/index.md` дает `/kb/services/`.
- У каждой HTML-страницы есть Markdown companion: `/kb/index.md` для корня и `/kb/<slug>/index.md` для вложенных страниц.
- В Markdown companion внутренние ссылки на `/kb/.../` ведут на соответствующие `.md` companion-страницы.
- Не создавай одновременно `foo.md` и `foo/index.md`: они конфликтуют за один публичный URL.
- Дочерние страницы не выводятся автоматически. Если раздел должен ссылаться на вложенные материалы, добавь ссылки вручную в Markdown.
- Новости и редакционные объявления идут в `/news`; перебои сервисов, аварии и окна работ — в `/status`, не в `/kb`.
