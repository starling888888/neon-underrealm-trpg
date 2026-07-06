# ネオン・アンダーレルムTRPG ルールサイト 要件定義

## 0. 文書の位置づけ

本ドキュメントは、ネオン・アンダーレルムTRPGの無料公開用ルールサイトを構築するための要件定義である。

本サイトは、制作者が継続的にルール本文、データ、リリースノートを更新し、Git連携によって静的サイトとして公開できることを最優先とする。

本ドキュメントは `docs/requirements.md` として管理する想定である。

実装順序、ブランチ分割、初期開発での作業粒度は `docs/plan.md` を正本とする。

本ドキュメントと `docs/plan.md` の間に齟齬がある場合、初期開発の作業計画・スコープ判断については `docs/plan.md` を優先し、本ドキュメント側を追従修正する。

`docs/out-of-scope.md` は初期スコープ外項目の補助文書とする。スコープ外項目について本ドキュメントと `docs/out-of-scope.md` の間に齟齬がある場合は、`docs/plan.md` の初期開発計画に従って整理する。

---

## 1. 基本方針

### 1.1 サイトの目的

ネオン・アンダーレルムTRPGのルール、世界観、キャラクターメイキング、データ、アイテム、戦闘ルール、成長ルールをWebサイトとして無料公開する。

初期公開スコープでは、PL向けの基本ルールと参照データを主対象とする。

GMガイド、シナリオ本文、キャンペーン本文は初期スコープ外とする。

### 1.2 最重要方針

本サイトでは、機能の多さよりも、制作者が継続的にコンテンツを管理・更新・公開できることを優先する。

以下を重視する。

* ルール本文を編集しやすいこと
* スキル、アイテムなどの表形式データを更新しやすいこと
* 公開手順が重すぎないこと
* Git連携によって自動公開できること
* Codex等のコード生成支援に修正依頼しやすい構造であること
* 将来のV1.5修正やデータ更新に耐えられること
* 1画面ずつ完成状態まで持っていけること

### 1.3 画面単位完成の方針

初期開発では、ページを単なる骨組みとして先に大量作成するのではなく、対象画面ごとに必要なデータ、Component、本文、デザイン確認をまとめて進める。

ページ作成では、原則として以下の順序を採用する。

1. 対象ページに必要なExcel由来データがある場合、データ変換仕様、検証スキーマ、変換スクリプト、テストを整備する。
2. 対象ページに必要な独立Componentがある場合、Component単体のdesignを作成し、Componentを実装する。
3. 対象ページを作成し、ユーザーがローカルに配置した記載内容と画面デザイン指示を反映する。
4. 完成画面のスクリーンショットを取得し、design正本を更新する。

---

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

初期段階では、検索index生成を含まない基本デプロイを先に成立させてもよい。

Pagefind導入後は、検索index生成済み成果物を公開できるCI/CDに更新する。

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

* スキル
* アイテム
* 流儀
* 生き様
* リリースノート

エネミー、NPC、GM専用データ、シナリオ本文、キャンペーン本文は初期実装対象に含めない。

ただし、将来的に同じ仕組みで追加できる構成を妨げない。

Excel本体はGit管理しない。

### AC-07. 生Excel・作業入力管理ディレクトリ

Excel本体は、リポジトリ直下の `.raw/` ディレクトリ配下で管理できること。

`.raw/` はローカル作業用ディレクトリであり、Git管理しない。

想定するローカル作業領域は以下。

```text
.raw/
├─ excel/
└─ contents/
```

`.raw/excel/` はExcel本体を置くローカル領域とする。

`.raw/contents/` は、ユーザーが画面作成前に記載内容とコメント形式の画面デザイン指示書を置くローカル領域とする。

`.raw/contents/SLUG.md` はコミットしない作業入力であり、最終的な画面本文・UI構造のSSoTは `src/pages` 配下の `.mdx` または `.astro` とする。

Excel変換スクリプトは、必要に応じて `.raw/` 配下のExcelファイルを読み込めること。

Gitで管理するのは、Excel本体や `.raw/contents/` の作業入力ではなく、以下とする。

* `src/pages` 配下のMarkdown / MDX / Astroページ
* サイトコード
* 変換済みJSON
* 変換仕様
* 検証スキーマ
* テスト
* 仕様ドキュメント

### AC-08. Excelから静的サイト用データへ変換できること

ExcelからJSONへ変換するスクリプトを用意する。

変換後データはGit管理し、静的サイトはこの変換済みデータを読み込んで表示する。

CSV出力は必要に応じて追加してよいが、初期実装の主形式はJSONとする。

同じデータドメインであっても、取得元シート、抽出条件、出力先JSON、ページで必要なデータ形状が異なる場合は、変換仕様を分けてよい。

変換処理の内部ロジックは、必要に応じて共通関数として再利用する。

### AC-09. CI/CDビルドはExcelに依存しないこと

CI/CD上のビルドは、Excelファイルなしで成功すること。

ビルドに必要なものは以下のみとする。

* Markdown / MDX / Astro本文
* 変換済みJSON
* サイトコード
* 設定ファイル
* 検索index生成に必要なビルド済みHTML

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

変換仕様ファイルは、単一ファイルではなく、対象ページまたはデータ出力単位で `docs/conversion/` 配下に分割して管理する。

例は以下。

