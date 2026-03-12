import type { Metadata } from "next";

import { getBooksPageData } from "@/lib/db/queries/books";
import { BooksOverview } from "@/modules/books/components/books-overview";

export const metadata: Metadata = {
  title: "书籍"
};

export default async function BooksPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const data = await getBooksPageData(params);

  return <BooksOverview {...data} />;
}
