import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { get_post_list } from "~/services/query.server";

export async function loader({ context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  const SITEINFO = env.SITEINFO;

  // 获取所有已发布的文章
  const allPosts = await get_post_list(env,1,1000,"published",true);
  // 生成 sitemap XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${SITEINFO?.website_url}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      ${allPosts.map(post => `
        <url>
          <loc>${SITEINFO?.website_url}/blog/${post.slug}</loc>
          <lastmod>${new Date(post.createdAt).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `).join('')}
    </urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
} 