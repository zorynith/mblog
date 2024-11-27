import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";
import { slugify } from "~/utils/tools";

export async function action({ request, context }: ActionFunctionArgs) {

  const env = context.cloudflare.env as Env;
  const { cf_ai_model, SECRET, AI } = env;

  try {


    const formData = await request.formData();
    const action = formData.get("action") as string;
    const content = formData.get("content") as string;
    const shortDescription = formData.get("short_content") as string;
    const apiKey = formData.get("apiKey") as string;
    const model = formData.get("model") as string;
    const endpoint = formData.get("endpoint") as string;
    const title = formData.get("title") as string;

    let prompt = "";

    switch (action) {
      case "generate_title":
        prompt = `<content>${shortDescription || content}</content>
Generate 5 engaging titles for the content above that are:
- Attention-grabbing
- Accurate to the content
- SEO-friendly
- Unique from each other
- provide the titles in the same language as the content

Format your response exactly like this:
1. [First title]
2. [Second title]
3. [Third title]
4. [Fourth title]
5. [Fifth title]
Output the final result directly without additional explanation.`;
        break;

      case "generate_summary":
        prompt = `<content>${content}</content>
Create a compelling meta description in 150 characters that:

Accurately summarizes the main value/topic of the content
Includes primary keywords naturally
Uses active voice and clear language
Ends with a subtle call-to-action when appropriate
Is SEO-optimized and clickable for search results
Avoids truncation in search displays
Analyze the language of the content first and respond in the same language (Chinese/English) as the original text, focusing on driving click-through rates while maintaining content accuracy.
Output the final result directly without additional explanation.`;
        break;

      case "generate_slug":
        prompt = `<title>${title}</title><description>${shortDescription}</description>
Create a clear, SEO-friendly URL slug for this title and description that
Uses lowercase letters
Includes main keywords
Separates words with hyphens
Is concise (4-8 words maximum)
Contains no special characters or spaces
Output the final result directly without additional explanation.`;
        break;

      default:
        throw new Error("Invalid action");
    }

    const messages = [{ role: "user", content: prompt }];

    let result;
    if (apiKey === SECRET) {
      // 使用 Cloudflare AI
      context.logger.info({
        msg: "using cloudflare ai",
      })
      const aiResponse = await AI.run(cf_ai_model, {
        messages,
        stream: false,
      });
      result = aiResponse.response;
    } else {
      // 使用外部 API
      const response = await fetch(`${endpoint}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages,
          model: model,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || "Generation failed");
      }
      result = data.choices[0].message.content.trim();
    }

    // 处理结果
    switch (action) {
      case "generate_title":
        const titles = result
          .split("\n")
          .filter((line: string) => line.trim())
          .map((line: string) => line.replace(/^\d+\.\s*/, "").trim());
        return json({ titles });
      case "generate_summary":
        return json({ summary: result });
      case "generate_slug":
        return json({ slug: slugify(result) });
      default:
        throw new Error("Invalid action");
    }                               
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
