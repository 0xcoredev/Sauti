/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@sauti/hardhat"],
  webpack: (config, { isServer }) => {
    // RainbowKit pulls in optional Coinbase smart account deps that aren't
    // installed and aren't needed for our use case. Mark them as externals
    // so the build doesn't try to resolve them.
    const optionalDeps = [
      "@x402/core",
      "@x402/core/client",
      "@x402/svm",
      "@x402/svm/exact/client",
      "@x402/evm",
    ];
    for (const dep of optionalDeps) {
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      if (!config.resolve.alias[dep]) {
        config.resolve.alias[dep] = false;
      }
    }
    return config;
  },
};

module.exports = nextConfig;
