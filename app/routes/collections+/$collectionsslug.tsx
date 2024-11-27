import { ActionFunctionArgs, json, MetaFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { Card, CardContent } from "~/components/ui/card";
import { Code } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getCollectionPostsBySlug, update_collection_order } from "~/services/query.server";
import Head from "~/components/Head";
import Foot from "~/components/foot";
import { HtmlContent } from "~/components/ui/html-content";
import { stripHtmlWithLimit } from "~/utils/tools";


export const meta: MetaFunction = ({ data }: { data: any }) => {
  const {SITEINFO} = useRouteLoaderData("root") as {SITEINFO: any};
  const description = stripHtmlWithLimit(data?.collection?.description || SITEINFO.desc, 150);
  return [
    { title: data?.collection?.name || SITEINFO.name },
    { name: "description", content: description },
    { name: "keywords", content:description },
    { name: "author", content: SITEINFO.author },
    // Open Graph
    { property: "og:title", content: data?.collection?.name || SITEINFO.name },
    { property: "og:description", content: description },
    { property: "og:type", content: "article" },
    ...(SITEINFO.avatar ? [
      { property: "og:image", content: SITEINFO.avatar }
    ] : []),
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: data?.collection?.name || SITEINFO.name },
    { name: "twitter:description", content: description },
    ...(SITEINFO.avatar ? [
      { name: "twitter:image", content: data?.collection?.coverImage || SITEINFO.avatar },
      
    ] : [])
  ];
}


export async function loader({ context, params }: LoaderFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  const { collectionsslug } = params;
  if (!collectionsslug) throw new Error("Collection slug is required");
  const { collection, posts } = await getCollectionPostsBySlug(env, collectionsslug);
  return json({ collection, posts });
}


export default function CollectionsSlug() {
  const { collection, posts } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Head />
      <div className="container space-y-8 px-4 py-8 mx-auto flex-grow max-w-7xl bg-background text-foreground">
        <section>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{collection?.name}</h1>
            {collection?.description && (
              <div className="mt-4">
                <HtmlContent 
                  content={collection?.description} 
                  className="text-muted-foreground mb-4"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            {posts && posts.length > 0 ? (
              posts.map((item: any) => (
                <Card key={item.id}>
                  <Link
                   prefetch="intent" 
                    to={item.slug ? `/blog/${item.slug}` : `/blog/${item.id}`}
                  >
                    <CardContent className="flex items-start p-4">
                      {item?.featuredImage ? (
                        <img
                          src={item?.featuredImage}
                          alt={item?.title}
                          className="mr-4 mt-1 h-20 w-20 object-cover"
                        />
                      ) : (
                        <Code className="mr-4 mt-1 h-5 w-5 text-blue-500" />
                      )}

                      <div>
                        <h2 className="text-3xl font-bold mb-4">
                          {item?.title}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {item?.author} • {item?.created_at}
                        </p>
                        <p className="mt-1"> {item?.description} </p>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-500">
                {t("no_posts_in_collection")}
              </p>
            )}
          </div>
        </section>
      </div>
      <Foot />
    </div>
  );
}
