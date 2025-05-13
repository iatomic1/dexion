import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// Enable CORS for localhost
app.use("*", cors({ origin: "http://localhost:3000" }));

function generateBars(fromTimestamp, toTimestamp, resolution) {
  const bars = [];
  let interval;

  // Convert resolution to milliseconds
  switch (resolution) {
    case "1": // 1 minute
      interval = 60 * 1000;
      break;
    case "5": // 5 minutes
      interval = 5 * 60 * 1000;
      break;
    case "15": // 15 minutes
      interval = 15 * 60 * 1000;
      break;
    case "1D": // 1 day
    default:
      interval = 24 * 60 * 60 * 1000;
      break;
  }

  // Starting price and trend factors
  let basePrice = 0.00000292; // Starting price
  let trend = 0; // Current trend direction
  let trendStrength = 0.02; // How strong the trend affects price
  let volatility = 0.005; // Random price variation

  // Convert timestamps to milliseconds
  const fromMs = fromTimestamp * 1000;
  const toMs = toTimestamp * 1000;

  // Generate bars for the requested time range
  for (let time = fromMs; time <= toMs; time += interval) {
    // Occasionally change trend direction
    if (Math.random() < 0.1) {
      trend = Math.random() > 0.5 ? 1 : -1;
    }

    // Calculate price movement
    const trendChange = basePrice * trendStrength * trend;
    const randomChange = basePrice * volatility * (Math.random() * 2 - 1);
    const priceChange = trendChange + randomChange;

    // Calculate OHLC values
    const open = basePrice;
    const close = basePrice + priceChange;
    const high =
      Math.max(open, close) + Math.abs(basePrice * volatility * Math.random());
    const low =
      Math.min(open, close) - Math.abs(basePrice * volatility * Math.random());
    const volume = Math.floor(Math.random() * 1000) + 500;

    // Add bar to result
    bars.push({
      time: time,
      open: parseFloat(open.toFixed(11)),
      high: parseFloat(high.toFixed(11)),
      low: parseFloat(low.toFixed(11)),
      close: parseFloat(close.toFixed(11)),
      volume: volume,
    });

    // Update base price for next iteration
    basePrice = close;
  }

  return bars;
}

// Generate more sample price data
const generateMorePriceData = () => {
  const result = [];
  let lastTime = 1731995100;
  let lastPrice = 0.00000287;

  for (let i = 0; i < 100; i++) {
    lastTime += 3600; // Add one hour
    const randomChange = (Math.random() - 0.5) * 0.00000005;
    const newPrice = lastPrice + randomChange;
    const priceObj = {
      time: lastTime,
      open: lastPrice,
      high: Math.max(lastPrice, newPrice) + Math.random() * 0.00000002,
      low: Math.min(lastPrice, newPrice) - Math.random() * 0.00000002,
      close: newPrice,
      volume: Math.floor(Math.random() * 100) + 20,
    };
    result.push(priceObj);
    lastPrice = newPrice;
  }

  return result;
};

// Sample price data (use your DB or API here)
const priceData = generateMorePriceData();

