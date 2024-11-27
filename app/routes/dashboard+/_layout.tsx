import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Outlet, useLoaderData } from "@remix-run/react";
import {
  Settings,
  FileText,
  LayoutDashboard,
  Users,
  FileSearch,
  type LucideIcon,
  Shield,
  UserCircle,
} from "lucide-react";

import { requireUser } from "~/services/auth.server";
import { ROUTE_PATH as LOGOUT_PATH } from "~/routes/auth+/logout";
import { useSiteInfo } from "~/context/SiteInfoContext";
export const ROUTE_PATH = "/dashboard" as const;

import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";

import { AppSidebar } from "~/components/app-sidebar";
import { BaseMenuItem, MenuItemWithIcon } from "~/types/menu";
import { userMenuItems, adminMenuItems } from "./menu-items";
import { detectLocale } from "~/services/locale.server";
import i18next from "~/services/i18next.server";

export const loader = async ({ request, context,params }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env as Env;
  const defaultLocale = env.SITEINFO?.locale;
  const locale = await detectLocale({ request, params, defaultLocale});


  const user = await requireUser(context, request);
  // 直接使用 拿到翻译实例
  const t = await i18next.getFixedT(locale);

  // 递归翻译菜单项
  const translateMenuItem = (item: any) => {
    const translatedItem = {
      ...item,
      title: t(item.title.replace(/\s+/g, '_'))  
    };

    // 如果有子菜单项，递归翻译
    if (Array.isArray(item.items)) {
      translatedItem.items = item.items.map((subItem: any) => ({
        ...subItem,
        title: t(subItem.title)
      }));
    }

    return translatedItem;
  };

  // 翻译所有菜单项
  const translatedUserMenuItems = userMenuItems.map(translateMenuItem);
  const translatedAdminMenuItems = adminMenuItems.map(translateMenuItem);

  return json({
    user,
    userMenuItems: translatedUserMenuItems,
    adminMenuItems: translatedAdminMenuItems
  });
};

// 图标映射
const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  settings: Settings,
  documents: FileText,
  users: Users,
  logs: FileSearch,
  profile: UserCircle,
  admin: Shield,
};

// 转换函数：将原始菜单项转换为带有 Lucide 图标的菜单项
function convertMenuItems(items: BaseMenuItem[]): MenuItemWithIcon[] {
  return items.map((item) => {
    const icon = iconMap[item.iconName];
    if (!icon) {
      console.warn(`Icon not found for: ${item.iconName}`);
    }

    return {
      ...item,
      icon: icon || Settings, // 如果找不到图标，使用默认图标
    };
  });
}

export default function DashboardLayout() {
  const SITEINFO = useSiteInfo();
  const { user, userMenuItems, adminMenuItems } = useLoaderData<typeof loader>();

  // 转换用户菜单
  const userMenu = convertMenuItems(userMenuItems);
  // 转换管理员菜单
  const adminMenu =
    user && "role" in user && ["admin", "editor"].includes(user.role)
      ? convertMenuItems(adminMenuItems)
      : [];

  return (
    <SidebarProvider>
      <AppSidebar
        menuItems={userMenu}
        adminMenuItems={adminMenu}
        userData={user}
      />
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-muted/40"></header>
      <SidebarInset>
        <div className="flex flex-col h-full mt-4 p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
