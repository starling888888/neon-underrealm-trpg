# アーキテクチャ要件

静的サイト、コンテンツ管理、Excel由来データ、技術スタックの制約を扱う。

## 2. アーキテクチャ制約

### AC-01. 静的サイトとして成立すること

本サイトは、GitHub Pages / GitLab Pages / Cloudflare Pages / Vercel / Netlify などの無料静的ホスティングサービスで公開できる構成にする。

サーバーサイド処理、データベース、常駐プロセス、認証必須CMSを前提にしてはならない。

### AC-02. ソースコード連携で自動公開できること

Gitリポジトリへの push または merge を契機として、CI/CDで自動ビルド・自動公開できること。

想定フローは以下とする。

```text
ローカルで編集
→ Git commit
→ GitHub / GitLab に push
→ CI/CD で静的ビルド
→ Pages等へ公開
```

GitHub Pagesへの公開では、公開用build後にPagefind検索indexを生成し、検索indexを含む成果物をCI/CDからdeployする。

### AC-03. サブパス公開に対応すること

GitHub Pages等で、以下のようなサブパス配下に公開されても壊れないこと。

```text
https://username.github.io/repository-name/
```

内部リンク、画像、CSS、JS、OGP画像URL、Pagefind検索index、データカード個別アンカーへの遷移は、ルート `/` 固定に依存しない。

### AC-04. コンテンツ本文はMarkdown / MDX / Astroページとして管理すること

ルール本文、世界観、用語、FAQ、注記、例示などの文章コンテンツは、Markdown、MDX、またはAstroページとして管理する。

初期公開スコープではPL向け本文を主対象とし、GMガイド、シナリオ本文、キャンペーン本文は含めない。

本文の修正に、Reactコンポーネントやアプリケーションコードの編集を過剰に要求しない。

### AC-05. Markdown本文にJS Componentを埋め込めること

各ページは、Markdown本文を基本としつつ、必要に応じてJS Componentを埋め込める構成にする。

この要件は、スキル、アイテム、スキル凡例、アイテム凡例、コールアウト、画像ブロックなどをカードUIや専用UIで表示するために必要である。

通常の文章コンテンツはMarkdownとして編集できること。

構造化データの一覧表示、カード表示、凡例表示、関連リンク表示など、通常Markdownでは表現しづらいUIはComponentとして埋め込めること。

実装候補として、MDX、Astro Components、または同等の仕組みを利用する。

### AC-06. 初期対象データはExcel起点で管理できること

初期公開スコープで扱う表形式データは、制作者がローカルのExcelで管理できること。

初期対象データは以下を基本とする。

- スキル
- アイテム
- 流儀
- 生き様
- リリースノート
- `/world`のNPC紹介用データ

`/world`のNPC紹介に限り、NPCデータはExcelから生成JSONへ変換して初期実装対象とする。個別画像は`id`を対応キーとして表示層で解決し、同名画像がない場合は`no_image.webp`へフォールバックする。

NPC一覧・詳細、エネミー、GM専用データ、シナリオ本文、キャンペーン本文は初期実装対象に含めない。

ただし、将来的に同じ仕組みで追加できる構成を妨げない。

Excel本体はGit管理しない。

### AC-07. 生Excel・作業入力管理ディレクトリ

Excel本体やページ作成前のMarkdown入力は、リポジトリ直下の `.raw/` ディレクトリ配下で管理できること。

`.raw/` はローカル作業用ディレクトリであり、Git管理しない。

Google Drive上のユーザー編集正本をローカル作業入力として使う場合、Google Drive同期対象フォルダのURLはリポジトリ直下の `raw-google-drive.url` で管理できること。

`raw-google-drive.url` はローカル開発環境ごとの設定ファイルであり、Git管理しない。

想定するローカル作業領域は以下。

```text
.raw/
├─ release-notes.xlsx
├─ data/
│  └─ *.xlsx
├─ contents/
│  └─ *.md
└─ v1.0/
   └─ *.md
```

