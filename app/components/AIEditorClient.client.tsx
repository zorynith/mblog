  "use client"; // Remix

import { AiEditor, AiEditorOptions, OpenaiModelConfig } from "aieditor";
import "aieditor/dist/style.css";

import { HTMLAttributes, forwardRef, useEffect, useRef } from "react";
import { youtubeButton, bilibiliButton } from '~/utils/editor/toolbar-extensions';

type AIEditorProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  placeholder?: string;
  defaultValue?: string;
  value?: any;
  theme?: string;
  onChangejson?: (val: any) => void;
  options?: Omit<AiEditorOptions, "element">;
  ai?: any;
  lang?: string;
  onChangeoutline?: (val: any) => void;
  onChangemarkdown?: (val: any) => void;
};

export default forwardRef<HTMLDivElement, AIEditorProps>(function AIEditor(
  {
    placeholder,
    defaultValue,
    value,
    ai,
    theme,
    onChangejson,
    onChangeoutline,
    onChangemarkdown,
    options,
    lang,
    ...props
  }: AIEditorProps,
  ref
) {
  const divRef = useRef<HTMLDivElement>(null);
  const aiEditorRef = useRef<AiEditor | null>(null);

  let fontFamily;
  if (lang == "zh") {
    fontFamily = {
      values: [
        { name: "宋体", value: "SimSun" },
        { name: "仿宋", value: "FangSong" },
        { name: "黑体", value: "SimHei" },
        { name: "楷体", value: "KaiTi" },
        { name: "微软雅黑", value: "Microsoft YaHei" },
        { name: "方正仿宋简体_GBK", value: "FangSong_GB2312" },
        { name: "Arial", value: "Arial" },
      ],
    };
  } else {
    fontFamily = {
      values: [
        { name: "Arial", value: "Arial" },
        { name: "Inter", value: "Inter, sans-serif" },          // 现代简约，可读性强
        { name: "Roboto", value: "Roboto, sans-serif" },        // Google 设计字体，清晰现代
        { name: "Open Sans", value: "Open Sans, sans-serif" },   // 友好开放的字体
        { name: "Lato", value: "Lato, sans-serif" },            // 平衡和谐的字体
        { name: "Montserrat", value: "Montserrat, sans-serif" }, // 现代几何字体
        { name: "Source Sans Pro", value: "Source Sans Pro, sans-serif" }, // Adobe 设计
        { name: "Poppins", value: "Poppins, sans-serif" },      // 几何圆润字体
        { name: "SF Pro", value: "-apple-system, BlinkMacSystemFont, sans-serif" }, // Apple 系统字体
        { name: "Comic Sans MS", value: "Comic Sans MS" },
      ],
    };
  }

  let customoptions = {
    placeholder: placeholder,
    theme: theme,
    content: value,
    debug: false, // 添加这行来启用 AiEditor 的调试功能
    lang: lang,
    fontFamily: fontFamily,
  } as any;
  if (ai && Object.keys(ai).length > 0) {
    customoptions = {
      ...customoptions,
      ai: {
        models: {
          openai: {
            apiKey: ai?.openai?.apiKey,
            model: ai?.openai?.model,
            endpoint: ai?.openai?.endpoint,
          } as OpenaiModelConfig,
        },
        menus: ai?.menus,
      },
    };
  }


  useEffect(() => {
    if (!divRef.current) return;
    if (!aiEditorRef.current) {

      const aiEditor = new AiEditor({
        element: divRef.current,
        toolbarKeys: ["undo", "redo", "brush", "eraser", 
          "|", "heading", "font-family", "font-size", 
          "|", "bold", "italic", "underline", "strike", "link", "code", "subscript", "superscript", "hr", "todo", "emoji", 
          "|", "highlight", "font-color",
          "|", "align", "line-height", 
          "|", "bullet-list", "ordered-list", "indent-decrease", "indent-increase", "break", 
          "|", "image", "video",youtubeButton, bilibiliButton, "attachment", "quote", "code-block", "table", 
          "|", "source-code", "printer", "fullscreen", "ai"
          
      ],
        ...customoptions,
        onChange: (ed) => {
          if (typeof onChangejson === "function") {
            onChangejson(ed.getJson());
          }
          if (typeof onChangeoutline === "function") {
            onChangeoutline(ed?.getOutline());
          }
          if (typeof onChangemarkdown === "function") {
            onChangemarkdown(ed?.getMarkdown());
          }
        },
        ...options,
        image: {
          allowBase64: true,
          defaultSize: 640,
          uploadUrl: "/dashboard/api/upload",
          uploadFormName: "image", //上传时的文件表单名称
          bubbleMenuItems: ["AlignLeft", "AlignCenter", "AlignRight", "delete"],
        },
        video: {
          uploadUrl: "/dashboard/api/upload",
          uploadFormName: "video", //上传时的文件表单名称
        },
        attachment: {
          uploadUrl: "/dashboard/api/upload",
          uploadFormName: "attachment", //上传时的文件表单名称
        },
      });

      // console.log("调试编辑器的属性");
      // console.log(aiEditor.getOptions());

      aiEditorRef.current = aiEditor;
    }

    return () => {
      if (aiEditorRef.current) {
        aiEditorRef.current.destroy();
        aiEditorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (ref) {
      if (typeof ref === "function") {
        ref(divRef.current);
      } else {
        ref.current = divRef.current;
      }
    }
  }, [ref]);


  return <div ref={divRef} {...props} />;
});


// 辅助函数：从 YouTube URL 中提取视频 ID
function extractYoutubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}