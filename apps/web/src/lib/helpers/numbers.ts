export function formatPrice(price: number, decimals: number = 1): string {
  if (price === 0) return "0";
  if (!price || isNaN(price)) return "N/A";

  const isNegative = price < 0;
  const absPrice = Math.abs(price);

  let formatted: string;

  if (absPrice < 1000) {
    formatted = absPrice.toFixed(decimals).replace(/\.0+$/, "");
  } else if (absPrice < 1_000_000) {
    formatted = (absPrice / 1000).toFixed(decimals).replace(/\.0+$/, "") + "k";
  } else if (absPrice < 1_000_000_000) {
    formatted =
      (absPrice / 1_000_000).toFixed(decimals).replace(/\.0+$/, "") + "M";
  } else if (absPrice < 1_000_000_000_000) {
    formatted =
      (absPrice / 1_000_000_000).toFixed(decimals).replace(/\.0+$/, "") + "B";
  } else {
    formatted =
      (absPrice / 1_000_000_000_000).toFixed(decimals).replace(/\.0+$/, "") +
      "T";
  }

  formatted = formatted.replace(/\.(\d*?)0+$/, ".$1").replace(/\.$/, "");

  return isNegative ? "-" + formatted : formatted;
}

export function formatTokenPrice(
  tokenPrice: number,
  significantDigits: number = 2,
): string {
  if (tokenPrice === 0) return "0";
  if (!tokenPrice || isNaN(tokenPrice)) return "N/A";

  if (tokenPrice >= 0.001) {
    return tokenPrice.toFixed(significantDigits).replace(/\.?0+$/, "");
  }

  const priceStr = tokenPrice.toString();

  if (priceStr.includes("e-")) {
    const [mantissa, exponent] = priceStr.split("e-");
    const exponentValue = parseInt(exponent ?? "0", 10);

    const zeroCount = exponentValue - 1;

    const cleanedMantissa = parseFloat(mantissa ?? "0")
      .toFixed(significantDigits)
      .replace(/^0\./, "")
      .replace(/\.?0+$/, "");

    return `0.${zeroCount}→${cleanedMantissa}`;
  } else {
    const decimalPart = priceStr.split(".")[1] ?? "";

    let zeroCount = 0;
    for (let i = 0; i < decimalPart.length; i++) {
      if (decimalPart[i] === "0") {
        zeroCount++;
      } else {
        break;
      }
    }

    const significantPart = decimalPart
      .substring(zeroCount, zeroCount + significantDigits)
      .replace(/\.?0+$/, "");

    return `0.${zeroCount}→${significantPart}`;
  }
}

export function formatTinyDecimal(num: number): string {
  if (num >= 1 || num <= 0) return num.toString();

  const decimalStr = num.toString().split(".")[1] ?? "";
  let zeroCount = 0;

  for (const char of decimalStr) {
    if (char === "0") {
      zeroCount++;
    } else {
      break;
    }
  }

  const significant = decimalStr.slice(zeroCount).padEnd(2, "0").slice(0, 2);
  return `0.<sub>${zeroCount}</sub>${significant}`;
}
