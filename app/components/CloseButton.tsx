import { X } from "lucide-react";
import { useNavigate } from "@remix-run/react";

interface CloseButtonProps {
  path: string;
  color?: string; // 可选的颜色属性
}

export default function CloseButton({ path, color = "text-red-500" }: CloseButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => {
        navigate(path); // 使用传入的 path 进行导航
      }}
      className={`absolute top-2 right-2 ${color} hover:text-red-700`} // 使用传入的颜色
    >
      <X className="w-6 h-6" /> {/* 使用 lucide 的关闭图标 */}
    </button>
  );
}