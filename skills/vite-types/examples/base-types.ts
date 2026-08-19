import type { QueryKey } from "@tanstack/react-query";

export interface DefaultPaginatedResponse<T> {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: Array<T>;
}

export interface DefaultPaginationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface BaseDates {
  createdAt: Date;
  updatedAt: Date | null;
}

export interface BaseCallbackArgs<TResponse = unknown> {
  on_success?: (data?: TResponse) => void;
  on_fail?: (error?: unknown) => void;
  query_keys_to_invalidate?: QueryKey;
}

export interface BaseActionArgs<TForm, TResponse = unknown> extends BaseCallbackArgs<TResponse> {
  form_data: TForm;
}
