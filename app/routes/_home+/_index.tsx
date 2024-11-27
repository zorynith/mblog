import { json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/cloudflare";
import { loader as blogLoader } from "~/routes/blog+/_index";

import { useLoaderData, useRouteLoaderData } from "@remix-run/react";

export async function loader(args: LoaderFunctionArgs) {
  // 复用 _index.tsx 的 loader 逻辑
  // reuse the loader logic of _index.tsx
  const { env } = args.context.cloudflare as { env: Env };
  const isHomeBlog = env?.SITEINFO?.homepagecontent === "blog";

  
  if (isHomeBlog) {
    // 如果主页设置为博客，则使用博客的 loader
    // if home page is blog, then use blog loader
    return blogLoader({
      context: { cloudflare: { env } },
      request: new Request(new URL(`/?page=${args.params.page}`, args.request.url)),
    } as LoaderFunctionArgs);
  }


    // 否则返回空数据（用于 About 页面）
    //else return json({ isHomeBlog: false });
    return json({ isHomeBlog: false });
}
// USE _index.tsx 的组件


// META SEO config
export const meta: MetaFunction = ({ data }: { data: any }) => {
  const {SITEINFO} = useRouteLoaderData("root") as {SITEINFO: any};
  return [
    { title: SITEINFO.name + "" },
    { name: "description", content: SITEINFO.desc },
    { name: "keywords", content: SITEINFO.summary },
    { name: "robots", content: "index, follow" },
    { name: "author", content: SITEINFO.author },
    // Open Graph
    { property: "og:title", content: SITEINFO.name },
    { property: "og:description", content: SITEINFO.desc },
    { property: "og:type", content: "article" },
    ...(SITEINFO.avatar ? [
      { property: "og:image", content: SITEINFO.avatar }
    ] : []),
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: SITEINFO.name },
    { name: "twitter:description", content: SITEINFO.desc },
    ...(SITEINFO.avatar ? [
      { name: "twitter:image", content: SITEINFO.avatar },
      
    ] : [])
  ];
}




// 如果默认显示博客页面
// if default show blog page
export { default } from "~/routes/blog+/_index";

// 或者如果默认显示关于页面
// export { default } from "./Aboutme";