import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { get_post_list } from "~/services/query.server";
export async function loader({ context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  const SITEINFO = env.SITEINFO;
  const allPosts = await get_post_list(env,1,1000,"published",true);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>${SITEINFO?.website_name}</title>
        <link>${SITEINFO?.website_url}</link>
        <description>${SITEINFO?.desc}</description>
        ${allPosts.map(post => `
          <item>
            <title>${post.title}</title>
            <link>${SITEINFO?.website_url}/blog/${post.slug}</link>
            <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
            <description><![CDATA[${post.shortDescription || ''}]]></description>
          </item>
        `).join('')}
      </channel>
    </rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}