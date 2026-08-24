const gitSha = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || "dev").slice(0, 7);

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_EQ_GIT_SHA: gitSha,
  },
  generateBuildId: async () => gitSha,
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
