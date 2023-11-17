/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "uploadthing.com",
      },
    ],
  },
  output: "standalone",
};

module.exports = nextConfig;
