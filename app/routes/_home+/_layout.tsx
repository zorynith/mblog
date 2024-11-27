import { Outlet } from "@remix-run/react";
export const ROUTE_PATH = "/" as const;

export default function Home() {
  return <Outlet />;
}
