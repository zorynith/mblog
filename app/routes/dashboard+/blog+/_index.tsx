import {
  json,
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
  useFetcher,
} from "@remix-run/react";
import { PlusCircle, MoreHorizontal } from "lucide-react";

import { Badge } from "~/components/ui/badge";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import type { LoaderFunctionArgs, LinksFunction } from "@remix-run/cloudflare";
import { get_post_list, get_post_list_count } from "~/services/query.server";
import logger from "~/utils/logger";
import { getUserSession } from "~/services/user.server";
import { useTranslation } from "react-i18next";
import React from "react";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { env } = context.cloudflare as { env: Env };
  const { SITEINFO } = env;

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = Number(url.searchParams.get("pageSize")) || 20;
  const status = url.searchParams.get("status") || "all";

  const posts = await get_post_list(env, page, pageSize, status);
  const total = await get_post_list_count(env, status);
  const totalPages = Math.ceil(total / pageSize);

  const sessionUser = await getUserSession(request, context);
  return json({
    SITEINFO,
    posts,
    sessionUser,
    pagination: {
      currentPage: page,
      totalPages,
      total,
    },
  });
};

//格式化分页url
const pageprefix = "/dashboard/blog";

//格式化分页url
function getPageUrl(pageNum: number) {
  return `${pageprefix}/?page=${pageNum}`;
}

export default function Dashboardblog() {
  const { posts, SITEINFO, sessionUser, pagination } =
    useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const { t } = useTranslation();

  const handleTabChange = (value: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams();
      newParams.set("status", value);
      return newParams;
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      fetcher.submit(
        { id },
        { method: "delete", action: "/dashboard/blog/delete" }
      );
    }
  };

  // Filter posts based on the current status
  const currentStatus = searchParams.get("status") || "all";

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 mt-4">
        <Popover>
          <Tabs value={currentStatus} onValueChange={handleTabChange}>
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">{t("All")}</TabsTrigger>
                <TabsTrigger value="published">{t("published")}</TabsTrigger>
                <TabsTrigger value="draft">{t("draft")}</TabsTrigger>
                <TabsTrigger value="archived">{t("archived")}</TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                {/* <Button size="sm" variant="outline" className="h-7 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button> */}
                <Link to="/dashboard/blog/new">
                  <Button size="sm" className="h-7 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      {t("add_blog")}
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
            <TabsContent value={currentStatus}>
              <Card x-chunk="A list of blogs in a table with actions. Each row has an image, name, status,shortDescription, created at and actions.">
                <CardHeader>
                  <CardTitle>{t("posts")}</CardTitle>
                  <CardDescription>
                    {t("manage_your_blogs_and_write_new_one")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                          <span className="sr-only">Image</span>
                        </TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell  max-w-xs">
                          shortDescription
                        </TableHead>

                        <TableHead className="hidden md:table-cell">
                          Created at
                        </TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts &&
                        posts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell className="hidden sm:table-cell">
                              {post?.featuredImage ? (
                                <img
                                  src={post.featuredImage}
                                  alt=""
                                  className="mr-4 mt-1 h-20 w-20 object-cover"
                                />
                              ) : (
                                <img
                                  src="/assets/placeholder.svg"
                                  alt="Placeholder"
                                  className="mr-4 mt-1 h-20 w-20 object-cover"
                                />
                              )}
                            </TableCell>

                            <TableCell className="flex items-center md:table-cell text-xl">
                              <Link
                                to={`/dashboard/blog/${post.id}`}
                                className="md:table-cell text-xl"
                              >
                                {post?.title}
                              </Link>
                            </TableCell>

                            <TableCell>
                              <Badge variant="outline">{post?.status}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell  max-w-xs">
                              {post?.shortDescription}
                            </TableCell>

                            <TableCell className="hidden md:table-cell">
                              {post?.createdAt}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    aria-haspopup="true"
                                    size="icon"
                                    variant="ghost"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="z-1050"
                                >
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>
                                    <Link to={`/dashboard/blog/${post.id}`}>
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <a
                                      href={`/blog/${post.slug}`}
                                      target="_blank"
                                    >
                                      view
                                    </a>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => handleDelete(post.id)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    {t("showing")} <strong>{posts.length}</strong> of{" "}
                    <strong>{pagination.total}</strong> {t("posts")}
                    {/* 分页 */}
                    {pagination.totalPages > 1 && (
                      <div className="mt-8">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                to={getPageUrl(
                                  Math.max(1, pagination.currentPage - 1)
                                )}
                                aria-disabled={pagination.currentPage === 1}
                              />
                            </PaginationItem>

                            {/* 生成页码按钮 */}
                            {Array.from(
                              { length: pagination.totalPages },
                              (_, i) => i + 1
                            )
                              .filter(
                                (pageNum) =>
                                  pageNum === 1 ||
                                  pageNum === pagination.totalPages ||
                                  Math.abs(pageNum - pagination.currentPage) <=
                                    1
                              )
                              .map((pageNum, index, array) => (
                                <React.Fragment key={pageNum}>
                                  {index > 0 &&
                                    array[index - 1] !== pageNum - 1 && (
                                      <PaginationItem>
                                        <PaginationEllipsis />
                                      </PaginationItem>
                                    )}
                                  <PaginationItem>
                                    <PaginationLink
                                      to={getPageUrl(pageNum)}
                                      isActive={
                                        pageNum === pagination.currentPage
                                      }
                                    >
                                      {pageNum}
                                    </PaginationLink>
                                  </PaginationItem>
                                </React.Fragment>
                              ))}

                            <PaginationItem>
                              <PaginationNext
                                to={getPageUrl(
                                  Math.min(
                                    pagination.totalPages,
                                    pagination.currentPage + 1
                                  )
                                )}
                                aria-disabled={
                                  pagination.currentPage ===
                                  pagination.totalPages
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </Popover>
      </main>
    </div>
  );
}
