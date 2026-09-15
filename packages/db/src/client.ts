import { drizzle } from "drizzle-orm/postgres-js";
import { schema } from "./schema";

export const db = drizzle({
	connection: {
		url: process.env.DB_URL!,
		ssl: false,
	},
	casing: "snake_case",
	schema: schema,
});
