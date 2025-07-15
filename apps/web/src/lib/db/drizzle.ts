import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { schema } from "./schema";

config({ path: ".env" }); // or .env.local

export const db = drizzle({
	connection: {
		url: process.env.DB_URL!,
		ssl: false,
	},
	casing: "snake_case",
	schema: schema,
});
