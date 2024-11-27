import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { delete_collection } from "~/services/query.server";

export async function action({ request, context }: ActionFunctionArgs) {
  context.logger.debug("Delete collection action 进入");
  const { env } = context.cloudflare as { env: Env };
  
  if (request.method !== "DELETE") {
    return json({ success: false, error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) {
      return json({ success: false, error: "ID is required" }, { status: 400 });
    }

    await delete_collection(env, parseInt(id));
    return json({ success: true });
  } catch (error) {
    console.error("Delete collection error:", error);
    return json(
      { success: false, error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}