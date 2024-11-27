import type { AiEditor, CustomMenu } from "aieditor";

const BilibiliIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.766.766 0 0 1 .213-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906L17.813 4.653zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773H5.333zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z" fill="#00A1D6"/>
</svg>`;

function extractBilibiliId(url: string): { aid?: string, bvid?: string, page?: string } | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const searchParams = new URLSearchParams(urlObj.search);
    
    // 支持多种B站视频链接格式
    if (pathname.includes('/video/')) {
      // 新版 BV 号格式：https://www.bilibili.com/video/BV1xx411c7mD/
      const bvid = pathname.split('/video/')[1].replace('/', '');
      const page = searchParams.get('p') || '1';
      return { bvid, page };
    } else if (searchParams.has('aid')) {
      // 旧版 av 号格式：https://www.bilibili.com/video/av170001/
      const aid = searchParams.get('aid');
      const page = searchParams.get('p') || '1';
      return { aid, page };
    }
  } catch (e) {
    return null;
  }
  return null;
}

export const bilibiliButton: CustomMenu = {
  icon: BilibiliIcon,
  onClick: (event, editor) => {
    const url = prompt('请输入 Bilibili 视频链接:');
    if (url) {
      const videoInfo = extractBilibiliId(url);
      if (videoInfo) {
        // 构建嵌入代码
        let embedId = '';
        if (videoInfo.bvid) {
          embedId = `bvid=${videoInfo.bvid}`;
        } else if (videoInfo.aid) {
          embedId = `aid=${videoInfo.aid}`;
        }
        
        editor.insert({
          type: "paragraph",
          content: [{
            type: "text",
            text: `%%bilibili{${embedId}&page=${videoInfo.page}}%%`
          }]
        });
      } else {
        alert('无效的 Bilibili 视频链接');
      }
    }
  },
  tip: "插入 Bilibili 视频"
}; 