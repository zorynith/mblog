// 辅助函数：从tiptap JSON内容中提取第一张图片的URL
export function extractFirstImageFromContent(
  contentjson: any,
  markdownvalue: string
): string | null {
  try {
    // 确保 markdownvalue 是字符串类型
    if (!markdownvalue || typeof markdownvalue !== 'string') {
      return null;
    }

    // 如果有 contentjson，先尝试从中提取图片
    if (contentjson?.content) {
      let firstImage = contentjson.content.find(
        (item: any) => item.type === "image"
      );
      if (firstImage?.attrs?.src) {
        return firstImage.attrs.src;
      }
    }

    // 如果从 contentjson 中没有找到图片，尝试从 markdown 中提取
    const imageRegex = /!\[.*?\]\((.*?)\)/;
    const match = markdownvalue.match(imageRegex);
    return match?.[1] || null;

  } catch (error) {
    console.error("Error parsing contentjson:", error);
    return null;
  }
}

// 简单的唯一ID生成函数
export function generateShortId(length: number = 8): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function generateTimestampWithRandom(): string {
  const timestamp = Date.now(); // 获取当前时间的时间戳（毫秒）
  const randomNum = Math.floor(Math.random() * 1000000); // 生成一个随机数
  return `${timestamp}${randomNum}`;
}

// 简单的唯一ID生成函数
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function add_recordId_with_timestamp(recordId: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const timestampString = timestamp.slice(-8);
  const task_recordId = recordId + "_" + timestampString;
  return task_recordId;
}

// 在 Cloudflare Workers 环境中生成类似 MD5 长度的哈希值
export async function generateHash(input: string): Promise<string> {
  // 将输入字符串转换为 Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  // 使用 SHA-256 算法计算哈希值
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // 将哈希值转换为十六进制字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // 截取前32个字符，使其长度与 MD5 相同
  return hashHex.slice(0, 32);
}

// 使用示例：
// const hash = await generateHash('你的输入字符串');
// console.log(hash); // 输出32个字符的哈希值

// 获取回调地址
//TODO 这里应该和用户的属性有关系，将来集群中可能会有N个不同的域名。
export function get_callback_by_path(BASEURL: string, path: string = "") {
  return (
    (BASEURL.endsWith("/") ? BASEURL.slice(0, -1) : BASEURL) +
    (path.startsWith("/") ? path : "/" + path)
  );
}

//将user 对象中的passwordHash 字段删除
export function remove_passwordHash_from_user(user: any) {
  delete user.passwordHash;
  return user;
}

// 将user 对象格式化成为sessionUser 对象
export function format_user_for_session(user: any) {
  const sessionUser = {
    id: user?.id,
    username: user?.username,
    email: user?.email,
    role: user?.role,
    avatar: user?.avatar,
    isSubscribed: user?.isSubscribed,
    accountbySocial: user?.accountbySocial,
  };

  return sessionUser;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function slugify(text: string): string {

  if (!text) {
    return "";
  }
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    // 将非英文字符转换为对应的拼音或英文
    .normalize('NFD')
    // 移除变音符号
    .replace(/[\u0300-\u036f]/g, '')
    // 替换空格为连字符
    .replace(/\s+/g, '-')
    // 移除所有非单词字符（除了连字符）
    .replace(/[^\w-]+/g, '')
    // 移除开头和结尾的连字符
    .replace(/^-+|-+$/g, '');
}

//检查是否是视频文件
// check if the url is a video file
export function isVideoUrl(url: string | undefined) {
  return url?.toLowerCase().endsWith('.mp4');
}


export function stripHtml(html: string = '') {
  return html
    .replace(/<[^>]*>/g, '') // 移除 HTML 标签
    .replace(/&nbsp;/g, ' ') // 替换 &nbsp; 为空格
    .replace(/&amp;/g, '&') // 替换 &amp; 为 &
    .replace(/&lt;/g, '<') // 替换 &lt; 为 <
    .replace(/&gt;/g, '>') // 替换 &gt; 为 >
    .trim(); // 移除首尾空格
} 


// 带字数限制的版本
export function stripHtmlWithLimit(html: string, limit: number = 150): string {
  const decoded = decodeHtmlEntities(html);
  const stripped = stripHtml(decoded);
  return stripped.length > limit ? `${stripped.slice(0, limit)}...` : stripped;
}


function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');
}
