import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PanelLeftOpen,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import { Logo as DefaultLogo } from "~/components/logo";

import { NavMain } from "~/components/nav-main";
import { NavProjects } from "~/components/nav-projects";
import { NavUser } from "~/components/nav-user";
import { TeamSwitcher } from "~/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { ChevronRight } from "lucide-react"; // 这是默认图标
import { Button } from "./ui/button";
import { useLoaderData } from "@remix-run/react";
import { BaseMenuItem } from "~/types/menu";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "my blog",
      logo: DefaultLogo,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
};
import { useSiteInfo } from "~/context/SiteInfoContext";
export function AppSidebar({
  menuItems,
  userData,
  adminMenuItems,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const SITEINFO = useSiteInfo();
  const teamslit = [
    {
      name: SITEINFO.website_name || "my site",
      logo: DefaultLogo,
      plan: "",
    },
  ];
  const user = {
    name: userData?.username || "my user",
    email: userData?.email || "my@email.com",
    avatar: "/assets/avatar.png",
  };

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <TeamSwitcher teams={teamslit} />
          {/* <div className="flex items-center gap-2 px-4 py-2">
            <DefaultLogo className="h-6 w-6" />
            <span className="font-semibold">我的博客</span>
          </div> */}
        </SidebarHeader>

        <SidebarContent>
          {menuItems?.length > 0 && (
            <NavMain items={menuItems as BaseMenuItem[]} title="User" />
          )}
          {adminMenuItems?.length > 0 && (
            <NavMain items={adminMenuItems} title="Platform" />
          )}
          {/* <NavProjects projects={data.projects} /> */}
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={userData} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <div className="group/trigger mt-4">
        {/* 展开时的触发器 */}
        <SidebarTrigger />
      </div>
    </>
  );
}

export function SidebarMenuItem({ item }: { item: MenuItem }) {
  // 添加类型断言来指定图标组件的类型
  const Icon = Icons[
    item.iconName as keyof typeof Icons
  ] as React.ComponentType<{ size: number }>;

  return (
    <div>
      {Icon && <Icon size={20} />}
      <span>{item.title}</span>
    </div>
  );
}
