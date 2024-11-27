import { useState, useEffect, useRef } from "react";
import { Separator } from "~/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Utterances } from "~/components/utterances";

import Foot from "~/components/foot";
import Head from "~/components/Head";
import { SmoothScroll } from "~/components/SmoothScroll";
import { ShareButtons } from '~/components/ShareButtons.client';
import { ExternalLink } from "lucide-react";
import {
  get_collection_detail,
  get_post_detail_by_slug,
  get_random_post_list
} from "~/services/query.server";
import {
  json,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from "@remix-run/cloudflare";
import { Link, useLoaderData, useLocation, useRouteLoaderData } from "@remix-run/react";
import { slugify } from "~/utils/tools";
import { generateTableOfContents } from "~/utils/outline";
import { generateHTML_by_tiptap } from "~/utils/generateHTML";
import logger from "~/utils/logger";
import { useSiteInfo } from "~/context/SiteInfoContext.js";
import { useTranslation } from "react-i18next";
import { useHydrated } from "remix-utils/use-hydrated";
import { ClientOnly } from 'remix-utils/client-only'; // 改用 ClientOnly


export const meta: MetaFunction = ({ data }: { data: any }) => {
  const { post } = data;
  const {SITEINFO} = useRouteLoaderData("root") as {SITEINFO: any};
  const canonical = `${SITEINFO.website_url}${SITEINFO.BLOG_prefix_url}/${post.slug}`;
  return [
    { title: post.title },
    { name: "description", content: post.shortDescription || post.title },
    { name: "keywords", content: post.tags || post.title },
    { name: "robots", content: "index, follow" },
    { name: "author", content: post.author || SITEINFO.author },

    {
      tagName: "link",
      rel: "canonical",
      href: canonical,
    },
    // Open Graph
    { property: "og:title", content: post.title },
    { property: "og:description", content: post.shortDescription || post.title },
    { property: "og:type", content: "article" },
    ...(post.featuredImage ? [
      { property: "og:image", content: post.featuredImage }
    ] : []),
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: post.title },
    { name: "twitter:description", content: post.shortDescription || post.title },
    ...(post.featuredImage ? [
      { name: "twitter:image", content: post.featuredImage },
      
    ] : [])
  ];
}
export const loader = async ({
  request,
  context,
  params,
}: LoaderFunctionArgs) => {
  const { env } = context.cloudflare as { env: Env };
  const { slug } = params;

  
  if (!slug) {
    return redirect("/");
  }


  const post = await get_post_detail_by_slug(env, slugify(slug));
  if (!post) {
    throw new Response("Not found", { status: 404 });
  }

  if (post.auto_redirect== true && post.origin_url) {
    return redirect(post.origin_url);
  }

  // 基于文章ID生成固定的推荐列表
  // generate random list based on post id
  const random_seed = post?.id % 100; 

  const random_list = await get_random_post_list(env, 5, random_seed,true);

  
  let collection = null;
  if (post?.collectionId && post.collectionId !== -1 ) {
    collection = await get_collection_detail(env, post.collectionId);
  }


  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }

  let html;
  try {
    // 在服务器端生成 HTML
    html = await generateHTML_by_tiptap(post?.contentjson);
  } catch (e) {
    logger.error(e);
  }
  return json({ html,post, random_list, collection });
};