app.get("/api/tv/history", async (c) => {
  const symbol = c.req.query("symbol") || "hellmoUSD";
  const from = parseInt(c.req.query("from") || "0");
  const to = parseInt(c.req.query("to") || `${Math.floor(Date.now() / 1000)}`);
  const resolution = c.req.query("resolution") || "1D";

  console.log(
    `History request for ${symbol}, from: ${from}, to: ${to}, resolution: ${resolution}`,
  );

  try {
    // Extract the contract ID from the symbol (assuming format like "MEME:SP3HNEXSXJK2RYNG5P6YSEE53FREX645JPJJ5FBFA.meme-stxcity")
    let contractId = "SP3HNEXSXJK2RYNG5P6YSEE53FREX645JPJJ5FBFA.meme-stxcity"; // Default value

    if (symbol.includes(":")) {
      contractId = symbol.split(":")[1];
    }

    // Fetch token data to get circulating supply
    const tokenResponse = await fetch(
      `https://api.stxtools.io/tokens/${contractId}`,
    );
    if (!tokenResponse.ok) {
      console.error(`Error fetching token data: ${tokenResponse.status}`);
      return c.json({ s: "error", errmsg: "Failed to fetch token data" });
    }

    const tokenData = await tokenResponse.json();
    const circulatingSupply =
      parseFloat(tokenData.circulating_supply) /
      Math.pow(10, tokenData.decimals);

    console.log(`Circulating supply for ${symbol}: ${circulatingSupply}`);

    // Fetch price data
    const priceResponse = await fetch(
      `https://api.stxtools.io/tokens/${contractId}/ohlc`,
    );
    if (!priceResponse.ok) {
      console.error(`Error fetching price data: ${priceResponse.status}`);
      return c.json({ s: "error", errmsg: "Failed to fetch price data" });
    }

    const priceData = await priceResponse.json();

    // Filter data based on the requested time range
    const filteredData = priceData.filter(
      (bar) => bar.time >= from && bar.time <= to,
    );

    if (filteredData.length === 0) {
      console.log("No data available for the requested time range");
      return c.json({ s: "no_data" });
    }

    // Convert price data to market cap data
    const marketCapData = filteredData.map((bar) => {
      return {
        time: bar.time,
        open: bar.open * circulatingSupply, // Convert to market cap
        high: bar.high * circulatingSupply,
        low: bar.low * circulatingSupply,
        close: bar.close * circulatingSupply,
        volume: bar.volume,
      };
    });

    // Format data for TradingView
    return c.json({
      s: "ok",
      t: marketCapData.map((bar) => bar.time),
      o: marketCapData.map((bar) => bar.open),
      h: marketCapData.map((bar) => bar.high),
      l: marketCapData.map((bar) => bar.low),
      c: marketCapData.map((bar) => bar.close),
      v: marketCapData.map((bar) => bar.volume),
    });
  } catch (error) {
    console.error("Error processing history request:", error);
    return c.json({ s: "error", errmsg: "Internal server error" });
  }
});

// /config endpoint
app.get("/api/tv/config", (c) => {
  return c.json({
    supported_resolutions: ["1", "5", "15", "1D"],
    supports_group_request: true,
    supports_marks: false,
    supports_time: true,
  });
});

app.get("/api/tv/symbols", async (c) => {
  try {
    const symbolQuery = c.req.query("symbol") || "MEME";
    let contractId = "SP3HNEXSXJK2RYNG5P6YSEE53FREX645JPJJ5FBFA.meme-stxcity"; // Default contract ID

    // Check if symbol contains contract ID
    if (symbolQuery.includes(":")) {
      contractId = symbolQuery.split(":")[1];
    }

    // Fetch token data
    const response = await fetch(
      `https://api.stxtools.io/tokens/${contractId}`,
    );
    if (!response.ok) {
      console.error(`Error fetching token data: ${response.status}`);
      return c.json({
        name: symbolQuery,
        ticker: symbolQuery,
        description: "Token Market Cap",
        type: "crypto",
        session: "24x7",
        exchange: "STX.CITY",
        listed_exchange: "STX.CITY",
        timezone: "Etc/UTC",
        minmov: 1,
        pricescale: 1, // For market cap in USD
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: false,
        supported_resolutions: ["1", "5", "15", "1D"],
        volume_precision: 2,
        data_status: "streaming",
      });
    }

    const tokenData = await response.json();

    // Determine appropriate price scale for display
    // Market cap will be much larger than token price, so we need a different scale
    const pricescale = 1; // For market cap in USD

    // Create a display-friendly symbol
    const symbol = `${tokenData.symbol} MCAP`;

    return c.json({
      name: symbol,
      ticker: `${tokenData.symbol}:${contractId}`,
      description: `${tokenData.name} Market Cap in USD`,
      type: "crypto",
      session: "24x7",
      exchange: "STX.CITY",
      listed_exchange: "STX.CITY",
      timezone: "Etc/UTC",
      minmov: 1,
      pricescale: pricescale,
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: false,
      supported_resolutions: ["1", "5", "15", "1D"],
      volume_precision: 2,
      data_status: "streaming",
      format: "price", // Use 'price' format for displaying large numbers
    });
  } catch (error) {
    console.error("Error in symbols endpoint:", error);
    return c.json({
      name: "MEME MCAP",
      ticker: "MEME:SP3HNEXSXJK2RYNG5P6YSEE53FREX645JPJJ5FBFA.meme-stxcity",
      description: "MEME Token Market Cap",
      type: "crypto",
      session: "24x7",
      exchange: "STX.CITY",
      listed_exchange: "STX.CITY",
      timezone: "Etc/UTC",
      minmov: 1,
      pricescale: 1,
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: false,
      supported_resolutions: ["1", "5", "15", "1D"],
      volume_precision: 2,
      data_status: "streaming",
    });
  }
});

