import pino, {
	type Logger,
	type LoggerOptions,
	type TransportSingleOptions,
} from "pino";
/**
 * createLogger - flexible logger factory
 * Allows arbitrary pino options + optional custom transport.
 */
export function createLogger(
	opts: LoggerOptions & {
		service?: string;
		env?: string;
		transport?: TransportSingleOptions;
	} = {},
): Logger {
	const {
		level = "info",
		service = "unknown-service",
		env = process.env.NODE_ENV || "development",
		transport,
		...rest
	} = opts;

	let transportOptions;
	if (transport) {
		// Convert TransportSingleOptions to DestinationStream
		transportOptions = pino.transport(transport);
	} else if (env === "development") {
		transportOptions = pino.transport({
			target: "pino-pretty",
			options: {
				colorize: true,
			},
		});
	}

	return pino(
		{
			level,
			base: {
				service,
				env,
			},
			...rest,
		},
		transportOptions,
	);
}

export type { Logger } from "pino";
