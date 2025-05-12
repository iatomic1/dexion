/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        hostname: "images.ctfassets.net",
      },
    ],
  },
};

export default nextConfig;
