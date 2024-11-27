// 小型图片上传按钮
// small image upload button
import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface ImageUploadButtonProps {
  accept: string;
  maxSize: number;
  onFileSelect: (url: string) => void;
  project_name: string;
  className?: string;
  variant?: "default" | "outline";
}

export function ImageUploadButton({
  accept = "image/*",
  maxSize = 5000000,
  onFileSelect,
  project_name,
  className,
  variant = "outline"
}: ImageUploadButtonProps) {
  const fetcher = useFetcher();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / 1000000}MB`);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_name", project_name);

    fetcher.submit(formData, {
      method: "post",
      action: "/api/r2upload",
      encType: "multipart/form-data",
    });
  };

  // 监听上传结果
  if (fetcher.data?.url && fetcher.data?.success) {
    onFileSelect(fetcher.data.url);
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant={variant}
        size="icon"
        className={cn("w-10 h-10", className)}
        onClick={() => fileInputRef.current?.click()}
        disabled={fetcher.state === "submitting"}
      >
        {fetcher.state === "submitting" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
        disabled={fetcher.state === "submitting"}
      />
      {error && (
        <div className="absolute top-full mt-1 text-xs text-red-500">
          {error}
        </div>
      )}
    </div>
  );
} 