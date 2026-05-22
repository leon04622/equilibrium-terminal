/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  /**
   * Keep dev build output under node_modules/.cache — avoids OneDrive breaking
   * symlinked `.next` at the project root (Windows EINVAL readlink).
   */
  ...(process.env.NODE_ENV === "development"
    ? { distDir: "node_modules/.cache/equilibrium-next-dev" }
    : {}),
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;
