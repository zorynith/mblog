import { useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const { env } = context.cloudflare as { env: Env };
  const { SITEINFO } = env;
  return json({ SITEINFO });
};

export default function MyInfo() {
  const { SITEINFO } = useLoaderData<typeof loader>();

  const Avatar_image = SITEINFO?.avatar
    ? SITEINFO?.avatar
    : "https://picsum.photos/100/100";

  return (
    <section className="container py-8  shadow-md rounded-lg space-y-8 px-4 py-8 mx-auto flex-grow max-w-7xl bg-background text-foreground">
      <div className="flex items-center space-x-4 mb-6">
        <Avatar className="w-100 h-100">
          <AvatarImage src={Avatar_image} className="w-100 h-100" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold text-4xl">
            <h1> {SITEINFO?.name} </h1>
          </div>
          <div className="text-sm mt-4 text-gray-500">{SITEINFO?.desc}</div>
        </div>
      </div>
      <p className="text-gray-600 py-4">{SITEINFO?.summary}</p>
    </section>
  );
}
