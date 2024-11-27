// remix
import type {
  LoaderFunctionArgs,
  LinksFunction,
  LoaderFunction,
} from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";

import {
  useLoaderData,
  Form,
  Link,
  useActionData,
  useSubmit,
  useNavigation,
  useParams,
  useRouteLoaderData,
  useFetcher,
} from "@remix-run/react";
//components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import { TimePickerInput } from "~/components/ui/time-picker-input";
import React, { lazy, Suspense, useEffect, useRef, useState } from "react";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import dayjs from "dayjs";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ExternalLink,
  Wand2,
} from "lucide-react";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { parseWithZod } from "@conform-to/zod";
import {
  useForm,
  getFormProps,
  getInputProps,
  getFieldsetProps,
  getTextareaProps,
  getSelectProps,
  SubmissionResult,
} from "@conform-to/react";
import { z } from "zod";
import { useCallback } from "react";

import { OpenaiModelConfig } from "aieditor";
import { extractFirstImageFromContent, slugify } from "~/utils/tools";

// services
import {
  get_post_detail_by_id,
  create_post,
  update_post,
  check_slug,
  addPostToCollection,
  get_collection_list_with_posts_count,
  removePostFromCollection,
  getPromptOptions,
  handlePostTags,
} from "~/services/query.server";
import { detectLocale } from "~/services/locale.server";
import i18next from "~/services/i18next.server";
import { useTranslation } from "react-i18next";
import { useToast } from "~/hooks/use-toast";
import { requireUser } from "~/services/auth.server";

// 定义表单schema
const schema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "title_min_3_chars"),
  shortDescription: z.string().optional(),
  contentjson: z.any().optional(),
  author: z.string().optional(),
  status: z.string().optional(),
  featuredImage: z.string().optional(),
  slug: z.string(),
  tags: z.string().optional(),
  collectionId: z.string().optional(),
  origin_url: z.string().optional(),
  auto_redirect: z.boolean().optional(),
  date: z.date().optional(),
  createdAt: z.date().optional(),
});

// Lazy load the AIEditor component
const LazyAIEditor = lazy(() => import("~/components/AIEditorClient.client"));

export const loader: LoaderFunction = async ({
  request,
  context,
  params,
}: LoaderFunctionArgs) => {
  const { id } = params;
  const { env } = context.cloudflare as { env: Env };

  const sessionUser = await requireUser(context, request);

  if (!id) {
    return redirect("/dashboard");
  }
  const collections = await get_collection_list_with_posts_count(env);
  const post = await get_post_detail_by_id(env, Number(id));

  //ai config
  const prompts = await getPromptOptions(
    env,
    sessionUser?.id?.toString() || ""
  );

  let { SITEINFO } = env || {};
  const aiconfig = {
    ai_apikey: prompts?.ai_apikey || env.ai_apikey || env.SECRET,
    ai_endpoint: prompts?.ai_endpoint || env.ai_endpoint || "/dashboard/api/ai",
    ai_model:
      prompts?.ai_model ||
      prompts?.cf_text_model ||
      env.ai_model ||
      env.cf_ai_model ||
      "@cf/meta/llama-3.1-70b-instruct",
    continuation: prompts?.continuation || "",
    optimization: prompts?.optimization || "",
  };

  return json({ SITEINFO, post, aiconfig, collections });
};

