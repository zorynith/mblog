import { Link } from "@remix-run/react";
import { Home } from "lucide-react";
import { GeneralErrorBoundary } from "~/components/error-boundary";

export function ErrorBoundary404() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h1>We can't find this page:</h1>
              <pre className="whitespace-pre-wrap break-all text-body-lg">
                {location.pathname}
              </pre>
            </div>
            <Link to="/" className="text-body-md underline">
              <Home className="h-10 w-10" />
              Back to home
            </Link>
          </div>
        ),
      }}
    />
  );
}
