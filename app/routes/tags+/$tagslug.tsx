import { ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardContent } from "~/components/ui/card";
import { Code } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getTagPostsById, getTagPostsBySlug } from "~/services/query.server";
import Head from "~/components/Head";
import Foot from "~/components/foot";

export async function loader({ context, params }: LoaderFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  const { tagslug } = params;
  if (!tagslug) throw new Error("Tag slug is required");

  // 检查 tagslug 是否为数字字符串
  //check if tagslug is a number string
  const isNumeric = /^\d+$/.test(tagslug);

  let tag;
  let posts;

  if (isNumeric) {
    console.log("getTagPostsById", tagslug);
    ({ tag, posts } = await getTagPostsById(env, parseInt(tagslug)));
  } else {
    ({ tag, posts } = await getTagPostsBySlug(env, tagslug));
  }

  return json({ tag, posts });
}

export default function TagSlug() {
  const { tag, posts } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Head />
      <div className="container space-y-8 px-4 py-8 mx-auto flex-grow max-w-7xl bg-background text-foreground">
        <section>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              {t("tag")}: {tag?.name}
            </h1>
          </div>

          <div className="space-y-4">
            {posts && posts.length > 0 ? (
              posts.map((item: any) => (
                <Card key={item.id}>
                  <Link
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
