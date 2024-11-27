import { createRequestHandler, type ServerBuild } from "@remix-run/cloudflare";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//待测试
// @ts-ignore This file won’t exist if it hasn’t yet been built
import * as build from "./build/server"; // eslint-disable-line import/no-unresolved
import { getLoadContext } from "./load-context";
import logger from '~/utils/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleRemixRequest = createRequestHandler(build as any as ServerBuild);



//主导出函数
export default {
  async fetch(request, env, ctx) {
    try {
      const loadContext = getLoadContext({
        request,
        context: {
          cloudflare: {
            // This object matches the return value from Wrangler's
            // `getPlatformProxy` used during development via Remix's
            // `cloudflareDevProxyVitePlugin`:
            // https://developers.cloudflare.com/workers/wrangler/api/#getplatformproxy
            cf: request.cf,
            ctx: {
              waitUntil: ctx.waitUntil.bind(ctx),
              passThroughOnException: ctx.passThroughOnException.bind(ctx),
            },
            caches,
            env,
          },
        },
      });
      return await handleRemixRequest(request, loadContext);
    } catch (error) {
      console.log(error);
      return new Response("An unexpected error occurred", { status: 500 });
    }
  },
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    console.log({
      cron: controller.cron,
      scheduledTime: controller.scheduledTime,
      env: env
    });

    switch (controller.cron) {
      case "*/1 * * * *":
        // 每分钟执行一次
        console.log("[Scheduled] Running every minute task", {
          cron: controller.cron,
          time: new Date().toISOString(),
          scheduledTime: controller.scheduledTime
        });
        break;

      default:
        console.log("[Scheduled] Unknown cron pattern:", controller.cron);
    }
  }
} satisfies ExportedHandler<Env>;
