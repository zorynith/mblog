import { ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { Language, LANGUAGES } from "~/locales/languages";
import { localePrefs } from "~/services/cookies.server";

export async function action({ request, context, params }: ActionFunctionArgs) {
  const logger = context.logger;


  const cookieHeader = request.headers.get("Cookie");
  const locale_in_cookie = (await localePrefs.parse(cookieHeader)) || {};

  context.logger.debug({
    msg: "change-language action",
    locale_in_cookie,
    params,
  });

  const formData = await request.formData();
  const locale = formData.get("locale");

  if (typeof locale === "string" && LANGUAGES.includes(locale as Language)) {

    let redirectTo = formData.get("redirectTo") || "/";
    let currentRouteId = formData.get("currentRouteId") || "";


    // 创建一个正则表达式来匹配语言路径
    // create a regex to match language path
    const languagePathRegex = new RegExp(`^/(${LANGUAGES.join("|")})/`);
    const match = (redirectTo as string).match(languagePathRegex);

    logger.debug({
      msg: "Language change attempted api",
      redirectTo,
      match,
      locale,
      currentRouteId
    });

    // 处理包含 ($lang) 的路由
    // handle route with ($lang)
    if (currentRouteId.toString().includes("($lang)")) {
      // 将当前 URL 中的语言替换为新的 locale
      // replace language in current url with new locale
      if (!match) {
        // URL 不包含语言前缀，添加新的语言前缀
        // if url not contain language prefix, add new language prefix
        redirectTo = `/${locale}${redirectTo}`;
      } else {
        // URL 包含语言前缀，替换为新的语言
        // if url contain language prefix, replace it with new language
        redirectTo = (redirectTo as string).replace(
          languagePathRegex,
          `/${locale}/`
        );
      }


    }else{
      // 如果当前路由不包含 ($lang)，则保持 redirectTo 不变
      // if current route not contain ($lang), keep redirectTo unchanged
      redirectTo = redirectTo as string;
    }

    logger.debug({
      msg: "Language change attempted api",
      redirectTo,
    });


    return redirect(redirectTo as string, {
      headers: {
        "Set-Cookie": await localePrefs.serialize(locale),
      },
    });
  }

  return json({ success: false }, { status: 400 });
}
