import type { Metadata } from "next";

import { getBooksPageData } from "@/lib/db/queries/books";
import { BooksOverview } from "@/modules/books/components/books-overview";

export const metadata: Metadata = {
  title: "书籍"
};

export default async function BooksPage() {
  const data = await getBooksPageData();

  return <BooksOverview {...data} />;
}

