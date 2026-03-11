import { bookBacklog, bookNotes, booksStats, currentBooks } from "@/lib/db/mock-data";
import { databaseAvailable } from "@/lib/db/client";

export async function getBooksPageData() {
  if (databaseAvailable) {
    // TODO: Hydrate from book_details joined to items once the project is connected to Postgres.
  }

  return {
    stats: booksStats,
    currentBooks,
    backlog: bookBacklog,
    notes: bookNotes
  };
}

