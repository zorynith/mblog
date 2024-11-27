import { createCookie } from "@remix-run/cloudflare"; // or cloudflare/deno

export const userPrefs = createCookie("user-prefs", {
  maxAge: 365*86400, // one year
});

// 主题
//theme: light, dark
export const themePrefs = createCookie("theme", {
  maxAge: 365*86400, // one year
});
// 语言
//locale: en, zh
export const localePrefs = createCookie("locale", {
  maxAge: 365*86400, // one year
});

//source: web, app
export const sourcePrefs = createCookie("source", {
  maxAge: 365*86400, // one year
});  
