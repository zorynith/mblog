// app/routes/login.tsx
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import {
  Form,
  json,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { createAuthenticator } from "~/services/auth.server";

import { Link } from "@remix-run/react";
import { useHydrated } from "remix-utils/use-hydrated";
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
import { SubmissionResult, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useEffect, useRef } from "react";
import { setUserSession } from "~/services/user.server";

export const ROUTE_PATH = "/auth/login" as const;

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// Finally, we can export a loader function where we check if the user is
// authenticated with `authenticator.isAuthenticated` and redirect to the
// dashboard if it is or return null if it's not
//如果用户已经登录，则跳转到dashboard，否则返回null
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { getSessionStorage } = context;
  const { env } = context.cloudflare as { env: Env };

  if (!getSessionStorage) {
    throw new Error("Session storage is not available");
  }

  const authenticator = createAuthenticator(getSessionStorage(), env);
  const user = await authenticator.isAuthenticated(request);
  if (user) {
    return redirect(env?.SITEINFO?.app_redirect_path || "/");
  }
  return {};
}

// Second, we need to export an action function, here we will use the
// `authenticator.authenticate method`
export async function action({ context, request }: ActionFunctionArgs) {
  const clonedRequest = request.clone();
  const formData = await clonedRequest.formData();
  const submission = parseWithZod(formData, { schema: loginSchema });

  // 如果有校验错误，返回错误信息
  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { getSessionStorage } = context;
  const { env } = context.cloudflare as { env: Env };
  if (!getSessionStorage) {
    throw new Error("Session storage is not available");
  }

  const authenticator = createAuthenticator(getSessionStorage(), env);
  try {
    // 主要修改在这里
    const user = await authenticator.authenticate("form", request);
    if (user) {
      const cookie = await setUserSession(request, context, user);

      // 获取returnTo参数
      // get returnTo parameter
      const url = new URL(request.url);
      const returnTo = url.searchParams.get("returnTo");

      // 如果有returnTo参数，则跳转到returnTo，否则跳转到app_redirect_path
      // if have returnTo, redirect to returnTo, otherwise redirect to app_redirect_path
      return redirect(returnTo || env?.SITEINFO?.app_redirect_path || "/", {
        headers: { "Set-Cookie": cookie },
      });
    } else {
      return redirect("/auth/login");
    }
  } catch (error) {
    console.error(error);
    return json(
      {
        status: "error",
        error: "Invalid email or password",
      },
      { status: 401 }
    );
  }
}

// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function Login() {
  const navigation = useNavigation();
  const isSubmitting = navigation.formAction === `/auth/login`;
  const inputRef = useRef<HTMLInputElement>(null);
  const isHydrated = useHydrated();

  const actionData = useActionData<typeof action>();

  const [form, { email, password }] = useForm({
    id: "login-form",
    lastResult: actionData as SubmissionResult<string[]> | null | undefined,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginSchema });
    },
  });

  useEffect(() => {
    isHydrated && inputRef.current?.focus();
  }, [isHydrated]);

  return (
    <div className="flex justify-center items-center min-h-screen">

        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6">
             {/* 主登录表单 */}
            <Form method="post">
              <div className="grid gap-4 ">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...email.props}
                  id="email"
                  type="email"
                  name="email" // 添加 name 属性
                  placeholder="example@example.com"
                  required
                />
                {email?.errors && (
                  <span className="text-red-500 text-sm">{email.errors[0]}</span>
                )}
              </div>
              <div className="grid gap-4  mb-4 mt-4">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input {...password.props} id="password" type="password" name="password" required />
                {password?.errors && (
                  <span className="text-red-500 text-sm">{password.errors[0]}</span>
                )}
              </div>
              {/* 显示通用错误信息  show general error message */}
              {actionData?.error && (
                <div className="text-red-500 text-sm text-center">
                  {actionData.error}
                </div>
              )}
              <Button type="submit" className="w-full">
                {isSubmitting ? "loginging" : "Login"}
              </Button>
              </Form>
        
              {actionData?.message && (
                <div className="mt-4 text-red-500 text-center">
                  {actionData.message}
                </div>
              )}
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/auth/signup" className="underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
