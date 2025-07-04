import {
	boolean,
	pgTable,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable(
	"users",
	{
		id: text("id").primaryKey(),
		name: text("name"),
		email: text("email").unique(),
		emailVerified: boolean("email_verified")
			.$defaultFn(() => false)
			.notNull(),
		image: text("image"),
		inviteCode: text("invite_code").unique(),
		subOrganizationId: varchar("sub_org_id", { length: 255 }).unique(),
		walletId: varchar("wallet_id", { length: 255 }).unique(),
		walletAddress: text("wallet_address"),
		walletPublicKey: text("wallet_public_key"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		subOrgCreated: boolean("sub_org_created").default(false),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		twoFactorEnabled: boolean("two_factor_enabled"),
	},
	(table) => ({
		userEmailUnique: unique("user_email_unique").on(table.email),
	}),
);

// export const turnkey = pgTable("turnkey", {
//   userId: text("user_id")
//     .notNull()
//     .references(() => user.id, { onDelete: "cascade" }),
//   subOrgId: varchar("sub_org_id", { length: 255 }).notNull(),
//   walletId: varchar("wallet_id", { length: 255 }).notNull(),
//   address: text("address").notNull(),
//   createdAt: timestamp("created_at", { withTimezone: true })
//     .$defaultFn(() => new Date())
//     .notNull(),
//   updatedAt: timestamp("updated_at", { withTimezone: true })
//     .$defaultFn(() => new Date())
//     .notNull(),
// });

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	updatedAt: timestamp("updated_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
});

export const jwks = pgTable("jwks", {
	id: text("id").primaryKey(),
	publicKey: text("public_key").notNull(),
	privateKey: text("private_key").notNull(),
	createdAt: timestamp("created_at").notNull(),
});

export const twoFactor = pgTable("two_factor", {
	id: text("id").primaryKey(),
	secret: text("secret").notNull(),
	backupCodes: text("backup_codes").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const schema = {
	user,
	session,
	account,
	verification,
	jwks,
	twoFactor,
};
