import {
  json,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/cloudflare";
import { Link, useLoaderData, useFetcher, useNavigate } from "@remix-run/react";
import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/hooks/use-toast";
import {
  get_assets,
  create_asset,
  delete_asset,
  get_assets_count,
  update_asset,
  get_assets_by_id,
} from "~/services/query.server";
import { Label } from "~/components/ui/label";
import { useTranslation } from "react-i18next";
import { ImageUploadButton } from "~/components/image-upload-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = 100;
  const offset = (page - 1) * pageSize;

  const assets = await get_assets(env, undefined, undefined, offset, pageSize);
  const total = await get_assets_count(env); // 需要在 query.server 中添加此函数
  // context.logger.info("assets", { assets });
  return json({
    assets,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  const formData = await request.formData();

  if (request.method === "POST") {
    const type = formData.get("type") as string;
    const urls = formData.get("urls") as string;
    const urlArray = urls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const assets = await Promise.all(
      urlArray.map(async (url) => {
        const randomName = `Asset-${Math.random()
          .toString(36)
          .substring(2, 15)}`; // 生成随机名称
        return create_asset(env, { title: randomName, type, ext: "", url });
      })
    );

    return json({ success: true, assets });
  }

  if (request.method === "DELETE") {
    const id = formData.get("id") as string;
    const asset = await get_assets_by_id(env, parseInt(id));
    if (asset && asset.url) {
      try {
        const urlArray = asset.url.split("/");
        const fileName = urlArray[urlArray.length - 1];
        await env.R2.delete(fileName);
      } catch (error) {
        console.error("删除 R2 文件失败", error);
      }
    }

    await delete_asset(env, id);
    return json({ success: true });
  }

  if (request.method === "PUT") {
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const type = formData.get("type") as string;
    const ext = formData.get("ext") as string;
    const url = formData.get("url") as string;

    await update_asset(env, id, {
      title,
      category,
      type,
      ext,
      url,
    });
    return json({ success: true });
  }

  return json({ success: false });
}

export default function AssetsAdmin() {
  const { assets, pagination } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [type, setType] = useState("");
  const [urls, setUrls] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<(typeof assets)[0] | null>(
    null
  );


const [isPreviewOpen, setIsPreviewOpen] = useState(false);
const [previewContent, setPreviewContent] = useState<React.ReactNode | null>(null);
const [previewTitle, setPreviewTitle] = useState("");
const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; type: string }>>([]);
const [imageUrl, setImageUrl] = useState("");


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.append("_action", "create");

    // 合并单个URL和多个URL  merge single url and multiple urls
    const urlList = [];
    
    // 添加手动输入的多个URL  add manual input multiple urls
    if (urls.trim()) {
      urlList.push(...urls.split("\n").filter(url => url.trim()));
    }

    // 添加上传的单个URL  add uploaded single url
    if (imageUrl.trim()) {
      urlList.push(imageUrl);
    }

    formData.set("urls", urlList.join("\n"));
    formData.set("type", type);

    fetcher.submit(formData, { method: "post" });
    setIsDialogOpen(false);
    setType("");
    setUrls("");
    setUploadedFiles([]); // 重置上传文件列表  reset uploaded files list
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("confirm_delete"))) {
      const formData = new FormData();
      formData.append("id", id.toString());
      formData.append("_action", "delete");

      fetcher.submit(formData, {
        method: "DELETE",
      });
    }
  };

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      toast({
        title: t("success"),
        description: t("operation") + " " + t("completed"),
      });
    }
  }, [fetcher.state, fetcher.data, fetcher.formData]);

  const handleEdit = (asset: (typeof assets)[0]) => {
    setEditingAsset(asset);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    fetcher.submit(formData, { method: "put" });
    setIsEditDialogOpen(false);
    setEditingAsset(null);
  };

  // 修改预览处理函数  modify preview processing function
  const handlePreview = (asset: {
    url: string;
    type: string;
    title?: string;
  }) => {
    const isVideo = asset.type.startsWith("video/");
    const mediaElement = isVideo ? (
      <video controls className="w-full h-full">
        <source src={asset.url} type={asset.type} />
        Your browser does not support the video tag.
      </video>
    ) : (
      <img
        src={asset.url}
        alt={asset.title}
        className="w-full h-full object-cover"
      />
    );

    setPreviewTitle(isVideo ? t("video_preview") : t("image_preview"));
    setPreviewContent(mediaElement);
    setIsPreviewOpen(true);
  };

    // 处理分页变化  handle page change
    const handlePageChange = (newPage: number) => {
      if (newPage < 1 || newPage > pagination.totalPages) return;
      navigate(`?page=${newPage}`);
    };
  

  // 在组件内添加处理函数  add processing function in the component
  const handleOpenDialog = () => {
    // 重置所有状态  reset all states
    setType("");
    setUrls("");
    setImageUrl("");
    setIsDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="grid flex-1 gap-4 p-4 md:gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("assets")}</CardTitle>
              <CardDescription>
                {t("manage_assets_description")}
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="h-8 gap-1"
              onClick={handleOpenDialog}
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t("add")} {t("asset")}</span>
            </Button>
          </CardHeader>
          
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("title")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead>{t("url")}</TableHead>
                  <TableHead className="w-[100px]">
                    <span className="sr-only">{t("operation")}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.title}</TableCell>
                    <TableCell>{asset.type}</TableCell>
                    <TableCell>{asset.url}</TableCell>
                    <TableCell className="space-x-2">
                      <div className="flex flex-row gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(asset)}
                        >
                          {t("preview")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(asset)}
                        >
                          {t("edit")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(asset.id)}
                        >
                          {t("delete")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          <CardFooter className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                {t("previous_page")}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t("page")} {pagination.page} {t("of")} {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                {t("next_page")}
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* 添加资产的 Dialog  add asset dialog*/}
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            if (!open) {
              // 关闭时也重置所有状态
              setType("");
              setUrls("");
              setImageUrl("");
            }
            setIsDialogOpen(open);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("add")} {t("asset")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">{t("type")}</Label>
                  <Input
                    id="type"
                    name="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder={t("please_enter_asset_type")}
                  />
                </div>
                
                {/* 添加文件上传按钮  add file upload button*/}
                <div className="space-y-2">
                  <Label>{t("upload_file")}</Label>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder={t("resource_url")}
                      />
                    </div>
                    <ImageUploadButton
                      project_name="blog"
                      accept="image/*,video/*"
                      maxSize={10000000}
                      onFileSelect={(url) => {
                        setImageUrl(url);
                        if (!type) {
                          // 根据URL后缀判断类型  determine type by url suffix
                          const fileExtension = url.split('.').pop()?.toLowerCase();
                          const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '');
                          setType(isImage ? 'image' : 'video');
                        }
                      }}
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
                  <Label htmlFor="urls">{t("input_multiple_urls")}</Label>
                  <Textarea
                    id="urls"
                    name="urls"
                    value={urls}
                    onChange={(e) => setUrls(e.target.value)}
                    placeholder={t("input_multiple_urls_placeholder")}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t("cancel")}
                </Button>
                <Button 
                  type="submit"
                  disabled={!type || (urls.trim() === "" && !imageUrl)}
                >
                  {t("add")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 编辑资产的 Dialog  edit asset dialog*/}
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={() => setIsEditDialogOpen(false)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("edit")} {t("asset")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <input type="hidden" name="id" value={editingAsset?.id} />
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">{t("title")}</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    defaultValue={editingAsset?.title}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">{t("category")}</Label>
                  <Input
                    id="edit-category"
                    name="category"
                    defaultValue={editingAsset?.category}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">{t("type")}</Label>
                  <Input
                    id="edit-type"
                    name="type"
                    defaultValue={editingAsset?.type}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-ext">{t("ext")}</Label>
                  <Textarea
                    id="edit-ext"
                    name="ext"
                    defaultValue={editingAsset?.ext}
                    rows={4}
                    placeholder={t("please_enter_extension_field_content")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-url">URL</Label>
                  <Input
                    id="edit-url"
                    name="url"
                    defaultValue={editingAsset?.url}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit">{t("save")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 预览 Dialog  preview dialog*/}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{previewTitle}</DialogTitle>
            </DialogHeader>
            <div className="max-h-[600px] overflow-auto">{previewContent}</div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}


