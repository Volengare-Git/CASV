import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://casv.ch";

const PUBLIC_ROUTES = [
  { path: "/",                         priority: 1.0,  changeFrequency: "monthly" as const },
  { path: "/course",                   priority: 0.9,  changeFrequency: "monthly" as const },
  { path: "/reglement",                priority: 0.8,  changeFrequency: "yearly"  as const },
  { path: "/inscription",              priority: 0.9,  changeFrequency: "monthly" as const },
  { path: "/benevoles",                priority: 0.8,  changeFrequency: "monthly" as const },
  { path: "/resultats",                priority: 0.7,  changeFrequency: "monthly" as const },
  { path: "/galerie",                  priority: 0.6,  changeFrequency: "monthly" as const },
  { path: "/association",              priority: 0.7,  changeFrequency: "yearly"  as const },
  { path: "/association/historique",   priority: 0.5,  changeFrequency: "yearly"  as const },
  { path: "/association/comite",       priority: 0.5,  changeFrequency: "yearly"  as const },
  { path: "/association/local",        priority: 0.5,  changeFrequency: "yearly"  as const },
  { path: "/association/construction", priority: 0.6,  changeFrequency: "yearly"  as const },
  { path: "/contact",                  priority: 0.6,  changeFrequency: "yearly"  as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const route of PUBLIC_ROUTES) {
    // French (default, no prefix)
    entries.push({
      url: `${BASE}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: {
          fr: `${BASE}${route.path}`,
          en: `${BASE}/en${route.path}`,
        },
      },
    });
  }

  return entries;
}
