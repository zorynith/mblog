// 服务器端专用代码
import { isValidLanguage, getDefaultLocale } from "./locale";
import { localePrefs } from "~/services/cookies.server";
import type { Language } from "~/i18nconfig";

interface LocaleDetectionOptions {
  request: Request;
  params: { lang?: string };
  defaultLocale?: string;
}

export async function detectLocale({ 
  request, 
  params, 
  defaultLocale 
}: LocaleDetectionOptions): Promise<Language> {
  const urlLang = params.lang as Language | undefined;
  const cookieHeader = request.headers.get("Cookie");
  const cookieLocale = await localePrefs.parse(cookieHeader);
  const fallbackLng = getDefaultLocale(defaultLocale);

  if (isValidLanguage(urlLang)) {
    return urlLang;
  }

  if (isValidLanguage(cookieLocale)) {
    return cookieLocale;
  }

  return fallbackLng;
} 