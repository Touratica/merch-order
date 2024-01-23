/** @type {import('next').NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        hostname: "uploadthing.com",
      },
    ],
  },
  output: "standalone",
};

export default config;
