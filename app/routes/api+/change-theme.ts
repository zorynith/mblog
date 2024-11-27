import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { themePrefs } from "~/services/cookies.server";

export async function action({ request, context }: ActionFunctionArgs) {

  const formData = await request.formData();
  const theme = formData.get("theme");

  if (theme === 'light' || theme === 'dark') {
    return json(
      { theme },
      {
        headers: {
          "Set-Cookie": await themePrefs.serialize(theme),
        },
      }
    );
  }

  return json({ success: false }, { status: 400 });
}