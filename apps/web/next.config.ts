const nextConfig = {
  transpilePackages: ["@repo/ui"],
  reactStrictMode: true,

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
