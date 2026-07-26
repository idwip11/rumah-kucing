/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    const adminOrigin =
      process.env.ADMIN_PANEL_ORIGIN || "http://localhost:3001";
    return [
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: adminOrigin },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PATCH,PUT,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type,x-admin-token",
          },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
    ];
  },
};

export default nextConfig;
