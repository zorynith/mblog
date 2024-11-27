import { getClientLocales } from "remix-utils/locales/server";
import { CURRENCIES } from "~/modules/biling/plan";


/**
 * 获取域名URL。
 * @param request - HTTP请求对象。
 * @returns 域名URL，如果无法获取则返回null。
 */
export function getDomainUrl(request: Request) {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("Host");
  if (!host) return null;

  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

/**
 * 获取域名路径名。
 * @param request - HTTP请求对象。
 * @returns 域名路径名，如果无法获取则返回null。
 */
export function getDomainPathname(request: Request) {
  const pathname = new URL(request.url).pathname;
  if (!pathname) return null;
  return pathname;
}

/**
 * 根据质量获取语言环境。
 * @param request - HTTP请求对象。
 * @returns 语言环境，默认返回'en'。
 */
export function getLocaleByQuality(request: Request) {
  const locales = getClientLocales(request);

  if (!locales) return "en";
  return locales[1];
}

/**
 * 获取语言环境的货币。
 * @param request - HTTP请求对象。
 * @returns 货币类型，默认返回CURRENCIES.DEFAULT。
 */
export function getLocaleCurrency(request: Request) {
  const locales = getClientLocales(request);
  if (!locales) return CURRENCIES.DEFAULT;

  return locales.find((locale) => locale === "en-US")
    ? CURRENCIES.USD
    : CURRENCIES.EUR;
}

/**
 * 合并多个头部对象。
 * @param headers - 多个头部对象。
 * @returns 合并后的头部对象。
 */
export function combineHeaders(
  ...headers: Array<ResponseInit["headers"] | null | undefined>
) {
  const combined = new Headers();
  for (const header of headers) {
    if (!header) continue;
    for (const [key, value] of new Headers(header).entries()) {
      combined.append(key, value);
    }
  }
  return combined;
}

/**
 * Singleton Server-Side Pattern.
 */
export function singleton<Value>(name: string, value: () => Value): Value {
  const globalStore = global as any;

  globalStore.__singletons ??= {};
  globalStore.__singletons[name] ??= value();

  return globalStore.__singletons[name];
}

/**
 * 生成随机字符串。
 * @returns 随机字符串。
 */
export function generateRandomString() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * 获取文件类型。
 * @param file - 文件对象。
 * @returns 文件类型，默认返回"image/jpeg"。
 */
export function getFileType(file: FormDataEntryValue | null): string {
  return (file instanceof File && file.type) || "image/jpeg";
}

/**
 * 获取文件名。
 * @param file - 文件对象。
 * @returns 文件名，默认返回"image/jpeg"。
 */
export function getFileName(file: FormDataEntryValue | null): string {
  return (
    (file instanceof File && generateRandomString() + file.name) ||
    generateRandomString() + ".jpg"
  );
}


/**
 * 验证 API key。
 * @param apiKey - API key。
 * @param env - 环境变量。
 * @returns 验证结果，默认返回false。
 */
export async function verifyApiKey(apiKey: string | null, env: Env): Promise<boolean> {
  if (!apiKey) return false;
  
  // 从环境变量获取有效的 API key
  const validApiKey = env.API_KEY;
  
  if (!validApiKey) return false;
  
  return apiKey === validApiKey;
}