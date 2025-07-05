import ImageKit from "imagekit";
import { NextResponse } from "next/server";

export async function GET() {
	const imagekit = new ImageKit({
		publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string,
		privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
		urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT as string,
	});

	const authParams = imagekit.getAuthenticationParameters();
	return NextResponse.json(authParams);
}
