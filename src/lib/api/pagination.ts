/**
 * Cursor-based pagination helpers.
 *
 * Standard interface used by all list endpoints:
 *   GET /api/...?cursor=<id>&limit=<n>
 * Response: { items: T[], nextCursor: string | null, total?: number }
 */

export interface PaginationParams {
  cursor?: string;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  total?: number;
}

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

/**
 * Parse cursor + limit from URLSearchParams with safe defaults.
 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const raw = parseInt(searchParams.get("limit") ?? String(DEFAULT_PAGE_SIZE), 10);
  const limit = Math.max(1, Math.min(isNaN(raw) ? DEFAULT_PAGE_SIZE : raw, MAX_PAGE_SIZE));
  const cursor = searchParams.get("cursor") ?? undefined;
  return { cursor, limit };
}

/**
 * Build the Prisma `take` / `cursor` / `skip` args from pagination params.
 * Fetches `limit + 1` rows so we can determine if there's a next page.
 */
export function buildPrismaPage(
  params: PaginationParams,
  idField: string = "id",
): {
  take: number;
  skip?: number;
  cursor?: Record<string, string>;
} {
  const base = { take: params.limit + 1 };
  if (!params.cursor) return base;
  return { ...base, cursor: { [idField]: params.cursor }, skip: 1 };
}

/**
 * Slice the over-fetched rows array and compute `nextCursor`.
 */
export function buildPage<T extends { id: string }>(
  rows: T[],
  limit: number,
  total?: number,
): PaginatedResponse<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1].id : null;
  const result: PaginatedResponse<T> = { items, nextCursor };
  if (total !== undefined) result.total = total;
  return result;
}

/**
 * Convenience: parse params, build prisma args, and return a ready-to-spread
 * Prisma query fragment.
 *
 * @example
 * const { prismaArgs, respond } = paginationFor(request.nextUrl.searchParams);
 * const rows = await prisma.user.findMany({ ...prismaArgs, where });
 * const total = await prisma.user.count({ where });
 * return NextResponse.json(respond(rows, total));
 */
export function paginationFor(searchParams: URLSearchParams) {
  const params = parsePaginationParams(searchParams);
  const prismaArgs = buildPrismaPage(params);
  return {
    prismaArgs,
    limit: params.limit,
    respond: <T extends { id: string }>(rows: T[], total?: number) =>
      buildPage(rows, params.limit, total),
  };
}
