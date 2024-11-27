import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { useSiteInfo } from "~/context/SiteInfoContext";
import { useTranslation } from "react-i18next";
export default function SearchBox() {
  const [keyword, setKeyword] = useState("");
  const { t } = useTranslation();
  const SITEINFO = useSiteInfo();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    
    // 移除网址中的协议前缀
    const siteUrl = SITEINFO.website_url.replace(/^https?:\/\//, "");
    
    // 构建 Google 搜索 URL
    const searchUrl = `https://www.google.com/search?q=site:${siteUrl} ${encodeURIComponent(keyword)}`;
    
    // 在新窗口打开
    window.open(searchUrl, "_blank");
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center space-x-2 bg-background text-foreground">
      <Input
        type="text"
        placeholder={t("search")}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="flex-1"
      />
      <Button 
        type="submit" 
        size="icon" 
        className=" bg-background text-foreground hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200"
      >
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
} 