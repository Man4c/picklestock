"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, Search } from "lucide-react";

export function ServerSearch({
  initialQuery,
  placeholder,
  queryParam = "q",
  pageParam = "page",
  className = "",
}: {
  initialQuery: string;
  placeholder: string;
  queryParam?: string;
  pageParam?: string;
  className?: string;
}) {
  return (
    <SearchInput
      key={initialQuery}
      initialQuery={initialQuery}
      placeholder={placeholder}
      queryParam={queryParam}
      pageParam={pageParam}
      className={className}
    />
  );
}

function SearchInput({
  initialQuery,
  placeholder,
  queryParam,
  pageParam,
  className,
}: {
  initialQuery: string;
  placeholder: string;
  queryParam: string;
  pageParam: string;
  className: string;
}) {
  const [value, setValue] = useState(initialQuery);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (value.trim() === initialQuery) return;
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const query = value.trim();
      if (query) params.set(queryParam, query);
      else params.delete(queryParam);
      params.delete(pageParam);
      const queryString = params.toString();
      startTransition(() =>
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        }),
      );
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [initialQuery, pageParam, pathname, queryParam, router, searchParams, value]);

  return (
    <div className={`relative ${className}`}>
      {pending ? (
        <LoaderCircle
          size={18}
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 animate-spin text-secondary"
        />
      ) : (
        <Search
          size={18}
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-status-muted"
        />
      )}
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label={placeholder}
        placeholder={placeholder}
        className="w-full rounded-input border border-border-subtle bg-surface-input py-2.5 pl-10 pr-4 font-body-md text-body-md text-on-surface placeholder:text-status-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
