import { Link, Form, useNavigation, useActionData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { MetaFunction, json, redirect, Session } from "@remix-run/cloudflare";
import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { hashPassword } from "~/services/auth.server";
import { ROUTE_PATH as DASHBOARD_PATH } from "~/routes/dashboard+/_layout";
import { setUserSession } from "~/services/user.server";
import { format_user_for_session } from "~/utils/tools";
// 查询用户
import {
  create_user_by_email,
  get_user_by_email,
} from "~/services/query.server";

export const ROUTE_PATH = "/auth/signup" as const;

export const SignupSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  const { SITEINFO } = env;

  const url = new URL(request.url);
  const pathname = url.pathname;

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: SignupSchema });

  if (SITEINFO?.disable_signup === true) {
    return json(
      {
        errors: {
          general: ["Signup is disabled"],
        },
      },
      { status: 400 }
    );
  }




  if (submission.status !== "success") {
    return json(submission.reply(), { status: 400 });
  }

  const { email, password } = submission.payload;

  // 检查邮箱是否已经存在
  const checkuser = await get_user_by_email(env, email as string);
  if (checkuser) {
    return json(
      submission.reply({
        formErrors: ["邮箱已存在"],
      }),
      { status: 400 }
    );
  }

  const hashedPassword = await hashPassword(password as string);
  // 模拟注册逻辑：你可以在此处将用户信息写入数据库
  const user = await create_user_by_email(env, email as string, hashedPassword);
  // === 优化会话写入 ===
  const sessionUser = format_user_for_session(user);

  const cookie = await setUserSession(request, context, sessionUser);
  // 成功注册后跳转到 dashboard，并附带 Set-Cookie 头
  return redirect(env?.SITEINFO?.app_redirect_path || "/", {
    headers: { "Set-Cookie": cookie },
  });
}

export default function Signup() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.formAction === `/auth/signup`;

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Form method="post" className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
                {/* 显示通用错误信息  show general error message */}
                {actionData?.errors?.general && actionData.errors.general.length > 0 && (
                <div className="text-red-500 text-sm text-center">
                  {actionData.errors.general.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
              <Button type="submit" className="w-full">
                {isSubmitting ? "signing" : "Create an account"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/auth/login" className="underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </Form>
    </div>
  );
}