export const action = async ({
  request,
  context,
  params,
}: LoaderFunctionArgs) => {
  const { id } = params;
  const { env } = context.cloudflare as { env: Env };
  const { SITEINFO } = env;
  const locale = await detectLocale({
    request,
    params,
    defaultLocale: SITEINFO?.locale,
  });
  const t = await i18next.getFixedT(locale);

  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });
  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const {
    id: id_,
    title,
    shortDescription,
    content,
    contentjson,
    markdownvalue,
    outline,
    author,
    status,
    featuredImage,
    slug,
    tags,
    collectionId,
    origin_url,
    auto_redirect,
    createdAt,
  } = submission.payload;

  // 添加安全检查和默认值处理
  const contentJsonData = contentjson
    ? typeof contentjson === "string"
      ? JSON.parse(contentjson)
      : contentjson
    : {};

  const outlineData = outline
    ? typeof outline === "string"
      ? JSON.parse(outline)
      : outline
    : {};

  const firstImage = extractFirstImageFromContent(
    contentJsonData,
    markdownvalue as string
  );

  const slug_ = slugify((slug?.toString() || "").trim());

  // 如果没有id，则创建新文章
  if (!id_) {
    const checkSlug = await check_slug(env, slug_.toString());
    if (checkSlug) {
      return json(
        submission.reply({
          formErrors: [t("slug_exists")],
        })
      );
    }
    const newpost = await create_post(env, {
      title,
      shortDescription,
      content: markdownvalue,
      contentjson: contentJsonData,
      outline: outlineData,
      author: author || SITEINFO?.author || "anonymous",
      status: status || "draft",
      featuredImage: featuredImage || firstImage || "",
      collectionId: Number(collectionId) || 0,
      origin_url: origin_url || "",
      auto_redirect: auto_redirect || false,
      tags: tags || "",
      slug:
        slug_ || Date.now().toString(36) + Math.random().toString(36).slice(2),
    });

    if (tags) {
      await handlePostTags(env, Number(newpost.id), tags.toString());
    }

    if (
      collectionId &&
      (collectionId !== "0" || collectionId !== 0 || collectionId !== "-1")
    ) {
      await addPostToCollection(env, Number(newpost.id), Number(collectionId));
    }

    return redirect("/dashboard/blog/" + newpost.id);
  }

  if (id_) {
    const oldpost = await get_post_detail_by_id(env, Number(id));
    if (oldpost?.slug != slug_.toString()) {
      const checkSlug = await check_slug(env, slug_.toString());
      if (checkSlug) {
        return json(
          submission.reply({
            formErrors: [t("slug_exists")],
          })
        );
      }
    }

    // 处理集合关系
    if (oldpost?.collectionId === 0 && collectionId !== "0") {
      await addPostToCollection(env, Number(id_), Number(collectionId));
    } else if (
      oldpost?.collectionId &&
      oldpost?.collectionId !== 0 &&
      collectionId === "0"
    ) {
      await removePostFromCollection(env, Number(id_), oldpost?.collectionId);
    } else {
      await addPostToCollection(
        env,
        Number(id_),
        Number(collectionId),
        oldpost?.collectionId || 0
      );
    }

    const re = await update_post(env, Number(id_), {
      title,
      shortDescription,
      content: markdownvalue,
      contentjson: contentJsonData,
      outline: outlineData,
      author: author || SITEINFO?.author || "anonymous",
      status: status || "draft",
      slug: slug_,
      featuredImage: firstImage || "",
      collectionId: Number(collectionId),
      origin_url: origin_url || "",
      auto_redirect: auto_redirect || false,
      tags: tags || "",
      createdAt: createdAt,
    });

    if (tags) {
      await handlePostTags(env, Number(id_), tags);
    }

    return redirect(`/dashboard/blog/${id_}`);
  }
};

