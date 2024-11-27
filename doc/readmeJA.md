# EdgeCD free blog 紹介

EdgeCD AI Blog は、Remix.run フレームワークに基づいて構築されたオープンソースのブログシステムで、Cloudflare Workers 上で動作します。特徴：- Remix.run フレームワーク駆動 - 完全エッジコンピューティング - Cloudflare エコシステム（D1、R2、AI、KV、CDN）を活用
# 無料、安全、高速。

EdgeCD は、強力で柔軟な SaaS テンプレート、boilerplate です。
EdgeCD のブログ部分を独立させ、無料でオープンソースのブログシステムを形成しました。

Cloudflare Workers の技術スタックに基づき、Cloudflare の様々なエコシステムを十分に活用します。完全にエッジ化され、依存関係を最小限に抑えることで、セットアップの手間を減らします。

また、開発者にとても優しく、二次開発が非常に容易です。

Cloudflare はエッジコンピューティングのリーダーとして、D1、R2、AI、KV、CDN、WAF など多くのエコシステムを提供しており、無料ユーザーに対して大量の利用枠を提供しています。ブログにとっては十分な量です。Cloudflare をベースにすることで、無料で高速かつ安全なブログシステムを手に入れることができます。

![edge blog](https://image.jiangsi.com/m3bwflrtudly59pdg1mimage.png)

## 技術スタック
Cloudflare Workers
無料枠で十分にスタートアップに対応

データベース D1、ブログデータの保存に使用

KV キー値の加速と保存に使用

R2 ウェブサイトの画像と添付ファイルの保存に使用（クレジットカードのバインドが必要ですが、無料枠で十分です）

remix.run
主プログラムに remix を使用し、様々な場所に簡単に保存できます。Cloudflare に依存しなくても、いくつかのファイルを修正するだけで自主的にホスティングできます。remix はちょうど良いです。

vite ローカル開発、フロントエンドが滑らかです。また、ローカルの vite 開発環境で 99% の Cloudflare エコシステム（D1、KV など）を呼び出すことができます。

### drizzle orm
軽量でエッジに優しい。また、D1 以外のデータベース（例えば、neon.tech が提供する PostgreSQL）も同時に使用できます。

### UI
Tailwind CSS

shadcn
テーマ ダークテーマとライトテーマ

### i18next 国際化多言語

### drizzle orm 軽量でエッジに優しい。また、D1 以外のデータベース（例えば、neon.tech が提供する PostgreSQL）も同時に使用できます。

## 強力な Edge AI blog

### AI を使用して文章を続け、最適化、翻訳する
EdgeCD blog は AIeditor を統合し、AI を通じて文章を続け、最適化することができます。

[![AI で時事ニュースを書く](https://img.youtube.com/vi/qKQr83Nqq7U/0.jpg)](https://youtu.be/qKQr83Nqq7U)

現代のデジタル時代において、AI 技術の急速な発展はあらゆる業界に前例のない変革をもたらしています。執筆分野も例外ではありません。EdgeCD blog は AIeditor を統合し、ブロガーに強力な執筆支援ツールを提供し、内容創作の効率と品質を飛躍的に向上させています。AI を通じて文章を続け、最適化することで、作者は迅速に内容を生成でき、元のスタイルと語調を維持しながら、文章の論理性と読みやすさをさらに向上させることができます。

AIeditor の核心的な優位性は、そのインテリジェントなテキスト処理能力にあります。文章の後続内容を続けるか、既存のテキストを最適化するかに関わらず、AIeditor は文脈に基づいて、論理的で創造的なテキストを自動生成します。このインテリジェントな執筆支援方式は、作者の執筆負担を軽減し、内容の多様性と深さにさらなる可能性を提供します。

さらに、AIeditor は強力な言語スタイルの識別と調整機能を備えています。正式な学術論文であろうと、軽快なブログ記事であろうと、AIeditor は続けと最適化の過程で一貫した語調と用語習慣を維持します。このシームレスな執筆体験により、作者は内容の深さと革新により多くの注意を払い、スタイルの急激な変化について心配する必要がなくなります。

実際の応用では、AIeditor の続け機能が特に優れています。文章のテーマと既存の内容に基づいて、連続的で論理的な後続段落を自動生成します。このインテリジェントな続け方式は、作者の時間とエネルギーを節約し、一定程度で創作のインスピレーションを刺激し、より豊かで深い内容を創作するのに役立ちます。

全体的に見て、EdgeCD blog は AIeditor の機能を統合し、ブロガーに新しい執筆体験を提供しています。AI の支援を通じて、作者はより効率的に内容創作を完了し、元のスタイルと語調を維持しながら、文章の品質と読みやすさをさらに向上させることができます。このインテリジェントな執筆支援ツールは、間違いなく未来の内容創作分野の重要なトレンドとなるでしょう。

### AI で SEO に必要な要約、タイトル、スラッグをまとめる
現代のデジタル時代において、検索エンジン最適化（SEO）は、ウェブ上で目立つことを望む企業や個人にとって不可欠なツールとなっています。SEO は単なるキーワードの詰め込みではなく、検索エンジン結果ページ（SERP）でのウェブサイトの可視性を向上させるための科学と芸術の結合です。精心の内容、最適化されたメタデータ、高品質の外部リンクを通じて、SEO はウェブサイトがより多くのターゲットトラフィックを引き寄せ、ブランドの知名度と売上を向上させることができます。

まず、キーワード研究は SEO の基礎です。適切なキーワードを選択することで、潜在的な顧客を引き寄せ、内容がユーザーの検索意図と一致するようにすることができます。Google キーワードプランナー、SEMrush などの各種ツールを使用して、ユーザーの検索頻度が高く、競争度が適度なキーワードを発見できます。これらのキーワードは、自然に文章のタイトル、本文、メタ説明に組み込まれ、検索エンジンの識別度を向上させる必要があります。

次に、内容の質は SEO 成功の鍵です。検索エンジンはユーザーエクスペリエンスを重視するため、高品質でオリジナルで価値のある内容はより高いランキングを獲得しやすくなります。内容は明確な構造を持ち、魅力的なタイトル、論理的な段落、理解しやすい文で構成されるべきです。さらに、定期的に内容を更新することも、ウェブサイトの活動性と検索エンジンのクローラーを引き寄せる重要な戦略です。

外部リンク、つまり他のウェブサイトからあなたのウェブサイトへのリンクも、SEO の重要な構成要素です。高品質の外部リンクは、ウェブサイトの権威性と信頼性を向上させ、検索エンジンのランキングを向上させることができます。これらのリンクを獲得する方法には、業界内の権威ウェブサイトとの協力、ソーシャルメディアでの交流、価値のある内���を公開して他のウェブサイトから引用されることなどがあります。

### 優れた SEO
最後に、技術的な SEO も無視できません。これには、ウェブサイトの読み込み速度の最適化、モバイルデバイスの互換性、構造化データマークアップの使用などが含まれます。これらの技術的な詳細は内容に直接反映されませんが、ユーザーエクスペリエンスと検索エンジンのクローラー効率に直接影響します。

総じて、SEO は多面的なプロセスであり、継続的な努力と最適化が必要です。キーワード研究、高品質の内容、外部リンク、技術的な最適化を総合的に活用することで、競争激しいウェブ世界で一席を占めることができます。

### 散らばったブログ内容を体系的な専門分野に整理する
散らばったブログ内容を体系的な専門分野に整理することは、読者の閲覧体験を向上させ、知識や見解をより体系的に伝えることができます。

散らばったブログ内容を体系的な専門分野に整理することは、精心に計画し実行する必要があります。明確なテーマを設定し、明確な構造を構築し、実用的な内容を提供し、多様な表現方法を提供することで、読者により価値のある体系的な知識体系を提供し、それぞれの分野でより良い成果を達成するのに役立ちます。

### 画像、添付ファイル、ビデオ、自由にアップロード
Cloudflare R2 のストレージを使用すると、基本的に自由に内容を R2 にアップロードできます。最初の 10GB は無料です。

ブログに直接スクリーンショットを貼り付けることもできます。


# どのように構築するか
## 1 Cloudflare
Cloudflare のダッシュボードにログインします [https://dash.cloudflare.com/](https://dash.cloudflare.com/)

## 2 Node.js のインストール
公式サイト [https://nodejs.org/](https://nodejs.org/) から Node.js をインストールします。
確認方法：
`node -v`
インストールが成功すると、Node.js のバージョン番号が表示されます。同様に、npm（Node.js のパッケージマネージャー）のバージョンも以下のコマンドで確認できます：
`npm -v`

## 3 Wrangler のインストールとログイン
npm（Node Package Manager）を使用して Wrangler をインストールします。ターミナルを開き、以下のコマンドを入力します：
`npm install wrangler -g`

このコマンドは Wrangler をグローバルにインストールし、システム内でいつでも使用できるようにします。インストールが完了したら、`wrangler --version` を実行してインストールが成功したか確認できます。すべてが順調であれば、Wrangler のバージョン番号が表示され、次のステップであるログインに進む準備が整います。

ログインは Wrangler を使用するための重要なステップの一つです。ログインすることで、Cloudflare アカウントを Wrangler に関連付け、Workers や Pages などのサービスへの完全なアクセス権を取得できます。ログインするには、ターミナルで以下のコマンドを入力します：
`wrangler login`

このコマンドを実行すると、Wrangler はブラウザを介して認証を行うように促します。Cloudflare のログインページにリダイレクトされ、アカウント情報を入力すると、システムは認証トークンを生成します。このトークンは Wrangler によって自動的にキャプチャされ、後で使用するために保存されます。

ログインが成功すると、Wrangler のさまざまな機能を使用する準備が整います。新しい Workers プロジェクトの作成や既存のコードのデプロイなど、Wrangler はシームレスな体験を提供します。コマンドラインインターフェースを使用して、プロジェクトを簡単に管理し、パフォーマンスを監視し、リアルタイムでデバッグすることができます。


## 4 クローン本プロジェクト
git clone でプロジェクトをローカルにクローンし、すべての依存関係をインストールします。

```
git clone https://github.com/jiangsi/edgecd-blog
cd  edgecd-blog
npm install
```

## 5 設定ファイルwrangler.tomlを編集
example.wrangler.toml をコピーして、wrangler.toml という名前に変更します。
このファイルはwrangler バージョンの基礎です

```toml
#:schema node_modules/wrangler/config-schema.json

#プロジェクト名、cloudflare のworkersで見られます
name = "aiedgeblog"     

compatibility_date = "2024-10-04"
assets = { directory = "./build/client" }
main = "./server.ts"


[vars]

MY_VAR = "Hello from edgecd blog"
#暗号化登録ログインパスワードに使用。長い文字列を書く必要があります
SECRET = "SECRET"
SITEINFO.BLOG_prefix_url="/blog"

#サイトの基本情報。
SITEINFO.name="name"
SITEINFO.author="author"
SITEINFO.desc="desc"
SITEINFO.summary="summary"

#アバター
SITEINFO.avatar="https://ui.shadcn.com/avatars/02.png"
#サイトのアドレス
SITEINFO.website_url="https://edgecd.com"
SITEINFO.website_name="edgecd"
#いくつかの外部リンク
SITEINFO.github_url="https://github.com/jiangsi/edgecd-blog"
SITEINFO.twitter_url=""
SITEINFO.instagram_url=""
SITEINFO.youtube_url=""
#R2バインドドメイン
SITEINFO.oss_url="https://image.edgecd.com"
SITEINFO.homepagecontent="blog"
#デフォルトのAIモデル、cloudflare のモデルを呼び出す、バックエンドで変更可能
cf_ai_model="@cf/meta/llama-3.1-70b-instruct"
#デフォルトのテーマカラー、dark またはlight を使用できます
SITEINFO.theme="dark"
#コメントに使用するgithub repo 、フォーマットはusername/repo 、コメントはutterancesを使用、サイト管理者はgithubでrepoを作成する必要があります。
SITEINFO.public_github_repo="jiangsi/public"           
#ログイン後、バックエンドにリダイレクト
SITEINFO.app_redirect_path="/dashboard"
#デフォルトの言語。
SITEINFO.locale="zh"
#edgecdの著作権を隠すかどうか。このサイトをサポートしたい場合は、falseのままにしてください
SITEINFO.hide_copyright=false
#登録を禁止するかどうか。管理者登録後に閉じることができます。
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

## 6 6 Cloudflareリソースの作成し、wrangler.tomlに記入
基本情報を記入した後、wranglerを使用して必要なリソースを作成します。

### 6.1 KVリソースの作成
edgecdblog と edgeblog-sessionStoragekv という名前で2つのKVリソースを作成します。名前は自由に変更できますが、覚えやすいものにしてください。
```
wrangler kv namespace create edgecdblog 
wrangler kv namespace create edgeblog-sessionStoragekv
```

成功のメッセージが表示されます。

```
✨ Success! Add the following to your configuration file in your kv_namespaces array: 
[[kv_namespaces]] 
binding = "edgecdblog"
id = "2835bf6fc1bb4e09963eae48bf06b7bc"
```
bindingが一致しない場合は無視し、idのみを
binding = "KV" の下のid
と
binding = "SESSION_KV" の下のidにコピーします。
期待される設定ファイルは次のようになります。

```
[[kv_namespaces]] 
binding = "KV"
id = "2835bf6fc1bb4e09963eae48bf06b7bc"
#edgecd-blog-free
```

### 6.2 D1の作成

```
wrangler d1 create データベースの名前
例えば
wrangler d1 create edgeblog
```

得られたidをdatabase_idに記入し、名前を変更した場合はdatabase_nameもそれに合わせて変更します。
```
[[d1_databases]]binding = "DB"
database_name = "edgeblog"
database_id = ""
migrations_dir = "./drizzle/migrations/d1"
```

### 6.3 ローカルとリモートの両方でD1データベースを初期化して作成
ターミナルで実行
```
npm run d1:g
```
実行すると、プロジェクト drizzle/migrations/d1/に初期化されたSQLファイルが生成されます。
package.json の d1:up と d1:up:local のapplyの後ろが、先ほど作成したD1の名前であるか確認し、そうでない場合は、先ほど作成したd1の名前に変更します。
"d1:up": "npx wrangler d1 migrations apply edgeblog --remote",
"d1:up:local": "npx wrangler d1 migrations apply edgeblog --local"
その後、ターミナルで実行
npm run d1:up:local
npm run d1:up
それぞれ確認が必要で、Yを押して確認後、データベースを初期化して作成します。

### 6.4 R2 の作成
R2 は Cloudflare が提供する静的ファイルホスティングサービスで、写真、ビデオ、添付ファイルの保存に使用されます。ブログで添付ファイルを使用しない場合、R2 を作成する必要はありません。

R2 を作成するには、Cloudflare のダッシュボードにログインし、左側のメニューから R2 Object Storage を選択します。クレジットカードをバインドする必要がありますが、心配する必要はありません。無料枠は非常に大きいです。R2 の価格を参照してください。

無料枠：
- ストレージ：10 GB/月
- A クラス操作（書き込み操作）：100 万リクエスト/月
- B クラス操作（読み取り操作）：1000 万リクエスト/月
- エグレス（インターネットへのデータ転送）：無料

クレジットカードをバインドした後、ダッシュボードでバケットを作成し、バケットの設定の Custom domains で、Cloudflare で登録または解決されたドメインをバインドします。現在、R2 が公開されている場合、このバインドを通じてドメインをバインドする必要があります。

![m3xub3cit032nxw3beimage.png](https://image.jiangsi.com/blog/m3xub3cit032nxw3beimage.png)
通常、images.your-domain.com のようなサブドメインを入力し、バケット名を設定ファイルに記入します。

```toml
[[r2_buckets]]
binding = "R2"
bucket_name = "aiedgeblog"
```

また、設定ファイルの oss ドメイン設定を更新します。
```toml
SITEINFO.oss_url="https://images.your-domain.com"
```

### 6.5 すべての設定ファイルの型定義を生成
`npm run typegen`

### 6.6 ロゴの設定
ロゴを R2 にアップロードし、URL をコピーして設定ファイルに設定します。
```toml
SITEINFO.logo = "logo url"
```

### 6.7 favicon アイコンの設定
ファイルはルートディレクトリにあります。
`public/favicon.ico`
これを置き換えるだけです。

これですべての設定が完了しました。デバッグとデプロイを行うことができます。

## 7 ローカルデバッグ
以下のコマンドでローカルで起動できます。
`npm run dev`

ターミナルに表示されるリンクをクリックして、ページを開いて確認できます。この時点で接続されているデータベースはローカルのものです。

## 8 デプロイ
以下のコマンドでデプロイします。このコマンドはまずローカルでビルドし、次に Cloudflare のサーバーに公開します。
`npm run deploy`

デプロイプロセスでエラーが発生しなければ、最後にいくつかの結果が表示されます。
```
Uploaded edgecd-blog-free (19.14 sec)
Deployed edgecd-blog-free triggers (0.28 sec)
https://プロジェクト名.ユーザー名.workers.dev Current Version ID: d30fe1ef-01bf-4079-9312-6d26c69f4b39
```
この時点で、このドメインを直接アクセスして効果を確認できます。

## 9 ドメインのバインド
Cloudflare のダッシュボードにログインし、左側のメニューから Workers & Pages を選択します。リストからプロジェクトを選択し、プロジェクトの詳細ページに移動し、設定をクリックします。ドメインで追加し、Cloudflare で登録されたドメインをバインドします。

![m3xvecx4wnrc2xfum2image.png](https://image.jiangsi.com/blog/m3xvecx4wnrc2xfum2image.png)

## 10 デプロイ後の必要な操作
デプロイ後、最初にユーザーを作成する必要があります。最初のユーザーは管理者ユーザーになります。

[オンラインインストールチュートリアルを見る](https://jiangsi.com/blog/edgecd-blog-setup-cloudflare-install)
[より多くの EdgeCD 専門分野](https://jiangsi.com/collections/edgecd)

## 11 AI の設定
OpenAI 互換の API アドレスを設定する必要があります。国内のユーザーは DeepSeek を推奨し、10 元のチャージで完全に使い切れません。
注意：アドレス https://openrouter.ai/ の最後にスラッシュを付けないでください。

### 11.1 wrangler.toml での設定
`wrangler.toml` で設定し、`[vars]` の下に追加します。
```toml
ai_apikey="sk-11111111111111111111111111111111"
ai_endpoint="https://openrouter.ai/api"
ai_model="anthropic/claude-3.5-sonnet:beta"
```

または、

``` 
ai_apikey="xai-11111111111111111111111111111111"
ai_endpoint="https://api.x.ai"
ai_model="grok-beta"
```


または、好きな OpenAI 互換のモデルを使用できます。設定しない場合、デフォルトで Cloudflare AI モデルが使用されます。パラメータは `cf_ai_model="@cf/meta/llama-3.1-70b-instruct"` です。

### 11.2 ブログダッシュボードでの設定
ブログにログインし、左側のメニューからブログ - プロンプトを選択します。
そこに希望する AI モデルのポートとアドレスを記入します。