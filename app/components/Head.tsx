import { Link } from "@remix-run/react";
import { buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import SearchBox from "~/components/search-box";
import ThemeSwitcher from "~/components/ThemeSwitcher";
import LanguageSwitcher from "~/components/LanguageSwitcher";
import { useState } from "react";
import { useSiteInfo } from "~/context/SiteInfoContext";
import { useTranslation } from "react-i18next";
import { useHydrated } from "~/hooks/useHydrated";
import { cn } from "~/lib/utils";
import { Logo } from "~/components/logo";

export default function Head() {
  const SITEINFO = useSiteInfo();
  const { t } = useTranslation();
  const isHydrated = useHydrated();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 mx-auto">
        {/* 左侧导航区域 - 固定宽度 */}
        <div className="flex items-center mr-4">
          {SITEINFO?.logo ? (
                <div className="flex items-center justify-center w-6 h-6"> {/* 添加一个固定尺寸的容器 */}
                <img 
                  src={SITEINFO.logo}
                  alt={SITEINFO.name} 
                  className="max-w-full max-h-full [&:not(:root)]:dark:invert object-contain"
                /> 
              </div>
          ) : (
            <Logo className="w-6 h-6" />
          )}
          <Link
            to="/"
            className="ml-2 text-2xl font-bold tracking-tight text-primary hover:text-primary/80 transition-colors"
          >
            {SITEINFO.name}
          </Link>
        </div>

        {/* 中间导航区域 - 自适应宽度 */}
        <div className="flex-1">
          <nav className="flex items-center space-x-6">
            <Link
              to="/collections"
              className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {t("collections")}
            </Link>
            <Link
              to={SITEINFO.BLOG_prefix_url || "/blog"}
              className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {t("blog")}
            </Link>
            
          </nav>
        </div>

        {/* 右侧功能区域 - 固定间距 */}
        <div className="flex items-center">
          {/* 移动端搜索按钮 */}
          <button
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none lg:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Toggle search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* 桌面端功能区 */}
          <div className="hidden lg:flex items-center">
            <div className="w-[200px]">
              <SearchBox />
            </div>
            <div className="flex items-center space-x-4 px-4 min-w-[120px]">
              <LanguageSwitcher />
              <ThemeSwitcher />
              <Link
                to="/dashboard"
                className={`${buttonVariants({
                  variant: "outline",
                })} h-full flex items-center`}
                aria-label="Go to dashboard"
              >
                {t("login")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
