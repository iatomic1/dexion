import type { BetterAuthPlugin, User } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { REDIS_PREFIX, updateCachedUserField } from "~/lib/db/redis";
import { auth } from "../../auth";
import type { TelegramAuthData, TelegramPluginOptions } from "./types";
import {
	parseMiniAppInitData,
	validateMiniAppData,
	validateTelegramAuthData,
	verifyMiniAppInitData,
	verifyTelegramAuth,
} from "./verify";

export type {
	TelegramAuthData,
	TelegramMiniAppChat,
	TelegramMiniAppData,
	TelegramMiniAppUser,
	TelegramPluginOptions,
} from "./types";

const BIG_LOGS = process.env.BIG_LOGS === "true" || false;

const bigLog = (...args: any[]) => {
	if (BIG_LOGS) {
		console.log(...args);
	}
};

// Utility function for URL validation
const isValidImageUrl = (url: string): boolean => {
	try {
		const parsedUrl = new URL(url);
		return (
			(parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") &&
			/\.(jpg|jpeg|png|gif|webp)$/i.test(parsedUrl.pathname)
		);
	} catch {
		return false;
	}
};

/**
 * Telegram authentication plugin for Better Auth
 *
 * @example
 * ```ts
 * import { betterAuth } from "better-auth";
 * import { telegram } from "better-auth-telegram";
 *
 * export const auth = betterAuth({
 *   plugins: [
 *     telegram({
 *       botToken: process.env.TELEGRAM_BOT_TOKEN!,
 *       botUsername: "your_bot_username"
 *     })
 *   ]
 * });
 * ```
 */
export const telegram = (options: TelegramPluginOptions) => {
	const {
		botToken,
		botUsername,
		allowUserToLink = true,
		autoCreateUser = true,
		maxAuthAge = 86400,
		mapTelegramDataToUser,
		miniApp,
	} = options;

	// Mini Apps configuration
	const miniAppEnabled = miniApp?.enabled ?? false;
	const miniAppValidateInitData = miniApp?.validateInitData ?? true;
	const miniAppAllowAutoSignin = miniApp?.allowAutoSignin ?? true;
	const mapMiniAppDataToUser = miniApp?.mapMiniAppDataToUser;

	if (!botToken) {
		throw new Error("Telegram plugin: botToken is required");
	}

	if (!botUsername) {
		throw new Error("Telegram plugin: botUsername is required");
	}

	return {
		id: "telegram",

		schema: {
			user: {
				fields: {
					telegramId: {
						type: "string",
						required: false,
						input: true,
						returned: true,
					},
					telegramUsername: {
						type: "string",
						required: false,
						input: true,
						returned: true,
					},
				},
			},
			account: {
				fields: {
					telegramId: {
						type: "string",
						required: false,
						input: false,
						returned: true,
					},
					telegramUsername: {
						type: "string",
						required: false,
						input: false,
						returned: true,
					},
				},
			},
		},

		endpoints: {
			signInWithTelegram: createAuthEndpoint(
				"/telegram/signin",
				{
					method: "POST",
				},
				async (ctx) => {
					const body = await ctx.body;

					// Validate auth data structure
					if (!validateTelegramAuthData(body)) {
						return ctx.json(
							{ error: "Invalid Telegram auth data" },
							{ status: 400 },
						);
					}

					const telegramData = body as TelegramAuthData;

					// Verify authentication
					const isValid = verifyTelegramAuth(
						telegramData,
						botToken,
						maxAuthAge,
					);

					if (!isValid) {
						return ctx.json(
							{ error: "Invalid Telegram authentication" },
							{ status: 401 },
						);
					}

					// Map Telegram data to user
					const defaultUserData = {
						name: telegramData.last_name
							? `${telegramData.first_name} ${telegramData.last_name}`
							: telegramData.first_name,
						image: telegramData.photo_url,
						email: undefined, // Telegram doesn't provide email
					};

					const userData = mapTelegramDataToUser
						? mapTelegramDataToUser(telegramData)
						: defaultUserData;

					// Find existing account by telegramId
					const existingAccount = await ctx.context.adapter.findOne({
						model: "account",
						where: [
							{
								field: "providerId",
								value: "telegram",
							},
							{
								field: "accountId",
								value: telegramData.id.toString(),
							},
						],
					});

					let userId: string;

					if (existingAccount) {
						// User already has Telegram linked
						userId = (existingAccount as any).userId;
					} else if (autoCreateUser) {
						// Create new user
						const newUser = await ctx.context.adapter.create({
							model: "user",
							data: {
								...userData,
								telegramId: telegramData.id.toString(),
								telegramUsername: telegramData.username,
							},
						});

						userId = newUser.id;

						// Create account
						await ctx.context.adapter.create({
							model: "account",
							data: {
								userId: newUser.id,
								providerId: "telegram",
								accountId: telegramData.id.toString(),
								telegramId: telegramData.id.toString(),
								telegramUsername: telegramData.username,
							},
						});
					} else {
						return ctx.json(
							{ error: "User not found and auto-create is disabled" },
							{ status: 404 },
						);
					}

					// Create session
					const session = await ctx.context.internalAdapter.createSession(
						userId,
						ctx,
					);

					const user = await ctx.context.adapter.findOne({
						model: "user",
						where: [{ field: "id", value: userId }],
					});

					await setSessionCookie(ctx, {
						session,
						user: user as User,
					});

					return ctx.json({
						user,
						session,
					});
				},
			),

			linkTelegram: createAuthEndpoint(
				"/telegram/link",
				{
					method: "POST",
					use: [sessionMiddleware],
				},
				async (ctx) => {
					try {
						bigLog("STEP 1: Endpoint called");
						bigLog("STEP 1: Full context keys:", Object.keys(ctx.context));
						bigLog("STEP 2: ctx.context:", ctx.context);
						bigLog("STEP 3: Session from context:", ctx.context.session);

						if (!allowUserToLink) {
							bigLog("STEP 1.1: Linking disabled");
							return ctx.json(
								{ error: "Linking Telegram accounts is disabled" },
								{ status: 403 },
							);
						}

						bigLog("STEP 2: Getting body and session");
						const body = await ctx.body;
						const session = ctx.context.session;
						bigLog(body, "body");
						bigLog(session, "session");

						bigLog("STEP 3: Checking authentication");
						if (!session?.user?.id) {
							bigLog("STEP 3.1: Not authenticated");
							return ctx.json({ error: "Not authenticated" }, { status: 401 });
						}

						bigLog("STEP 4: Validating Telegram auth data");
						if (!validateTelegramAuthData(body)) {
							bigLog("STEP 4.1: Invalid Telegram auth data");
							return ctx.json(
								{ error: "Invalid Telegram auth data" },
								{ status: 400 },
							);
						}

						bigLog("STEP 5: Parsing Telegram data");
						const telegramData = body as TelegramAuthData;
						bigLog("STEP 5.1: Telegram data:", telegramData);

						bigLog("STEP 6: Verifying Telegram authentication");
						const isValid = verifyTelegramAuth(
							telegramData,
							botToken,
							maxAuthAge,
						);
						bigLog("STEP 6.1: Verification result:", isValid);

						if (!isValid) {
							bigLog("STEP 6.2: Invalid Telegram authentication");
							return ctx.json(
								{ error: "Invalid Telegram authentication" },
								{ status: 401 },
							);
						}

						const telegramId = telegramData.id.toString();

						bigLog("STEP 7: Checking for existing account");
						const existingAccount = await ctx.context.adapter.findOne<{
							userId: string;
							providerId: string;
							accountId: string;
						}>({
							model: "account",
							where: [
								{ field: "providerId", value: "telegram" },
								{ field: "accountId", value: telegramId },
							],
						});
						bigLog("STEP 7.1: Existing account:", existingAccount);

						if (existingAccount && existingAccount.userId !== session.user.id) {
							bigLog("STEP 7.2: Account linked to another user");
							return ctx.json(
								{
									error:
										"This Telegram account is already linked to another user",
								},
								{ status: 409 },
							);
						}

						if (existingAccount) {
							bigLog("STEP 7.3: Account already linked to current user");

							// Ensure cache reflects Telegram link
							await updateCachedUserField(
								session.user.id,
								"telegram_id",
								telegramId,
							);

							return ctx.json(
								{
									error:
										"This Telegram account is already linked to your account",
								},
								{ status: 409 },
							);
						}

						// Use transaction for atomic operations
						await ctx.context.adapter.transaction(async (trxAdapter) => {
							bigLog("STEP 8: Creating account link");
							await trxAdapter.create({
								model: "account",
								data: {
									userId: session.user.id,
									providerId: "telegram",
									accountId: telegramId,
									telegramId: telegramId,
									telegramUsername: telegramData.username,
									createdAt: new Date(),
									updatedAt: new Date(),
								},
							});
							bigLog("STEP 8.1: Account link created");
						});

						bigLog("STEP 9: Updating user with Telegram data");

						// Prepare update data
						const updateData: {
							telegramId: string;
							telegramUsername?: string;
							image?: string;
						} = {
							telegramId,
							telegramUsername: telegramData.username,
						};

						// Only update image if user doesn't have one and Telegram provides a valid one
						if (!session.user.image && telegramData.photo_url) {
							if (isValidImageUrl(telegramData.photo_url)) {
								updateData.image = telegramData.photo_url;
							} else {
								bigLog(
									"STEP 9.0: Invalid Telegram photo URL, skipping image update",
								);
							}
						}

						// Update user and cached session
						await auth.api.updateUser({
							headers: ctx.headers,
							body: updateData,
						});
						bigLog("STEP 9.1: User updated");

						// Update Redis cache
						await updateCachedUserField(
							session.user.id,
							"telegram_id",
							telegramId,
						);
						bigLog("STEP 9.2: Redis cache updated");

						bigLog("STEP 10: Success - returning response");
						return ctx.json({
							success: true,
							message: "Telegram account linked successfully",
						});
					} catch (error) {
						console.error("Error linking Telegram account:", {
							error,
							userId: ctx.context.session?.user?.id,
						});

						return ctx.json(
							{ error: "Failed to link Telegram account. Please try again." },
							{ status: 500 },
						);
					}
				},
			),

			unlinkTelegram: createAuthEndpoint(
				"/telegram/unlink",
				{
					method: "POST",
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const session = ctx.context.session;

					if (!session?.user?.id) {
						return ctx.json({ error: "Not authenticated" }, { status: 401 });
					}

					// Find and delete Telegram account
					const account = await ctx.context.adapter.findOne({
						model: "account",
						where: [
							{
								field: "userId",
								value: session.user.id,
							},
							{
								field: "providerId",
								value: "telegram",
							},
						],
					});

					if (!account) {
						return ctx.json(
							{ error: "No Telegram account linked" },
							{ status: 404 },
						);
					}

					await ctx.context.adapter.delete({
						model: "account",
						where: [{ field: "id", value: (account as any).id }],
					});

					// Clear Telegram data from user
					await auth.api.updateUser({
						headers: ctx.headers,
						body: {
							telegramId: null,
							telegramUsername: null,
						},
					});

					return ctx.json({
						success: true,
						message: "Telegram account unlinked successfully",
					});
				},
			),

			getTelegramConfig: createAuthEndpoint(
				"/telegram/config",
				{
					method: "GET",
				},
				async (ctx) =>
					ctx.json({
						botUsername,
						miniAppEnabled,
					}),
			),

			// Mini Apps endpoints (only available when enabled)
			...(miniAppEnabled
				? {
						signInWithMiniApp: createAuthEndpoint(
							"/telegram/miniapp/signin",
							{
								method: "POST",
							},
							async (ctx) => {
								const body = await ctx.body;
								const { initData } = body;

								if (!initData || typeof initData !== "string") {
									return ctx.json(
										{ error: "initData is required and must be a string" },
										{ status: 400 },
									);
								}

								// Verify initData
								if (
									miniAppValidateInitData &&
									!verifyMiniAppInitData(initData, botToken, maxAuthAge)
								) {
									return ctx.json(
										{ error: "Invalid Mini App initData" },
										{ status: 401 },
									);
								}

								// Parse initData
								const data = parseMiniAppInitData(initData);

								// Validate structure
								if (!validateMiniAppData(data)) {
									return ctx.json(
										{ error: "Invalid Mini App data structure" },
										{ status: 400 },
									);
								}

								if (!data.user) {
									return ctx.json(
										{ error: "No user data in initData" },
										{ status: 400 },
									);
								}

								const miniAppUser = data.user;

								// Map Mini App user data to user object
								const defaultUserData = {
									name: miniAppUser.last_name
										? `${miniAppUser.first_name} ${miniAppUser.last_name}`
										: miniAppUser.first_name,
									image: miniAppUser.photo_url,
									email: undefined, // Telegram doesn't provide email
								};

								const userData = mapMiniAppDataToUser
									? mapMiniAppDataToUser(miniAppUser)
									: defaultUserData;

								// Find existing account by telegramId
								const existingAccount = await ctx.context.adapter.findOne({
									model: "account",
									where: [
										{
											field: "providerId",
											value: "telegram",
										},
										{
											field: "accountId",
											value: miniAppUser.id.toString(),
										},
									],
								});

								let userId: string;

								if (existingAccount) {
									// User already has Telegram linked
									userId = (existingAccount as any).userId;
								} else if (autoCreateUser && miniAppAllowAutoSignin) {
									// Create new user
									const newUser = await ctx.context.adapter.create({
										model: "user",
										data: {
											...userData,
											telegramId: miniAppUser.id.toString(),
											telegramUsername: miniAppUser.username,
										},
									});

									userId = newUser.id;

									// Create account
									await ctx.context.adapter.create({
										model: "account",
										data: {
											userId: newUser.id,
											providerId: "telegram",
											accountId: miniAppUser.id.toString(),
											telegramId: miniAppUser.id.toString(),
											telegramUsername: miniAppUser.username,
										},
									});
								} else {
									return ctx.json(
										{
											error:
												"User not found and auto-signin is disabled for Mini Apps",
										},
										{ status: 404 },
									);
								}

								// Create session
								const session = await ctx.context.internalAdapter.createSession(
									userId,
									ctx,
								);

								const user = await ctx.context.adapter.findOne({
									model: "user",
									where: [{ field: "id", value: userId }],
								});

								await setSessionCookie(ctx, {
									session,
									user: user as User,
								});

								return ctx.json({
									session,
									user,
								});
							},
						),

						validateMiniApp: createAuthEndpoint(
							"/telegram/miniapp/validate",
							{
								method: "POST",
							},
							async (ctx) => {
								const body = await ctx.body;
								const { initData } = body;

								if (!initData || typeof initData !== "string") {
									return ctx.json(
										{ error: "initData is required and must be a string" },
										{ status: 400 },
									);
								}

								const isValid = verifyMiniAppInitData(
									initData,
									botToken,
									maxAuthAge,
								);

								if (!isValid) {
									return ctx.json({
										valid: false,
										data: null,
									});
								}

								const data = parseMiniAppInitData(initData);

								return ctx.json({
									valid: true,
									data,
								});
							},
						),
					}
				: {}),
		},
	} satisfies BetterAuthPlugin;
};
