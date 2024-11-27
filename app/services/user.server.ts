import {AppLoadContext, Session } from "@remix-run/cloudflare";

export const UserSessionKey = "user-session";
export type UserSessionKeyType = typeof UserSessionKey;

export async function getUserSession(request: Request, context: AppLoadContext) {
    const { getSessionStorage } = context;
    const session = await getSessionStorage().getSession(
        request.headers.get("Cookie")
    ) as Session & { get(key: UserSessionKeyType): { username: string } | undefined };
    const userSession = session.get(UserSessionKey) as { id:any, username: string, email:string } | undefined;

    if (!userSession) {
        return null;
    }
    return userSession
}

export async function setUserSession(request: Request, context: AppLoadContext, user:any) {
    const { getSessionStorage } = context;
    // 获取 session，并设置用户信息
    //get session and set user info
    const session = await getSessionStorage().getSession(
        request.headers.get("Cookie")
    ) as Session;
    session.set(UserSessionKey, user);
    const cookie = await getSessionStorage().commitSession(session);
    return cookie
}