import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/cloudflare";

import { Logo as DefaultLogo } from "~/components/logo";
import { useSiteInfo } from "~/context/SiteInfoContext";

export const ROUTE_PATH = "/auth" as const;

const QUOTES = [
  {
    quote: "There is nothing impossible to they who will try.",
    author: "Alexander the Great",
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    quote: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
  },
  {
    quote:
      "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
  },
  {
    quote: "The only thing we have to fear is fear itself.",
    author: "Franklin D. Roosevelt",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return json({ randomQuote });
}

export default function Layout() {
  const SITEINFO = useSiteInfo();
  const { randomQuote } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-screen w-full">
      <div className="absolute left-1/2 top-10 mx-auto flex -translate-x-1/2 transform lg:hidden">
      <div className="flex items-center w-[200px] mr-4">
          {SITEINFO?.logo ? (
                <div className="flex items-center justify-center w-6 h-6"> {/* 添加一个固定尺寸的容器 */}
                <img 
                  src={SITEINFO.logo}
                  alt={SITEINFO.name} 
                  className="max-w-full max-h-full [&:not(:root)]:dark:invert object-contain"
                /> 
              </div>
          ) : (
            <DefaultLogo className="w-6 h-6" />
          )}
          <Link
            to="/"
            className="ml-2 text-2xl font-bold tracking-tight text-primary hover:text-primary/80 transition-colors"
          >
            {SITEINFO.name}
          </Link>
        </div>
      </div>
      <div className="relative hidden h-full w-[50%] flex-col justify-between overflow-hidden bg-card p-10 lg:flex">
      <div className="flex items-center w-[200px] mr-4">
          {SITEINFO?.logo ? (
                <div className="flex items-center justify-center w-6 h-6"> {/* 添加一个固定尺寸的容器 */}
                <img 
                  src={SITEINFO.logo}
                  alt={SITEINFO.name} 
                  className="max-w-full max-h-full [&:not(:root)]:dark:invert object-contain"
                /> 
              </div>
          ) : (
            <DefaultLogo className="w-6 h-6" />
          )}
          <Link
            to="/"
            className="ml-2 text-2xl font-bold tracking-tight text-primary hover:text-primary/80 transition-colors"
          >
            {SITEINFO.name}
          </Link>
        </div>

        <div className="z-10 flex flex-col items-start gap-2">
          <p className="text-base font-normal text-primary">
            {randomQuote.quote}
          </p>
          <p className="text-base font-normal text-primary/60">
            - {randomQuote.author}
          </p>
        </div>
        <div className="base-grid absolute left-0 top-0 z-0 h-full w-full opacity-40" />
      </div>
      <div className="flex h-full w-full flex-col border-l border-primary/5 bg-card lg:w-[50%]">
        <Outlet />
      </div>
    </div>
  );
}
