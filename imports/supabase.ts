export * from "jsr:@supabase/supabase-js@2.46.1";
import { createClient } from "./supabase.ts";
import { Database } from "../assets/db/database.types.ts";
export type { Database };

export const supabase = createClient<Database>(
	Deno.env.get("PROJECT_URL")!,
	Deno.env.get("SERVICE_ROLE_KEY")!,
);
