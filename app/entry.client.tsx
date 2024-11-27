/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { hydrate } from "react-dom";

// 国际化 internationalization
import i18nconfig from "./i18nconfig";
import i18next  from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { Language, resources } from "~/locales/languages.js";
import { getInitialNamespaces } from "remix-i18next/client";

// 定义 root loader 的返回类型 
//define the return type of the root loader
interface RootLoaderData {
  locale: Language; 
  theme: string;
}
function getRootLoaderData(): RootLoaderData | undefined {
  // 直接从 remixContext.state.loaderData.root 获取
  const remixContext = window.__remixContext;
  return remixContext?.state?.loaderData?.root;
}


async function hydrateweb() {
  // 获取 root loader 数据 
  // get the root loader data
  const rootData = getRootLoaderData();
  const locale = rootData?.locale || i18nconfig.fallbackLng;

  i18next
    .use(initReactI18next) // Tell i18next to use the react-i18next plugin
    // .use(LanguageDetector) // Setup a client-side language detector
    .init({
      lng: locale, // 设置初始语言  set the initial language
      ...i18nconfig, // spread the configuration
      // This function detects the namespaces your routes rendered while SSR use
      resources: resources,
      ns: getInitialNamespaces(),
      detection: {
        // Here only enable htmlTag detection, we'll detect the language only
        // server-side with remix-i18next, by using the `<html lang>` attribute
        // we can communicate to the client the language detected server-side
        order: ["path"],
        lookupFromPathIndex: 0,
        // Because we only use htmlTag, there's no reason to cache the language
        // on the browser, so we disable it
        caches: [],
      },
      // 确保这些选项与服务端一致 
      // ensure these options are consistent with the server
      react: {
        useSuspense: false,
        transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p"],
      },
    });

  startTransition(() => {
    hydrate( 
    <StrictMode>
      <I18nextProvider i18n={i18next}>
          <RemixBrowser />
      </I18nextProvider>
      </StrictMode>,
           document,

    );
  });

}

if (typeof requestIdleCallback === "function") {
  requestIdleCallback(hydrateweb);
} else {
  // 延迟执行以确保样式加载
  setTimeout(hydrateweb, 1);
}
