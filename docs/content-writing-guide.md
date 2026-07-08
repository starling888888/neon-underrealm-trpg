# 本文作成ガイド

このドキュメントは、ネオン・アンダーレルムTRPG ルールサイトの本文を継続管理するための初期方針です。

MDX対応は導入済みです。本文ページを追加するときは、この方針に沿ってMarkdown / MDXを使い分けます。

## 基本方針

- ルール本文や説明文はMarkdown / MDXで管理する。
- 本文の修正だけであれば、なるべくアプリケーションコードの編集を不要にする。
- スキル、アイテム、流儀、生き様、リリースノートなどの表形式データは本文に直接大量記述しない。
- 表形式データはExcelから変換した `data/generated/` 配下のJSONを正とする。
- MDX本文では、必要に応じて表示Componentを呼び出す。

## 本文ページの想定

初期公開では、以下のようなページをMarkdown / MDXで管理する想定です。

- はじめに
- ワールドガイド
- キャラクターメイキング
- ルールトップ
- シナリオ進行ルール
- 戦闘ルール
- 成長
- データトップ
- アイテム説明
- 更新履歴

実際のファイル配置やルーティングは、ページ骨組みタスクで確定します。

現行計画では、ページ作成は `docs/plan.md` のPhase 3以降で、対象ページごとにデータ整備、必要Component、画面作成、完成画面のdesign更新を進めます。最終的な公開ページ本文とUI構造のSSoTは `src/pages` 配下の `.mdx` または `.astro` とします。

## 書き方の原則

- Markdown styleは、見出しATX形式、unordered list marker `-`、nested list 2 spaces indentに限定する。
- `.md` ファイルを作成・編集した後は、Markdown formatterを実行する。
- Markdown style判断のためにGoogle Markdown Style Guideなどの外部style guideを参照しない。
- 見出し階層を自然に保つ。
- 1ページに複数の大きな話題を詰め込みすぎない。
- ルール本文、例、注意、補足を区別して書く。
- 固有名詞やルール用語の表記を揃える。
- 画像には意味のある代替テキストを付ける。
- 未実装ページへの空リンクや準備中ページを増やさない。

## MDX内Component埋め込み方針

MDX本文では、通常の文章、見出し、箇条書きはMarkdownとして書きます。

Astro Componentを使うのは、通常Markdownだけでは管理しづらい表示に限定します。

- コールアウト、注記、例示などの本文補助表示
- JSONデータから生成する一覧、カード、凡例
- 画像やリンク集など、表示ルールを共通化したい要素

Componentに渡す値は、本文から読み取れる短いpropsに留めます。大量のスキル、アイテム、流儀、生き様データをMDX本文へ直接書かず、`data/generated/` と表示Componentを組み合わせます。

最小確認用の例は以下です。

```mdx
import MdxExample from "../components/_common/MdxExample.astro";

<MdxExample label="Astro ComponentをMDX内から表示しています。" />
```

本格的なデータ表示Componentは後続タスクで追加します。MDX導入タスクでは、Componentを埋め込める基盤確認までを対象とします。

## MDX本文内リンクの方針

通常の内部リンクはMarkdownリンク記法を優先します。

```mdx
[戦闘ルール](/rules/battle/)
```

base path補正や将来の外部リンク判定など、実装側の処理が必要なリンクは、MDX本文に `withBase()` を直接書かず、内部リンクComponentへ寄せます。

```mdx
import InternalLink from "../components/_common/InternalLink.astro";

<InternalLink href="/rules/battle/">戦闘ルール</InternalLink>
```

生の `<a href={...}>` や `withBase()` の直接利用は、Layout、Component、404ページなど実装寄りの場所に限定します。

## データ表示の扱い

スキルやアイテムの一覧は、Markdown表で手管理しない方針です。

将来的には、MDX内で以下のようなComponentを使って表示します。

```mdx
<SkillCard variant="legend" />
<SkillList owner="teppoudama" />
<WeaponCard variant="legend" />
<ItemList type="weapon" />
```

凡例専用Componentは作らず、通常表示で使うCard Componentへ凡例用データを渡して表示します。

これらのComponentはまだ未実装です。実装は後続のデータ表示UIタスクで扱います。

## 生成データとの関係

Excel本体やページ作成前のMarkdown入力は、リポジトリルート直下の `.raw/` 配下でローカル管理します。

ユーザー編集用の正本はGoogle Drive上で管理し、ローカル作業時に必要なファイルだけ `.raw/` 配下へ同期します。

Google Drive同期対象フォルダのURLは、リポジトリルート直下の `raw-google-drive.url` に置きます。`raw-google-drive.url` と `.raw/` はGit管理しません。

同期後の `.raw/` 配下は以下の構造にします。

```text
.raw/
├── release-notes.xlsx
├── data/
│   └── *.xlsx
└── contents/
    └── *.md
```

Google Docsは `.raw/contents/*.md` として、Google Sheetsは `.raw/release-notes.xlsx` または `.raw/data/*.xlsx` として取得します。

Git管理するのは、Excelから変換された `data/generated/` 配下のJSONです。生成済みJSONは原則として手編集しません。

本文から特定データへリンクする場合は、公開後に変わりにくいIDを使う方針です。ID設計と変換仕様は後続タスクで確定します。

## 初期スコープ外

以下は初期実装では作りません。

- GMガイド
- シナリオ本文
- Webキャラクターシート
- ダイスローラー
- CMS
- ログイン・認証
- コメント・投稿機能
- DBやAPIサーバーを使う機能

詳細は `docs/out-of-scope.md` を参照してください。
