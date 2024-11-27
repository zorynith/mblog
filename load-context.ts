import {
  type AppLoadContext,
  createWorkersKVSessionStorage,
  createCookie,
} from "@remix-run/cloudflare";
import { type PlatformProxy } from "wrangler";
import type { GetLoadContextFunction } from "@remix-run/cloudflare-pages";
import { createLogger } from "./app/utils/context_logger";


type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
    extra: string;
    logger: ReturnType<typeof createLogger>;
    getSessionStorage: () => ReturnType<typeof createWorkersKVSessionStorage>;
  }
}

type GetLoadContext = (args: {
  request: Request;
  context: { cloudflare: Cloudflare }; // load context _before_ augmentation
}) => AppLoadContext;

// Shared implementation compatible with Vite, Wrangler, and Cloudflare Pages
export const getLoadContext: GetLoadContext = ({ context }) => {
  let sessionStorage: ReturnType<typeof createWorkersKVSessionStorage> | null =
    null;
  const sessionCookie = createCookie("__session", {
    secrets: [context.cloudflare.env.SECRET || "r3m1x123123zdfasr0ck5"],
    sameSite: "lax",
  });

  const getSessionStorage = () => {
    if (!sessionStorage) {
      if (!context.cloudflare.env.SESSION_KV) {
        throw new Error("SESSION_KV is not available in the environment");
      }
      sessionStorage = createWorkersKVSessionStorage({
        kv: context.cloudflare.env.SESSION_KV,
        cookie: sessionCookie,
      });
    }
    return sessionStorage;
  };

  const logger = createLogger(context.cloudflare.env);

  return {
    ...context,
    extra: "stuff",
    logger,
    getSessionStorage,
  };
};
