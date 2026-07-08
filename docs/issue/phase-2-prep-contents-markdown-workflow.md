# phase-2-prep-contents-markdown-workflow

## 目的

Google Docs上に置くcontents markdownの作成・同期・解釈ルールを整理する。

このissueでは、Google Docsを「レイアウト済み文書」として扱わず、agentが解釈可能なMarkdownソースを保持する置き場として扱う方針を明文化する。

主な目的は以下。

- ChatGPTが参照してcontents markdownを作成できるSKILLを追加する
- Google Docsから `.raw/contents/*.md` へ同期する際は `text/plain` exportを使うよう、既存の `drive-to-raw-sync` SKILLを修正する
- contents markdownの共通解釈ルールを追加する
- Google Drive上のcontents markdown用Google Docは、Markdownソースをプレーンテキストとして保持する必要があることをREADME等に明記する

## 背景

`.raw/contents/*.md` は、Google Docs由来のローカル作業入力であり、Git管理対象ではない。

これまで、Google DocsからMarkdownとしてexportする運用を検討したが、Google DocsのMarkdown exportでは、Google Docs側のリッチテキスト構造からMarkdownが再生成されるため、次のような崩れが発生する。

- 相対リンクが `http:///path` に変換される
- blockquoteの `>` が失われる
- fenced code blockのフェンスと言語指定が失われる
- HTMLコメントやfrontmatterの扱いが不安定になる
- Markdownソースとして保持したい記法が、Google Docsのリッチテキスト構造に変換される

一方、Google Docs上にMarkdownソースをプレーンテキストとして保持し、`text/plain` でexportした場合、次の要素はほぼそのまま保持される。

- frontmatter
- HTMLコメント
- ATX見出し
- 太字・斜体・インラインコード
- 相対リンク
- blockquote
- unordered list
- ordered list
- checklist
- table
- fenced code block
- horizontal rule

そのため、contents markdownについては、Google Docsをレイアウト済み文書として扱わず、Markdownソースをプレーンテキストとして置く方針へ切り替える。

Google Docs由来の `text/plain` exportには、BOM、余分な空行、末尾スペースが含まれる場合がある。ただし、これらは意味情報ではないため、contents markdownの解釈ルール側でノイズとして扱う。

## 対象範囲

- `.agents/skills/contents-markdown-authoring/SKILL.md`
  - 新規作成
  - ChatGPT / Codexがcontents markdown草案を作成するためのSKILL
  - frontmatterをページメタ情報として使う方針を定義する
  - 本文には通常のMarkdown記法を使う方針を定義する
  - agent向け指示はHTMLコメントで書く方針を定義する
  - HTMLコメントを最終ページ本文に出さない方針を定義する
  - Google Docsへ貼り付ける場合は、Markdownソースをプレーンテキストとして貼り付ける前提を定義する
  - Google Docsの見出し、箇条書き、表、リンク等のリッチテキスト書式でレイアウト済み文書を作らない前提を定義する
- `.agents/skills/drive-to-raw-sync/SKILL.md`
  - 既存SKILLを修正
  - Google Docsから `.raw/contents/*.md` へ同期する場合は `text/plain` exportを使う方針へ変更する
  - `.raw/contents/*.md` への保存時はMarkdownファイルとして保存する
  - Google Driveへ書き戻さない方針を維持する
  - `.raw/contents/*.md` はGit管理対象にしない方針を維持する
- `.agents/rules/contents-markdown.md`
  - 新規作成
  - contents markdownの共通解釈ルールを定義する
  - frontmatterはページメタ情報として扱う
  - HTMLコメントはagent向け指示として扱う
  - HTMLコメントは最終本文ではない
  - BOM、余分な空行、末尾スペースはGoogle Docs由来のノイズとして扱う
  - `.raw/contents/*.md` は作業入力であり、デザイン正本ではないことを定義する
  - requirements、plan、issue、designを置き換える正本ではないことを定義する
- `.agents/rules/README.md`
  - 新規ruleの索引を追加する
- `.agents/skills/README.md`
  - 新規SKILLの索引を追加する
