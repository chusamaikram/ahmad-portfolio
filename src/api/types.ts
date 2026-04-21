export type Pagination = {
  page: number;
  count: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
};

export type PaginatedResponse<T> = {
  results: T[];
  pagination: Pagination;
};

export const parsePaginated = <T>(data: any, mapper: (d: any) => T): PaginatedResponse<T> => {
  if (Array.isArray(data)) {
    const results = data.map(mapper);
    return { results, pagination: { page: 1, count: results.length, page_size: results.length, total_count: results.length, total_pages: 1, has_next: false, has_previous: false } };
  }
  return { results: (data.results ?? []).map(mapper), pagination: data.pagination };
};
