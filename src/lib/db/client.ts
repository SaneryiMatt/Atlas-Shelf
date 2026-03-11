import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env";
import * as schema from "@/lib/db/schema";

const connectionString = env.DATABASE_URL;

export const databaseAvailable = Boolean(connectionString);

const queryClient = connectionString ? postgres(connectionString, { prepare: false }) : null;

export const db = queryClient ? drizzle(queryClient, { schema }) : null;

