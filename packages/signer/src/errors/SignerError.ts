export class SignerError extends Error {
	constructor(
		message: string,
		public code: string,
		public originalError?: Error,
	) {
		super(message);
		this.name = "SignerError";
	}
}

export class TurnkeyError extends SignerError {
	constructor(message: string, originalError?: Error) {
		super(message, "TURNKEY_ERROR", originalError);
		this.name = "TurnkeyError";
	}
}

export class ValidationError extends SignerError {
	constructor(message: string, originalError?: Error) {
		super(message, "VALIDATION_ERROR", originalError);
		this.name = "ValidationError";
	}
}

export class SigningError extends SignerError {
	constructor(message: string, originalError?: Error) {
		super(message, "SIGNING_ERROR", originalError);
		this.name = "SigningError";
	}
}
