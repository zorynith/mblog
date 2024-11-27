import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData, useRouteLoaderData } from "@remix-run/react";
import BlogGrid from "~/components/blog-grid";
import Foot from "~/components/foot";
import Head from "~/components/Head";
import { useTranslation } from "react-i18next";
import { get_collection_list } from "~/services/query.server";


//SEO config
export const meta: MetaFunction = ({ data }: { data: any }) => {
  const {SITEINFO} = useRouteLoaderData("root") as {SITEINFO: any};
  let collections_titles = "";
  if(data?.collections?.length  && data?.collections?.length > 0){
    collections_titles = data.collections.map((collection: any) => collection.name).join(", ");
    collections_titles = collections_titles.slice(0, 150);
  }
  return [
    { title: SITEINFO.name + " - collections" },
    { name: "description", content: collections_titles },
    { name: "keywords", content: SITEINFO.summary },
    { name: "robots", content: "index, follow" },
    { name: "author", content: SITEINFO.author },
    // Open Graph
    { property: "og:title", content: SITEINFO.name + " - collections" },
    { property: "og:description", content: collections_titles },
    { property: "og:type", content: "article" },
    ...(SITEINFO.avatar ? [
      { property: "og:image", content: SITEINFO.avatar }
    ] : []),
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: SITEINFO.name + " - collections" },
    { name: "twitter:description", content: collections_titles },
    ...(SITEINFO.avatar ? [
      { name: "twitter:image", content: SITEINFO.avatar },
      
    ] : [])
  ];
}


export const loader = async ({ context }: LoaderFunctionArgs) => {

  const { env } = context.cloudflare as { env: Env };
  const collections = await get_collection_list(env);

  return json({collections});
  };

export default function Collections() {
  const { collections } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  return (
    <div>
      <Head />
      <div className="flex flex-col items-center">
          {/* Heading Div */}
          <div className="mb-8 max-w-3xl text-center">
            <h2 className="mb-4 mt-6 text-3xl font-bold md:text-5xl">
              {t("collections")}
            </h2>
            <p className="mx-auto mt-4 text-gray-500">
              {t("collections_of_articles")}
            </p>

          </div>
      </div>
      <BlogGrid list={collections} />
      <Foot />
    </div>
  );
}
