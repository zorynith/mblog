import { useState } from "react";
import { stripHtml } from "~/utils/tools";
import { cn } from "~/lib/utils";
export default function BlogGrid({list}: {list: any[]}) {

  return (
    <section>
      {/* Container */}
      <div className="mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-20">
        {/* Component */}

          {/* Blog Content */}
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {list.map((item) => (
              <a 
                key={item.id}
                href={`/collections/${item.slug}`}
                className="group flex flex-col gap-4 rounded-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                {/* 图片容器 */}
                <div className="aspect-[16/9] w-full overflow-hidden">
                  <img
                    alt={item.name}
                    src={item.coverImage || "/assets/placeholder.svg"}
                    className={cn(
                      "w-full h-full object-cover",
                      "transition-transform duration-300 group-hover:scale-105",
                      "bg-muted", // 图片加载前的背景色
                    )}
                    loading="lazy"
                  />
                </div>

                {/* 内容区域 */}
                <div className="flex flex-col gap-2 p-4">
                  <h2 className="text-xl font-bold line-clamp-2 md:text-2xl">
                    {item.name}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {stripHtml(item.description)}
                  </p>
                </div>
              </a>
            ))}

          </div>
      </div>
    </section>
  );
}

