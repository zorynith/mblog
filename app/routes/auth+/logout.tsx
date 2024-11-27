import { redirect } from "@remix-run/cloudflare";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { createAuthenticator } from "~/services/auth.server";

export const ROUTE_PATH = "/auth/logout" as const;

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  const { getSessionStorage } = context;
  const authenticator = createAuthenticator(getSessionStorage(), env);

  // 获取当前会话
  const session = await getSessionStorage().getSession(
    request.headers.get("Cookie")
  );
  // 清除会话数据
  session.unset("user");

  // 返回重定向响应，同时清除 cookie
  return redirect("/", {
    headers: {
      "Set-Cookie": await getSessionStorage().destroySession(session),
    },
  });

  return authenticator.logout(request, { redirectTo: "/" });
}

// action 和 loader 使用相同的逻辑
export const action = loader;
// export async function action({ request, context }: ActionFunctionArgs) {
//   const { env } = context.cloudflare as { env: Env };
//   const { getSessionStorage } = context;
//   const authenticator = createAuthenticator(getSessionStorage(), env);
//   return authenticator.logout(request, { redirectTo: "/" });
// }
