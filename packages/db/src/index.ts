import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { schema } from "./schema";

config({ path: ".env" });
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
	if (!_db) {
		_db = drizzle({
			connection: {
				url: process.env.DB_URL!,
				ssl: false,
			},
			casing: "snake_case",
			schema: schema,
		});
	}

	return _db;
}

export const db = getDb();
export * from "./schema";
