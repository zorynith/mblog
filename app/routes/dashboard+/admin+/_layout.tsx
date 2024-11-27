import { Outlet, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { requireUserWithRole } from "~/services/auth.server";

export const loader: LoaderFunction = async ({
  request,
  context,
}: LoaderFunctionArgs) => {
  await requireUserWithRole(context, request, "admin", {
    redirectTo: "/dashboard",
  });
  return json({});
};

export default function DashboardblogLayout() {
  return <Outlet />;
}
