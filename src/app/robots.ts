import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://casv.ch";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/en/admin/",
          "/compte/",
          "/en/compte/",
          "/login",
          "/en/login",
          "/register",
          "/en/register",
          "/forgot-password",
          "/en/forgot-password",
          "/reset-password",
          "/en/reset-password",
          "/maintenance",
          "/en/maintenance",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