`.raw/release-notes.xlsx` はリリースノートExcel本体を置くローカル領域とする。

`.raw/data/*.xlsx` は、スキル、アイテム、流儀、生き様などのデータExcel本体を置くローカル領域とする。

`.raw/contents/*.md` は、ユーザーが画面作成前にcontents markdownを置くローカル領域とする。

`.raw/v1.0/*.md` は、v1.0公開時の旧ルール、テストプレイ、v1.5向け検討を参照するローカル領域とする。現行サイト本文の正本として扱わない。

Drive `v1.0/` 直下のGoogle Docsは、スタイルをMarkdownとして保持するため `text/markdown` exportで `.raw/v1.0/*.md` に同期する。export結果に含まれるinline base64画像定義は、agentのコンテキストとローカル作業入力を肥大化させないため保存前に除去する。これは `contents/` Google Docsを `text/plain` exportする運用とは別である。

contents markdownは、frontmatterをページメタ情報、Markdown本文をページ内容、HTMLコメントをagent向け指示として扱う。

Google Docs上にcontents markdownを置く場合は、Markdownソースをプレーンテキストとして保持し、`text/plain` exportで `.raw/contents/*.md` に同期する。

Google Docsのリッチテキスト書式でレイアウト済み文書を作成し、それを `.raw/contents/*.md` の正本として扱わない。

Google Driveへのローカル変更反映は、ユーザーが明示的に`raw-to-drive-sync`を実行した場合だけ許可する。このとき `.raw/contents/<slug>.md` は同名のGoogle Doc `<slug>.md` へプレーンテキストとして反映し、`.raw/release-notes.xlsx` は既存Google Sheet `release-notes` へ反映する。`.raw/data/` と `.raw/v1.0/` はDrive書込みを許可しない。

`.raw/contents/SLUG.md` はコミットしない作業入力である。対応ページでは、ユーザー編集のMarkdown本文とHTMLコメントを、ページ本文・可視の表示構成の正本とする。ユーザーの最新指示、および `AGENTS.md` と該当skill・ruleの安全・workflow規約を除き、issue、requirements、out-of-scope、plan、TODO、design、既存の `src/pages` 実装より優先する。`src/pages` 配下の `.mdx` または `.astro` は、それらの指示を反映した公開用実装であり、齟齬時に正本として扱わない。

Excel変換スクリプトは、必要に応じて `.raw/` 配下のExcelファイルを読み込めること。

Gitで管理するのは、Excel本体や `.raw/contents/` の作業入力ではなく、以下とする。

- `src/pages` 配下のMarkdown / MDX / Astroページ
- サイトコード
- 変換済みJSON
- 変換仕様
- 検証スキーマ
- テスト
- 仕様ドキュメント

### AC-08. Excelから静的サイト用データへ変換できること

ExcelからJSONへ変換するスクリプトを用意する。

変換後データはGit管理し、静的サイトはこの変換済みデータを読み込んで表示する。

CSV出力は必要に応じて追加してよいが、初期実装の主形式はJSONとする。

同じデータドメインであっても、取得元シート、抽出条件、出力先JSON、ページで必要なデータ形状が異なる場合は、変換仕様を分けてよい。1つのExcelを1つのJSONへ集約する場合でも、シートごとに入力契約または出力形状が異なるなら、変換関数は種別ごとに分離する。

変換処理の内部ロジックは、必要に応じて共通関数として再利用する。

### AC-09. CI/CDビルドはExcelに依存しないこと

CI/CD上のビルドは、Excelファイルなしで成功すること。

ビルドに必要なものは以下のみとする。

- Markdown / MDX / Astro本文
- 変換済みJSON
- サイトコード
- 設定ファイル
- 検索index生成に必要なビルド済みHTML

Excel変換は、制作者がローカルで明示的に実行するメンテナンス作業とする。

CI/CDではExcel変換を必須工程にしない。

### AC-10. コンテンツと表示ロジックを分離すること

Markdown / MDX本文、構造化データ、表示コンポーネントを分離する。

