import { NextResponse } from "next/server";
import { STX_WATCH_API_KEY } from "~/lib/constants";

// const allowedDomains = ["localhost:3001", "dexion.pro"];

async function proxyFetch(request: Request, targetUrl: string) {
  const urlObj = new URL(targetUrl);
  // if (!allowedDomains.includes(urlObj.hostname)) {
  //   return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
  // }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${STX_WATCH_API_KEY}`,
    Apikey: STX_WATCH_API_KEY as string,
  };

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    fetchOptions.body = await request.text();
    const contentType = request.headers.get("content-type");
    if (contentType) headers["Content-Type"] = contentType;
  }

  const res = await fetch(targetUrl, fetchOptions);
  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");
  if (!targetUrl) {
    return NextResponse.json(
      { error: "Missing 'url' query parameter" },
      { status: 400 },
    );
  }
  try {
    return await proxyFetch(request, targetUrl);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");
  if (!targetUrl) {
    return NextResponse.json(
      { error: "Missing 'url' query parameter" },
      { status: 400 },
    );
  }
  try {
    return await proxyFetch(request, targetUrl);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
