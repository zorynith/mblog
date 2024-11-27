import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { flatRoutes } from "remix-flat-routes";
import { getLoadContext } from "./load-context";

//

const IGNORE_STRIPE = true;

export default defineConfig({
  plugins: [
    remixCloudflareDevProxy({ getLoadContext }),
    remix(
      {
        ignoredRouteFiles: [
          ...(IGNORE_STRIPE ? [
            '**/stripe.*',
          ] : []),
        ],
        routes: async (defineRoutes) => {
          return flatRoutes("routes", defineRoutes, {
            // 在这里定义要忽略的文件模式
            ignoredRouteFiles: [
              ...(IGNORE_STRIPE ? [
                '**/stripe.*',
              ] : []),
            ]
          });
        },
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,  
          // v3_singleFetch: true,  引起了无法通过 window.__remixContext 获取属性state 
          // v3_lazyRouteDiscovery: true,
        },
      }),
    tsconfigPaths(),
  ],
  ssr: {
    resolve: {
      conditions: ["workerd", "worker", "browser"],
    },
  },
  resolve: {
    mainFields: ["browser", "module", "main"],
  },
  build: {
    minify: true,
  },
});