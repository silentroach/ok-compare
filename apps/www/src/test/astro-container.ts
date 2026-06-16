import { unified } from '@astrojs/markdown-remark';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

const astroMarkdownDefaultsWarning =
  '[astro] `markdown.gfm` and `markdown.smartypants` are deprecated. Move them onto your processor instead (e.g. `unified({ gfm: false, smartypants: false })`). Will be removed in a future major.';

type AstroContainerInstance = Awaited<ReturnType<typeof AstroContainer.create>>;

const isAstroMarkdownDefaultsWarning = (message: unknown): boolean =>
  typeof message === 'string' && message === astroMarkdownDefaultsWarning;

export const createAstroContainer =
  async (): Promise<AstroContainerInstance> => {
    const warn = console.warn;

    // Astro 6.4.4 validates Container defaults with deprecated markdown fields.
    // Keep this local so app config deprecation warnings still surface normally.
    console.warn = (message?: unknown, ...args: readonly unknown[]): void => {
      if (isAstroMarkdownDefaultsWarning(message)) {
        return;
      }

      warn(message, ...args);
    };

    try {
      return await AstroContainer.create({
        astroConfig: {
          markdown: {
            processor: unified({ gfm: true, smartypants: true }),
          },
        },
      });
    } finally {
      console.warn = warn;
    }
  };
