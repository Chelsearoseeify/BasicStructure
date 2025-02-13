export interface Page<T> {
  content: Array<T>;
  last: boolean;
  totalPages: number;
  totalElements: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  size: number;
  number: number;
}