```text
docs/conversion/release-notes.md
docs/conversion/common-skills.md
docs/conversion/ryugi-index.md
docs/conversion/ryugi-detail.md
docs/conversion/ikizama-index.md
docs/conversion/ikizama-detail.md
docs/conversion/items-weapons.md
docs/conversion/items-armors.md
docs/conversion/items-omamori.md
docs/conversion/items-cybernetics.md
docs/conversion/items-nanomachines.md
docs/conversion/items-drugs.md
```

同じデータドメインであっても、取得元シート、抽出条件、出力先JSON、ページで必要なデータ形状が異なる場合は、変換仕様を別ファイルとして管理してよい。

リリースノートは、トップページの最新5件表示と `/release-notes` の全件表示で同じ `release-notes.json` を参照するため、共通の変換仕様として扱う。

変換仕様は、実際のExcelファイルを読み込んで、シート構成、列名、データ内容を確認したうえで作成する。

初期段階では変換仕様を固定せず、実Excel確認後に以下を定義する。

* 対象Excelファイル
* 対象シート
* 抽出条件
* 各シートの列定義
* 必須列
* 任意列
* 空欄時の扱い
* 改行の扱い
* ID生成ルール
* 表示順ルール
* JSON出力先
* JSON出力形式
* バリデーションルール
* 変換スクリプトの責務
* 検証スキーマの責務
* テスト観点

### AC-13. 変換スクリプトと検証スキーマのテスト

ExcelからJSONへ変換する処理、および生成JSONを検証するスキーマには、最低限のテストを追加する。

テスト対象は以下を含む。

* 必須項目の欠落
* ID重複
* 不正なカテゴリ値
* 不正なタイミング表記
* 不正なアイテム種別
* 改行保持
* 空欄時fallback
* 出力先JSONの形状
* ページ側が必要とする最低限のフィールド

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

* 必須項目の空欄
* ID重複
* カテゴリ値の不正
* タイミング表記の不正
* アイテム種別の不正
* スキルと流儀の関連不整合
* スキルと生き様の関連不整合
* 生き様と関連アイテムの不整合
* Markdown / MDX / Astroページから参照しているデータIDの存在確認
* データカード個別アンカーとして利用するIDの妥当性

### AC-16. データスキーマ定義

生成済みJSONにはTypeScript型またはJSON Schema、もしくはZod Schemaを定義する。

最低限、以下のデータ型を定義する。

* Skill
* Item
* Weapon
* Armor
* Omamori
* Cybernetic
* Nanomachine
* Drug
* Ryugi
* Ikizama
* ReleaseNote

`Item` はアイテム共通項目を表す基底型として扱い、`Weapon`、`Armor`、`Omamori`、`Cybernetic`、`Nanomachine`、`Drug` はそれぞれの固有項目を持つ型として定義する。

各アイテム種別のスキーマは、共通項目を再利用しつつ、種別固有項目を明示的に検証できることが望ましい。

---

## 3. 技術スタック

### 3.1 初期実装の第一候補

初期実装の技術スタックは以下を第一候補とする。

* Astro
* MDX
* TypeScript strict
* Astro Content Collectionsまたは同等のデータ管理
* Zod
* Pagefind
* Node.js / TypeScript scripts
* ExcelJS
* GitHub Actions
* GitHub Pages
* Astro scoped CSS + CSS variables

本サイトはサーバーサイド処理、DB、認証、CMSを前提にしない。

Markdown / MDX本文、Excelから変換したJSON、Astro Componentを組み合わせて静的HTMLを生成する。

検索はPagefindにより、公開用ビルド後に静的HTMLから検索インデックスを生成する。

Excel変換はローカル実行用のNode.js / TypeScriptスクリプトとして実装する。

CI/CDではExcelファイルに依存せず、Git管理されたMarkdown / MDX、変換済みJSON、サイトコードのみでビルド・公開できること。

### 3.2 採用しない技術

初期実装では以下を採用しない。

* WordPress等のDB型CMS
* サーバーサイドアプリケーション
* 認証必須CMS
* Vite + React SPAとしての全面実装
* Next.js前提のSSR構成
* 外部検索サービス
* 大規模UIライブラリ

---

## 4. 非機能要件

### NFR-01. 開発・ビルド・変換・検証コマンド

具体的なコマンド名と実装方法は、技術スタック確定後に定義する。

ただし、最終的なプロジェクトでは、以下の操作を明示的なコマンドで実行できること。

* ローカル開発サーバーを起動する
* 静的サイトをビルドする
* ビルド済みサイトをローカルでプレビューする
* Excelから静的サイト用JSONへ変換する
* 生成済みJSONを検証する
* 変換スクリプトと検証スキーマのテストを実行する
* 型チェック、lint、データ検証などの公開前チェックを実行する
* Pagefind検索indexを生成する

CI/CDでは、Excel変換を必須工程にしない。

### NFR-02. アクセシビリティ最低基準

本サイトは、最低限のアクセシビリティを確保する。

初期実装では厳密なWCAG完全準拠までは要求しないが、以下を満たすこと。

* 画像には適切な `alt` 属性を設定する
* 装飾目的の画像には空の `alt` を許容する
* アイコンのみのリンクには `aria-label` またはスクリーンリーダー用テキストを設定する
* 現在ページのナビゲーションリンクには可能であれば `aria-current="page"` を設定する
* 検索ポップアップ、サイトメニュー、ページ内目次はキーボード操作で開閉できることが望ましい
* Escキーで検索ポップアップ、サイトメニュー、ページ内目次を閉じられることが望ましい
* フォーカス移動が大きく破綻しないこと
* 見出し階層を不自然に飛ばさないこと
* 色だけに依存して情報を表現しないこと
* クリック可能な要素には十分なタップ領域を確保すること

