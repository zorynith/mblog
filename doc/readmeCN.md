# EdgeCD free blog 介绍

EdgeCD AI Blog 是一个基于 Remix.run 框架构建的开源博客系统，建立在 Cloudflare Workers 上。特点：- 由 Remix.run 框架驱动 - 完全边缘计算 - 利用 Cloudflare 生态系统（D1、R2、AI、KV、CDN）
# 免费 、安全 、快速。


EdgeCD 是一个功能强大且灵活的saas模板，boilerplate
从其中将edgecd 的blog 独立出来，形成一个免费、开源的的blog 系统。

基于cloudflare workers的技术栈。充分利用cloudflare的 各种生态。完全边缘化，尽量减少依赖项目。减少折腾。

并且对于开发者非常友好，可以非常方便的进行二次开发。

cloudflare 作为边缘计算的领导者，提供了非常多的生态，比如D1,R2,AI,KV,CDN,WAF,并且这些资源为免费用户提供了大量的额度，对于一个blog来说，完全足够。基于cloudflare,我们就可以得到一个免费、快速、安全的blog系统。

![edge blog](https://image.jiangsi.com/m3bwflrtudly59pdg1mimage.png)

## 技术栈
cloudflare workers
免费额度足够startup起步

数据库 D1 ,用于保存blog数据

KV 用于加速和保存键值对

R2 用于存放网站图片和附件 （需要绑定信用卡，但免费额度足够）

remix.run
主程序使用了remix，可以方便存放在各种位置，即使不依赖cloudflare也可以少修改若干个文件就可以自主托管,减少对vercel的依赖。remix 刚刚好，

vite 本地开发，前端丝滑。并且99%的能在本地vite开发环境中调用cloudflare 的生态，比如d1 kv等

### dirzzle orm 
轻量并边缘友好。并且可以同时使用除了D1以外的数据库，比如neon.tech 提供的postgresql,

### UI
Tailwind CSS

shadcn
 theme 暗色主题和亮色主题


### i18next 国际化多语言

###drizzle orm 轻量并边缘友好。并且可以同时使用除了D1以外的数据库，比如neon.tech 提供的postgresql,

## 强大的Edge AI blog

### 使用AI来续写、优化和翻译你的文字
EdgeCD blog 集成 AIeditor ,可以通过AI进行续写和优化你的文字,



[![AI攥写时事新闻](https://img.youtube.com/vi/qKQr83Nqq7U/0.jpg)](https://youtu.be/qKQr83Nqq7U)



在当今数字化时代，AI技术的迅猛发展为各行各业带来了前所未有的变革，写作领域也不例外。EdgeCD blog 集成 AIeditor 的功能，不仅为博主们提供了强大的写作辅助工具，更在内容创作的效率和质量上实现了质的飞跃。通过AI进行续写和优化文字，不仅能够帮助作者快速生成内容，还能在保持原有风格和语调的基础上，进一步提升文章的逻辑性和可读性。

AIeditor 的核心优势在于其智能化的文本处理能力。无论是续写文章的后续内容，还是对现有文字进行优化，AIeditor 都能根据上下文语境，自动生成符合逻辑且富有创意的文本。这种智能化的辅助写作方式，不仅减轻了作者的写作负担，还为内容的多样性和深度提供了更多可能性。

此外，AIeditor 还具备强大的语言风格识别和调整功能。它能够识别并保留原文的写作风格，无论是正式的学术论文，还是轻松的博客文章，AIeditor 都能在续写和优化过程中保持一致的语调和用词习惯。这种无缝衔接的写作体验，使得作者在创作过程中能够更加专注于内容的深度和创新，而不必担心风格上的突兀变化。

在实际应用中，AIeditor 的续写功能尤为出色。它能够根据文章的主题和已有的内容，自动生成连贯且富有逻辑的后续段落。这种智能化的续写方式，不仅节省了作者的时间和精力，还能在一定程度上激发作者的创作灵感，帮助他们突破写作瓶颈，创作出更加丰富和有深度的内容。

总的来说，EdgeCD blog 集成 AIeditor 的功能，为博主们提供了一种全新的写作体验。通过AI的辅助，作者不仅能够更高效地完成内容创作，还能在保持原有风格和语调的基础上，进一步提升文章的质量和可读性。这种智能化的写作辅助工具，无疑将成为未来内容创作领域的重要趋势。

### AI来总结SEO需要的摘要，标题和slug
在当今数字化时代，搜索引擎优化（SEO）已成为任何希望在网络上脱颖而出的企业或个人不可或缺的工具。SEO不仅仅是关于关键词的堆砌，它更是一门科学和艺术的结合，旨在提高网站在搜索引擎结果页面（SERP）中的可见性。通过精心策划的内容、优化的元数据和高质量的外部链接，SEO可以帮助网站吸引更多的目标流量，从而提升品牌知名度和销售业绩。

首先，关键词研究是SEO的基础。选择合适的关键词不仅能吸引潜在客户，还能确保内容与用户的搜索意图相匹配。通过使用各种工具如Google关键词规划师、SEMrush等，可以发现用户搜索频率高且竞争度适中的关键词。这些关键词应自然地融入到文章的标题、正文和元描述中，以提高搜索引擎的识别度。

其次，内容质量是SEO成功的关键。搜索引擎越来越重视用户体验，因此高质量、原创且有价值的内容更容易获得较高的排名。内容应具有清晰的结构，包括引人入胜的标题、逻辑分明的段落和易于理解的句子。此外，定期更新内容也是保持网站活跃度和吸引搜索引擎爬虫的重要策略。

外部链接，即从其他网站指向你网站的链接，也是SEO的重要组成部分。高质量的外部链接可以提升网站的权威性和可信度，从而提高搜索引擎排名。获取这些链接的方法包括与行业内的权威网站合作、参与社交媒体互动以及发布有价值的内容吸引其他网站的引用。

###优秀的SEO
最后，技术SEO也不容忽视。这包括优化网站的加载速度、确保移动设备兼容性以及使用结构化数据标记等。这些技术细节虽然不直接体现在内容中，但它们对用户体验和搜索引擎的抓取效率有着直接影响。

总之，SEO是一个多维度的过程，需要持续的努力和优化。通过综合运用关键词研究、高质量内容、外部链接和技术优化，任何网站都可以在竞争激烈的网络世界中占据一席之地。

### 组织专题，将散落blog的内容变成有序专题
在整理散落的博客内容时，将其组织成专题不仅能够提升读者的阅读体验，还能更系统地传达知识和见解

将散落的博客内容组织成有序专题是一项需要精心策划和执行的工作。通过明确主题、构建清晰的结构、提供实用内容以及多样化呈现方式，我能够为读者提供更有价值、更系统的知识体系，帮助他们在各自领域中取得更好的成果。

### 图片、附件、视频，上传随心所欲

基于cloudflare R2 的存储让你可以基本上随意的将内容上传到r2上，它前10G免存储费。

也可以直接截图贴入到blog之中。


# 如何搭建
## 1 注册cloudflare
cloudflare 官网  [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
## 2 安装nodejs
从官方网站 [https://nodejs.org/](https://nodejs.org/) 安装Node.js

校验安装成功，在终端中输入
`node -v`
如果安装成功，你会看到Node.js的版本号显示在屏幕上。同样，你也可以通过以下命令来检查npm（Node.js的包管理工具）的版本：
`
npm -v
`
## 3 安装wrangler 并登录
你可以通过npm（Node Package Manager）来完成这一步骤。打开终端并输入以下命令： 
如果已经安装请升级到最新版本。目前最新版本为3.90.0

`npm install wrangler -g`

这个命令会全局安装Wrangler，使其在你的系统中随时可用。安装完成后，你可以通过运行wrangler --version来验证安装是否成功。如果一切顺利，你将看到Wrangler的版本号，这表明你已经准备好进入下一步——登录。

登录是使用Wrangler的关键步骤之一。通过登录，你可以将你的Cloudflare账户与Wrangler关联起来，从而获得对Workers和Pages等服务的完全访问权限。要登录，只需在终端中输入：

`wrangler login`
执行此命令后，Wrangler会引导你通过浏览器进行身份验证。你将被重定向到Cloudflare的登录页面，输入你的账户信息后，系统会生成一个授权令牌。这个令牌将被Wrangler自动捕获并存储，以便后续使用。

登录成功后，你就可以开始使用Wrangler的各种功能了。无论是创建新的Workers项目，还是部署现有的代码，Wrangler都能为你提供无缝的体验。通过命令行界面，你可以轻松管理你的项目，监控其性能，甚至进行实时调试。

## 4 克隆本项目
通过git clone 将项目clone 到本地，并且安装所有依赖。

```
git clone https://github.com/jiangsi/edgecd-blog
cd  edgecd-blog
npm install
```

## 5 编辑配置文件wrangler.toml
将 example.wrangler.toml 拷贝一份，改名为 wrangler.toml

这个文件是wrangler 发布版本的基础

```toml
#:schema node_modules/wrangler/config-schema.json

#项目名称，会在cloudflare 后台的workers中看到
name = "aiedgeblog"     

compatibility_date = "2024-10-04"
assets = { directory = "./build/client" }
main = "./server.ts"


[vars]

MY_VAR = "Hello from edgecd blog"
#用于加密注册登录密码。需要写一个长一点的字符串
SECRET = "SECRET"
SITEINFO.BLOG_prefix_url="/blog"

#网站的基本信息。
SITEINFO.name="name"
SITEINFO.author="author"
SITEINFO.desc="desc"
SITEINFO.summary="summary"

#头像
SITEINFO.avatar="https://ui.shadcn.com/avatars/02.png"
#网站地址
SITEINFO.website_url="https://edgecd.com"
SITEINFO.website_name="edgecd"
#一些外链
SITEINFO.github_url="https://github.com/jiangsi/edgecd-blog"
SITEINFO.twitter_url=""
SITEINFO.instagram_url=""
SITEINFO.youtube_url=""
#R2绑定的域名
SITEINFO.oss_url="https://image.edgecd.com"
SITEINFO.homepagecontent="blog"
#默认的AI调用cloudflare 的模型，可以在后台修改
cf_ai_model="@cf/meta/llama-3.1-70b-instruct"
#默认的主题颜色 可以用dark 或者light
SITEINFO.theme="dark"
#评论使用的github repo ，格式为username/repo  ,评论使用的是utterances,需要站长在github上创建一个repo。
SITEINFO.public_github_repo="jiangsi/public"           
#登录后跳转到后台
SITEINFO.app_redirect_path="/dashboard"
#默认语言。
SITEINFO.locale="zh"
#是否隐藏掉edgecd的版权。希望支持本站，保持false
SITEINFO.hide_copyright=false
#是否禁止注册。注册完管理员之后可以关闭。
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
migrations_dir = "./drizzle/migrations/d1" # 确保这个路径正确


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
## 6 创建cloudflare资源，并填写到wrangler.toml
填写好基本资料之后，开始通过wrangler 创建需要的资源

### 6.1 创建kv资源
以 edgecdblog 和 edgeblog-sessionStoragekv 为名字创建两个kv资源，名字可以随便改，只要自己能记住
```
wrangler kv namespace create edgecdblog 
wrangler kv namespace create edgeblog-sessionStoragekv
```

你会看到成功的提示。

```
✨ Success! Add the following to your configuration file in your kv_namespaces array: 
[[kv_namespaces]] 
binding = "edgecdblog"
id = "2835bf6fc1bb4e09963eae48bf06b7bc"
```
不用管binding 不一致，而是只把id 拷贝到

binding = "KV" 下面的id

和

binding = "SESSION_KV" 下面的id上。

预期配置文件中是这样
```
[[kv_namespaces]] 
binding = "KV"
id = "2835bf6fc1bb4e09963eae48bf06b7bc"
#edgecd-blog-free
```

### 6.2 创建D1

```
wrangler d1 create 数据库的名字
例如
wrangler d1 create edgeblog
```

将得到的id填写到 database_id，名字如果修改了。则要保证database_name 也做相应修改。
```
[[d1_databases]]binding = "DB"
database_name = "edgeblog"
database_id = ""
migrations_dir = "./drizzle/migrations/d1"
```

### 6.3 在本地和远程都将D1数据库初始化创建好
在终端中执行
```
npm run d1:g
```
执行会在项目 drizzle/migrations/d1/生成初始化的sql文件

检查 package.json 中的 d1:up 和 d1:up:local 中的apply 后面的是不是刚才创建的D1 的名字,如果不是，将刚才你创建的d1的名字修改掉 edgeblog 这个字符串。

    "d1:up": "npx wrangler d1 migrations apply edgeblog --remote",
    "d1:up:local": "npx wrangler d1 migrations apply edgeblog --local"
然后在终端中执行
npm run d1:up:local
npm run d1:up
分别需要确认，按Y确认后，即可将数据库进行初始化创建。

### 6.4 创建R2
R2是cloudflare 提供的静态文件托管服务，可以存放照片，视频和附件，作为blog，如果不用附件，则可以不创建。

创建R2 需要到cloudflare 后台dashbaord上在左侧 R2 Object Storage 点击进去，并绑定信用卡。不用担心，虽然绑定信用卡，但是免费额度非常高，请参考R2 的价格


Free 免费

Storage 存储

10 GB / month 10 GB/月

Class A Operations A 类操作 写操作

1 million requests / month
1 百万请求/月

Class B Operations B 类操作 读操作

10 million requests / month
1000 万请求/月

Egress (data transfer to Internet)
出口带宽（数据传输到互联网）

Free 1 自由 1

绑定好信用卡之后，可以直接在dashbaord上创建一个bucket 的桶。然后在桶的setting 中的Custom domains，连结自己注册、或者解析在cloudflare 上的域名，目前R2 如果公开的话，必须要通过这个连接来绑定域名。

![m3xub3cit032nxw3beimage.png](https://image.jiangsi.com/blog/m3xub3cit032nxw3beimage.png)
一般我们要输入一个二级别域名比如 images.your-domain.com 

并且将桶的名字 填写到配置文件
```
[[r2_buckets]] 
binding = "R2" 
bucket_name = "aiedgeblog"
```
并且向上修改配置文件中的oss域配置
```
SITEINFO.oss_url="https://images.your-domain.com"
```

### 6.5 生成一次所有配置文件的类型定义
`npm run typegen`

### 6.6 logo
可以将logo 放到r2上，并copy地址。到配置文件中设置

```
SITEINFO.logo = "logo url"
``` 

### 6.7 favicon icon
文件处于根目录

public/favicon.ico

替换它就可以了。

至此所有配置配置完毕。可以进行调试和部署了

## 7 本地调试
此时可以通过以下命令，本地启动

`npm run dev`

可以通过点击终端显示的连接，打开页面进行查看。此时连接的数据库是本地的。

## 8 部署上线
通过命令，此命令会先在本地进行build，然后发布到cloudflare的服务器上。

`npm run deploy`

发布过程如果没有报错，在最后会显示几行结果

```
Uploaded edgecd-blog-free (19.14 sec) 
Deployed edgecd-blog-free triggers (0.28 sec) 
https://你给项目起的名字.你的用户名.workers.dev Current Version ID: d30fe1ef-01bf-4079-9312-6d26c69f4b39
```
这时候你可以拿这个域名直接访问查看效果。

## 9 绑定域名
并且需要到cloudflare 中去找到这个workers，并且给其配置你想要的域名。

登录到cloudflare dashboard ，在左侧找到workers & pages.进入后，从列表中能看到你的项目。点击项目进入项目详情，点击setting 。在domains 这里可以add ，并且绑定一个你在cloudflare中的域名即可。

![m3xvecx4wnrc2xfum2image.png](https://image.jiangsi.com/blog/m3xvecx4wnrc2xfum2image.png)

并且需要到cloudflare 中去找到这个workers，并且给其配置你想要的域名。

## 10 上线后的必要操作
上线后需要第一时间创建一个用户，第一个用户会是管理员用户。

[查看线上安装教程](https://jiangsi.com/blog/edgecd-blog-setup-cloudflare-install)
[更多edgecd 专题](https://jiangsi.com/collections/edgecd)

## 11 AI 配置

需要配置openai 兼容的api 地址
国内同学建议deepseek,10元充值完全用不完
注册地址 https://www.deepseek.com/


### 11.1 在wrangler.toml 中配置
可以在 wrangler.toml 中配置 在[vars] 下添加

``` 
ai_apikey="sk-11111111111111111111111111111111"
ai_endpoint="https://api.deepseek.com"
ai_model="deepseek-chat"
```

注意地址 https://api.deepseek.com 最后要没有斜杠结尾。
或者你喜欢的任何openai兼容的模型即可。
如果不填写，则默认使用cloudflare AI模型。参数为cf_ai_model="@cf/meta/llama-3.1-70b-instruct"

### 11.2 在blog dashboard 中配置
登录blog，在左侧找到blog - prompts 。中文为博客 - 提示词。
在其中填写想要的AI模型端口和地址。
