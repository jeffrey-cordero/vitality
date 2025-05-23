/** @type {import('next').NextConfig} */
const nextConfig = {
   images: {
      remotePatterns: [
         {
            protocol: "https",
            hostname: "**"
         }
      ]
   },
   productionBrowserSourceMaps: false
};
module.exports = nextConfig;