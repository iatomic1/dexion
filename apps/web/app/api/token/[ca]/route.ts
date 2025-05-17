import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ca: string }> },
) {
  const ca = (await params).ca;
  const apiUrl = `https://api.stxtools.io/tokens/${ca}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    console.log("server", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch token metadata" },
      { status: 500 },
    );
  }
}
