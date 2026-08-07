import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // WebContainers (@webcontainer/api) necesita SharedArrayBuffer, que solo
  // está disponible en páginas cross-origin-isolated.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

export default nextConfig;
