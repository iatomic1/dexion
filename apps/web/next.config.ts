const nextConfig = {
	transpilePackages: ["@repo/ui"],
	reactStrictMode: true,
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		remotePatterns: [
			{
				hostname: "images.ctfassets.net",
			},
			{
				hostname: "assets.hiro.so",
			},
		],
	},
};

export default nextConfig;