export default function BlogPage() {


  const { html, post, random_list, collection } = useLoaderData<typeof loader>();

  const SITEINFO =  useSiteInfo();
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("");
  const isHydrated = useHydrated();
  const originalData: any = post.outline;

  // 添加安全处理
  let tableOfContents: any[] = [];
  try {
    const outlineData = typeof post.outline === 'string' 
      ? JSON.parse(post.outline) 
      : post.outline;
    
    tableOfContents = generateTableOfContents(outlineData);
  } catch (error) {
    console.error('Error parsing outline:', error);
    tableOfContents = [];
  }


  const location = useLocation();
  // 用于引用滚动的父级 div // used to reference the parent div of the scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash) as HTMLElement; // 断言为 HTMLElement
      const scrollContainer = scrollContainerRef.current;

      if (element && scrollContainer) {
        // 假设 navbar 的高度为 60px，你可以根据实际情况调整
        // assume the height of the navbar is 60px, you can adjust it according to the actual situation
        const navbarHeight = 180; 

        // 获取目标元素的相对偏移量，滚动到该位置并留出 navbar 的空间
        // get the relative offset of the target element, scroll to that position and leave space for the navbar
        const elementPosition = element.offsetTop;
        const containerScrollTop = scrollContainer.scrollTop;

        scrollContainer.scrollTo({
          top: elementPosition + containerScrollTop - navbarHeight,
          behavior: "smooth",
        });
      }
    }
  }, [location]);

  const { theme } = useRouteLoaderData("root") as { theme: string };
  
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-background text-foreground">
        <Head />

        <main className="container mx-auto px-4 py-8 flex">
          <div className="flex-grow max-w-5xl">
            <div className="shadow-md rounded-lg p-6 mb-8 bg-background text-foreground">
              <h1 className="text-5xl font-bold mb-4">{post?.title}</h1>
              <div className="flex items-center space-x-4 mb-8 mt-8">
                {post?.author !== SITEINFO?.author ? (
                  <Avatar>
                    <AvatarImage src={post?.author_avatar_url as string || ''} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar>
                    <AvatarImage src={SITEINFO?.avatar} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <div className="font-semibold">{post?.author}</div>
                  <div className="text-sm text-muted-foreground">
                    {post?.createdAt}
                  </div>
                </div>
              </div>
              <div
                className="prose max-w-none dark:prose-invert"
              >
                <div dangerouslySetInnerHTML={{ __html: html || '' }} />


              </div>
            </div>
            <Separator className="my-8" />
            {/* {isHydrated && (
              <ShareButtons 
                title={post.title} 
                description={post.shortDescription}
              />
      )} */}

<ClientOnly fallback={<div className="h-10"></div>}>
        {() => (
          <ShareButtons 
            title={post.title} 
            description={post.shortDescription}
          />
        )}
      </ClientOnly>

            <Separator className="my-8" />
            {/* 评论  comment Utterances*/}
            {SITEINFO?.public_github_repo && (
              <ClientOnly fallback={<div className="h-10"></div>}>
                {() => (
                  <Utterances repo={SITEINFO?.public_github_repo} theme={theme == "dark" ? "github-dark" : "github-light"} />
                )}
              </ClientOnly>
            )}


            <Separator className="my-8" />
            <div className="bg-background   shadow-md rounded-lg p-6">

            {collection && (
              <>
                <h3 className="text-xl font-semibold mb-4">
                 {t("related_collection_details")}  <Link to={`/collections/${collection.slug}`}>{collection.name}</Link> 
                </h3>
              </>
            )}
      

              {/* 推荐文章 recommend articles*/}
              <h3 className="text-xl font-semibold mb-4">{t("recommend")}</h3>
              <div className="space-y-4">
                {random_list &&
                  random_list.map((item: any) => (
                    <div className="flex items-start space-x-4" key={item.id}>
                      <div>
                        <Link to={`${SITEINFO.BLOG_prefix_url}/${item.slug}`}>
                          <div id={item.id} className="font-semibold">
                            {item.title}
                          </div>

                          <p className="text-gray-600">
                            {item.shortDescription}
                          </p>
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>

            </div>
          </div>

          <div className="ml-8 w-64 hidden lg:block bg-background text-foreground">
            <div className="shadow-md rounded-lg p-4 sticky top-20">
                  
              {collection && (
                <>
                  <h3 className="text-xl font-semibold mb-4">
                   <Link to={`/collections/${collection.slug}`}>{t("collection")}: {collection.name}</Link>
                  </h3>
                  {collection.posts && (
                    <div className="space-y-4">
                      {collection.posts.map((item: any) => (
                        <div key={item.id}>
                          <Link to={`${SITEINFO.BLOG_prefix_url}/${item.slug}`}>{item.title}</Link>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {/* 来源  source*/}

              {post?.origin_url && (
                <>
                <div>
                  <a href={post?.origin_url} target="_blank" className="flex items-center"> {/* 添加 flex 和 items-center 以使它们在一行 */}
                    <h3 className="text-lg font-semibold mb-0 mt-4">{t("origin_url")}</h3>
                    <ExternalLink className="h-5 w-5 ml-2 mt-3" /> {/* 添加 ml-2 以增加间距 */}
                  </a>
                </div>
                </>
              )}

               {/* 摘要  summary*/}
              {post?.shortDescription && (
                <>
                  <h3 className="text-lg  font-semibold mb-2 mt-4">{t("summary")}</h3>
                  <div>{post?.shortDescription}</div>
                </>
              )}

              {/* 目录  section*/}
              {tableOfContents && tableOfContents.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold mb-2 mt-4">{t("chapter")}</h3>
                  <nav>
                    <ul className="space-y-2">
                      {tableOfContents.map((section) => (
                        <li key={section.id}>
                          <Link
                            to={`#${section.id}`}
                            className={`block text-base hover:text-blue-500 ${
                              activeSection === section.id.toString()
                                ? "text-blue-500 font-medium"
                                : "text-gray-600"
                            }`}
                          >
                            {section.title}
                          </Link>
                          {section.subsections && section.subsections.length > 0 && (
                            <ul className="ml-4 mt-1 space-y-1">
                              {section.subsections.map((subsection) => (
                                <li key={subsection.id}>
                                  <Link
                                    to={`#${subsection.id}`}
                                    className={`block text-sm hover:text-blue-500 ${
                                      activeSection === subsection.id.toString()
                                        ? "text-blue-500 font-medium"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {subsection.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </nav>
                </>
              )}
            </div>
          </div>
        </main>

        <Foot />
      </div>
    </SmoothScroll>
  );
}