- `AGENTS.md`
  - 必要に応じて、新SKILLと新ruleへの短い参照入口を追加する
  - 詳細ルールを長文で重複記載しない
- `README.md`
  - Google Drive上にcontents markdown用Google Docを置く場合の運用を明記する
  - Markdownソースをプレーンテキストとして貼り付ける必要があることを明記する
  - Google Docsのリッチテキスト書式でレイアウト済みドキュメントを作ってはならないことを明記する
- `docs/requirements/architecture.md`
  - `.raw/contents/*.md` の説明を、HTMLコメント指示と `text/plain` export前提へ修正する
  - 既存の「コメント形式の画面デザイン指示書」等の表現が残っている場合は、新方針に合わせて修正する
- `docs/plan.md`
  - `NN-2` 等に `.raw/contents/*.md` の古い前提が残っている場合、新方針に合わせて修正する
  - チェックボックスの完了扱い・done退避は行わない

## 初期スコープ外

- Google Drive上のDocs本文を書き換えない
- Google Driveへローカル変更を書き戻さない
- Google Docsをリッチテキスト文書として整形する運用は定義しない
- `.raw/contents/*.md` をGit管理しない
- `.raw/contents/*.md` をそのまま公開ページとして扱わない
- `.raw/contents/*.md` をrequirements、plan、issue、designの正本として扱わない
- `:::` 指示ブロックは採用しない
- Google Docsから `.raw/contents/*.md` への同期で `text/markdown` exportを使わない
- `.raw/contents/*.md` 用のMarkdown formatter処理は追加しない
- formatter前コピー、formatter差分確認、formatter用一時領域は追加しない
- Google Docs由来の表記崩れを網羅的に列挙して自動補正しない
- `.raw/contents` から `src/pages` へ変換する汎用自動スクリプトは作らない
- UI実装、ページ実装、Component実装はこのissueでは行わない
- design画像生成は行わない
- GitHub Issueは作成しない
- PRは作成しない
- commit / pushは行わない
- `docs/plan.md` のチェックボックスを完了扱いにしない
- `docs/plan-done.md` への退避を行わない

## 完了条件