ルール本文の更新、スキルデータの更新、UIの変更が互いに過剰に結合しない構成にする。

ただし、画面単位の完成を優先するため、実装計画上はページごとに必要なデータ、Component、画面実装をまとめて扱ってよい。

### AC-11. 生成JSONの手編集禁止

`data/generated/` 配下のJSONは、Excelから生成されたデータとして扱う。

原則として手編集してはならない。

必要な修正はExcel側に反映し、変換スクリプトを再実行してJSONを更新する。

### AC-12. Excel変換仕様の管理

Excel由来データについて、ExcelからJSONへ変換する仕様をMarkdownファイルとして管理する。

変換仕様ファイルは、対象ページ、データ出力、または独立して変更される入力契約の単位で `docs/conversion/` 配下に分割して管理する。1つの出力JSONを共有し、共通の変換契約として管理する方が明確な場合は、1ファイルに集約してよい。

例は以下。

```text
docs/conversion/release-notes.md
docs/conversion/common-skills.md
docs/conversion/ryugi-index.md
docs/conversion/ryugi-skills.md
docs/conversion/ikizama-index.md
docs/conversion/ikizama-skills.md
docs/conversion/items.md
```

`items.xlsx`のように1つのJSONへ集約する複数シートは、共通の変換仕様内でシート別契約を定義してよい。この場合でも、実装は各シートの専用変換関数を持ち、共通helperへ種別固有の条件分岐を集約しない。

リリースノートは、トップページの最新5件表示と `/release-notes` の全件表示で同じ `release-notes.json` を参照するため、共通の変換仕様として扱う。

変換仕様は、実際のExcelファイルを読み込んで、シート構成、列名、データ内容を確認したうえで作成する。

初期段階では変換仕様を固定せず、実Excel確認後に以下を定義する。

- 対象Excelファイル
- 対象シート
- 抽出条件
- 各シートの列定義
- 必須列
- 任意列
- 空欄時の扱い
- 改行の扱い
- ID生成ルール
- 表示順ルール
- JSON出力先
- JSON出力形式
- バリデーションルール
- 変換スクリプトの責務
- 検証スキーマの責務
- テスト観点

### AC-13. 変換スクリプトと検証スキーマのテスト

ExcelからJSONへ変換する処理、および生成JSONを検証するスキーマには、最低限のテストを追加する。

テスト対象は以下を含む。

- 必須項目の欠落
- ID重複
- 不正なカテゴリ値
- 不正なタイミング表記
- 不正なアイテム種別
- 改行保持
- 空欄時fallback
- 出力先JSONの形状
- ページ側が必要とする最低限のフィールド

テストは、実Excel本体に依存しすぎないよう、必要に応じてfixtureや最小サンプルを用意してよい。

### AC-14. 流儀・生き様ページは共通テンプレートから生成すること

流儀詳細ページと生き様詳細ページは、共通テンプレートから静的生成する。

流儀詳細ページ `/data/ryugi/[ryugiId]` は、流儀データを入力として、1つの流儀詳細テンプレートから生成する。

生き様詳細ページ `/data/ikizama/[ikizamaId]` は、生き様データを入力として、1つの生き様詳細テンプレートから生成する。

個別流儀・個別生き様ごとのページファイルを複製して管理してはならない。

個別の補足説明や例外表示が必要な場合は、データ側の追加フィールド、Markdown / MDX補足本文、またはテンプレート内の条件分岐で対応する。

### AC-15. データ検証を可能にすること

Excelから変換したJSONに対して、最低限の検証を行えること。

検証対象の例は以下。

- 必須項目の空欄
- ID重複
- カテゴリ値の不正
- タイミング表記の不正
- アイテム種別の不正
- スキルと流儀の関連不整合
- スキルと生き様の関連不整合
- 生き様と関連アイテムの不整合
- Markdown / MDX / Astroページから参照しているデータIDの存在確認
- データカード個別アンカーとして利用するIDの妥当性

### AC-16. データスキーマ定義

