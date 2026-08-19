"use client";

import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useDebounce } from "@/hooks/use-debounce";
import { env } from "@/shared/constants/env-variables";

const prefix = "wd_";

export const defaultWidgetSearchParams = {
  search: "",
  page: 1,
};

export function useWidgetSearchParams() {
  const [params, setParams] = useQueryStates({
    [`${prefix}search`]: parseAsString.withDefault(defaultWidgetSearchParams.search),
    [`${prefix}page`]: parseAsInteger.withDefault(defaultWidgetSearchParams.page),
  });

  const search = params[`${prefix}search`] as string;
  const page = params[`${prefix}page`] as number;

  const setSearch = (value: string) => {
    void setParams({ [`${prefix}search`]: value });
  };

  const setPage = (value: number) => {
    void setParams({ [`${prefix}page`]: value });
  };

  const debouncedSearch = useDebounce(search, env.NEXT_PUBLIC_DEFAULT_DEBOUNCE_IN_MS, {
    onDebounce: (value) => {
      if (value) setPage(1);
    },
  });

  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  return { search, setSearch, page, setPage, debouncedSearch, clearSearch };
}
