import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { requireUser } from "~/services/auth.server";
import logger from "~/utils/logger";
import { generateId } from "~/utils/tools";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  await requireUser(context, request);
}

export const action: ActionFunction = async ({ request, context }) => {
    const { env } = context.cloudflare as { env: Env };

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const project_name = formData.get("project_name") as string;



    if (!file) {
      return json({ error: "can not find file" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const fileExtension = file.name.split(".").pop() || "";
    const fileName = `${generateId()}.${fileExtension}`;

    logger.info({
      msg: "upload file",
      fileName,
      fileExtension,
      fileType: file.type,
      fileSize: file.size,
      byteLength: buffer.byteLength,
      project_name,
    });

    try {
      await env.R2.put(project_name + "/" + fileName, buffer, {
      httpMetadata: {
        contentType: file.type,
      },
      });
    } catch (error) {
      return json({ error: "upload file error" }, { status: 500 });
    }

    const fileUrl = `${env.SITEINFO.oss_url}/${project_name}/${fileName}`;

    logger.info({
      msg: "file upload success",
      fileName,
      url: fileUrl,
    });

    return json({ success: true, url: fileUrl });
  } catch (error) {
    logger.error({
      msg: "upload file error",
      error: error instanceof Error ? error.message : String(error),
    });

    return json({ error: "upload file error" }, { status: 500 });
  }
};
