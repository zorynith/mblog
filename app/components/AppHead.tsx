import { Link } from "@remix-run/react";
import { buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import ThemeSwitcher from "~/components/ThemeSwitcher";
import LanguageSwitcher from "~/components/LanguageSwitcher";
import { useEffect, useState } from "react";
import { useSiteInfo } from "~/context/SiteInfoContext";
import { useTranslation } from "react-i18next";
import { useHydrated } from "~/hooks/useHydrated";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Coins, Gem, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { ROUTE_PATH as LOGOUT_PATH } from "~/routes/auth+/logout";
import { Logo as DefaultLogo } from "~/components/logo";
import logger from "~/utils/logger";
import { Badge } from "~/components/ui/badge";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
interface User {
  [key: string]: any;
}

interface AppHeadProps {
  user?: User ;
  list?: any;
}

export default function AppHead({ user, list,custom_menu={} }: AppHeadProps = {}) {
  const SITEINFO = useSiteInfo();
  const { t } = useTranslation();
  const isHydrated = useHydrated();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="shadow-sm sticky top-0 z-10 bg-background text-foreground">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
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
          
          {/* 右侧 */}
          <div className="flex items-center space-x-4 ">

             {/* 桌面端菜单 Desktop menu */}
            <div className="hidden lg:flex items-center space-x-4">
            <div className="flex space-x-2">
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                  </div>
              {list && list.length > 0 && (
                <Link to="/app/my-list" className="relative">
                  <Button variant="outline">
                  {t("my_list")}
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 px-2 py-1 text-xs"
                    >
                      {list.length}
                    </Badge>
                  </Button>
                </Link>
              )}

              {user ? (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/payment"
                    className="flex items-center space-x-1"
                  >
                    <Coins className="w-4 h-4" />
                    <span>{user.freecoin || 0}</span>
                  </Link>
                  <Link
                    to="/payment"
                    className="flex items-center space-x-1"
                  >
                    <Gem className="w-4 h-4" />
                    <span>{user.vipcoin || 0}</span>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="overflow-hidden rounded-full"
                      >
                        {user?.avatar ? (
                          <img
                            src={user?.avatar}
                            alt=""
                            className="h-9 w-9 object-cover"
                          />
                        ) : (
                          <User className="h-9 w-9" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("my_account")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link to={custom_menu.profile || "/dashboard/user/profile"}>{t("settings")}</Link>
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem>Support</DropdownMenuItem> */}
                      <DropdownMenuSeparator />
                      <Link to={LOGOUT_PATH}>
                        <DropdownMenuItem>Logout</DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  className={`${buttonVariants({
                    variant: "outline",
                  })} h-full flex items-center`}
                  aria-label="Go to dashboard"
                >
                  login
                </Link>
              )}
            </div>


    {/* 移动端菜单 Mobile menu */}
    <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-4">
                  {list && list.length > 0 && (
                    <Link to="/app/my-list" className="relative">
                      <Button variant="outline" className="w-full justify-start">
                        
                        <Badge variant="secondary" className="ml-2">
                          {list.length}
                        </Badge>
                      </Button>
                    </Link>
                  )}
            <div className="flex space-x-2">
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                  </div>
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Link to="/payment" className="flex items-center space-x-1">
                          <Coins className="w-4 h-4" />
                          <span>{user.freecoin || 0}</span>
                        </Link>
                        <Link to="/payment" className="flex items-center space-x-1">
                          <Gem className="w-4 h-4" />
                          <span>{user.vipcoin || 0}</span>
                        </Link>
                      </div>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to={custom_menu.profile || "/dashboard/user/profile"}>Settings</Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to={custom_menu.support || "/dashboard/user/profile"}>Support</Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to={LOGOUT_PATH}>Logout</Link>
                      </Button>
                    </div>
                  ) : (
                    <Link to="/auth/login" className={buttonVariants({ variant: "outline", className: "w-full" })}>
                      Login
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>



          </div>
        </div>
      </div>
    </header>
  );
}
