import {
  json,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Link, useLoaderData, MetaFunction, useRouteLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import React from "react";
//ui
import { Card, CardContent } from "~/components/ui/card";
import { Code } from "lucide-react";
import Head from "~/components/Head";
import Foot from "~/components/foot";
import MyInfo from "~/components/myinfo";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { useSiteInfo } from "~/context/SiteInfoContext";
import { TagCloud } from "~/components/tag-cloud";

import {getBlogListData} from "~/services/query.server";


export const meta: MetaFunction = ({ data }: { data: any }) => {
  const {SITEINFO} = useRouteLoaderData("root") as {SITEINFO: any};
  return [
    { title: SITEINFO.name + " - Blog" },
    { name: "description", content: SITEINFO.desc },
    { name: "keywords", content: SITEINFO.summary },
    { name: "robots", content: "index, follow" },
    { name: "author", content: SITEINFO.author },
    // Open Graph
    { property: "og:title", content: SITEINFO.name + " - Blog" },
    { property: "og:description", content: SITEINFO.desc },
    { property: "og:type", content: "article" },
    ...(SITEINFO.avatar ? [
      { property: "og:image", content: SITEINFO.avatar }
    ] : []),
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: SITEINFO.name + " - Blog" },
    { name: "twitter:description", content: SITEINFO.desc },
    ...(SITEINFO.avatar ? [
      { name: "twitter:image", content: SITEINFO.avatar },
      
    ] : [])
  ];
}

export const loader: LoaderFunction = async ({
  request,
  context,
}: LoaderFunctionArgs) => {
  const { env } = context.cloudflare as { env: Env };
  const logger = context.logger;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = 20;
  // 通过 URL 判断是否在首页
  const is_at_homepage = url.pathname === "/";

  const { list: data_list, total, tagCloud } = await getBlogListData(env, page, pageSize, true);
  const totalPages = Math.ceil(total / pageSize);

  return json({
    data_list,
    pagination: {
      currentPage: page,
      totalPages,
      total,
    },
    tagCloud,
    is_at_homepage,
  });
};

//格式化分页url
function getPageUrl(pageNum: number, isHomePage: boolean) {
  if (pageNum === 1) {
    return isHomePage ? '/' : '/blog';
  }
  return isHomePage ? `/pages/${pageNum}` : `/blog/pages/${pageNum}`;
}


// 首先定义标签的接口
interface TagCloud {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export default function BlogHome() {


  const { data_list, pagination, tagCloud, is_at_homepage } = useLoaderData<typeof loader>() as {
    data_list: any;
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
    };
    tagCloud: any;
    is_at_homepage: boolean;
  };
  const { t } = useTranslation();
  const SITEINFO = useSiteInfo();
  const isHomePage = SITEINFO?.homepagecontent === "blog";
  return (
    <div className="min-h-screen  bg-background text-foreground">
      <Head />
      <div className="container  space-y-8 px-4 py-8 mx-auto flex-grow max-w-7xl bg-background text-foreground">
        {is_at_homepage && <MyInfo />}
        <section>
          <div className="space-y-4">
            {data_list && data_list.length > 0 ? (
              data_list.map((item: any) => (
                <Card key={item.id}>
                  <Link
                    prefetch="intent" 
                    to={item.slug ? `/blog/${item.slug}` : `/blog/${item.id}`
                    
                  }
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
                        <h1 className="text-3xl font-bold mb-4">
                          {item?.title}
                        </h1>
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
                {t("no_data")}
              </p>
            )}

            {/* 分页 pagination */}
          </div>
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      to={getPageUrl(Math.max(1, pagination.currentPage - 1), isHomePage)}
                      aria-disabled={pagination.currentPage === 1}
                    />
                  </PaginationItem>

                  {/* 生成页码按钮 pagination item */}
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter(
                      (pageNum) =>
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        Math.abs(pageNum - pagination.currentPage) <= 1
                    )
                    .map((pageNum, index, array) => (
                      <React.Fragment key={pageNum}>
                        {index > 0 && array[index - 1] !== pageNum - 1 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            to={getPageUrl(pageNum, isHomePage)}
                            isActive={pageNum === pagination.currentPage}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    ))}

                  <PaginationItem>
                    <PaginationNext
                      to={getPageUrl(
                        Math.min(pagination.totalPages, pagination.currentPage + 1),
                        isHomePage
                      )}
                      aria-disabled={pagination.currentPage === pagination.totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </section>
        <TagCloud tags={tagCloud} />

      </div>

  
      <Foot />
    </div>
  );
}

