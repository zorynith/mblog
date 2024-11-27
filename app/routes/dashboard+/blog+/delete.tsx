import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { post_delete } from "~/services/query.server";
import logger from "~/utils/logger";

export const action = async ({ request, context }: LoaderFunctionArgs) => {
  const { env } = context.cloudflare as { env: Env };
  const formData = await request.formData();
  const id = formData.get("id") as string;

  logger.info({ id }, "Deleting blog post");

  if (!id) {
    return json({ error: "ID is required" }, { status: 400 });
  }

  await post_delete(env, parseInt(id));

  return json({ success: true });
};