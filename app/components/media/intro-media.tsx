import { type FC } from "react";

interface IntroMediaProps {
  url: string;
  text?: string;
}

// 使用 export default 而不是命名导出
export default function IntroMedia({ url, text }: IntroMediaProps) {
  // 添加默认值或早期返回
  if (!url) {
    return null; // 或者返回一个占位符组件
  }

  const isVideo = url.toLowerCase().endsWith('.mp4');

  return (
    <>
      {isVideo ? (
        <video
          className="w-full h-full object-cover rounded-lg"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={url} type="video/mp4" />
          your browser does not support the video tag.
        </video>
      ) : (
        <>
          <img
            src={url}
            alt="Intro Image"
            className="w-full h-auto"
          />
          {text && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              {text}
            </p>
          )}
        </>
      )}
    </>
  );
} 