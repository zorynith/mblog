import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, useLoaderData } from "@remix-run/react";
import { Twitter, Github, Instagram, Youtube } from "lucide-react";
import { useSiteInfo } from "~/context/SiteInfoContext";



export default function Foot() {
  const SITEINFO = useSiteInfo();
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">
              About {SITEINFO?.website_name}
            </h4>
            <p className="text-sm">{SITEINFO?.summary}</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Links</h4>
            <ul className="space-y-2">
              {SITEINFO?.github_url && (
                <li>
                  <a
                  href={SITEINFO?.github_url}
                  target="_blank"
                  className="text-sm hover:underline"
                >
                  github
                </a>
                </li>
              )}
              {SITEINFO?.twitter_url && (
                <li>
                  <a
                  href={SITEINFO?.twitter_url}
                  target="_blank"
                  className="text-sm hover:underline"
                >
                  twitter
                  </a>
                </li>
              )}
              {SITEINFO?.youtube_url && (
                <li>
                  <a
                  href={SITEINFO?.youtube_url}
                  target="_blank"
                  className="text-sm hover:underline"
                >
                  youtube
                </a>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow me</h4>
            <div className="flex space-x-4">
              {SITEINFO?.twitter_url && (
                <a
                  href={SITEINFO?.twitter_url}
                  target="_blank"
                  className="text-white hover:text-blue-400"
                >
                  <Twitter className="w-6 h-6" />
                </a>
              )}
              {SITEINFO?.github_url && (
                <a
                  href={SITEINFO?.github_url}
                  target="_blank"
                  className="text-white hover:text-blue-400"
                >
                  <Github className="w-6 h-6" />
                </a>
              )}
              {SITEINFO?.instagram_url && (
                <a
                  href={SITEINFO?.instagram_url}
                  className="text-white hover:text-blue-400"
                >
                  <Instagram className="w-6 h-6" />
                </a>
              )}

              {SITEINFO?.youtube_url && (
                <a
                  href={SITEINFO?.youtube_url}
                  className="text-white hover:text-blue-400"
                >
                  <Youtube className="w-6 h-6" />
                </a>
              )}

              {/* Add more social icons as needed */}
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-sm">
          © {SITEINFO?.website_name} {new Date().getFullYear()}  All rights reserved.  
          {!SITEINFO?.hide_copyright && (
            <span>
              Powered by <a href="https://edgecd.com" target="_blank">edgecd.com</a>
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
