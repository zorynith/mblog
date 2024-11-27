
import { type BaseMenuItem  } from "~/types/menu";
// 普通用户菜单
export const userMenuItems: BaseMenuItem[] = [
];

// 管理员专属菜单（不包含用户菜单项）
export const adminMenuItems: BaseMenuItem[] = [
  {
    title: "blog",
    url: "/dashboard/admin",
    iconName: "admin",
    items: [
      {
        title: "posts",
        url: "/dashboard/blog",
      },
      {
        title: "prompts",
        url: "/dashboard/blog/prompts",
      },
      {
        title: "collections",
        url: "/dashboard/blog/collections",
      },
      {
        title: "assets",
        url: "/dashboard/blog/assets",
      },
    ],
  },
  {
    title: "users",
    url: "",
    iconName: "users",
    items: [
      {
        title: "users",
        url: "/dashboard/admin/settings/users",
      },
    ],
  },
];