### NFR-03. レスポンシブ基準幅

サイトはPC、タブレット、スマホで閲覧できるレスポンシブデザインとする。

初期実装では、以下の幅を目安にレイアウトを切り替える。

* PCレイアウト: `1024px` 以上
* タブレット / 狭幅PC: `768px` 以上 `1024px` 未満
* スマホレイアウト: `768px` 未満

PCレイアウトでは、左にサイトメニュー、中央に本文、右にページ内目次を表示する。

`1024px` 未満では、右サイドのページ内目次は常設表示せず、開閉式UIに切り替える。

`768px` 未満では、サイトメニューも常設表示せず、ヘッダーから開閉するUIに切り替える。

最終的なブレークポイントはUI確認後に調整してよい。

### NFR-04. 表示パフォーマンス

本サイトは、静的サイトとして軽量に閲覧できることを重視する。

以下を基本方針とする。

* サーバーサイド処理に依存しない
* DBアクセスに依存しない
* 静的生成可能なページはビルド時に生成する
* スキル・アイテム・流儀・生き様などのデータページは、可能な限りビルド時にHTML化する
* 検索インデックスは公開用ビルド時に生成する
* 検索用JavaScriptは初期表示を大きく妨げないようにする
* 画像には可能な範囲で `loading="lazy"` を設定する
* 不要に大きなUIライブラリを導入しない
* カード一覧表示は、過剰なクライアントサイド描画に依存しすぎない
* 外部解析スクリプトは初期実装では導入しない

### NFR-05. ライセンス・権利表記

サイト上にコピーライトを表示する。

ルール本文、画像、ロゴ、ソースコードの利用条件を必要に応じて分けて記載できること。

初期実装では、明示的な再利用許諾をしない場合でも、著作権者表記とクレジット導線を表示する。

---

## 5. ページ構成

### 5.1 初期公開ページ

初期公開スコープでは、以下のページを用意する。

```text
/
/introduction
/world
/character-making
/data
/data/ryugi
/data/ryugi/[ryugiId]
/data/ikizama
/data/ikizama/[ikizamaId]
/data/common-skills
/data/items
/data/items/weapons
/data/items/armors
/data/items/omamori
/data/items/cybernetics
/data/items/nanomachines
/data/items/drugs
/rules
/rules/scenario-play
/rules/battle
/advancement
/release-notes
/404
```

### 5.2 ページ詳細

#### `/`

トップページ。

タイトルロゴ、短い紹介、主要導線、最新リリースノート、クレジットを表示する。

#### `/introduction`

はじめに。

ゲーム概要、必要なもの、基本用語、読み始める導線を記載する。

#### `/world`

ワールドガイド。

初期公開範囲の世界観本文を記載する。

GM専用情報、シナリオ本文、キャンペーン本文は配置しない。

#### `/character-making`

キャラクターメイキング。

キャラクター作成の手順を記載し、必要に応じてデータ参照導線を配置する。

Webキャラクターシート、自動計算、入力フォーム、保存機能は実装しない。

#### `/data`

データトップページ。

スキルの見方、データ項目、タイミング、コスト、制限などの凡例を記載する。

スキル凡例は、専用の `SkillLegend` Componentではなく、`SkillCard` に凡例用データを渡して表示する。

アイテム凡例は、このページで全種別をまとめて表示するのではなく、各個別アイテムページ側で各Item系Cardに凡例用データを渡して表示する。

#### `/data/ryugi`

流儀一覧。

#### `/data/ryugi/[ryugiId]`

各流儀の説明、基礎能力値、プライマリボーナス、共通スキルボーナス、流儀スキル一覧を表示する。

流儀スキル一覧は `SkillList` / `SkillCard` を利用して表示する。

#### `/data/ikizama`

生き様一覧。

#### `/data/ikizama/[ikizamaId]`

各生き様の説明、専用ルール、生き様スキル一覧、関連アイテムへのリンクを表示する。

生き様スキル一覧は `SkillList` / `SkillCard` を利用して表示する。

#### `/data/common-skills`

共通スキル一覧。

共通スキル一覧は `SkillList` / `SkillCard` を利用して表示する。

#### `/data/items`

アイテム説明トップ。

武器、防具、お守り、サイバネ、ナノマシン、ドラッグへの導線を配置する。

#### `/data/items/weapons`

武器リスト。

`WeaponList` / `WeaponCard` を利用して表示する。

武器凡例は `WeaponCard` に凡例用データを渡して表示する。

#### `/data/items/armors`

防具リスト。

`ArmorList` / `ArmorCard` を利用して表示する。

防具凡例は `ArmorCard` に凡例用データを渡して表示する。

#### `/data/items/omamori`

お守り一覧。

`OmamoriList` / `OmamoriCard` を利用して表示する。

お守り凡例は `OmamoriCard` に凡例用データを渡して表示する。

#### `/data/items/cybernetics`

サイバネ一覧。

`CyberneticList` / `CyberneticCard` を利用して表示する。

サイバネ凡例は `CyberneticCard` に凡例用データを渡して表示する。

#### `/data/items/nanomachines`

ナノマシン一覧。

`NanomachineList` / `NanomachineCard` を利用して表示する。

ナノマシン凡例は `NanomachineCard` に凡例用データを渡して表示する。

