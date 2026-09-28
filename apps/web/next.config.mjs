/** @type {import("next").NextConfig} */
const nextConfig = {
  transpilePackages: ["@carevoice/types"],
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
