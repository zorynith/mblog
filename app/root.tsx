import type {
  LinksFunction,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { json} from "@remix-run/cloudflare";
import { cssBundleHref } from "@remix-run/css-bundle";


import { useChangeLanguage } from "remix-i18next/react";
import { useTranslation } from "react-i18next";
import { resources, type Language } from "~/locales/languages.js";
import { SiteInfoProvider } from "~/context/SiteInfoContext";
import { themePrefs, localePrefs, sourcePrefs } from "~/services/cookies.server";
import { Toaster } from "~/components/ui/toaster"
import { ExternalScripts } from "~/utils/external-scripts-react";
import {
  Links,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useParams,
} from "@remix-run/react";

import stylesheet from "~/tailwind.css?url";
import { detectLocale } from "./services/locale.server";
import { useEffect } from "react";
import { useNonce } from '~/utils/nonce-provider'


export const links: LinksFunction = () => [
  { rel: "preload", href: stylesheet, as: "style" },
  { rel: "stylesheet", href: stylesheet, precedence: "high"  },
      // 添加初始化样式以防闪烁
      {
        rel: "stylesheet",
        href: "/styles/init.css",
        precedence: "high"
      },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const loader: LoaderFunction = async ({
  request,
  context,
  params,
}: LoaderFunctionArgs) => {
  const { env } = context.cloudflare as { env: Env };
  const { SITEINFO } = env;
  const logger = context.logger;


    // 合并 SITEINFO 和 logo 
    const enhancedSiteInfo = {
      ...SITEINFO,
      logo: env?.logo || SITEINFO?.logo || '' // 优先使用 env.logo，如果没有则使用 SITEINFO 中的 logo
    };

  const cookieHeader = request.headers.get("Cookie");
  const theme_in_cookie = (await themePrefs.parse(cookieHeader)) || "";
  const theme = theme_in_cookie === "" ? (SITEINFO?.theme || "light") : theme_in_cookie; 


  const locale = await detectLocale({
    request,
    params,
    defaultLocale: SITEINFO?.locale
  });

  // console.log(locale , 'locale in server loader')

  return json({
    SITEINFO:enhancedSiteInfo,
    locale,
    resources: resources[locale as keyof typeof resources],
    theme,
  });
};

export default function App() {
  const { locale, resources, theme, SITEINFO } = useLoaderData<
    typeof loader
  >() as {
    locale: Language;
    resources: (typeof resources)[Language];
    theme: string;
    SITEINFO:any;
  };

  const nonce = useNonce()
  useChangeLanguage(locale);
  const { i18n } = useTranslation();
  useEffect(() => {
    // 在客户端初始化时设置语言和翻译资源
    i18n.changeLanguage(locale);
    Object.entries(resources).forEach(([ns, resources]) => {
      i18n.addResourceBundle(locale, ns, resources, true, true);
    });
  }, [locale, resources, i18n]);

  return (
    <SiteInfoProvider value={SITEINFO}>
      <html lang={locale} className={theme} suppressHydrationWarning>
      <head>

          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body>
          <div id="root">
          <Outlet />
          </div>
          <ScrollRestoration nonce={nonce} />
          <Scripts nonce={nonce} />
          <Toaster />
           
          {/* <ExternalScripts /> */}
        </body>
      </html>
    </SiteInfoProvider>
  );
}


