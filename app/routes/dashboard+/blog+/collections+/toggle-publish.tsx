import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { toggle_collection_publish } from "~/services/query.server";

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  const formData = await request.formData();
  
  if (request.method === "PATCH") {
    const id = formData.get("id") as string;
    const isPublished = formData.get("isPublished") === "true";

    const collection = await toggle_collection_publish(env, parseInt(id), isPublished);

    return json({ success: true, collection });
  }

  return json({ success: false });
} 