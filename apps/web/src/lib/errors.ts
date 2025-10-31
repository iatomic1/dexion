export class PublicError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "PUBLIC_ERROR";
	}
}

export const handleReturnedServerError = (err: any) => {
	const isAllowedError = err instanceof PublicError;
	const isDev = process.env.NODE_ENV === "development";
	if (isAllowedError || isDev) {
		console.error(err);
		if (err instanceof Error) {
			return err.message;
		}
		return "An unknown error occurred";
	}
	return "Something went wrong";
};
