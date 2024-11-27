import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useSiteInfo } from "~/context/SiteInfoContext.js";
import { get_post_list_count } from "~/services/query.server";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useTranslation } from "react-i18next";

export const loader = async ({context}: LoaderFunctionArgs) => {
  const { env } = context.cloudflare as { env: Env };
  const postCount = await get_post_list_count(env);
  return json({postCount});
}

export default function Page() {
  const SITEINFO = useSiteInfo();
  const { postCount } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("blog_count")}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{postCount}</div>
            <p className="text-xs text-muted-foreground">
              {t("blog_count_desc")}
            </p>
          </CardContent>
        </Card>
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div>
  )
}