#### `/data/items/drugs`

ドラッグ一覧。

`DrugList` / `DrugCard` を利用して表示する。

ドラッグ凡例は `DrugCard` に凡例用データを渡して表示する。

#### `/rules`

ルールトップ。

ゴールデンルール、基本判定、達成値、効果値、対抗判定、端数処理を記載する。

#### `/rules/scenario-play`

シナリオ進行ルール。

シーン、情報収集、休息、シナリオ終了処理などを記載する。

シナリオ本文、ハンドアウト本文、キャンペーン本文は配置しない。

#### `/rules/battle`

戦闘ルール。

攻撃、リアクション、コンボ、掛け合い等を記載する。

戦闘処理支援ツール、ダイスローラー、戦闘シミュレーターは実装しない。

#### `/advancement`

キャラクター成長。

#### `/release-notes`

更新履歴。

#### `/404`

404ページ。

---

## 6. レイアウト要件

### FR-01. 基本レイアウト

サイトは、ヘッダー、フッター、サイトメニュー、メインコンテンツ、ページ内目次で構成する。

### FR-01-01. ヘッダー

全ページ共通のヘッダーを表示する。

ヘッダーには以下を含める。

* サイトタイトル
* トップページへのリンク
* スマホ版サイトメニュー開閉ボタン
* 検索UIまたは検索アイコン

PC版ヘッダーは画面上部に固定表示する。

スマホ版ヘッダーは、本文を下方向へスクロールしている間は非表示にし、上方向へスクロールした場合に再表示する。

ページ最上部ではヘッダーを表示する。

サイトメニューまたはページ内目次を開いている間は、ヘッダーを表示状態に固定する。

### FR-01-02. フッター

全ページ共通のフッターを表示する。

フッターには以下を表示する。

* コピーライト表記
* クレジット
* GitHub リポジトリ
* X アカウント
* Discord サーバー

コピーライト表記はテキストで表示する。

クレジット、GitHub、X、Discord サーバーへのリンクはアイコンで表示する。

各アイコンリンクには、`aria-label` またはスクリーンリーダー用テキストを設定すること。

GitHub、X、Discord などの外部リンクは別タブで開く。

外部リンクには `rel="noopener noreferrer"` を設定する。

クレジットリンクは、初期実装ではトップページ内のクレジットセクション `/#credits` へ遷移する。

将来的にクレジットが長くなる場合は `/credits` ページとして分離できる構成にする。

コピーライト表記の仮案は以下とする。

```text
© 2026 ネオン・アンダーレルムTRPG
```

### FR-01-03. サイトメニュー

サイト全体のページ構造を示すサイトメニューを用意する。

PC版では左サイドバーとして常設表示する。

スマホ版では、ヘッダーのボタンから開閉できるドロワーまたはオーバーレイとして表示する。

サイトメニューの項目を選択した場合、該当ページへ遷移し、スマホ版ではメニューを閉じる。

### FR-01-04. サイトメニュー現在地ハイライト

サイトメニューでは、現在表示しているページを視覚的に識別できること。

PC版左サイドメニュー、スマホ版メニューの両方で現在ページをハイライトする。

階層メニューの場合、現在ページの親カテゴリも展開または強調できることが望ましい。

ハイライトは色だけに依存せず、太字、左線、背景、`aria-current` などを併用すること。

現在ページのリンクには可能であれば `aria-current="page"` を設定する。

### FR-01-05. ページ内目次

一部の長いページでは、現在ページ内の見出しから生成されるページ内目次を表示する。

ページ内目次の各項目はリンクとして機能し、選択すると該当見出しへジャンプする。

ページ内目次は全ページに常時表示するものではなく、長い本文ページやデータページを主対象とする。

トップページ `/`、更新履歴ページ `/release-notes`、404ページ `/404`、その他目次が不要な画面ではページ内目次を表示しない。

ページ内目次の表示/非表示は、Astro layout propsで制御できること。

MDXページでは、frontmatterからページ内目次の表示/非表示を制御できること。

ページ内目次は、MDX / Markdownだけでなく、Astroで生成されたデータページにも適用できること。

ページ内目次の生成は、最終HTMLをbuild後に解析するpostprocess方式を採用候補とする。

見出しIDは標準運用では手作業で書かせない。

日本語見出し本文をそのままアンカーIDにせず、ASCII-onlyの安定したIDを自動生成する。

自動生成IDはページ内出現順に依存しないhash形式とする。

同一ページ内で生成IDが衝突した場合は、黙ってsuffixを付与して解決せず、build時に検出する。

PC版では、ページ内目次を右サイドに表示する。

ページ内目次は本文とは独立した固定位置に表示し、本文スクロール中も画面内に残ること。

スマホ版でも「このページの目次」をワンタッチで開き、目次項目から該当箇所へジャンプできること。

サイト全体のメニューとページ内目次は別機能として扱い、UI上も混同しないようにする。

ページ内目次では、現在閲覧中の見出しをハイライトできることが望ましい。

ただし、この機能は優先度低とし、初期リリース必須要件ではない。

### FR-01-06. パンくずリスト

パンくずリストは初期実装では採用しない。

現在地表示は、サイトメニューの現在ページハイライトで担保する。

---

## 7. 検索要件

### FR-02. サイト内検索

サイト内検索を実装する。

PC版ではヘッダー内に検索入力欄、または検索ボタンを配置する。

