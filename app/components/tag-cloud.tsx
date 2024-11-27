import { Link } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";

interface TagCloud {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface TagCloudProps {
  tags: TagCloud[];
  className?: string;
}

function getTagSize(count: number): string {
  if (count >= 10) return 'text-lg font-semibold';
  if (count >= 5) return 'text-base font-medium';
  return 'text-sm';
}

function getTagColor(count: number): string {
  if (count >= 10) return 'bg-primary/10 hover:bg-primary/20 text-primary';
  if (count >= 5) return 'bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground';
  return 'bg-muted hover:bg-muted/80 text-muted-foreground';
}

export function TagCloud({ tags, className }: TagCloudProps) {
  const { t } = useTranslation();

  return (
    <section className={cn("mt-8", className)}>
      <h2 className="text-2xl font-bold mb-4">{t("tag_cloud")}</h2>
      <div className="flex flex-wrap gap-3">
        {tags?.length > 0 ? (
          tags.map((tag) => (
            <Link 
              key={tag.id} 
              to={`/tags/${tag.slug || tag.id}`}
              className="no-underline"
            >
              <div 
                className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full",
                  "cursor-pointer transition-all duration-200",
                  "hover:scale-105 hover:shadow-sm",
                  getTagSize(tag.count),
                  getTagColor(tag.count)
                )}
              >
                {tag.name}
                {tag.count > 0 && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({tag.count})
                  </span>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p className="text-muted-foreground">{t("no_tags")}</p>
        )}
      </div>
    </section>
  );
} 