- [x] `.agents/skills/contents-markdown-authoring/SKILL.md` が作成されている
- [x] `.agents/skills/contents-markdown-authoring/SKILL.md` のfrontmatter `name` がフォルダ名 `contents-markdown-authoring` と一致している
- [x] `contents-markdown-authoring` が、ChatGPT / Codexでcontents markdown草案を作成する用途を明示している
- [x] `contents-markdown-authoring` が、frontmatterをページメタ情報として使う方針を明示している
- [x] `contents-markdown-authoring` が、本文には通常のMarkdown記法を使う方針を明示している
- [x] `contents-markdown-authoring` が、agent向け指示はHTMLコメントで書く方針を明示している
- [x] `contents-markdown-authoring` が、HTMLコメントを最終ページ本文に出さない方針を明示している
- [x] `contents-markdown-authoring` が、Google Docsへ貼り付ける場合はMarkdownソースをプレーンテキストとして貼り付ける方針を明示している
- [x] `contents-markdown-authoring` が、Google Docsのリッチテキスト書式でレイアウト済み文書を作らない方針を明示している
- [x] `contents-markdown-authoring` が、`:::` 指示ブロックを使わない方針を明示している
- [x] `.agents/skills/drive-to-raw-sync/SKILL.md` が、Google Docsから `.raw/contents/*.md` へ同期する場合は `text/plain` exportを使う方針へ修正されている
- [x] `.agents/skills/drive-to-raw-sync/SKILL.md` が、`.raw/contents/*.md` はMarkdownファイルとして保存する方針を明示している
- [x] `.agents/skills/drive-to-raw-sync/SKILL.md` が、Google Driveへ書き戻さない方針を維持している
- [x] `.agents/skills/drive-to-raw-sync/SKILL.md` が、`.raw/contents/*.md` をGit管理対象にしない方針を維持している
- [x] `.agents/rules/contents-markdown.md` が作成されている
- [x] `.agents/rules/contents-markdown.md` が、frontmatterをページメタ情報として扱う方針を明示している
- [x] `.agents/rules/contents-markdown.md` が、HTMLコメントをagent向け指示として扱う方針を明示している
- [x] `.agents/rules/contents-markdown.md` が、HTMLコメントを最終本文として扱わない方針を明示している
- [x] `.agents/rules/contents-markdown.md` が、BOM、余分な空行、末尾スペースをGoogle Docs由来ノイズとして扱う方針を明示している
- [x] `.agents/rules/contents-markdown.md` が、`.raw/contents/*.md` は作業入力であり、デザイン正本ではないことを明示している
- [x] `.agents/rules/contents-markdown.md` が、`.raw/contents/*.md` はrequirements、plan、issue、designを置き換える正本ではないことを明示している
- [x] `.agents/rules/README.md` に `contents-markdown.md` の索引が追加されている
- [x] `.agents/skills/README.md` に `contents-markdown-authoring` の索引が追加されている
- [x] 必要に応じて `AGENTS.md` に新SKILL・新ruleへの短い参照入口が追加されている
- [x] `README.md` に、Google Drive上にcontents markdown用Google Docを置く場合はMarkdownソースをプレーンテキストとして貼り付ける必要があることが明記されている
- [x] `README.md` に、Google Docsのリッチテキスト書式でレイアウト済みドキュメントを作ってはならないことが明記されている
- [x] `README.md` に、contents markdown用Google Docはagentが解釈可能な作業入力であり、Markdown書式を維持する必要があることが明記されている
- [x] `docs/requirements/architecture.md` の `.raw/contents/*.md` 説明が、frontmatter + Markdown本文 + HTMLコメント指示 + `text/plain` export前提へ修正されている
- [x] `docs/plan.md` に `.raw/contents/*.md` の古い前提が残っている場合、新方針に合わせて修正されている
- [x] `.raw/` がGit管理対象に含まれていない
- [x] `git diff --check` が通る
- [x] Markdown-only変更である場合、`npm run check` / `npm run build` を省略した理由が作業報告に記録されている
- [x] 実行した検証コマンドと結果が作業報告に記録されている

## チェックポイント

- [x] 既存ルートが壊れていない
- [x] GitHub Pagesのサブパス公開に影響しない
- [x] 不要な依存関係を追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] 関連する `docs/TODO.md` 項目と矛盾していない
- [x] 関連する `docs/design/` と矛盾していない
- [x] ユーザーの未コミット変更を破壊していない
- [x] `.raw/contents/*.md` の変更をコミット対象にしていない
- [x] Google Driveへの書き戻しを行っていない
- [x] Google Docsから `.raw/contents/*.md` への同期が `text/plain` export前提になっている
- [x] Google Docsから `.raw/contents/*.md` への同期に `text/markdown` exportを使う前提が残っていない
- [x] contents markdown用Google Docをリッチテキスト文書として作る前提が残っていない
- [x] `:::` 指示ブロック前提が残っていない
- [x] `.raw/contents/*.md` 用formatter処理を追加していない
- [x] SKILL作成時に `.agents/skills/skill-authoring/SKILL.md` の形式・安全要件に従っている
- [x] Google Drive同期に触れる変更が `.agents/skills/drive-to-raw-sync/SKILL.md` と `.agents/rules/data-management.md` に反していない
- [x] ChatGPTでcontents markdown草案作成・内容確認を行い、Codexはローカル同期・実装・検証に集中する分担が崩れていない
- [x] `.raw/contents/*.md` がデザイン正本や仕様正本として扱われていない

## 想定変更ファイル

- `.agents/skills/contents-markdown-authoring/SKILL.md`
- `.agents/skills/drive-to-raw-sync/SKILL.md`
- `.agents/rules/contents-markdown.md`
- `.agents/rules/README.md`
- `.agents/skills/README.md`
- `AGENTS.md`
- `README.md`
- `docs/requirements/architecture.md`
- `docs/plan.md`