スマホ版では、ヘッダー右側に検索アイコンを表示する。

検索アイコンを押すと、検索ポップアップを表示する。

検索結果は専用ページへ遷移せず、現在の画面上のポップアップ、モーダル、またはオーバーレイ内に表示する。

検索結果をクリックすると、該当ページ、該当見出し、またはデータカード個別アンカーへ遷移する。

検索インデックスは、公開用ビルド時に生成する。

検索インデックス生成の第一候補はPagefindとする。

Pagefind等の静的検索ライブラリを用い、サーバーサイド検索、DB、外部検索サービスに依存しないこと。

検索対象は以下とする。

* Markdown / MDX本文ページ
* 流儀ページ
* 生き様ページ
* スキル一覧
* アイテム一覧
* 戦闘ルール
* 成長ルール
* 更新履歴

ヘッダー、フッター、サイトメニュー、ページ内目次などの共通UIは検索対象から除外する。

検索結果には、ページタイトル、該当セクション見出し、抜粋、種別ラベルを表示する。

日本語本文、カタカナ用語、英数字IDを検索できること。

ただし、日本語検索の精度は初期実装後に実データで確認し、必要に応じて検索対象テキストやメタデータを調整する。

---

## 8. トップページ要件

### FR-03. トップページ

トップページ `/` は、サイト入口、雰囲気提示、更新確認、主要導線のためのページとする。

トップページはルール本文を詳しく読ませるページにはしない。

トップページには、以下の順で要素を表示する。

1. ゲームキャッチコピー
2. タイトルロゴ
3. 最新リリースノート5件
4. ゲームのかんたんな説明
5. クレジット

### FR-03-01. ゲームキャッチコピー

ゲームの印象を伝える短いキャッチコピーを表示する。

キャッチコピーはコードに直書きせず、Markdown、MDX、Astroページ本文、または設定ファイルから編集できること。

### FR-03-02. タイトルロゴ

タイトルロゴ画像を表示する。

ロゴ画像は静的アセットとして管理し、差し替え可能にする。

ロゴ画像には適切な `alt` 属性を設定する。

ロゴ画像の表示には、必要に応じて共通画像Componentを利用できること。

### FR-03-03. 最新リリースノート

最新のリリースノートを最大5件表示する。

各リリースノート項目には、更新日、かんたんな説明を表示する。

トップページの最新リリースノートは、リリースノートJSONから自動抽出すること。

トップページ上にリリースノートを二重管理しない。

リリースノート一覧ページ `/release-notes` へのリンクを表示する。

### FR-03-04. ゲームのかんたんな説明

ゲームの概要を短く表示する。

詳細な説明は `/introduction` に配置し、トップページから `/introduction` へのリンクを表示する。

### FR-03-05. クレジット

トップページ末尾にクレジットを表示する。

クレジットには、制作、イラスト、ロゴ、協力者、権利表記などを記載できること。

クレジット本文はMarkdown、MDX、Astroページ本文、または設定ファイルで編集できること。

---

## 9. データ表示要件

### FR-04. データカード表示

スキル、アイテム、凡例などの構造化データはカードUIで表示できること。

カードに表示するデータはMarkdown / MDX本文に直書きせず、Excelから変換されたJSONを参照すること。

Markdown / MDX / Astroページでは、簡潔なComponent呼び出しでデータ表示を行えること。

例は以下。

```mdx
<SkillCard skill={legendSkillExample} variant="legend" />
<SkillList skills={commonSkills} />
<WeaponList items={weapons} />
<WeaponCard item={legendWeaponExample} variant="legend" />
```

上記のprops名や実装詳細は初期案であり、最終的なComponent APIは実装時に調整してよい。

ただし、以下の方針を守る。

* `SkillLegend` という独立Componentは作らない
* スキル凡例は `SkillCard` に凡例用データを渡して表示する
* `ItemLegend` という独立Componentは作らない
* アイテム凡例は、各Item系Cardに凡例用データを渡して表示する
* 汎用 `ItemCard` に全アイテム種別を無理に統合しない
* アイテム種別ごとに固有のCard / List Componentを用意する

### FR-04-01. スキルカード

スキルカードには最低限以下を表示できること。

* 名称
* 最大レベル
* タイミング
* コスト
* 技能
* 制限
* 効果
* カテゴリ
* 所属流儀または所属生き様

`SkillCard` は、通常のスキル表示だけでなく、凡例用データを渡してスキル凡例として表示できること。

`SkillList` は、受け取ったスキルデータ配列を `SkillCard` へ渡して一覧表示する。

`SkillList` は、`SkillCard` と表示仕様を重複実装しない。

### FR-04-02. アイテムカード

アイテムカードには、アイテム種別ごとに必要な項目を表示できること。

武器、防具、お守り、サイバネ、ナノマシン、ドラッグは、それぞれ項目が異なるため、同一カード部品で無理に統一しすぎない。

初期実装では、以下のようにアイテム種別ごとのComponentを用意する。

* `WeaponCard`
* `WeaponList`
* `ArmorCard`
* `ArmorList`
* `OmamoriCard`
* `OmamoriList`
* `CyberneticCard`
* `CyberneticList`
* `NanomachineCard`
* `NanomachineList`
* `DrugCard`
* `DrugList`

各Item系Cardは、通常のアイテム表示だけでなく、凡例用データを渡して凡例として表示できること。

各Item系Listは、受け取ったアイテムデータ配列を対応するItem系Cardへ渡して一覧表示する。

