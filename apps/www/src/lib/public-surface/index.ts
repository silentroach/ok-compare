import type {
  PublicSurface,
  PublicSurfaceId,
  PublicSurfaceLinksetItem,
  PublicSurfaceOwner,
  PublicSurfaceOwnerId,
  PublicSurfaceRegistry,
  PublicSurfaceSlice,
} from './types';
import { comparePublicSurfaceSlice } from '@/compare/lib/public-surface';
import { newsPublicSurfaceSlice } from '@/lib/news/public-surface';
import { peoplePublicSurfaceSlice } from '@/lib/people/public-surface';
import { reglamentPublicSurfaceSlice } from '@/lib/reglament/public-surface';
import { rootPublicSurfaceSlice } from '@/lib/root-public-surface';
import { statusPublicSurfaceSlice } from '@/lib/status/public-surface';

const absoluteUrl = (root: string, path: string): string =>
  new URL(path.replace(/^\//, ''), `${root.replace(/\/$/, '')}/`).toString();

export const surfaceHref = (root: string, surface: PublicSurface): string =>
  surface.path === undefined
    ? surface.routePattern
    : absoluteUrl(root, surface.path);

export const surfaceToLinksetItem = (
  root: string,
  surface: PublicSurface,
): PublicSurfaceLinksetItem => ({
  href: surfaceHref(root, surface),
  type: surface.mediaType,
  ...(surface.linkRelations?.length
    ? { rel: surface.linkRelations.map((link) => link.rel) }
    : {}),
  ...(surface.label ? { title: surface.label } : {}),
});

export const createPublicSurfaceRegistry = (
  slices: readonly PublicSurfaceSlice[],
): PublicSurfaceRegistry => {
  const sections = slices.map((slice) => slice.owner);
  const surfaces = slices.flatMap((slice) => slice.surfaces);
  const ownerBySurfaceId = new Map<PublicSurfaceId, PublicSurfaceOwner>(
    slices.flatMap((slice) =>
      slice.surfaces.map((surface) => [surface.id, slice.owner] as const),
    ),
  );
  const surfacesByOwnerId = new Map<
    PublicSurfaceOwnerId,
    readonly PublicSurface[]
  >(slices.map((slice) => [slice.owner.id, slice.surfaces] as const));

  return {
    sections,
    surfaces,
    slices,
    surfaceOwner: (surfaceId) => ownerBySurfaceId.get(surfaceId),
    surfacesByOwner: (ownerId) => surfacesByOwnerId.get(ownerId) ?? [],
  };
};

export const publicSurfaceRegistry = createPublicSurfaceRegistry([
  rootPublicSurfaceSlice,
  newsPublicSurfaceSlice,
  statusPublicSurfaceSlice,
  peoplePublicSurfaceSlice,
  reglamentPublicSurfaceSlice,
  comparePublicSurfaceSlice,
]);

export { comparePublicSurfaceSlice } from '@/compare/lib/public-surface';
export { newsPublicSurfaceSlice } from '@/lib/news/public-surface';
export { peoplePublicSurfaceSlice } from '@/lib/people/public-surface';
export { reglamentPublicSurfaceSlice } from '@/lib/reglament/public-surface';
export { rootPublicSurfaceSlice } from '@/lib/root-public-surface';
export { statusPublicSurfaceSlice } from '@/lib/status/public-surface';

export type {
  PublicSurface,
  PublicSurfaceAcceptNegotiation,
  PublicSurfaceCacheClass,
  PublicSurfaceCatalogRole,
  PublicSurfaceDiscoveryRole,
  PublicSurfaceId,
  PublicSurfaceLinkRelation,
  PublicSurfaceLinksetItem,
  PublicSurfaceOwner,
  PublicSurfaceOwnerId,
  PublicSurfaceRegistry,
  PublicSurfaceSlice,
} from './types';
