// 直接在配置文件中定义支持的语言
// define the supported languages directly in the configuration file
// export const LANGUAGES = ["en", "zh", "es", "id", "ar", "it", "pt", "ko", "fr"]
export const LANGUAGES = ["en", "zh", "fr", "ja"]
export type Language = (typeof LANGUAGES)[number];

const i18nConfig = {
  debug: false,
  supportedLngs: LANGUAGES as string[],
  fallbackLng: "en" as Language,
  defaultNS: "translation",
  // Disabling suspense is recommended
  react: { useSuspense: false },
  interpolation: {
    escapeValue: false,
  },
  // preload: LANGUAGES,
  partialBundledLanguages: true,
  ignoreJSONStructure: true,
} as const;

export default i18nConfig;