各Item系Listは、対応するItem系Cardと表示仕様を重複実装しない。

### FR-04-03. 凡例カード

スキル凡例、アイテム凡例はカードまたは折りたたみUIで表示できること。

ただし、凡例専用Componentを別途作成するのではなく、通常表示で使うCard Componentへ凡例用データを渡して表示する。

スキル凡例は `SkillCard` を利用する。

武器凡例は `WeaponCard` を利用する。

防具凡例は `ArmorCard` を利用する。

お守り凡例は `OmamoriCard` を利用する。

サイバネ凡例は `CyberneticCard` を利用する。

ナノマシン凡例は `NanomachineCard` を利用する。

ドラッグ凡例は `DrugCard` を利用する。

### FR-04-04. データカードの個別アンカー

スキルカード、アイテムカードには個別IDを付与する。

個別IDはHTML上のアンカーとして利用できること。

検索結果、本文内リンク、外部共有リンクから、特定のスキルカードまたはアイテムカードへ直接ジャンプできること。

例は以下。

```text
/data/ryugi/teppoudama#skill-r-teppoudama-basic-a-001
/data/items/cybernetics#item-cybernetics-arm-001
```

GitHub Pages等のサブパス配下でも、個別アンカーへの遷移が壊れないこと。

---

## 10. データID管理方針

### 10.1 基本方針

スキル、アイテムなどの構造化データには、永続的なIDを持たせる。

IDは原則としてExcel上のID列で管理する。

ID列が空欄の場合、変換スクリプトがIDを自動生成できること。

ただし、一度生成・公開されたIDは、既存リンク維持のため、原則として変更しない。

初回生成後は、生成されたIDをExcel側へ転記し、Excel上のIDを正本として扱うことを推奨する。

### 10.2 スキルID生成ルール案

スキルIDは以下の形式を基本候補とする。

```text
skill-r-{owner}-{category}-{timing}-{index}
```

* `skill`: スキルデータであることを示す
* `r`: 流儀スキルであることを示す
* `{owner}`: 所属流儀ID
* `{category}`: bonus / basic / advanced などの分類
* `{timing}`: タイミングをID用に正規化した値
* `{index}`: 同一グループ内の連番

攻撃タイミング `A-A` は、ID上では `a` とする。

Excelでは、スキルを所属・カテゴリ・タイミングごとに整理して管理する。

新規スキルを追加する場合は、原則として該当グループの末尾に追加する。

この運用により、既存IDの変更を避ける。

ただし、既存行の途中挿入、所属変更、カテゴリ変更、タイミング変更を行う場合はIDが変わりうるため、公開済みIDの維持が必要な場合はExcel上のID列を正本として管理する。

### 10.3 タイミング正規化案

| ルール上のタイミング | ID用        |
| ---------- | ---------- |
| `Pv`       | `pv`       |
| `SU`       | `su`       |
| `INI`      | `ini`      |
| `CU`       | `cu`       |
| `M`        | `m`        |
| `A-A`      | `a`        |
| `R`        | `r`        |
| `Aa`       | `aa`       |
| `Ra`       | `ra`       |
| `D`        | `d`        |
| `SP`       | `sp`       |
| `×-A`      | `first-a`  |
| `A-×`      | `a-last`   |
| `☆-A`      | `start-a`  |
| `A-☆`      | `a-finish` |
| `○-○`      | `any`      |

### 10.4 アイテムID生成ルール案

アイテムIDは、アイテム種別ごとに定義する。

初期候補は以下。

```text
item-weapon-{group}-{index}
item-armor-{index}
item-omamori-{index}
item-cybernetics-{part}-{index}
item-nanomachines-{part}-{index}
item-drug-{timing}-{index}
```

最終的なID生成ルールは、Excel本体の構造を確認した後、該当する `docs/conversion/*.md` に記載する。

---

## 11. 流儀・生き様ページ要件

### FR-05. 流儀詳細ページ

`/data/ryugi/[ryugiId]` は、流儀詳細テンプレートから生成する。

流儀ごとに個別のページファイルを作らない。

流儀詳細ページには、以下を表示する。

* 流儀名
* 概要説明
* 基礎能力値
* プライマリボーナス
* 副能力増加値
* 共通スキルボーナス
* 流儀スキル一覧
* 関連ページリンク

流儀スキル一覧は、Excelから変換されたスキルデータを参照して表示する。

流儀スキル一覧は `SkillList` / `SkillCard` を利用して表示する。

流儀本文や補足説明が必要な場合は、データ側の説明フィールド、またはMarkdown / MDXの補足本文を参照できる構成にする。

### FR-06. 生き様詳細ページ

`/data/ikizama/[ikizamaId]` は、生き様詳細テンプレートから生成する。

生き様ごとに個別のページファイルを作らない。

生き様詳細ページには、以下を表示する。

* 生き様名
* 概要説明
* 副能力係数
* 能力値ポイント
* 専用ルール
* 生き様スキル一覧
* 関連アイテム
* 関連ページリンク

生き様スキル一覧と関連アイテムは、Excelから変換されたデータを参照して表示する。

生き様スキル一覧は `SkillList` / `SkillCard` を利用して表示する。

ケジメ、スミ、ヤクのように専用アイテムを持つ生き様では、対応するアイテム一覧へのリンクを表示できること。

---

## 12. 画像要件

### FR-07. 画像埋め込み

