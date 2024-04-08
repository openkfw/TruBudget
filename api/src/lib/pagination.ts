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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  optionalParams: Record<string, any>,
): Pagination {
  const currentPage = currentChunk + 1;
  const totalPages = Math.ceil(records.length / limit);
  const isNextPage = currentPage + 1 <= totalPages;
  const isPrevPage = currentPage > 1;
  const optionalQuery = new URLSearchParams(
    Object.fromEntries(
      Object.entries(optionalParams).filter(([key, value]) => value !== undefined),
    ),
  ).toString();
  const nextPage = isNextPage
    ? `${route}?page=${currentPage + 1}&limit=${limit}&${optionalQuery}`
    : null;
  const prevPage = isPrevPage
    ? `${route}?page=${currentPage - 1}&limit=${limit}&${optionalQuery}`
    : null;
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
  query: {
    page: string | number;
    limit: string | number;
    order?: string;
    search?: string;
    sort?: string;
  },
): [Array<T>, Pagination] {
  const limit = isNaN(Number(query?.limit)) ? 10 : Number(query.limit);
  const chunkPage = isNaN(Number(query?.page)) ? 0 : Number(query.page) - 1;

  const pageChunks = chunkArray(records, limit);
  const items = pageChunks[chunkPage] || [];

  const pagination = makePagination(route, records, chunkPage, limit, {
    search: query.search,
    sort: query.sort,
    order: query.order,
  });

  return [items, pagination];
}
