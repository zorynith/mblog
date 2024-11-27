import { ChevronRight, type LucideIcon } from "lucide-react"
// 定义原始菜单项的类型
//define type of base menu item
export interface BaseMenuItem {
  title: string;
  url: string;
  iconName: string;
  isActive?: boolean;
  items?: Omit<BaseMenuItem, "iconName">[];
}

// 定义带有 Lucide 图标的菜单项类型
//define type of menu item with Lucide icon
export interface MenuItemWithIcon {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: Omit<BaseMenuItem, "iconName">[];
}