import en from "./en.js"; //en 英语
import fr from "./fr.js"; //fr 法语
import zh from "./zh.js"; //zh 中文
import es from "./es.js"; //es 西班牙语
import id from "./id.js"; //id 印度尼西亚语
import ar from "./ar.js"; //ar 阿拉伯语
import it from "./it.js"; //it 意大利语
import pt from "./pt.js"; //pt 葡萄牙语
import ko from "./ko.js"; //ko 韩语
import ja from "./ja.js"; //ja 日语
import { AppLoadContext, Session } from "@remix-run/cloudflare";
import i18nConfig from "~/i18nconfig";

export const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
  zh: {
    translation: zh,
  },
  it: {
    translation: it,
  },
  ko: {
    translation: ko,
  },
  fr: {
    translation: fr,
  },
  id: {
    translation: id,
  },
  ar: {
    translation: ar,
  },
  pt: {
    translation: pt,
  },
  ja: {
    translation: ja,
  },
};


export const LANGUAGES: Array<Language> = i18nConfig.supportedLngs as Language[]
export type Language = keyof typeof resources;
export const LANGUAGE_LABELS = {
  en: "English",
  zh: "中文",
  es: "Spanish",
  id: "Indonesian",
  ar: "Arabic",
  it: "Italian",
  pt: "Portuguese",
  ko: "Korean",
  fr: "French",
  ja: "Japanese",
};

// 定义一个更准确的语言资源类型
interface LanguageResource {
  [key: string]: string | { [key: string]: string };
}


export function isValidLanguage(lang: string): lang is Language {
  return LANGUAGES.includes(lang as Language);
}

import type { Params } from "@remix-run/react";
import { localePrefs } from "~/services/cookies.server.js";
import { getDefaultLocale } from "~/services/locale.js";
// 客户端代码
export function detectClientLocale(params: { lang?: string }, defaultLocale?: string): Language {
  const urlLang = params.lang as Language | undefined ;
  const fallbackLng = getDefaultLocale(defaultLocale);

  if (urlLang && isValidLanguage(urlLang)) {
    return urlLang;
  }

  return fallbackLng;
}