ローカル作業入力として同期される可能性があるファイル:

- `.raw/contents/*.md`

ただし `.raw/` はGit管理しない。

## レビュー観点

- `contents-markdown-authoring` が、ChatGPTでcontents markdown草案を作るためのSKILLとして過不足ないか
- frontmatter + Markdown本文 + HTMLコメント指示の形式が明確か
- HTMLコメントを指示として扱い、最終本文には出さない方針が明確か
- Google Docsへ貼り付ける場合、Markdownソースをプレーンテキストとして保持する方針が明確か
- Google Docsのリッチテキスト書式でレイアウト済み文書を作らない方針が明確か
- `drive-to-raw-sync` が `.raw/contents/*.md` について `text/plain` exportを使う方針になっているか
- `drive-to-raw-sync` のGoogle Driveへ書き戻さない方針が維持されているか
- contents markdown ruleが、BOM、余分な空行、末尾スペースをGoogle Docs由来ノイズとして扱えているか
- `.raw/contents/*.md` をデザイン正本として扱わない方針が維持されているか
- requirements、plan、issue、designとのSSoT関係が曖昧になっていないか
- `README.md` の記述が、ユーザーの実運用ミスを防げる粒度になっているか
- `AGENTS.md` に長文ルールを増やしすぎていないか
- formatterや追加tool導入など、今回不要な実装を含んでいないか

## 備考

contents markdownの想定形式は以下。

```md
---
page: home
route: /
title: 光都暗域〈ネオン・アンダーレルム〉TRPG
---

<!--
トップページではページ内目次を表示しない。
キャッチコピーは h1 / h2 の見出しサイズにしない。
キャッチコピーは本文より少し大きいリード文として扱う。
-->

# 光都暗域〈ネオン・アンダーレルム〉TRPG

_近未来。_ ネオン華やぐオオサカ副都で、お前は力を選び、生き様を定義する。

_裏社会。_ 光の裏には闇がある。仕事人として、縁をその身に、光の届かない道を駆け抜けろ。

<!--
次に最新リリースノートを表示する。
リンク先は /release-notes とする。
-->

## 最新リリースノート

[更新履歴を見る](/release-notes)
```

採用しない形式は以下。

```md
:::

meta:

page: home

route: /

:::

:::
これは全体のデザイン指示。
:::

:::
個々にコンポーネントで〇〇を置く。
:::
```

Google Docs上のcontents markdown用Docは、Markdownソースをプレーンテキストとして保持する。

Google Docsの見出し、箇条書き、表、リンク、引用、コードブロック等のリッチテキスト書式でレイアウト済み文書として作成しない。

Google Docsから `.raw/contents/*.md` へ同期する場合は、`text/plain` exportで取得し、`.md` ファイルとして保存する。

## Local Validation Summary

- mode: local repository mode
- branch: `phase-2-prep-contents-markdown-workflow`
- issue: `docs/issue/phase-2-prep-contents-markdown-workflow.md`
- local working tree: checked before implementation
- related TODO: no direct `docs/TODO.md` item found
- related design target: none; this issue does not implement UI, CSS, layout, page, or Component work
- plan handling: user explicitly approved `plan追加不要`; this issue may update existing `docs/plan.md` wording but must not add a new plan item or mark plan checkboxes complete
- local ignore policy: `.raw/`, `.raw/contents/example.md`, and `raw-google-drive.url` are Git-ignored
- validation commands:
  - `npm run format:md`: passed
  - `git diff --check`: passed
  - `npm run check:md`: passed
  - `git check-ignore -v .raw .raw/contents/example.md raw-google-drive.url`: passed
  - `git ls-files .raw raw-google-drive.url`: no tracked files found
- skipped commands:
  - `npm run check`: skipped because changes are Markdown-only and do not touch `.mdx`, Astro, TypeScript, CSS, config, package, generated data, images, or workflows
  - `npm run build`: skipped because changes are Markdown-only and do not touch `.mdx`, Astro, TypeScript, CSS, config, package, generated data, images, or workflows
- remaining unverified before final report: final failure-log category check
