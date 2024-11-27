import { useState, useRef, useEffect } from "react";
import { Loader2, File, X } from "lucide-react";
import { useFetcher } from "@remix-run/react";
import { useTranslation } from "react-i18next";

interface ImageUploadProps {
  accept: string;
  maxSize: number;
  onFileSelect: (url: string) => void;
  project_name: string;
  className?: string;
  variant?: "default" | "outline";
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  accept = "image/*",
  maxSize = 5000000, // 5MB
  onFileSelect,
  project_name,
  className = "", // 默认空字符串
  variant = "default" // 默认样式
}) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fetcher = useFetcher();
  const isActiveRef = useRef(true);

  useEffect(() => {
    if (isActiveRef.current && fetcher.data?.url && fetcher.data?.success) {
      setUploadedUrl(fetcher.data.url as string);
      onFileSelect(fetcher.data.url as string);
    }
  }, [fetcher.data, onFileSelect]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError("");

    if (!selectedFile) {
      console.log("did not select file");
      return;
    }

    if (selectedFile.size > maxSize) {
      setError(`file size must be less than ${maxSize / 1000000}MB`);
      return;
    }

    isActiveRef.current = true;
    setFile(selectedFile);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile, selectedFile.name);
      formData.append("project_name", project_name || "unknown");
      //   console.log("准备上传的 FormData:", formData);

      const response = await fetcher.submit(formData, {
        method: "post",
        action: "/api/r2upload",
        encType: "multipart/form-data",
      });

      // 上传成功后设置预览
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }

      //   if (onFileSelect && fetcher?.data?.url && fetcher?.data?.success) {
      //     await onFileSelect(fetcher?.data?.url as string);
      //   }
    } catch (err) {
      setError("error uploading file");
      console.error("upload error:", err);
    }
  };

  const removeFile = () => {
    isActiveRef.current = false;
    setFile(null);
    setPreview(null);
    setError("");
    setUploadedUrl(null);
    if (onFileSelect) {
      onFileSelect("");
    }
  };

  const truncateFileName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + "...";
  };

  return (
    <div className="w-full">
      <label
        className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300 ${
          preview ? "p-4" : "h-32"
        }`}
      >
        <div
          className={`flex flex-col items-center justify-center w-full ${
            preview ? "" : "pt-5 pb-6"
          }`}
        >
          {fetcher.state === "submitting" ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-sm text-gray-500">
                uploading: {truncateFileName(file?.name || "")}
              </span>
            </div>
          ) : preview ? (
            <div className="relative w-full max-w-[350px] flex justify-center">
              <img
                src={preview}
                alt="预览"
                className="max-w-full w-full object-contain rounded"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeFile();
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <File className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">{t("click_to_upload")}</span> 
                 <br/>{t("drag_and_drop_file")}
              </p>
              <p className="text-xs text-gray-500">
                {accept.split(",").join(", ")} (max {maxSize / 1000000}MB)
              </p>
            </>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
          disabled={fetcher.state === "submitting"}
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {uploadedUrl && <p className="mt-2 text-sm text-green-500">{t("uploaded")}</p>}
    </div>
  );
};

export default ImageUpload;