現時点では主にタイトルロゴを想定するが、将来的に各ページへ画像を埋め込める構成にする。

Markdown / MDX ページ内で画像を表示できること。

画像の想定用途は以下。

* タイトルロゴ
* キービジュアル
* ワールドガイド用イラスト
* NPCイラスト
* ルール説明用図解
* 戦闘例の図
* アイテムやスキルの補助画像

画像ファイルは静的アセットとして管理する。

初期配置案は以下とする。

```text
public/assets/images/
```

画像、CSS、JS、内部リンクは、GitHub Pages等のサブパス公開でも壊れないようにbase pathを考慮して参照すること。

Markdown標準の画像記法、または画像表示用Componentから画像を埋め込めること。

必要に応じて、以下のような画像Componentを利用できること。

```mdx
<ImageBlock src="world/osaka-night.jpg" alt="雨のオオサカ副都" caption="オオサカ副都の夜" />
```

画像には `alt` 属性を設定できること。

必要に応じてキャプションを表示できること。

装飾目的の画像の場合は空 `alt` を許容する。

画像には可能な範囲で lazy loading を適用する。

高度な画像最適化、レスポンシブ画像生成、CDN連携は初期必須要件ではない。

---

## 13. リリースノート要件

### FR-08. リリースノート

リリースノートはExcelで管理する。

Excel本体はGit管理しない。

ExcelからJSONへ変換するスクリプトを用意し、変換後のJSONをGit管理する。

CI/CD上の静的サイトビルドはExcelに依存せず、変換済みJSONを参照する。

リリースノートの変換仕様は以下に記載する。

```text
docs/conversion/release-notes.md
```

トップページの最新5件表示と `/release-notes` の全件表示は、同じ `data/generated/release-notes.json` を参照する。

### 13.1 Excel列

リリースノートExcelには、最低限以下の列を持たせる。

* 更新日
* かんたんな説明
* 全文

`更新日` と `かんたんな説明` は必須とする。

`全文` は空欄を許容する。

### 13.2 JSON出力

Excelから、以下のようなJSONへ変換する。

```json
[
  {
    "date": "2026-07-03",
    "summary": "かんたんな説明",
    "body": "全文。改行を含んでもよい。"
  }
]
```

JSON出力先は以下とする。

```text
data/generated/release-notes.json
```

### 13.3 表示

トップページには、最新リリースノート5件を表示する。

トップページで表示する内容は以下。

* 更新日
* かんたんな説明

トップページには、リリースノートページ `/release-notes` へのリンクを表示する。

リリースノートページ `/release-notes` では、全リリースノートを表示する。

リリースノートページで表示する内容は以下。

* 更新日
* 全文

ただし、全文が空欄の場合は、かんたんな説明を本文として表示する。

### 13.4 改行

Excelの全文セルに含まれる改行は、JSON変換後も保持する。

リリースノートページでは、全文内の改行を表示上反映する。

初期実装では、`white-space: pre-line` などを用いて改行を反映してよい。

### 13.5 並び順

リリースノートは更新日の降順で表示する。

トップページには、更新日の降順で先頭5件を表示する。

---

## 14. OGP / SEO要件

### FR-09. OGP / SEOメタ情報

各ページに `title` と `description` を設定できること。

SNS共有時に表示されるOGPメタ情報を設定できること。

最低限、以下を設定する。

* `og:title`
* `og:description`
* `og:type`
* `og:url`
* `og:image`

トップページには、サイト全体のOGP画像を設定する。

各ページごとに個別OGP情報を設定できる構成が望ましい。

初期実装では、個別OGP画像がないページは共通OGP画像を使用してよい。

GitHub Pages等のサブパス公開でも、OGP画像URLが壊れないこと。

個別OGP画像生成は初期必須要件ではない。

---

## 15. コールアウト要件

### FR-10. コールアウトComponent

Markdown / MDX本文内で、注意書き、補足、例、警告、変更点などを表示するコールアウトComponentを使用できること。

想定するコールアウト種別は以下。

* `note`: 補足
* `tip`: 運用のコツ
* `warning`: 注意
* `danger`: 重大注意
* `example`: 例
* `version`: 変更点・V1.5注記

本文側では、簡潔な記法で利用できること。

例は以下。

```mdx
<Callout type="warning" title="注意">
この処理はコンボ中に一度だけ行えます。
</Callout>
```

コールアウトは色だけに依存せず、見出し・アイコン・ラベルなどでも種別が分かるようにする。

`Callout` は特定ページ専用ではなく、後続ページでも再利用できる共通Componentとして扱う。

---

## 16. 404ページ要件

### FR-11. 404ページ

存在しないURLにアクセスした場合、404ページを表示する。

404ページは簡易な内容でよい。

最低限、以下を表示する。

* ページが見つからない旨
* トップページへのリンク
* サイトメニューまたは検索への導線

GitHub Pages等の静的ホスティングで404ページとして機能する構成にする。

404ページではページ内目次を表示しない。

---

## 17. 初期スコープ外

以下は初期スコープ外とする。

* GMガイド
* シナリオ本文
* キャンペーン本文
* キャンペーン管理機能
* キャラクターシートWebアプリ
* キャラクター作成ウィザード
* 自動計算つきキャラクター作成フォーム
* ダイスローラー
* 戦闘シミュレーター
* 戦闘処理支援ツール
* CMS
* ログイン・認証
* 投稿・コメント機能
* DB
* サーバーサイド処理
* 外部検索サービス連携
* PDF自動生成
* PWA対応
* 多言語対応
* 高度な画像最適化
* 高度な一覧フィルタ
* 用語集専用ページ
* パンくずリスト
* ページ末尾の前後ナビゲーション
* ページ内目次の現在位置ハイライト必須化
* 個別OGP画像生成
* 高度なアニメーション
* 過剰なUIライブラリ
* アクセス解析

