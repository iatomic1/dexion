/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  reactStrictMode: false,
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
