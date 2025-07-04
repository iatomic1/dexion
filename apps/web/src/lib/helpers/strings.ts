/**
 * Truncates a string by showing the first N characters, then an ellipsis, then the last M characters.
 * Perfect for blockchain addresses, long file names, etc.
 *
 * @param {string} str - The string to truncate
 * @param {number} [startChars=7] - Number of characters to show at the beginning
 * @param {number} [endChars=4] - Number of characters to show at the end
 * @param {string} [ellipsis="..."] - The ellipsis string to use
 * @returns {string} The truncated string
 */
export const truncateString = (
	str: string,
	startChars = 7,
	endChars = 4,
	ellipsis = "...",
): string => {
	if (!str) return "";

	// If the string is shorter than or equal to startChars + endChars, just return it
	if (str.length <= startChars + endChars) {
		return str;
	}

	// Otherwise, truncate it
	const start = str.substring(0, startChars);
	const end = str.substring(str.length - endChars);

	return `${start}${ellipsis}${end}`;
};

// Usage examples:
// truncateAddress("SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1")
// => "SP1Y5YS...MY4A1"

// truncateAddress("SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1", 5, 5)
// => "SP1Y5...MY4A1"

// truncateAddress("SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1", 10, 8, "···")
// => "SP1Y5YSTAH···JECTMY4A1"
