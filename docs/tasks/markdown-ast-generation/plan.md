# Plan

1. Step 1 - Add package Markdown AST API
   - Demo: `@shelkovo/markdown` exports tested primitives to create mdast documents, parse fragments, serialize documents, and generate YAML frontmatter.
   - Expected wave: implement `01-package-markdown-ast-api.md` with package tests and package typecheck.

2. Step 2 - Migrate section companion Markdown
   - Demo: news, status, people, reglament, and Compare companion `.md` generators use the package AST API while preserving public routes and document meaning.
   - Expected wave: implement task files 02 through 07, keeping each section independently verifiable.

3. Step 3 - Migrate llms generators
   - Demo: section, root, reglament, and Compare `llms.txt` / `llms-full.txt` outputs are generated through the package AST API and remain Markdown-compatible `.txt` discovery surfaces.
   - Expected wave: implement task files 08 and 09 with focused discovery/llms tests.

4. Step 4 - Cleanup and final verification
   - Demo: old frontmatter/string-document helpers are removed or explicitly justified, package docs explain generation vs render, and final checks pass or have recorded blockers.
   - Expected wave: implement `10-cleanup-and-final-verification.md` with final package/app verification.
