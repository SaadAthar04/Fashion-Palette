"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getParam = (key: string) => searchParams.get(key) || "";
  const getParamArray = (key: string) => {
    const value = searchParams.get(key);
    return value ? value.split(",") : [];
  };

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      // Reset to page 1 when filters change
      if (!("page" in updates)) {
        params.delete("page");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const toggleArrayParam = useCallback(
    (key: string, value: string) => {
      const current = getParamArray(key);
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setParams({ [key]: updated.length > 0 ? updated.join(",") : null });
    },
    [getParamArray, setParams]
  );

  const clearAll = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    brands: getParamArray("brands"),
    sizes: getParamArray("sizes"),
    colors: getParamArray("colors"),
    fabrics: getParamArray("fabrics"),
    occasions: getParamArray("occasions"),
    minPrice: getParam("minPrice"),
    maxPrice: getParam("maxPrice"),
    sort: getParam("sort") || "newest",
    page: parseInt(getParam("page") || "1"),
    setParams,
    toggleArrayParam,
    clearAll,
  };
}
