import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSiteInfo } from "~/context/SiteInfoContext";
import {
  FacebookShareButton,
  TwitterShareButton,
  WeiboShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  WeiboIcon,
  LinkedinIcon,
} from "react-share";

// X (Twitter) icon component
function XIcon({ size = 32 }: { size?: number }) {
  return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: '#000',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg 
          width={size * 0.6} 
          height={size * 0.6} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M16.99 3H20.25L13.88 10.37L21.5 21H15.37L10.61 14.52L5.14 21H1.88L8.65 13.16L1.38 3H7.66L11.98 8.95L16.99 3ZM16.17 19.19H17.98L6.82 4.71H4.87L16.17 19.19Z" 
            fill="white"
          />
        </svg>
      </div>
    );
  }

interface ShareButtonsProps {
  title?: string;
  description?: string;
}

export function ShareButtons({
  title = "",
  description = "",
}: ShareButtonsProps) {
  const [url, setUrl] = useState("");
  const { t } = useTranslation();
  const siteInfo = useSiteInfo();
  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  if (!url) return null;

  return (
    <div className="flex gap-2 items-center mt-8">
      <span className="text-sm text-gray-600">{t("share_to")}</span>



      <TwitterShareButton
        url={url}
        title={title}
        {...(siteInfo.twitter ? { via: siteInfo.twitter } : {})}
      >
        <XIcon size={32} />
      </TwitterShareButton>

      <FacebookShareButton url={url} quote={title}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>

      <LinkedinShareButton url={url} title={title} summary={description}>
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>

      <WeiboShareButton url={url} title={`${title}\n${description}`}>
        <WeiboIcon size={32} round />
      </WeiboShareButton>
    </div>
  );
}