// Main component
export default function Blogpost() {
  const { post, SITEINFO, aiconfig, collections }: any =
    useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { id } = useParams(); // 获取路由参数中的 id

  const isSubmitting = navigation.formAction === `/dashboard/blog/${id}`;

  const lastResult = useActionData<typeof action>();

  const [form, fields] = useForm({
    lastResult: lastResult as SubmissionResult<string[]> | null | undefined,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    defaultValue: post
      ? {
          title: post.title,
          shortDescription: post.shortDescription,
          author: post.author,
          status: post.status,
          featuredImage: post.featuredImage,
          content: post.content,
          contentjson: post.contentjson,
          outline: post.outline,
          slug: post.slug,
          tags: post.tags,
          date: post.createdAt,
          collectionId: post.collectionId,
        }
      : undefined,
    shouldValidate: "onSubmit",
    shouldRevalidate: "onSubmit",
  });

  const submit = useSubmit();

  const [contentjsonValue, setContentjsonValue] = useState<any>(
    post?.contentjson || {}
  );
  const [markdownvalue, setMarkdownvalue] = useState(post?.content || "");
  const [outlineValue, setOutlineValue] = useState<any>(post?.outline || "");

  const [datevalue, setdatevalue] = useState<Date>(
    post?.createdAt || new Date()
  );

  const [shortDescriptionValue, setShortDescriptionValue] = useState(
    post?.shortDescription || ""
  );
  const [titleValue, setTitleValue] = useState(post?.title || "");
  const [slugValue, setSlugValue] = useState(post?.slug || "");

  const [slugPreview, setSlugPreview] = useState("");
  // 生成标题对话框 generate title dialog
  const [showTitlesDialog, setShowTitlesDialog] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);

  const { toast } = useToast();
  const fetcher = useFetcher();

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      // logger.info({
      //   msg: "blog.$id handleSubmit",
      //   formData,
      // });
      // 添加所有字段到 formData
      // add all fields to formData
      Object.entries(fields).forEach(([key, field]) => {
        if (field.value !== undefined) {
          formData.append(key, field.value as string);
        }
      });
      formData.set(fields.shortDescription.name, shortDescriptionValue);
      formData.set(fields.title.name, titleValue);
      formData.set(fields.slug.name, slugValue);

      // 添加其他字段
      // add other fields
      if (contentjsonValue)
        formData.set("contentjson", JSON.stringify(contentjsonValue));
      if (outlineValue) formData.set("outline", JSON.stringify(outlineValue));
      if (markdownvalue) formData.set("markdownvalue", markdownvalue);
      if (datevalue)
        formData.set(
          "createdAt",
          dayjs(datevalue).format("YYYY-MM-DD HH:mm:ss")
        );
      submit(formData, {
        method: "post",
        // 添加这个配置，强制重新获取数据
        // add this configuration to force re-fetch data
        navigate: true,
        // 可选：添加替换历史记录，这样后退按钮不会回到编辑前的状态
        // optional: add replace history, so the back button will not return to the previous editing state
        replace: true,
      });
    },
    [fields, contentjsonValue, outlineValue, markdownvalue, submit]
  );

  //处理生成 标题 、slug 、摘要
  // handle generate title, slug, summary
  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data?.error) {
        toast({
          title: t("error"),
          description: fetcher.data.error,
          variant: "destructive",
        });
      } else {
        // 根据返回的数据类型更新对应字段
        console.log("fetcher.data", fetcher.data);
        if (fetcher.data?.titles) {
          setGeneratedTitles(fetcher.data.titles);
          setShowTitlesDialog(true);
        }

        if (fetcher.data?.summary) {
          // 移除多余的引号
          const cleanSummary = fetcher.data.summary.replace(/^"|"$/g, "");
          console.log("Attempting to update summary with:", {
            summary: cleanSummary,
            fieldName: fields.shortDescription.name,
          });

          try {
            setShortDescriptionValue(cleanSummary);

            toast({
              title: t("success"),
              description: t("generate_success"),
            });
          } catch (error) {
            console.error("Error updating form:", error);
            toast({
              title: t("error"),
              description: "Failed to update form field",
              variant: "destructive",
            });
          }
        }
        if (fetcher.data?.slug) {
          setSlugValue(fetcher.data.slug);
        }

        toast({
          title: t("success"),
          description: t("generate_success"),
        });
      }
    }
  }, [fetcher.data]);

  return (
    <div>
      <Form method="post" id={form.id} onSubmit={handleSubmit}>
        {post && <input type="hidden" name="id" value={post.id} />}
        <div className="container space-y-8 px-4 py-8 mx-auto flex-grow max-w-9xl">
          <div className="mx-auto grid max-w-[72rem] flex-1 auto-rows-max gap-4">
            <div className="flex items-center gap-4">
              <Link to="/dashboard/blog">
                <Button variant="outline" size="icon" className="h-7 w-7">
                  <ChevronLeft className="h-4 w-4" />

                  <span className="sr-only">Back</span>
                </Button>
              </Link>
              {post?.status && (
                <Badge variant="outline" className="ml-auto sm:ml-0">
                  {post?.status}
                </Badge>
              )}
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                {post?.slug && (
                  <Button variant="outline" asChild>
                    <a
                      href={`/blog/${post?.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      {t("preview")}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button type="submit">
                  {post
                    ? isSubmitting
                      ? t("updating")
                      : t("update")
                    : isSubmitting
                    ? t("creating")
                    : t("create")}
                </Button>

                {lastResult && (
                  <div>
                    {lastResult.status === "success"
                      ? t("success")
                      : t("failed")}{" "}
                    <a href="/dashboard/blog">{t("back")}</a>
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-[4fr_1fr]  lg:gap-4">
              {/* 左侧  blog details */}
              <div className="grid auto-rows-max items-start gap-2  lg:gap-4 ">
                <Card x-chunk="dashboard-07-chunk-0">
                  <CardHeader>
                    <CardTitle> {t("blog_details")} </CardTitle>
                    <CardTitle>
                      <div className="text-red-500">{form.errors}</div>{" "}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={fields.title.id}>
                            {t("post_title")} {fields.title.errors}
                          </Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.preventDefault();
                              if (
                                !markdownvalue ||
                                typeof markdownvalue !== "string" ||
                                markdownvalue.length < 10
                              ) {
                                toast({
                                  title: t("error"),
                                  description: t("please_input_content_first"),
                                  variant: "destructive",
                                });
                                return;
                              }

                              fetcher.submit(
                                {
                                  action: "generate_title",
                                  content: markdownvalue.slice(0, 2000),
                                  shortDescription: shortDescriptionValue,
                                  apiKey: aiconfig.ai_apikey,
                                  model: aiconfig.ai_model,
                                  endpoint: aiconfig.ai_endpoint,
                                },
                                {
                                  method: "post",
                                  action: "/dashboard/api/ai/generate-blog",
                                }
                              );
                            }}
                          >
                            {fetcher.state === "submitting" ? (
                              <div className="h-4 w-4 animate-spin">...</div>
                            ) : (
                              <Wand2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <Input
                          id={fields.title.id}
                          name={fields.title.name}
                          value={titleValue}
                          onChange={(e) => setTitleValue(e.target.value)}
                          className="w-full"
                          aria-invalid={Boolean(fields.title.errors)}
                          aria-describedby={
                            fields.title.errors
                              ? `${fields.title.id}-error`
                              : undefined
                          }
                        />

                        {/* 标题选择对话框  title selection dialog */}
                        <Dialog
                          open={showTitlesDialog}
                          onOpenChange={setShowTitlesDialog}
                        >
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>{t("select_title")}</DialogTitle>
                              <DialogDescription>
                                {t("select_title_description")}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              {generatedTitles.map((title, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  className="w-full justify-start text-left h-auto whitespace-normal"
                                  onClick={() => {
                                    setTitleValue(title);
                                    setShowTitlesDialog(false);
                                    toast({
                                      title: t("success"),
                                      description: t("title_selected"),
                                    });
                                  }}
                                >
                                  {title}
                                </Button>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="grid gap-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={fields.shortDescription.id}>
                            {t("post_description")}{" "}
                            {fields.shortDescription.errors}
                          </Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.preventDefault();
                              if (
                                !markdownvalue ||
                                markdownvalue?.length < 10
                              ) {
                                toast({
                                  title: t("error"),
                                  description: t("please_input_content_first"),
                                  variant: "destructive",
                                });
                                return;
                              }

                              if (!aiconfig.ai_apikey) {
                                toast({
                                  title: t("error"),
                                  description: t("please_input_api_key_first"),
                                  variant: "destructive",
                                });
                                return;
                              }

                              fetcher.submit(
                                {
                                  action: "generate_summary",
                                  content: markdownvalue.slice(0, 2000),
                                  apiKey: aiconfig.ai_apikey,
                                  model: aiconfig.ai_model,
                                  endpoint: aiconfig.ai_endpoint,
                                },
                                {
                                  method: "post",
                                  action: "/dashboard/api/ai/generate-blog",
                                }
                              );
                            }}
                          >
                            {fetcher.state === "submitting" ? (
                              <div className="h-4 w-4 animate-spin">...</div>
                            ) : (
                              <Wand2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {t("generate_summary")}
                            </span>
                          </Button>
                        </div>
                        <Textarea
                          id={fields.shortDescription.id}
                          name={fields.shortDescription.name}
                          value={shortDescriptionValue}
                          onChange={(e) =>
                            setShortDescriptionValue(e.target.value)
                          }
                          className="min-h-16"
                          rows={2}
                          aria-invalid={Boolean(fields.shortDescription.errors)}
                          aria-describedby={
                            fields.shortDescription.errors
                              ? `${fields.shortDescription.id}-error`
                              : undefined
                          }
                        />
                      </div>
                    </div>
                  </CardContent>

                  {/* origin_url */}

                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={fields.origin_url.id}>
                            origin_url
                          </Label>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="auto_redirect" className="text-sm">
                              {t("direct_redirect")}
                            </Label>
                            <Switch
                              id="auto_redirect"
                              {...getInputProps(fields.auto_redirect, {
                                type: "checkbox",
                              })}
                              defaultChecked={post?.auto_redirect}
                            />
                          </div>
                        </div>
                        <Input
                          {...getInputProps(fields.origin_url, {
                            type: "text",
                          })}
                          defaultValue={post?.origin_url || ""}
                        />
                      </div>
                    </div>
                  </CardContent>

                  {/* 编辑器  AIEditorWrapper */}
                  <CardContent>
                    <div className="grid gap-6">
                      <AIEditorWrapper
                        aiconfig={aiconfig}
                        value={contentjsonValue || {}}
                        onChangeoutline={(val: any) => setOutlineValue(val)}
                        onChangejson={(val: any) => setContentjsonValue(val)}
                        onChangemarkdown={(val: any) => setMarkdownvalue(val)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* 右侧  options */}
              <div className="grid auto-rows-max items-start gap-2 lg:gap-4  md:w-auto ml-auto">
                <Card x-chunk="dashboard-07-chunk-3">
                  <CardHeader>
                    <CardTitle> Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor={fields.status.id}>
                          Status {fields.status.errors}
                        </Label>
                        <Select {...getSelectProps(fields.status)}>
                          <SelectTrigger
                            id={fields.status.id}
                            aria-label="Select status"
                          >
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">draft</SelectItem>
                            <SelectItem value="published">published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>

                  {/* slug */}
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={fields.slug.id}>
                            slug {fields.slug.errors}
                          </Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.preventDefault();
                              if (
                                !titleValue ||
                                typeof titleValue !== "string"
                              ) {
                                toast({
                                  title: t("error"),
                                  description: t("please_input_content_first"),
                                  variant: "destructive",
                                });
                                return;
                              }

                              fetcher.submit(
                                {
                                  action: "generate_slug",
                                  title: titleValue,
                                  shortDescription: shortDescriptionValue,
                                  apiKey: aiconfig.ai_apikey,
                                  model: aiconfig.ai_model,
                                  endpoint: aiconfig.ai_endpoint,
                                },
                                {
                                  method: "post",
                                  action: "/dashboard/api/ai/generate-blog",
                                }
                              );
                            }}
                          >
                            {fetcher.state === "submitting" ? (
                              <div className="h-4 w-4 animate-spin">...</div>
                            ) : (
                              <Wand2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <Input
                          id={fields.slug.id}
                          name={fields.slug.name}
                          value={slugValue}
                          onChange={(e) => {
                            const newValue = slugify(e.target.value);
                            setSlugPreview(newValue);
                            setSlugValue(newValue);
                          }}
                          aria-invalid={Boolean(fields.slug.errors)}
                          aria-describedby={
                            fields.slug.errors
                              ? `${fields.slug.id}-error`
                              : undefined
                          }
                        />
                        {slugPreview && <div>{`real: ` + slugPreview}</div>}
                      </div>
                    </div>
                  </CardContent>
                  {/* author */}
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor={fields.author.id}>author</Label>
                        <Input
                          {...getInputProps(fields.author, { type: "text" })}
                          defaultValue={
                            post?.author || SITEINFO?.author || "anonymous"
                          }
                        ></Input>
                      </div>
                    </div>
                  </CardContent>
                  {/* tags */}
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor={fields.tags.id}>tags</Label>
                        <Input
                          {...getInputProps(fields.tags, { type: "text" })}
                          defaultValue={post?.tags || ""}
                        ></Input>
                      </div>
                    </div>
                  </CardContent>

                  {/* collection */}
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor={fields.collectionId.id}>
                          {t("collection")} {fields.collectionId.errors}
                        </Label>
                        <Select {...getSelectProps(fields.collectionId)}>
                          <SelectTrigger
                            id={fields.collectionId.id}
                            aria-label="Select collection"
                          >
                            <SelectValue placeholder="Select collection" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">None</SelectItem>
                            {collections?.map((collection: any) => (
                              <SelectItem
                                key={collection.id}
                                value={collection.id.toString()}
                              >
                                {collection.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>

                  {/* date */}
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label>Date and Time</Label>
                        <div className="flex flex-col gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !datevalue && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {datevalue ? (
                                  dayjs(datevalue).format("YYYY-MM-DD HH:mm:ss")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                selected={datevalue}
                                onSelect={(date) => {
                                  if (date) {
                                    const newDate = new Date(datevalue);
                                    newDate.setFullYear(date.getFullYear());
                                    newDate.setMonth(date.getMonth());
                                    newDate.setDate(date.getDate());
                                    setdatevalue(newDate);
                                  }
                                }}
                              />
                            </PopoverContent>
                          </Popover>

                          <TimePickerInput
                            value={datevalue}
                            onChange={(date) => setdatevalue(date)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}

/* 
  编辑器组件
*/
function AIEditorWrapper(props: any, ref: any) {
  const { theme } = useRouteLoaderData("root") as { theme: string };

  const [isClient, setIsClient] = useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true); // 在客户端标记已加载 // mark as loaded in the client
  }, []);

  const { t, i18n } = useTranslation();
  const locale = i18n.language || "en";
  if (!isClient) {
    return <div>{t("loading_editor")}</div>; // 在服务端渲染时显示占位符 // display placeholder when rendered on the server
  }

  let options = {
    placeholder: t("editor_placeholder"),
    theme: theme || "light",
    style: { height: 620 },
    lang: locale,
  } as any;

  if (props?.aiconfig?.ai_apikey) {
    options = {
      ...options,
      ai: {
        openai: {
          apiKey: props.aiconfig.ai_apikey,
          endpoint: props.aiconfig.ai_endpoint,
          model: props.aiconfig.ai_model,
        } as OpenaiModelConfig,
        menus: [
          {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"></path><path d="M4 18.9997H20V13.9997H22V19.9997C22 20.552 21.5523 20.9997 21 20.9997H3C2.44772 20.9997 2 20.552 2 19.9997V13.9997H4V18.9997ZM16.1716 6.9997L12.2218 3.04996L13.636 1.63574L20 7.9997L13.636 14.3637L12.2218 12.9495L16.1716 8.9997H5V6.9997H16.1716Z"></path></svg>`,
            name: t("ai_continuation"),
            prompt:
              props.aiconfig.continuation ||
              `
              As a professional blog writer, please continue expanding the content above while maintaining:
                The original writing style and tone
              Similar sentence structure and word choice patterns
              The same level of formality/casualness
              Matching paragraph length and formatting
              Natural flow and logical progression of ideas

                First check if the content contains any Chinese characters. If there are Chinese characters, respond in Chinese regardless of other languages present. If no Chinese characters are detected, then respond in the language of the content.. Continue the narrative seamlessly as if written by the same author, focusing on providing valuable insights and maintaining consistent voice throughout the continuation.`,
            text: "focusBefore",
            model: "auto",
          },
          {
            icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"></path><path d="M15 5.25C16.7949 5.25 18.25 3.79493 18.25 2H19.75C19.75 3.79493 21.2051 5.25 23 5.25V6.75C21.2051 6.75 19.75 8.20507 19.75 10H18.25C18.25 8.20507 16.7949 6.75 15 6.75V5.25ZM4 7C4 5.89543 4.89543 5 6 5H13V3H6C3.79086 3 2 4.79086 2 7V17C2 19.2091 3.79086 21 6 21H18C20.2091 21 22 19.2091 22 17V12H20V17C20 18.1046 19.1046 19 18 19H6C4.89543 19 4 18.1046 4 17V7Z"></path></svg>`,
            name: t("ai_optimization"),
            prompt: `As a professional editor, please refine and enhance the above content while:

Maintaining the core message and key points
Improving clarity and readability
Strengthening word choice and sentence structure
Removing redundancies and filler words
Ensuring natural flow between ideas

First check if the content contains any Chinese characters. If there are Chinese characters, respond in Chinese regardless of other languages present. If no Chinese characters are detected, then respond in the language of the content, preserving the original tone and style while making it more polished and engaging. Focus on making impactful improvements without changing the fundamental meaning or author's voice.`,
            text: "selected",
            model: "auto",
          },
        ],
      },
    };
  }

  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <LazyAIEditor ref={editorRef} {...props} {...options} />
    </Suspense>
  );
}
