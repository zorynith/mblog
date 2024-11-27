# edgecd-blog
EdgeCD AI Blog is an open-source blog system built with Remix.run on Cloudflare Workers. Features: - Powered by Remix.run framework - Fully edge-based computing - Leverages Cloudflare ecosystem (D1, R2, AI, KV, CDN)
# EdgeCD Free Blog Introduction
# Free, Secure, Fast.

[查看中文版](doc/readmeCN.md)
[日文版を見る ](doc/readmeJA.md)

EdgeCD Blog is a powerful and flexible blog system extracted from the EdgeCD SaaS template/boilerplate. It's free, open-source, and designed for simplicity.

Built on Cloudflare Workers technology stack, it leverages various Cloudflare ecosystem services. The system is fully edge-based, minimizing dependencies and complexity.

It's also developer-friendly, making secondary development convenient and straightforward.

As a leader in edge computing, Cloudflare provides numerous ecosystem services like D1, R2, AI, KV, CDN, and WAF. These resources come with generous free tiers that are more than sufficient for a blog. Based on Cloudflare, we can create a free, fast, and secure blog system.

[![english write blog demo](https://img.youtube.com/vi/DF3Jv5O0Uew/0.jpg)](https://www.youtube.com/watch?v=DF3Jv5O0Uew)

## Technology Stack

### Cloudflare Workers
Free tier sufficient for startup needs

### Database
- D1 for blog data storage
- KV for caching and key-value storage
- R2 for website images and attachments (requires credit card, but free tier is sufficient)

### Framework
- Remix.run: Main framework, easily deployable anywhere with minimal modifications
- Vite: Smooth local development with 99% Cloudflare ecosystem access locally

### ORM
Drizzle ORM: Lightweight and edge-friendly, compatible with databases beyond D1

### UI
- Tailwind CSS
- Shadcn with dark/light theme support

### Features
- i18next for internationalization
- Edge AI capabilities for content enhancement
- SEO optimization
- Topic organization
- Media management with R2 storage

## Key Features

### AI-Powered Content Enhancement
- AI-assisted writing and optimization
- Content continuation and improvement
- Style preservation and enhancement

### SEO Optimization
- AI-generated summaries, titles, and slugs
- Structured content organization
- Technical SEO implementation

### Topic Organization
Transform scattered blog posts into organized collections

### Media Management
Easy upload and management of images, attachments, and videos using Cloudflare R2

## Installation Guide

### 1. Register with Cloudflare
Create and verify your Cloudflare account

### 2. Install Node.js
Download and install Node.js from the official website

### 3. Install or upgrade wrangler and Login to Wrangler
```bash
npm install wrangler -g
wrangler login
```

wrangler verion at this time is 3.90.0

### 4. Clone the Project
```bash
git clone https://github.com/jiangsi/edgecd-blog
cd edgecd-blog
npm install
```

### 5. Configure wrangler.toml
Copy `example.wrangler.toml` to `wrangler.toml` and update the configuration:

```toml
#:schema node_modules/wrangler/config-schema.json

#project name, will see in cloudflare workers
name = "aiedgeblog"     

compatibility_date = "2024-10-04"
assets = { directory = "./build/client" }
main = "./server.ts"


[vars]
MY_VAR = "Hello from edgecd blog"
# used to encrypt password. need a long string
SECRET = "SECRET"
SITEINFO.BLOG_prefix_url="/blog"

#website basic info.
SITEINFO.name="name"
SITEINFO.author="author"
SITEINFO.desc="desc"
SITEINFO.summary="summary"

#avatar
SITEINFO.avatar="https://ui.shadcn.com/avatars/02.png"
#website url
SITEINFO.website_url="https://edgecd.com"
SITEINFO.website_name="edgecd"
#some external links
SITEINFO.github_url="https://github.com/jiangsi/edgecd-blog"
SITEINFO.twitter_url=""
SITEINFO.instagram_url=""
SITEINFO.youtube_url=""
#R2 bind domain
SITEINFO.oss_url="https://image.edgecd.com"
SITEINFO.homepagecontent="blog"
#default ai model, can change in dashboard
cf_ai_model="@cf/meta/llama-3.1-70b-instruct"
#default theme, can use dark or light
SITEINFO.theme="dark"
#comment use github repo, format is username/repo
SITEINFO.public_github_repo="jiangsi/public"
#login redirect path
SITEINFO.app_redirect_path="/dashboard"
#default language.
SITEINFO.locale="en"
#hide edgecd copyright. if you want to support this site, keep false
SITEINFO.hide_copyright=false

#is disable signup, after create admin user, can close it.
SITEINFO.disable_signup=false
SITEINFO.logo = ""




[[kv_namespaces]]
binding = "KV"
id = ""

[[kv_namespaces]]
binding = "SESSION_KV"
id = ""
# aiedgeblog-sessionStoragekv

[[d1_databases]]   
binding = "DB" # i.e. available in your Worker on env.DB
database_name = "edgeblog"
database_id = ""
migrations_dir = "./drizzle/migrations/d1" 


[[r2_buckets]]
binding = "R2"
bucket_name = "aiedgeblog"


# Workers Logs
# Docs: https://developers.cloudflare.com/workers/observability/logs/workers-logs/
# Configuration: https://developers.cloudflare.com/workers/observability/logs/workers-logs/#enable-workers-logs
[observability]
enabled = true


[ai]
binding = "AI" 
```
### 6. Create Cloudflare Resources
- Create KV namespaces

Create two kv resources with names edgecdblog and edgeblog-sessionStoragekv, the names can be changed as long as you can remember them.
```
wrangler kv namespace create edgecdblog 
wrangler kv namespace create edgeblog-sessionStoragekv
```

You will see successful tips.

```
✨ Success! Add the following to your configuration file in your kv_namespaces array: 
[[kv_namespaces]] 
binding = "edgecdblog"
id = "2835bf6fc1bb4e09963eae48bf06b7bc"
```
Ignore the binding inconsistency, just copy the id to

binding = "KV" 

and

binding = "SESSION_KV" 

Expected configuration file:
```
[[kv_namespaces]] 
binding = "KV"
id = "2835bf6fc1bb4e09963eae48bf06b7bc"
#edgecd-blog-free
```

- Set up D1 database

```
wrangler d1 create database_name
example
wrangler d1 create edgeblog
```

 use the id to fill in database_id, if the name is changed, also ensure that database_name is modified accordingly.
```
[[d1_databases]]binding = "DB"
database_name = "edgeblog"
database_id = ""
migrations_dir = "./drizzle/migrations/d1"
```


- Initialize databases
Execute in terminal
```
npm run d1:g
```
Execute in terminal, it will generate the initial sql file in drizzle/migrations/d1/

Check if the apply after d1:up and d1:up:local in package.json is the name of the D1 you created, if not, change the string edgeblog to the name of the D1 you created.

    "d1:up": "npx wrangler d1 migrations apply edgeblog --remote",
    "d1:up:local": "npx wrangler d1 migrations apply edgeblog --local"
Then execute in terminal
```
npm run d1:up:local
npm run d1:up
```
Need to confirm, after Y confirmation, the database will be initialized and created.


- Configure R2 storage
R2 is a static file hosting service provided by Cloudflare, you can store photos, videos, and attachments. If you don't need attachments, you can skip creating it.

Create R2 in the Cloudflare dashboard, go to the R2 Object Storage in the left sidebar, and bind a credit card. Don't worry, although a credit card is bound, the free tier is very high, please refer to R2 pricing.



After binding a credit card, you can create a bucket in the dashboard. Then in the bucket setting, connect your registered domain or the domain parsed in Cloudflare, currently, if R2 is public, it must be bound through this connection.

![m3xub3cit032nxw3beimage.png](https://image.jiangsi.com/blog/m3xub3cit032nxw3beimage.png)
We usually input a second-level domain like images.edgecd.com

And fill in the bucket name to the configuration file
```
[[r2_buckets]] 
binding = "R2" 
bucket_name = "aiedgeblog"
```
And modify the oss domain configuration in the configuration file
```
SITEINFO.oss_url="https://images.edgecd.com"
```

### 7. Local Development
```bash
npm run dev
```

### 8. Deployment
```bash
npm run deploy
```

### 9. Domain Configuration
Configure custom domain in Cloudflare dashboard

### 10. Post-Deployment Setup
Create the first admin user immediately after deployment

[View Online Installation Guide](https://jiangsi.com/blog/edgecd-blog-setup-cloudflare-install)
[More EdgeCD Topics](https://jiangsi.com/collections/edgecd)

## 11 AI Settings

Need to configure the openai compatible api address
suggest openrouter
Note that the address https://openrouter.ai/api should not end with a slash.


### 11.1 wrangler.toml settings AI configuration
In wrangler.toml, in [vars], add

``` 
ai_apikey="sk-11111111111111111111111111111111"
ai_endpoint="https://openrouter.ai/api"
ai_model="anthropic/claude-3.5-sonnet:beta"
```

or like

``` 
ai_apikey="xai-11111111111111111111111111111111"
ai_endpoint="https://api.x.ai"
ai_model="grok-beta"
```


or any other openai compatible model.
If not filled, the default is cloudflare AI model. The parameter is cf_ai_model="@cf/meta/llama-3.1-70b-instruct"

### 11.2 blog dashboard settings
Login to blog, find blog - prompts.
Fill in the AI model port and address you want.

