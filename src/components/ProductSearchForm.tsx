"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SORT_FIELDS, SearchQuerySchema } from "@/lib/products";
import type { SearchQuery } from "@/lib/products";

type ProductSearchFormProps = {
  initialQuery: SearchQuery;
};

// Client Component: ตรวจฟอร์มด้วย Zod แล้วเปลี่ยน URL
// หน้า Server Component จะอ่านค่าจาก searchParams แล้วค้นหาฝั่ง server
export default function ProductSearchForm({ initialQuery }: ProductSearchFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchQuery>({
    resolver: zodResolver(SearchQuerySchema),
    mode: "onTouched",
    defaultValues: initialQuery,
  });

  function search(query: SearchQuery) {
    const params = new URLSearchParams({
      q: query.q,
      limit: String(query.limit),
      sortBy: query.sortBy,
    });
    router.push(`/?${params.toString()}`);
  }

  return (
    <form className="search-form" onSubmit={handleSubmit(search)} noValidate>
      <input
        id="q"
        className="search-input"
        {...register("q")}
        placeholder="ค้นหาสินค้า"
      />

      <select id="sortBy" className="search-select" {...register("sortBy")}>
        {SORT_FIELDS.map((field) => (
          <option key={field} value={field}>เรียงตาม {field}</option>
        ))}
      </select>

      <div className="search-limit">
        <input
          id="limit"
          className="search-limit-input"
          type="number"
          required
          {...register("limit", { valueAsNumber: true })}
          aria-invalid={!!errors.limit}
          aria-describedby="limit-error"
        />
        <span id="limit-error" className="field-error" role="alert">{errors.limit?.message}</span>
      </div>

      <button type="submit" className="btn btn-primary">ค้นหา</button>
    </form>
  );
}
