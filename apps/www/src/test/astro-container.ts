import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { createAstroMarkdownProcessor } from '@/lib/markdown/astro-processor';

const astroMarkdownDefaultsWarning =
  '[astro] `markdown.gfm` and `markdown.smartypants` are deprecated.';

type AstroContainerInstance = Awaited<ReturnType<typeof AstroContainer.create>>;

const isAstroMarkdownDefaultsWarning = (message: unknown): boolean =>
  typeof message === 'string' &&
  message.startsWith(astroMarkdownDefaultsWarning);

export const createAstroContainer =
  async (): Promise<AstroContainerInstance> => {
    const warn = console.warn;

    // Astro Container validates defaults with deprecated markdown fields.
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
            processor: createAstroMarkdownProcessor(),
          },
        },
      });
    } finally {
      console.warn = warn;
    }
  };
