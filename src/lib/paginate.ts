export interface Paginated<T> {
  data: T[];
  currentPage: number;
  lastPage: number;
  total: number;
  size: number;
}

export function paginate<T>(items: T[], opts: { page: number; pageSize: number }): Paginated<T> {
  const { page, pageSize } = opts;
  const total = items.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), lastPage);
  const start = (currentPage - 1) * pageSize;
  const data = items.slice(start, start + pageSize);

  return { data, currentPage, lastPage, total, size: pageSize };
}
