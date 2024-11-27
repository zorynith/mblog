// components/TabBar.js
"use client";

import { useLocation, Link } from "@remix-run/react";
import { Home, Search, User, Settings } from "lucide-react";

const tabs = [
  { 
    id: 1, 
    label: "图片换脸", 
    icon: <Home size={24} />,
    path: "/app/imglist"
  },
  { 
    id: 2, 
    label: "视频换脸", 
    icon: <Search size={24} />,
    path: "/app/csf/vsf"
  },
  { 
    id: 3, 
    label: "脱衣", 
    icon: <User size={24} />,
    path: "/app/csf/csfun"
  },
  { 
    id: 4, 
    label: "我的", 
    icon: <Settings size={24} />,
    path: "/app/csf/profile"
  },
];

interface TabBarProps {
  isStandalone?: boolean;
}

export default function TabBar({ isStandalone = true }: TabBarProps) {
  const location = useLocation();
  
  // 根据当前路径判断激活的标签
  const getActiveTab = (pathname: string) => {
    const activeTab = tabs.find(tab => pathname.startsWith(tab.path));
    return activeTab?.id || 1; // 如果没找到匹配的，默认返回1
  };

  return (
    <div className={`bg-white shadow-lg border-t border-gray-300 ${
      isStandalone ? 'fixed bottom-0 left-0 right-0 md:hidden' : ''
    }`}>
      <div className="flex h-16">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            rel="preload"
            to={tab.path}
            className="flex-1"
          >
            <button
              className={`w-full h-full flex flex-col items-center justify-center text-sm ${
                getActiveTab(location.pathname) === tab.id ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {tab.icon}
              <span className="mt-1">{tab.label}</span>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
