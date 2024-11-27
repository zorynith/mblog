import {
  json,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/cloudflare";
import { Link, useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { PlusCircle, MoreHorizontal, Image, Eye } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { slugify } from "~/utils/tools";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { HtmlContent } from "~/components/ui/html-content";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { useTranslation } from "react-i18next";
import {
  get_collection_list_with_posts_count,
  create_collection,
  update_collection,
} from "~/services/query.server";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RichEditor } from "~/components/ui/rich-editor";
import { toast } from "~/hooks/use-toast";
import { generateId } from "~/utils/tools";
import { ImageUploadButton } from "~/components/image-upload-button";
import { Switch } from "~/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";

export async function loader({ context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };

  const collections = await get_collection_list_with_posts_count(env);
  // context.logger.info("collections", { collections });

  return json({ collections });
}

interface CollectionFormData {
  id?: number;
  name: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  isPublished?: boolean;
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  const formData = await request.formData();

  if (request.method === "POST") {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    let slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const coverImage = formData.get("coverImage") as string;
    const isPublished = formData.get("isPublished") === "true";

    let finalSlug = slug?.trim() || slugify(name);
    if (!finalSlug) {
      finalSlug = generateId(8);
    }

    if (id) {
      const collection = await update_collection(env, {
        id: parseInt(id),
        name,
        slug: finalSlug,
        description,
        coverImage,
        isPublished
      });
      return json({ success: true, collection });
    } else {
      const collection = await create_collection(env, {
        name,
        slug: finalSlug,
        description,
        coverImage,
        isPublished: isPublished || false
      });
      return json({ success: true, collection });
    }
  }

  return json({ success: false });
}

export default function CollectionsAdmin() {
  const { collections } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<CollectionFormData | null>(null);
  const [previewSlug, setPreviewSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const handleImageUpload = useCallback(
    (url: string) => {
      if (url) {
        setImageUrl(url);
      } else {
        // 文件被移除，清除上传的图片 URL
        setImageUrl(null);
      }
    },
    [imageUrl]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    formData.set("isPublished", isPublished.toString());

    fetcher.submit(formData, { method: "post" });
    setIsDialogOpen(false);
    setEditingCollection(null);
  };

  const handleAdd = () => {
    setEditingCollection(null);
    setImageUrl("");
    setPreviewSlug("");
    setIsPublished(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (collection: CollectionFormData) => {
    setEditingCollection({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      coverImage: collection.coverImage,
      isPublished: collection.isPublished
    });
    setImageUrl(collection.coverImage || "");
    setIsPublished(collection.isPublished || true);
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingCollection(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("confirm_delete_collection"))) {
      const formData = new FormData();
      formData.append("id", id.toString());

      fetcher.submit(formData, {
        method: "DELETE",
        action: "/dashboard/blog/collections/delete",
      });
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPreviewSlug(value ? slugify(value) : "");
  };

  const handlePublishToggle = async (id: number, currentState: boolean) => {
    const formData = new FormData();
    formData.append("id", id.toString());
    formData.append("isPublished", (!currentState).toString());
    
    fetcher.submit(formData, {
      method: "PATCH",
      action: "/dashboard/blog/collections/toggle-publish"
    });
  };

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      toast({
        title: t("success"),
        description: t("success_operation"),
      });
    } else if (fetcher.data?.error) {
      toast({
        title: t("error"),
        description: fetcher.data.error,
        variant: "destructive",
      });
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("collections")}</CardTitle>
              <CardDescription>
                {t("manage_collections_description")}
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="h-8 gap-1"
              onClick={handleAdd}
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t("add_collection")}</span>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("slug")}</TableHead>
                  <TableHead>{t("preview")}</TableHead>
                  <TableHead>{t("description")}</TableHead>
                  <TableHead className="text-center">
                    {t("posts_count")}
                  </TableHead>
                  <TableHead>{t("created_at")}</TableHead>
                  <TableHead className="text-center">{t("status")}</TableHead>
                  <TableHead className="w-[100px]">
                    <span className="sr-only">{t("actions")}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.map((collection) => (
                  <TableRow key={collection.id}>
                    <TableCell className="font-medium">
                      {collection.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {collection.slug}
                    </TableCell>
                    <TableCell>
                      {collection.coverImage ? (
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Image className="h-4 w-4" />
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <img
                              src={collection.coverImage}
                              alt={collection.name}
                              className="rounded-md max-w-full h-auto"
                            />
                          </HoverCardContent>
                        </HoverCard>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                                <Image className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("no_cover_image")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                    <TableCell className="max-w-md">
                      {collection.description ? (
                        <HoverCard>
                          <HoverCardTrigger className="cursor-help">
                            <div className="text-sm text-muted-foreground">
                              {truncateText(collection.description, 100)}
                              {collection.description.length > 100 && "..."}
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="text-sm">
                              <HtmlContent text={collection.description} />
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          {t("no_description")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {collection.postsCount}
                    </TableCell>
                    <TableCell>
                      {new Date(collection.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={collection.isPublished}
                        onCheckedChange={() => handlePublishToggle(collection.id, collection.isPublished)}
                        aria-label={t("toggle_publish")}
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">{t("open_menu")}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleEdit(collection)}
                          >
                            {t("edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `/dashboard/blog/collections/${collection.id}/sort`
                              )
                            }
                          >
                            {t("sort_posts")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(collection.id)}
                          >
                            {t("delete")}
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
              {t("showing_collections", { count: collections.length })}
            </div>
          </CardFooter>
        </Card>

        {/* 创建/编辑集合的 Dialog */}
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            if (!open) {
              handleClose();
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCollection ? t("edit_collection") : t("add_collection")}
              </DialogTitle>
              <DialogDescription>
                {editingCollection
                  ? t("edit_collection_description")
                  : t("add_collection_description")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              {editingCollection && (
                <input type="hidden" name="id" value={editingCollection.id} />
              )}
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("collection_name")}</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingCollection?.name}
                    placeholder={t("collection_name_placeholder")}
                    required
                  />
                </div>

                {/* 图片上传部分 */}
                <div className="space-y-2">
                  <Label htmlFor="coverImage">{t("collection_image")}</Label>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Input
                        id="coverImage"
                        name="coverImage"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder={t("collection_image_url_placeholder")}
                      />
                    </div>
                    <ImageUploadButton
                      project_name="blog"
                      accept="image/*"
                      maxSize={10000000}
                      onFileSelect={(url) => setImageUrl(url)}
                      variant="outline"
                    />
                  </div>
                  {imageUrl && (
                    <div className="mt-2">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="max-w-[200px] h-auto rounded-md"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">
                    {t("collection_slug")}
                    <span className="text-xs text-muted-foreground ml-2">
                      ({t("optional")})
                    </span>
                  </Label>
                  <Input
                    id="slug"
                    name="slug"
                    defaultValue={editingCollection?.slug}
                    onChange={handleSlugChange}
                    placeholder={t("collection_slug_placeholder")}
                  />
                  {previewSlug && (
                    <p className="text-xs text-muted-foreground">
                      {t("preview")}: {previewSlug}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t("description")}</Label>
                  <RichEditor
                    defaultValue={editingCollection?.description}
                    onChange={(content) => {
                      const formElement = document.querySelector("form");
                      const descriptionInput = formElement?.querySelector(
                        'input[name="description"]'
                      );
                      if (descriptionInput) {
                        (descriptionInput as HTMLInputElement).value = content;
                      }
                    }}
                    placeholder={t("collection_description_placeholder")}
                  />
                  <input type="hidden" name="description" />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="isPublished" className="flex flex-col space-y-1">
                    <span>{t("publish_status")}</span>

                  </Label>
                  <Switch
                    id="isPublished"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                    aria-label={t("toggle_publish")}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  {t("cancel")}
                </Button>
                <Button type="submit">
                  {editingCollection ? t("save") : t("create")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

/*
这个实现包含了：
集合列表展示
显示集合名称和描述
每个集合右侧有编辑和排序按钮
创建/编辑功能
右上角的创建按钮
使用同一个表单组件处理创建和编辑
Dialog 弹窗形式
排序功能
独立的排序对话框
可以直接输入数字调整顺序
实时预览排序效果
UI 组件
使用 shadcn/ui 的 Dialog、Button、Input 等组件
响应式布局
清晰的视觉层次
需要注意的是，您还需要实现对应的 API 路由来处理：
POST /api/collections - 创建集合
PUT /api/collections/:id - 更新集合
PUT /api/collections/:id/order - 更新排序
这些 API 路由可以使用之前定义的服务函数来实现具体的数据库操作。
界面是中文的，但代码变量名和函数名保持英文，这样可以保持代码的通用性和可维护性。
*/

// 添加文本截断辅助函数
function truncateText(text: string, maxLength: number): string {
  // 移除 HTML 标签
  const plainText = text.replace(/<[^>]*>/g, '');
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength);
}
