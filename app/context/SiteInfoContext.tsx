import { createContext, useContext } from "react";

type SiteInfo = Env["SITEINFO"];

const SiteInfoContext = createContext<SiteInfo | null>(null);

export const useSiteInfo = () => {
  const context = useContext(SiteInfoContext);
  if (!context) {
    throw new Error("useSiteInfo must be used within a SiteInfoProvider");
  }
  return context;
};

export const SiteInfoProvider = SiteInfoContext.Provider;
