import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      // Stable content date, bumped when the page's content materially changes.
      lastModified: new Date("2026-07-09"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
