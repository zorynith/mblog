import { ActionFunctionArgs, json } from "@remix-run/cloudflare";

interface RequestBody {
  messages: unknown[];
  stream?: boolean;
}

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const env = context.cloudflare.env as Env;
  const { cf_ai_model, SECRET, AI } = env;
  // 验证API密钥
  const authHeader = new Headers(request.headers).get("Authorization");
  const apiKey = authHeader?.split("Bearer ")[1];
  if (apiKey !== SECRET) {
    console.log(apiKey);
    return json({ error: "无效的API密钥" }, { status: 401 });
  }

  // 解析请求体
  const body = (await request.json()) as RequestBody;

  const { messages, stream = false, model } = body;


  let cf_ai_model_to_use = model || cf_ai_model;

  if (!Array.isArray(messages)) {
    return json({ error: "无效的消息格式" }, { status: 400 });
  }

  try {
    // 调用Cloudflare AI
    const aiResponse = await AI.run(cf_ai_model_to_use, {
      messages,
      stream,
    });

    if (stream) {
      const responseId = crypto.randomUUID();
      const createdTimestamp = Date.now();
      const encoder = new TextEncoder();

      const transformStream = new TransformStream({
        start(controller) {
          // 发送初始响应
          const initialResponse = {
            id: responseId,
            object: "chat.completion.chunk",
            created: createdTimestamp,
            model: cf_ai_model_to_use,
            choices: [
              {
                index: 0,
                delta: { role: "assistant", content: "" },
                logprobs: null,
                finish_reason: null,
              },
            ],
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialResponse)}\n\n`));
        },
        async transform(chunk, controller) {
          const text = new TextDecoder().decode(chunk);
          const lines = text.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.response !== undefined) {
                  const jsonResponse = {
                    id: responseId,
                    object: "chat.completion.chunk",
                    created: createdTimestamp,
                    model: cf_ai_model_to_use,
                    choices: [
                      {
                        index: 0,
                        delta: { content: data.response },
                        logprobs: null,
                        finish_reason: null,
                      },
                    ],
                  };
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(jsonResponse)}\n\n`));
                }
              } catch (error) {
                console.error("解析错误:", error);
              }
            }
          }
        },
        flush(controller) {
          const finalResponse = {
            id: responseId,
            object: "chat.completion.chunk",
            created: createdTimestamp,
            model: cf_ai_model_to_use,
            choices: [
              {
                index: 0,
                delta: {},
                logprobs: null,
                finish_reason: "stop",
              },
            ],
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalResponse)}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        },
      });

      return new Response(aiResponse.pipeThrough(transformStream), {
        headers: { 
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } else {
      // 返回非流式响应
      const fullResponse = await aiResponse.text();
      return json({
        id: crypto.randomUUID(),
        object: "chat.completion",
        created: Date.now(),
        model: cf_ai_model_to_use,
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: fullResponse,
            },
            finish_reason: "stop",
          },
        ],
      });
    }
  } catch (error) {
    console.error("AI处理错误:", error);
    return json({ error: "AI处理失败" }, { status: 500 });
  }
};
