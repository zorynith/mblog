import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

export async function loader({ context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  const SITEINFO = env.SITEINFO;
  const content = `
User-agent: *
Allow: /
Disallow: /auth/
Disallow: /api/
Disallow: /admin/
Disallow: /payment/
Disallow: /dashboard/


Sitemap: ${SITEINFO?.website_url}/sitemap.xml
  `.trim();

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
} 