生成済みJSONにはZod SchemaとTypeScript型を定義する。Zodを使う変換・生成JSON検証・ID生成は`src/lib/schemas/conversion/`へ、ブラウザでも安全に参照できる型と定数は`src/lib/types/`へ置く。

Zod Schemaは、生成済みJSONのデータ契約を定義し、変換スクリプト実行時、データ変換テスト、必要に応じたCI検証で使う。

通常表示処理および将来のクライアント側機能は、`schemas/conversion/`を実行時importしない。クライアント入力の検証が必要な場合は、生成済みデータのID存在確認など用途に必要な独立Schemaを定義する。

`src/lib/types/`の公開型と`schemas/conversion/`のZod Schemaは別モジュールで管理するため、Node test内で各root JSON型と`z.output<typeof Schema>`の双方向代入可能性をコンパイル時に検証する。これはnullable、必須項目、配列階層、literal型の片側変更による乖離を検出するための契約テストであり、型専用importと空の型アサーションだけで構成する。実行時のJSON再検証、ブラウザbundle、公開型から変換Schemaへの依存は追加しない。

サイトの通常表示処理では、Git管理された `data/generated/` 配下のJSONを信頼する。ページ表示やComponent描画のたびに、生成済みJSONをZodで再検証することを必須にしない。

Excel入力そのものの検証は、変換スクリプトの責務とする。ヘッダー、途中空行、日付の入力順、Excel列ごとの入力エラーなど、ユーザーがExcelを修正するための行番号付きエラーは、変換処理側で扱う。

Zod Schemaでは、生成済みJSONとして満たすべき基本的な型、必須項目、列挙値、ID形式、改行正規化に加えて、ID重複、表示順、関連データIDの存在確認など、データ種別ごとのドメイン制約を扱う。

日付・日時の形式検証は、可能な範囲でZodの組み込みISO helperを使う。プロジェクト固有のID形式など、組み込みで表現できないものだけ正規表現またはカスタム検証を使う。

最低限、以下のデータ型を定義する。

- Skill
- Item
- Weapon
- Armor
- Omamori
- Cybernetic
- Nanomachine
- Drug
- Ryugi
- Ikizama
- ReleaseNote

`Item` はアイテム共通項目を表す基底型として扱い、`Weapon`、`Armor`、`Omamori`、`Cybernetic`、`Nanomachine`、`Drug` はそれぞれの固有項目を持つ型として定義する。

各アイテム種別のスキーマは、共通項目を再利用しつつ、種別固有項目を明示的に検証できることが望ましい。

---

## 3. 技術スタック

### 3.1 初期実装の技術スタック

初期実装の採用済み技術スタックは以下とする。

- Astro
- MDX
- TypeScript strict
- Biome
- Node.js / TypeScript scripts
- Playwright
- GitHub Actions
- GitHub Pages
- Astro scoped CSS + CSS variables
- Pagefind

- Zod
- read-excel-file
- fflate

以下は後続タスクで追加予定の技術である。

- Astro Content Collectionsまたは同等のデータ管理

本サイトはサーバーサイド処理、DB、認証、CMSを前提にしない。

Markdown / MDX本文、Excelから変換したJSON、Astro Componentを組み合わせて静的HTMLを生成する。

検索にはPagefindを導入し、公開用ビルド後に静的HTMLから検索インデックスを生成する。CI/CDでは検索indexを`dist/`へ生成し、GitHub Pagesのdeploy成果物に含める。

Excel変換は、ローカル実行用のNode.js / TypeScriptスクリプトとして実装する。

CI/CDではExcelファイルに依存せず、Git管理されたMarkdown / MDX、変換済みJSON、サイトコードのみでビルド・公開できること。

### 3.2 採用しない技術

初期実装では以下を採用しない。

- WordPress等のDB型CMS
- サーバーサイドアプリケーション
- 認証必須CMS
- Vite + React SPAとしての全面実装
- Next.js前提のSSR構成
- 外部検索サービス
- 大規模UIライブラリ

---
