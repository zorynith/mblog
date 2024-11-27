import { Authenticator } from "remix-auth";
import {
  AppLoadContext,
  redirect,
  type SessionStorage,
} from "@remix-run/cloudflare";
import { FormStrategy } from "remix-auth-form";
import {
  get_user_by_email,
} from "./query.server";
import { ROUTE_PATH as LOGIN_PATH } from "~/routes/auth+/login";
import { UserSessionKey } from "~/services/user.server";
import { format_user_for_session } from "~/utils/tools";
import { NullableSessionUser } from "~/types/app";

export function createAuthenticator(sessionStorage: SessionStorage, env: Env) {
  let authenticator = new Authenticator(sessionStorage, {
    sessionKey: UserSessionKey,
    sessionErrorKey: "my-error-key",
  }).use(
    new FormStrategy(async ({ form }) => {
      const email = form.get("email");
      const password = form.get("password");

      if (!email || !password) {
        throw new Error("email and password are required.");
      }

      const user = await get_user_by_email(env, email as string);

      if (!user) {
        throw new Error("Incorrect username or password.");
      }
      if (user.accountStatus === "deleted" || user.accountStatus === "disabled") {
        throw new Error("Account deleted or disabled.");
      }

      const passwordMatch = await verifyPassword(
        password as string,
        user.passwordHash
      );
      if (!passwordMatch) {
        throw new Error("Incorrect username or password.");
      }

      const sessionUser = format_user_for_session(user);
      return sessionUser; 
      // 如果成功返回用户对象
      //if success, return user object
    }),
    "form"
  );

  return authenticator;
}

//在workers 中，使用更高强度的 crypto.subtle.digest 来加密密码
//use higher strength crypto.subtle.digest to hash password in workers
export async function hashPassword(password: string): Promise<string> {
  const salt = await generateSalt();
  const derivedKey = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password + salt)
  );
  return salt + ":" + arrayBufferToHex(derivedKey);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const [salt, key] = hash.split(":");
  const derivedKey = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password + salt)
  );
  return key === arrayBufferToHex(derivedKey);
}

export async function requireUser(
  context: AppLoadContext,
  request: Request,
  { redirectTo, disableRedirect }: { redirectTo?: string | null, disableRedirect?: boolean } = {},
) {
  const { getSessionStorage } = context;
  const { env } = context.cloudflare as { env: Env };

  const authenticator = createAuthenticator(getSessionStorage(), env);
  const sessionUser = await authenticator.isAuthenticated(request);

  // 获取当前URL路径
  //get current URL path
  const url = new URL(request.url);
  const returnTo = url.pathname + url.search;

  if (!sessionUser && !disableRedirect) {
    if (!redirectTo) throw redirect(`${LOGIN_PATH}?returnTo=${encodeURIComponent(returnTo)}`);
    else throw redirect(redirectTo);
  } else if (!sessionUser && disableRedirect) {
    return null as NullableSessionUser;
  }
  return sessionUser as NullableSessionUser;
}

/*
  need user and role
  if role is not match, throw redirect to dashboard page 
*/

// 方式1：使用字符串字面量联合类型
//type 1: use string literal union type
type UserRole = "admin" | "user" | "guest" | "editor";
type Roles = UserRole | UserRole[];

export async function requireUserWithRole(
  context: AppLoadContext,
  request: Request,
  role: Roles,
  { redirectTo }: { redirectTo?: string | null } = {}
) {
  const { getSessionStorage } = context;
  const { env } = context.cloudflare as { env: Env };

  const sessionUser = await requireUser(context, request);

  if (!sessionUser) {
    if (!redirectTo) throw redirect(LOGIN_PATH);
    else throw redirect(redirectTo);
  }

  // // 检查用户角色权限
  // //check user role permission
  // if (!sessionUser?.role || sessionUser?.role !== role) {
  //   throw redirect("/dashboard"); 
  //   //or other unauthorized page
  // }

  if (!hasRole(role, sessionUser?.role)) {
    if (!redirectTo) throw redirect("/dashboard");
    else throw redirect(redirectTo);
  }

  return sessionUser;
}

// 检查角色的辅助函数
//check role helper function
function hasRole(roles: Roles, roleToCheck: UserRole): boolean {
  return Array.isArray(roles)
    ? roles.includes(roleToCheck)
    : roles === roleToCheck;
}

// 生成随机的盐值,incloudflare，在worker中，crypto不需要import
//generate random salt in cloudflare, in worker, crypto doesn't need importq
async function generateSalt(): Promise<string> {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return arrayBufferToHex(array.buffer);
}

// 将 ArrayBuffer 转换为十六进制字符串
//
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
