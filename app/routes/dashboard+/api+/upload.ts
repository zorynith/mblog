import type { ActionFunctionArgs, UploadHandler } from "@remix-run/cloudflare"; // or cloudflare/deno

import { json } from "@remix-run/cloudflare";
import {
  generateRandomString,
  getFileName,
  getFileType,
} from "~/utils/misc.server";
import { create_asset } from "~/services/query.server";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const { env } = context.cloudflare as { env: Env };
  const data = await request.formData();

  const file = data.get("image") || data.get("video") || data.get("attachment");

  if (!file) {
    return json(
      {
        errorCode: 400,
        message: "No file uploaded.",
      },
      { status: 400 }
    );
  }

  // 将文件转换为 ArrayBuffer
  // ... 现有代码 ...
  const arrayBuffer =
    typeof file === "string"
      ? new TextEncoder().encode(file).buffer
      : await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer); // 转换为 Uint8Array
  // ... 现有代码 ...

  const fileType = getFileType(file);
  
  const folder = data.get("folder") || "blog";

  const filename = getFileName(file);

  try {
    // 上传到 R2，假设 context.env.BUCKET 是你的 R2 bucket
    const r2upload = await env.R2.put(folder + "/" + filename, uint8Array, {
      httpMetadata: {
        contentType: fileType, // 设置文件类型
      },
    });


    const randomName = `Asset-${Math.random().toString(36).substring(2, 15)}`; // 生成随机名称
    await create_asset(env, { title: randomName, type: "blog", ext: "", url: env.SITEINFO.oss_url + "/" + folder + "/" + filename });
    //保存到assets

    return json({
      errorCode: 0,
      data: {
        src: env.SITEINFO.oss_url + "/" + folder + "/" + filename,
        alt: filename,
      },
    });
  } catch (error) {
    console.error(error);
    return json(
      {
        errorCode: 500,
        message: "Failed to upload file.",
      },
      { status: 500 }
    );
  }
};
