import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Settings } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Fragment } from "react";

interface EnvVariable {
  key: string;
  value: string;
}

export async function loader({ context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  console.log(env);

 const variables: EnvVariable[] = Object.entries(env)
    .filter(([key, value]) => 
      (key === "SITEINFO" || typeof value === "string") && 
      !key.includes("SECRET")
    )
    .map(([key, value]) => ({
      key,
      value: key === "SITEINFO" ? JSON.stringify(value, null, 2) : (value as string),
    }));

    console.log(variables);
    

  return json({ variables });
}

export default function EnvironmentVariables() {
  const { variables } = useLoaderData<typeof loader>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          EnvironmentVariables
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {variables.map((variable) => {
              if (variable.key === "SITEINFO") {
                const siteInfo = JSON.parse(variable.value);
                return (
                  <Fragment key={variable.key}>
                    <TableRow>
                      <TableCell className="font-medium">{variable.key}</TableCell>
                      <TableCell>details</TableCell>
                    </TableRow>
                    {Object.entries(siteInfo).map(([subKey, subValue]) => (
                      <TableRow key={`${variable.key}-${subKey}`} className="bg-muted/50">
                        <TableCell className="pl-8">└─ {subKey}</TableCell>
                        <TableCell>{subValue as string}</TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                );
              }
              
              return (
                <TableRow key={variable.key}>
                  <TableCell>{variable.key}</TableCell>
                  <TableCell>{variable.value}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
