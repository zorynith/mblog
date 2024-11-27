import { Languages } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { Form, useMatches } from "@remix-run/react";
import type { Language } from "~/locales/languages";
import { LANGUAGE_LABELS, LANGUAGES } from "~/locales/languages";
import { useNavigate, useLocation } from "@remix-run/react";
import { ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { useSubmit } from "@remix-run/react";
import logger from "~/utils/logger";

export async function action({ request, context }: ActionFunctionArgs) {
  const { getSessionStorage } = context;
  const session = await getSessionStorage().getSession(
    request.headers.get("Cookie")
  );

  const formData = await request.formData();
  const locale = formData.get("locale");


  if (typeof locale === "string" && LANGUAGES.includes(locale)) {
    session.set("locale", locale);

    return json(
      { success: true },
      {
        headers: {
          "Set-Cookie": await getSessionStorage().commitSession(session),
        },
      }
    );
  }

  return json({ success: false }, { status: 400 });
}

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const submit = useSubmit();

  const matches = useMatches();
  // 获取当前路由ID
  const currentRouteId = matches[matches.length - 1].id;
  // console.log("currentRouteId", currentRouteId);

  function handleLanguageChange(locale: string) {
    const formData = new FormData();
    formData.append("locale", locale);
    formData.append("redirectTo", location.pathname + location.search);
    formData.append("currentRouteId", currentRouteId);
    // 使用专门的路由处理语言切换
    submit(formData, {
      method: "post",
      action: "/api/change-language",
    });


  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((locale) => (
          <DropdownMenuItem
            key={locale}
            className="cursor-pointer"
            onSelect={() => handleLanguageChange(locale)}
          >
            {LANGUAGE_LABELS[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
