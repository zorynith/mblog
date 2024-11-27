// 共享的类型和工具函数（客户端和服务器端都可以使用）
import i18nConfig from "~/i18nconfig";  
import type { Language } from "~/i18nconfig";

export function isValidLanguage(lang?: string): lang is Language {
  if (!lang) return false;
  return Object.values(i18nConfig.supportedLngs).includes(lang as Language);
}

export function getDefaultLocale(siteLocale?: string): Language {
    return (siteLocale || i18nConfig.fallbackLng) as Language;
} 