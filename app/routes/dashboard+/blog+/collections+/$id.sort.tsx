import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { get_collection_detail, update_collection_order } from "~/services/query.server";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

// 使用 dnd-kit 进行拖拽排序
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "~/hooks/use-toast";
// 加载集合数据
export async function loader({ context, params }: LoaderFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  const { id } = params;
  
  if (!id) throw new Error("Collection ID is required");
  
  const collection = await get_collection_detail(env, parseInt(id));
  return json({ collection });
}

// 添加 action 处理排序保存
export async function action({ request, context, params }: ActionFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  const { id } = params;
  
  if (!id) throw new Error("Collection ID is required");
  
  const formData = await request.json();
  const { order } = formData;

  try {
    await update_collection_order(env, parseInt(id), order);
    return json({ success: true });
  } catch (error) {
    return json(
      { success: false, error: "Failed to save order" },
      { status: 400 }
    );
  }
}

// 可排序的文章项组件
function SortablePost({ post }: { post: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: post.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      suppressHydrationWarning
    >
      <Card className="mb-2">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DragHandleDots2Icon className="h-5 w-5 text-gray-500" />
            <span>{post.title}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 主组件
export default function CollectionSort() {
  const { collection } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const [posts, setPosts] = useState(collection.posts || []);
  const { toast } = useToast();
  const fetcher = useFetcher();

  // 设置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 处理拖拽结束事件
  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setPosts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  // 保存排序
  async function handleSaveOrder() {
    const newOrder = posts.map((post, index) => ({
      id: post.id,
      order: index,
    }));

    fetcher.submit(
      { order: newOrder },
      { 
        method: "post",
        encType: "application/json"
      }
    );
  }

    // 处理保存结果
    useEffect(() => {
      if (fetcher.state === "idle" && fetcher.data) {
        if (fetcher.data.success) {
          toast({
            title: t("sort_saved"),
            description: t("sort_saved_description"),
            variant: "success",
          });
        } else {
          toast({
            title: t("sort_error"),
            description: t("sort_error_description"),
            variant: "destructive",
          });
        }
      }
    }, [fetcher.state, fetcher.data, toast, t]);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{collection.name} - {t("sort_posts")}</CardTitle>
          <CardDescription>{t("drag_to_sort")}</CardDescription>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div suppressHydrationWarning>
              <SortableContext
                items={posts}
                strategy={verticalListSortingStrategy}
              >
                {posts.map((post) => (
                  <SortablePost key={post.id} post={post} />
                ))}
              </SortableContext>
            </div>
          </DndContext>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveOrder}>
              {t("save_order")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}