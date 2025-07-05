import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

/**
 * Configure dayjs with compact relative time formatting
 */
export const configureDayjs = () => {
	// Only configure once
	if (!(dayjs as any).__configured) {
		dayjs.extend(relativeTime);
		dayjs.extend(updateLocale);

		// Customize the relative time formatting to be more compact
		dayjs.updateLocale("en", {
			relativeTime: {
				future: "in %s",
				past: "%s ago",
				s: "now",
				m: "1m",
				mm: "%dm",
				h: "1h",
				hh: "%dh",
				d: "1d",
				dd: "%dd",
				w: "1w",
				ww: "%dw",
				M: "1M",
				MM: "%dM",
				y: "1y",
				yy: "%dy",
			},
		});

		// Mark as configured to prevent duplicate configuration
		(dayjs as any).__configured = true;
	}

	return dayjs;
};

/**
 * Format a date to compact relative time (e.g., "2d", "3h")
 * @param date Date to format (Date object, timestamp, or ISO string)
 * @param withoutSuffix If true, returns just the time without suffix (e.g., "2d" instead of "2d ago")
 */
export const formatRelativeTime = (
	date: string | number | Date,
	withoutSuffix = true,
) => {
	const dayjsInstance = configureDayjs();
	return dayjsInstance(date).fromNow(withoutSuffix);
};

/**
 * Format a date to a specific format
 * @param date Date to format (Date object, timestamp, or ISO string)
 * @param format Format string (defaults to "MMM D, YYYY")
 */
export const formatDate = (
	date: string | number | Date,
	format = "MMM D, YYYY",
) => {
	const dayjsInstance = configureDayjs();
	return dayjsInstance(date).format(format);
};

/**
 * Check if a date is today
 * @param date Date to check
 */
export const isToday = (date: string | number | Date) => {
	const dayjsInstance = configureDayjs();
	return dayjsInstance(date).isSame(dayjsInstance(), "day");
};

/**
 * Get time elapsed since date in human readable format
 * @param date Starting date
 * @param endDate End date (defaults to now)
 */
export const timeElapsed = (
	date: string | number | Date,
	endDate?: string | number | Date,
) => {
	const dayjsInstance = configureDayjs();
	const start = dayjsInstance(date);
	const end = endDate ? dayjsInstance(endDate) : dayjsInstance();

	const seconds = end.diff(start, "second");

	if (seconds < 60) return `${seconds}s`;
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
	return `${Math.floor(seconds / 86400)}d`;
};
