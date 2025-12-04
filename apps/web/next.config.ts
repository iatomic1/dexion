const nextConfig = {
	transpilePackages: ["@dexion/ui"],
	reactStrictMode: true,
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.ctfassets.net",
			},
			{
				protocol: "https",
				hostname: "assets.hiro.so",
			},
			{
				protocol: "https",
				hostname: "szigdtxfspmofhxoytra.supabase.co",
				pathname: "/storage/v1/object/public/token_logo/**",
			},
		],
	},
};

export default nextConfig;
