import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // 开发服务与生产构建使用不同目录，避免同时运行时互相覆盖缓存。
  distDir: process.env.NODE_ENV === "development" ? ".next" : ".next-build",
  turbopack: {
    root: __dirname,
  },
};

export default config;
