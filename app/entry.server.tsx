/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import type { AppLoadContext, EntryContext } from "@remix-run/cloudflare";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";

const ABORT_DELAY = 5000;

import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { resources } from "~/locales/languages.js";
import i18nconfig from "~/i18nconfig"; // your i18n configuration file
import { detectLocale } from "~/services/locale.server";
import { NonceProvider } from "./utils/nonce-provider";
export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ABORT_DELAY);

  // 为每个请求创建一个新的 i18next 实例
  // create a new i18next instance for each request
  const instance = createInstance();
  const { SITEINFO } = (loadContext.cloudflare as { env: Env }).env;
  const locale = await detectLocale({
    request,
    params: remixContext.staticHandlerContext?.matches?.[0]?.params,
    defaultLocale: SITEINFO?.locale,
  });
  await instance.use(initReactI18next).init({
    ...i18nconfig,
    lng: locale, // 设置当前语言 set the current language
    resources,
    react: {
      useSuspense: false,
      // 转换HTML内容时保留的标签  keep the tags when converting HTML content
      transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p"],
    },
  });


  const nonce = String(loadContext.cspNonce) ?? undefined;
  const body = await renderToReadableStream(
    <NonceProvider value={nonce}>
      <I18nextProvider i18n={instance}>
        <RemixServer
          context={remixContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
        />
      </I18nextProvider>
    </NonceProvider>,
    {
      signal: controller.signal,
      onError(error: unknown) {
        if (!controller.signal.aborted) {
          // Log streaming rendering errors from inside the shell
          console.error(error);
        }
        responseStatusCode = 500;
      },
    }
  );

  body.allReady.then(() => clearTimeout(timeoutId));

  if (isbot(request.headers.get("user-agent") || "")) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
