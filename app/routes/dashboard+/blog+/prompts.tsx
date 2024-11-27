import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { requireUser } from "~/services/auth.server";
import { updatePromptOptions, getPromptOptions } from "~/services/query.server";
import { z } from "zod";
import { useToast } from "~/hooks/use-toast";
import i18next from "~/services/i18next.server";
import { detectLocale } from "~/services/locale.server";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import models from "./cf-text-models.json";
import { useState } from "react";

const PromptSchema = z.object({
  ai_endpoint: z.string().optional().default(""),
  ai_model: z.string().optional().default(""),
  ai_apikey: z.string().optional().default(""),
  cf_text_model: z.string().optional().default(""),
  continuation: z.string().optional().default(""),
  optimization: z.string().optional().default(""),
});

type LoaderData = {
  prompts: z.infer<typeof PromptSchema>;
  modelsList: string[];
};

// 修改 ActionData 类型
type ActionData = {
  type?: 'verify' | 'save';
  success?: boolean;
  message?: string;
  error?: string;
};


export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  const sessionUser = await requireUser(context, request);
  if (!sessionUser) {
    return redirect("/auth/login");
  }

  // 从 JSON 文件加载模型列表
  const modelsList =  models.models;

  try {
    const rawPrompts = await getPromptOptions(env, sessionUser?.id.toString());
    const prompts = PromptSchema.parse(rawPrompts);

    return json<LoaderData>({ prompts, modelsList });
  } catch (error) {
    console.error("Error loading prompts:", error);
    return json<LoaderData>({
      prompts: {
        continuation: "",
        optimization: "",
        ai_endpoint: "",
        ai_model: "",
        ai_apikey: "",
        cf_text_model: "",
      },
      modelsList,
    });
  }
}

export async function action({ request, context ,params}: ActionFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  const defaultLocale = env.SITEINFO?.locale;
  const locale = await detectLocale({ request, params, defaultLocale});
  const t = await i18next.getFixedT(locale);
  const sessionUser = await requireUser(context, request);
  if (!sessionUser) {
    return redirect("/auth/login");
  }

  const formData = await request.formData();
  const _action = formData.get('_action');
  const continuation = formData.get("continuation") as string;
  const optimization = formData.get("optimization") as string;
  const ai_endpoint = formData.get("ai_endpoint") as string;
  const ai_model = formData.get("ai_model") as string;
  const ai_apikey = formData.get("ai_apikey") as string;
  const cf_text_model = formData.get("cf-text-model") as string;

  if (_action === 'verify') {
    try {
      const ai_endpoint = formData.get('ai_endpoint') as string;
      const ai_model = formData.get('ai_model') as string;
      const ai_apikey = formData.get('ai_apikey') as string;

      const response = await fetch(ai_endpoint + "/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ai_apikey}`,
        },
        body: JSON.stringify({
          model: ai_model,
          messages: [{ role: 'user', content: 'Hello' }],
        }),
      });
      context.logger.info({
        msg: "verify response",
        api_endpoint: ai_endpoint + "/v1/chat/completions",
        api_model: ai_model,
        api_apikey: ai_apikey,
        response,
      });
      if (!response.ok) {
        return json<ActionData>({ 
          type: 'verify',
          success: false, 
          error: t('verify_error') 
        });
      }

      return json<ActionData>({ 
        type: 'verify',
        success: true, 
        message: t('verify_success') 
      });
    } catch (error) {
      return json<ActionData>({ 
        type: 'verify',
        success: false, 
        error: t('verify_error') 
      });
    }
  }


  try {
    await updatePromptOptions(env, sessionUser.id.toString(), {
      continuation,
      optimization,
      ai_endpoint,
      ai_model,
      ai_apikey,
      cf_text_model,
    });

    return json<ActionData>({ 
      type: 'save',
      success: true,
      message: t('success') 
    });
  } catch (error) {
    console.error("Error updating prompts:", error);
    return json<ActionData>({ 
      type: 'save',
      success: false,
      error: t('update_error') 
    });
  }
}

export default function PromptsPage() {
  const { prompts, modelsList } = useLoaderData<LoaderData>();


  const actionData = useActionData<typeof action>();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(prompts.ai_model || "");
  // 使用 prompts.cf_text_model 作为默认值
  const [cftextmodelvalue, setCftextmodelvalue] = useState(prompts.cf_text_model || "");


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t('AI_settings')}</h1>

      <Form method="post" className="space-y-6">
        {/* AI 配置 */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <h2 className="text-sm font-medium leading-none">{t('AI_settings')}</h2>
            <div className="flex flex-col items-end gap-2">
              <Button
                type="submit"
                name="_action"
                value="verify"
                variant="secondary"
                size="sm"
              >
                {t('verify')}
              </Button>
              {actionData?.type === 'verify' && (
                <div className="text-sm">
                  {actionData.success ? (
                    <span className="text-emerald-500">{actionData.message}</span>
                  ) : (
                    <span className="text-destructive">{actionData.error}</span>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai_endpoint">{t('AI_endpoint')}</Label>
              <Input
                id="ai_endpoint"
                name="ai_endpoint"
                defaultValue={prompts.ai_endpoint}
                placeholder={t('AI_endpoint_placeholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai_model">{t('AI_model')}</Label>
              <Input
                id="ai_model"
                name="ai_model"
                defaultValue={prompts.ai_model}
                placeholder={t('AI_model_placeholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai_apikey">API Key</Label>
              <Input
                type="password"
                id="ai_apikey"
                name="ai_apikey"
                defaultValue={prompts.ai_apikey}
                placeholder="input API Key..."
              />
            </div>
          </CardContent>
        </Card>

        {/* CF Text Models 选择 */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium">{t('cf_text_models')}</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="cf-text-model">{t('Select_CF_Model')}</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {cftextmodelvalue || t("Select model...")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command className="rounded-lg border shadow-md">
                    <CommandInput placeholder={t("Type a command or search...")} />
                    <CommandList>
                      <CommandEmpty>{t("No results found.")}</CommandEmpty>
                      <CommandGroup heading={t("Suggestions")}>
                        {modelsList.map((model) => (
                          <CommandItem 
                            key={model}
                            onSelect={(currentValue) => {
                              setValue(currentValue);
                              setOpen(false);
                              // 同步更新隐藏的表单字段
                              const input = document.querySelector('input[name="cf-text-model"]') as HTMLInputElement;
                              if (input) {
                                input.value = currentValue;
                              }
                              setCftextmodelvalue(currentValue);
                            }}
                          >
                            {model}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {/* 隐藏的表单字段 */}
              <input 
                type="hidden" 
                name="cf-text-model" 
                value={cftextmodelvalue}
              />
            </div>
          </CardContent>
        </Card>

        {/* 文章续写 */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium">{t('article_continuation')}</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="continuation">{t('continuation_prompt')}</Label>
              <Textarea
                id="continuation"
                name="continuation"
                defaultValue={prompts.continuation || ""}
                className="min-h-[128px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* 文章优化 */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium">{t('article_optimization')}</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="optimization">{t('optimization_prompt')}</Label>
              <Textarea
                id="optimization"
                name="optimization"
                defaultValue={prompts.optimization || ""}
                className="min-h-[128px]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button type="submit">{t('save')}</Button>
          {actionData?.type === 'save' && (
            <>
              {actionData.success && (
                <p className="text-emerald-500 text-sm">{actionData.message}</p>
              )}
              {actionData.error && (
                <p className="text-destructive text-sm">{actionData.error}</p>
              )}
            </>
          )}
        </div>
      </Form>
    </div>
  );
}