シナリオ進行ルールページ `/rules/scenario-play` は、シナリオ本文を掲載するページではなく、PL向けのシナリオ進行ルールを説明するページとして扱う。

---

## 18. 推奨ディレクトリ構成

```text
neon-underrealm-site/
├─ .github/
│  └─ workflows/
│     └─ deploy.yml
│
├─ .raw/
│  ├─ excel/
│  └─ contents/
│
├─ public/
│  └─ assets/
│     ├─ images/
│     │  ├─ logo/
│     │  ├─ ogp/
│     │  ├─ top/
│     │  ├─ world/
│     │  └─ rules/
│     └─ icons/
│
├─ data/
│  ├─ generated/
│  │  ├─ skills.json
│  │  ├─ items.json
│  │  ├─ ryugi.json
│  │  ├─ ikizama.json
│  │  └─ release-notes.json
│  └─ README.md
│
├─ docs/
│  ├─ requirements.md
│  ├─ plan.md
│  ├─ out-of-scope.md
│  ├─ content-writing-guide.md
│  ├─ deployment.md
│  └─ conversion/
│     ├─ release-notes.md
│     ├─ common-skills.md
│     ├─ ryugi-index.md
│     ├─ ryugi-detail.md
│     ├─ ikizama-index.md
│     ├─ ikizama-detail.md
│     ├─ items-weapons.md
│     ├─ items-armors.md
│     ├─ items-omamori.md
│     ├─ items-cybernetics.md
│     ├─ items-nanomachines.md
│     └─ items-drugs.md
│
├─ scripts/
│  ├─ convert-excel.ts
│  ├─ validate-data.ts
│  └─ lib/
│     ├─ excel.ts
│     ├─ ids.ts
│     └─ normalize.ts
│
├─ src/
│  ├─ components/
│  │  ├─ layout/
│  │  ├─ nav/
│  │  ├─ search/
│  │  ├─ data/
│  │  │  ├─ SkillCard.astro
│  │  │  ├─ SkillList.astro
│  │  │  ├─ WeaponCard.astro
│  │  │  ├─ WeaponList.astro
│  │  │  ├─ ArmorCard.astro
│  │  │  ├─ ArmorList.astro
│  │  │  ├─ OmamoriCard.astro
│  │  │  ├─ OmamoriList.astro
│  │  │  ├─ CyberneticCard.astro
│  │  │  ├─ CyberneticList.astro
│  │  │  ├─ NanomachineCard.astro
│  │  │  ├─ NanomachineList.astro
│  │  │  ├─ DrugCard.astro
│  │  │  └─ DrugList.astro
│  │  ├─ common/
│  │  │  ├─ Callout.astro
│  │  │  └─ ImageBlock.astro
│  │  └─ seo/
│  │
│  ├─ layouts/
│  │  ├─ BaseLayout.astro
│  │  └─ ContentLayout.astro
│  │
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ introduction.mdx
│  │  ├─ world.mdx
│  │  ├─ character-making.mdx
│  │  ├─ advancement.mdx
│  │  ├─ release-notes.astro
│  │  ├─ 404.astro
│  │  ├─ rules/
│  │  │  ├─ index.mdx
│  │  │  ├─ scenario-play.mdx
│  │  │  └─ battle.mdx
│  │  └─ data/
│  │     ├─ index.mdx
│  │     ├─ common-skills.astro
│  │     ├─ ryugi/
│  │     ├─ ikizama/
│  │     └─ items/
│  │
│  ├─ lib/
│  │  ├─ data/
│  │  ├─ schemas/
│  │  ├─ site/
│  │  └─ utils/
│  │
│  └─ styles/
│     ├─ global.css
│     ├─ tokens.css
│     └─ prose.css
│
├─ astro.config.mjs
├─ package.json
├─ tsconfig.json
├─ .gitignore
└─ README.md
```

---

## 19. `.gitignore` 方針

以下はGit管理しない。

```gitignore
node_modules/
dist/
.astro/

.env
.env.*

.raw/
*.xlsx
*.xlsm
~$*.xlsx

.DS_Store
```

`data/generated/*.json` はGit管理するため、ignoreしない。

`.raw/contents/*.md` はユーザーのローカル作業入力であり、Git管理しない。

最終的な本文・画面構造は `src/pages` 配下の `.mdx` または `.astro` に反映する。

---

## 20. package scripts案

Astro前提の場合、以下を初期候補とする。

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "index:search": "pagefind --site dist",
    "build:search": "astro build && pagefind --site dist",
    "preview": "astro preview",
    "convert:data": "tsx scripts/convert-excel.ts",
    "validate:data": "tsx scripts/validate-data.ts",
    "test:data": "vitest run scripts",
    "check": "astro check && npm run validate:data"
  }
}
```

基本デプロイ段階のCIでは以下を想定する。

```text
npm ci
npm run check
npm run build
deploy
```

検索導入後のCIでは以下を想定する。

```text
npm ci
npm run check
npm run build:search
deploy
```

Excel変換はCIに入れない。

変換済みJSONをGit管理する前提とする。
