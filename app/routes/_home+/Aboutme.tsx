import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { useSiteInfo } from "~/context/SiteInfoContext";
import Head from "~/components/Head";

export default function AboutPage() {
  const SITEINFO = useSiteInfo();
  const Avatar_image = SITEINFO.avatar
  ? SITEINFO.avatar
  : "https://picsum.photos/100/100";

  return (
    <div className="min-h-screen  bg-background text-foreground">
      <Head />
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <Avatar className="w-32 h-32 mx-auto mb-4">
            <AvatarImage src={Avatar_image} alt={SITEINFO.name} />
            <AvatarFallback>YN</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold">{SITEINFO.name}</CardTitle>
          <CardDescription>{SITEINFO.desc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">About Me</h2>
            <p>
              Hello! edgecd-blog is a blog with AI
              </p>
              <p>built with remix.run and cloudflare.
              </p>
              <p>it is totally open source.
              </p>
              <p>and the infrastructure is powered by cloudflare is free and awesome.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              <Badge>remix.run</Badge>
              <Badge>AI</Badge>
              <Badge>TypeScript</Badge>
              <Badge>cloudflare</Badge>
              <Badge>open source</Badge>
              <Badge>free</Badge>
              <Badge>awesome</Badge>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-2">Contact</h2>
            <p className="text-muted-foreground">

              GitHub: <a href="https://github.com/jiangsi" className="text-primary hover:underline">github.com/jiangsi</a><br />
              code: <a href="https://github.com/jiangsi/edgecd-blog" className="text-primary hover:underline">github.com/jiangsi/edgecd-blog</a>
            </p>
          </section>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

