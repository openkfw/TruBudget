import { chunkArray } from "./chunkArray";

export interface Pagination {
  totalRecords: number;
  limit: number;
  totalPages: number;
  currentPage: number;
  nextPage: string | null;
  prevPage: string | null;
}

export function makePagination<T>(
  route: string,
  records: Array<T>,
  currentChunk: number,
  limit: number,
): Pagination {
  const currentPage = currentChunk + 1;
  const totalPages = Math.ceil(records.length / limit);
  const isNextPage = currentPage + 1 <= totalPages;
  const isPrevPage = currentPage > 1;
  const nextPage = isNextPage ? `${route}?page=${currentPage + 1}&limit=${limit}` : null;
  const prevPage = isPrevPage ? `${route}?page=${currentPage - 1}&limit=${limit}` : null;
  return {
    totalRecords: records.length,
    limit,
    totalPages,
    currentPage,
    nextPage,
    prevPage,
  };
}

export function paginate<T>(
  route: string,
  records: Array<T>,
  queryPage: number | undefined,
  queryLimit: number | undefined,
): [Array<T>, Pagination] {
  const limit = queryLimit || 10;
  const chunkPage = queryPage ? queryPage - 1 : 0;

  const pageChunks = chunkArray(records, limit);
  const items = pageChunks[chunkPage] || [];

  const pagination = makePagination(route, records, chunkPage, limit);

  return [items, pagination];
}
