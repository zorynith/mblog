import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { loader as indexLoader } from "~/routes/blog+/_index";

export async function loader(args: LoaderFunctionArgs) {
  // 复用 _index.tsx 的 loader 逻辑
  return indexLoader({
    ...args,
    request: new Request(new URL(`/?page=${args.params.page}`, args.request.url))
  });
}

// 复用 _index.tsx 的组件
export { default } from "~/routes/blog+/_index";