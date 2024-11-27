import { useMatches } from "@remix-run/react";
import { useSiteInfo } from "~/context/SiteInfoContext";
interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function MetaTags({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website' 
}: MetaTagsProps) {
  const matches = useMatches();
  const siteInfo = useSiteInfo();
  const rootData = matches[0]?.data as { env: Env };
//   const baseUrl = rootData?.env?.website_url || '';
  const baseUrl = siteInfo?.website_url || '';

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url || baseUrl} />
      {image && <meta property="og:image" content={image} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </>
  );
}