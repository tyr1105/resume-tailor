import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // GitHub Pages部署需要设置basePath
  // 如果用自定义域名则不需要
  // basePath: "/resume-tailor",
};

export default nextConfig;
