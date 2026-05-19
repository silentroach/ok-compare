import { expect } from 'vitest';

import {
  surfaceHref,
  type PublicSurface,
  type PublicSurfaceCatalogRole,
  type PublicSurfaceSlice,
} from './index';

type CatalogEntry = {
  readonly href?: string;
};

type CatalogLinkset = {
  readonly anchor?: string;
  readonly item?: readonly CatalogEntry[];
  readonly 'service-desc'?: readonly CatalogEntry[];
};

type AssertSectionCatalogInput = {
  readonly catalog: (root: string) => Record<string, unknown>;
  readonly catalogRoot?: string;
  readonly siteRoot: string;
  readonly slice: PublicSurfaceSlice;
};

const linksets = (
  catalog: Record<string, unknown>,
): readonly CatalogLinkset[] =>
  Array.isArray(catalog.linkset) ? (catalog.linkset as CatalogLinkset[]) : [];

const hrefs = (
  catalog: Record<string, unknown>,
  role: PublicSurfaceCatalogRole,
): readonly string[] =>
  linksets(catalog).flatMap((linkset) => {
    if (role === 'anchor') {
      return linkset.anchor ? [linkset.anchor] : [];
    }

    return (linkset[role] ?? []).flatMap((entry) =>
      entry.href ? [entry.href] : [],
    );
  });

const sectionCatalogRole = (
  surface: PublicSurface,
): PublicSurfaceCatalogRole | false | undefined =>
  surface.sectionCatalogRole ?? surface.catalogRole;

export const expectSectionCatalogMatchesRegistry = ({
  catalog,
  catalogRoot,
  siteRoot,
  slice,
}: AssertSectionCatalogInput): void => {
  const body = catalog(catalogRoot ?? siteRoot);

  for (const role of ['anchor', 'item', 'service-desc'] as const) {
    const actual = hrefs(body, role);
    const expected = slice.surfaces
      .filter((surface) => sectionCatalogRole(surface) === role)
      .map((surface) => surfaceHref(siteRoot, surface));

    expect(actual, `${slice.owner.id} catalog ${role} hrefs`).toEqual(
      expect.arrayContaining(expected),
    );
  }
};
