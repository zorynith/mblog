import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { useSiteInfo } from "~/context/SiteInfoContext";
import { useTranslation } from "react-i18next";

export default function MyInfo() {
  const siteInfo = useSiteInfo();
  let { t } = useTranslation();

  const Avatar_image = siteInfo.avatar
    ? siteInfo.avatar
    : "https://picsum.photos/100/100";

  return (
    <section className="container py-8  shadow-md rounded-lg space-y-8 px-4 py-8 mx-auto flex-grow max-w-7xl bg-background text-foreground">
      <div className="flex items-center space-x-4 mb-6">
        <Avatar className="w-24 h-24">
          <AvatarImage src={Avatar_image} className="w-24 h-24" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold text-4xl">
            <h1> {siteInfo.name} </h1>
          </div>
          <div className="text-sm mt-4 text-gray-500">{siteInfo.desc}</div>
        </div>
      </div>
      <p className="text-gray-600 py-4">{siteInfo.summary}</p>
    </section>
  );
}
