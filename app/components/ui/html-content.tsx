import { cn } from "~/lib/utils";

interface HtmlContentProps {
  content: string;
  className?: string;
}

export function HtmlContent({ content, className }: HtmlContentProps) {
  if (!content) return null;

  return (
    <div 
      className={cn(
        "prose dark:prose-invert max-w-none",
        "prose-headings:font-bold prose-headings:tracking-tight",
        "prose-a:text-primary hover:prose-a:text-primary/80",
        "prose-img:rounded-md",
        "prose-pre:bg-muted prose-pre:text-muted-foreground",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
}