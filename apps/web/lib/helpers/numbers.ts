/**
 * Formats a number into a human-readable price string with appropriate suffix (k, M, B, T)
 * @param price - The price number to format
 * @param decimals - Number of decimal places to show (default: 1)
 * @returns Formatted price string (e.g., "193.4k", "1.2M", "$5")
 */
export function formatPrice(price: number, decimals: number = 1): string {
  // Handle edge cases
  if (price === 0) return "0";
  if (!price || isNaN(price)) return "N/A";

  // Handle negative numbers
  const isNegative = price < 0;
  const absPrice = Math.abs(price);

  let formatted: string;

  if (absPrice < 1000) {
    // Values less than 1000 don't need suffixes
    formatted = absPrice.toFixed(decimals).replace(/\.0+$/, "");
  } else if (absPrice < 1_000_000) {
    // Thousands (k)
    formatted = (absPrice / 1000).toFixed(decimals).replace(/\.0+$/, "") + "k";
  } else if (absPrice < 1_000_000_000) {
    // Millions (M)
    formatted =
      (absPrice / 1_000_000).toFixed(decimals).replace(/\.0+$/, "") + "M";
  } else if (absPrice < 1_000_000_000_000) {
    // Billions (B)
    formatted =
      (absPrice / 1_000_000_000).toFixed(decimals).replace(/\.0+$/, "") + "B";
  } else {
    // Trillions (T) or more
    formatted =
      (absPrice / 1_000_000_000_000).toFixed(decimals).replace(/\.0+$/, "") +
      "T";
  }

  // Remove trailing zeros after decimal point
  formatted = formatted.replace(/\.(\d*?)0+$/, ".$1").replace(/\.$/, "");

  // Add negative sign if needed
  return isNegative ? "-" + formatted : formatted;
}

/**
 * Formats a very small token price into a human-readable string
 * For extremely small values, shows the number of leading zeros and then the significant digits
 * e.g., 0.0000028036... becomes "0.6→28" (6 zeros followed by 28)
 *
 * @param tokenPrice - The small token price to format
 * @param significantDigits - Number of significant digits to show (default: 2)
 * @returns Formatted token price string
 */
export function formatTokenPrice(
  tokenPrice: number,
  significantDigits: number = 2,
): string {
  // Handle edge cases
  if (tokenPrice === 0) return "0";
  if (!tokenPrice || isNaN(tokenPrice)) return "N/A";

  // Handle case for regular numbers (not extremely small)
  if (tokenPrice >= 0.001) {
    return tokenPrice.toFixed(significantDigits).replace(/\.?0+$/, "");
  }

  // For very small numbers, we need to count leading zeros after decimal
  const priceStr = tokenPrice.toString();

  // Check if it's in scientific notation
  if (priceStr.includes("e-")) {
    // Handle scientific notation
    const [mantissa, exponent] = priceStr.split("e-");
    const exponentValue = parseInt(exponent);

    // Calculate number of leading zeros
    const zeroCount = exponentValue - 1;

    // Format the mantissa to get significant digits
    const cleanedMantissa = parseFloat(mantissa)
      .toFixed(significantDigits)
      .replace(/^0\./, "")
      .replace(/\.?0+$/, "");

    return `0.${zeroCount}→${cleanedMantissa}`;
  } else {
    // Handle regular decimal notation
    const decimalPart = priceStr.split(".")[1];

    // Count leading zeros
    let zeroCount = 0;
    for (let i = 0; i < decimalPart.length; i++) {
      if (decimalPart[i] === "0") {
        zeroCount++;
      } else {
        break;
      }
    }

    // Get significant digits
    const significantPart = decimalPart
      .substring(zeroCount, zeroCount + significantDigits)
      .replace(/\.?0+$/, "");

    return `0.${zeroCount}→${significantPart}`;
  }
}

export function formatTinyDecimal(num: number): string {
  if (num >= 1 || num <= 0) return num.toString(); // only for small decimals

  const decimalStr = num.toString().split(".")[1] || "";
  let zeroCount = 0;

  for (const char of decimalStr) {
    if (char === "0") {
      zeroCount++;
    } else {
      break;
    }
  }

  const significant = decimalStr.slice(zeroCount).padEnd(2, "0").slice(0, 2); // first 2 digits after zeros
  return `0.<sub>${zeroCount}</sub>${significant}`;
}