app.get("/api/tv/search", async (c) => {
  const query = c.req.query("query") || "";

  try {
    // For this example, we'll just return the MEME token
    // In a real application, you would implement a search against all available STX tokens

    // Default token data
    const defaultToken = {
      symbol: "MEME",
      full_name: "MEME:SP3HNEXSXJK2RYNG5P6YSEE53FREX645JPJJ5FBFA.meme-stxcity",
      description: "MEME Token Market Cap",
      exchange: "STX.CITY",
      type: "crypto",
      contract_id: "SP3HNEXSXJK2RYNG5P6YSEE53FREX645JPJJ5FBFA.meme-stxcity",
    };

    // In a complete implementation, you could fetch a list of tokens from an API
    // and filter based on the query parameter

    // Optional: implement actual search functionality by calling an API that lists tokens
    // For now, we'll just return the default token if the query is empty or matches "MEME"
    if (!query || query.toUpperCase().includes("MEME")) {
      return c.json({
        symbols: [
          {
            symbol: "MEME MCAP",
            full_name:
              "MEME:SP3HNEXSXJK2RYNG5P6YSEE53FREX645JPJJ5FBFA.meme-stxcity",
            description: "MEME Token Market Cap",
            exchange: "STX.CITY",
            type: "crypto",
          },
        ],
      });
    }

    // If query doesn't match, return empty array
    return c.json({ symbols: [] });
  } catch (error) {
    console.error("Error in search endpoint:", error);
    return c.json({ symbols: [] });
  }
});

// /symbol_info endpoint
app.get("/api/tv/symbol_info", (c) => {
  const group = c.req.query("group");
  if (group && (group === "NYSE" || group === "FOREX" || group === "AMEX")) {
    return c.json({ s: "no_data" }); // Return no data for unsupported groups
  }
  // Handle other custom symbol info logic for meme coins
  return c.json({
    s: "ok",
    name: "hellmoUSD",
    description: "hellmo token on Raydium",
    type: "crypto",
    session: "24x7",
    timezone: "Etc/UTC",
    minmov: 1,
    pricescale: 1000000,
    supported_resolutions: ["1", "5", "15", "1D"],
  });
});
app.get("/api/tv/group_request", (c) => {
  const symbols = c.req.query("symbols") || ""; // List of symbols requested
  return c.json({
    s: "ok",
    d: symbols.split(",").map((symbol) => ({
      symbol,
      price: 0.00000292, // Sample price data
      volume: 35.7,
      change: 1.7,
    })),
  });
});

// /time endpoint
app.get("/api/tv/time", (c) => {
  return c.text(`${Math.floor(Date.now() / 1000)}`);
});

// Start the server with Bun
const server = Bun.serve({
  port: 3004,
  fetch: app.fetch,
});

console.log(`UDF server running on http://localhost:${server.port}`);
