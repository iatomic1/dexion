import crypto from "crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;

export function encryptToken(token: string, secret: string): string {
	const iv = crypto.randomBytes(IV_LENGTH);
	const key = crypto.createHash("sha256").update(secret).digest();
	const cipher = crypto.createCipheriv(ALGO, key, iv);

	const encrypted = Buffer.concat([
		cipher.update(token, "utf8"),
		cipher.final(),
	]);
	const authTag = cipher.getAuthTag();

	return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

export function decryptToken(encrypted: string, secret: string): string {
	const data = Buffer.from(encrypted, "base64url");
	const iv = data.subarray(0, IV_LENGTH);
	const authTag = data.subarray(IV_LENGTH, IV_LENGTH + 16);
	const ciphertext = data.subarray(IV_LENGTH + 16);

	const key = crypto.createHash("sha256").update(secret).digest();
	const decipher = crypto.createDecipheriv(ALGO, key, iv);
	decipher.setAuthTag(authTag);

	const decrypted = Buffer.concat([
		decipher.update(ciphertext),
		decipher.final(),
	]);
	return decrypted.toString("utf8");
}
