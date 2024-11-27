import { RemixI18Next } from "remix-i18next/server";
import i18nconfig from "~/i18nconfig"; // your i18n configuration file
import { resources } from "~/locales/languages.js";

let i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18nconfig.supportedLngs,
    fallbackLanguage: i18nconfig.fallbackLng,
  },
  // This is the configuration for i18next used
  // when translating messages server-side only
  i18next: {
    ...i18nconfig,
    resources: resources,
  },
  // The i18next plugins you want RemixI18next to use for `i18n.getFixedT` inside loaders and actions.
  // E.g. The Backend plugin for loading translations from the file system
  // Tip: You could pass `resources` to the `i18next` configuration and avoid a backend here
});

export default i18next;
