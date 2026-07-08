# phase-2-prep-markdown-formatting

## 目的

Markdown / MDX運用のスタイル指定を、現在のGoogle Markdown Style Guide参照ベースから、リポジトリ固有の最小ルールとformatter運用へ切り替える。

このissueでは、Markdown style判断を以下の3点に限定する。

- 見出しはATX形式を使う
- unordered list marker は `-` を使う
- nested list は2 spaces indentを使う

あわせて、Markdown formatterを導入し、Markdownファイルの作成・編集後にformatを実行する運用をエージェント規約へ組み込む。

## 背景

現行のGoogle Markdown Style Guideベースの指定は、このリポジトリの実運用と合っていない。

特に、Codex / 生成AIエージェントがMarkdownを生成・編集する際に、Google Markdown Style Guide全体を参照させると、以下の問題が起きる。

- `*` と `-` の扱いがリポジトリ運用とずれる
- 2 spaces indentの方針が安定しない
- style guide全体の解釈が広く、今回必要な整形ルール以上の判断を持ち込みやすい
- Fetch MCPで外部style guideを読む運用が、Markdown style判断として過剰になっている

今後は、Markdown styleの正本を外部style guideではなく、リポジトリ内のstanding ruleとformatter設定に寄せる。

## ローカル検証

このissue draftはlocal repository modeで検証済み。

- branch: `phase-2-prep-markdown-formatting`
- issue: `docs/issue/phase-2-prep-markdown-formatting.md`
- local working tree: issue draftのみ未追跡の状態から開始
- matching branch: 作成済み
- matching issue file: 存在確認済み
- `docs/plan.md`: このprep issueはユーザー指定によりplan追加しない
- `docs/TODO.md`: active TODOにこのissueで回収すべきMarkdown formatter関連項目は存在しない
- design target: UI、CSS、layout、page、Component実装ではないため不要

検証時に参照した主なファイル:

- `AGENTS.md`
- `.agents/skills/issue-first-development/SKILL.md`
- `.agents/rules/README.md`
- `.agents/rules/mcp.md`
- `.agents/rules/file-structure.md`
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `.github/ISSUE_TEMPLATE/issue-first-development.md`

## 対象範囲

### Markdown style rule

以下のいずれか、または必要な組み合わせで、Markdown styleのstanding ruleを定義する。

- `.agents/rules/markdown-style.md` を新規作成する
- `.agents/rules/README.md` に `markdown-style.md` を追加する
- `AGENTS.md` のRules入口にMarkdown style ruleへの参照を追加する
- 必要であれば `docs/content-writing-guide.md` に本文作成者向けの短い補足を追加する

Markdown style ruleには、以下だけを書く。

- 見出しはATX形式を使う
  - `#`
  - `##`
  - `###`
- unordered list marker は `-` を使う
- nested unordered list は2 spaces indentを使う
- Markdown style判断のためにGoogle Markdown Style Guideを参照しない
- style不明時も、Google Markdown Style Guideへ拡張せず、上記3点に収まる範囲だけ判断する
- 上記3点以外の文体、用語、文章構造、行長、句読点、強調記法、リンク記法などは、このruleでは規定しない

### MCP rule

`.agents/rules/mcp.md` を更新する。

必須変更:

- Fetch MCP自体は残す
- Fetch MCPをMarkdown style判断のために使わない
- Google Markdown Style Guide URLをMarkdown style判断の参照先として扱う記述を削除または無効化する
- Fetch MCPは引き続き、公開外部ドキュメントや仕様ページの確認用途に限定する
- Markdown style判断は `.agents/rules/markdown-style.md` とformatter設定を正とする

### Markdown formatter

Markdown formatterを導入する。

実装時の第一候補:

- `dprint`
- dprint Markdown plugin

ただし、実装時に以下を確認する。

- `.md` ファイルを安全にformatできること
- unordered list marker `-` を維持または強制できること
- nested list 2 spaces indentを維持または強制できること
- 既存Markdown本文の意味を変えないこと
- MDXを対象に含める場合は、MDX内Componentやimport構文を壊さないこと

dprintだけで3点を十分に担保できない場合は、以下のどちらかを採用する。

- formatterはdprint、style検査はmarkdownlint系ツールで補完する
- より適切なMarkdown formatter / fixerへ切り替える

どのpackageを追加したか、なぜ必要か、代替案は何か、初期スコープに必要な理由をissueまたは作業報告に記録する。

実装では以下を追加した。

- `dprint`
  - 追加理由: `.md` ファイルの一括formatとformat checkを安定して実行するため。
  - 代替案: Prettier、markdownlint系fixerのみ、既存BiomeのMarkdown対応待ち。
  - 初期スコープに必要な理由: Google Markdown Style Guide依存をやめ、Markdown作成・編集後に機械的にformatできる運用へ切り替えるため。
- `@dprint/markdown`
  - 追加理由: dprintのMarkdown plugin wasmをnpm dependencyとして固定し、format / check時の外部URL取得依存を避けるため。
  - 代替案: dprint plugin URLを `dprint.json` に直接書く。
  - 初期スコープに必要な理由: CIやローカル検証でMarkdown formatterを再現可能にするため。
- `markdownlint-cli2`
  - 追加理由: dprintによるformatに加え、ATX heading、`-` list marker、2 spaces indentの3点をcheck / fixで補完するため。
  - 代替案: dprintのみ、別のMarkdown linter / fixer、独自script。
  - 初期スコープに必要な理由: リポジトリ固有の最小style ruleをformat / checkで検出できるようにするため。

### npm scripts

`package.json` にMarkdown format / check用scriptを追加する。

想定:

```json
{
  "scripts": {
    "format": "biome format --write . && npm run format:md",
    "format:md": "<markdown formatter command>",
    "check": "astro check && biome check . && npm run check:md",
    "check:md": "<markdown formatter check command>"
  }
}
```

実際のコマンドは導入したformatterに合わせて調整する。

要件:

- 既存のBiome formatter運用を壊さない
- Markdown formatterを `npm run format` に接続する
- Markdown format未適用を `npm run check` または専用 `check:md` で検出できるようにする
- `.tmp/`、`.raw/`、`dist/`、`.astro/`、`test-results/`、`playwright-report/`、`node_modules/` を対象外にする
- 生成物や一時ファイルをformat対象に含めない

### Markdown作成・編集後の運用ルール

エージェント向けruleに以下を追加する。

- `.md` ファイルを作成・編集した場合は、作業終了前にMarkdown formatterを実行する
- `.mdx` ファイルを対象に含めるかはformatterの安全性確認後に決める
- Markdown-only変更の場合、通常の `npm run build` は必須にしない
- ただし `package.json`、formatter config、`.mdx`、Astro、TypeScript、CSS、workflowに触れた場合は、既存規約どおり必要なcheck/buildを実行する
- formatterによる大量差分が発生した場合は、差分内容を確認し、本文意味やMDX構文が変わっていないことを確認する

### 既存Markdownの一括format

最後に、Git管理対象の既存 `.md` ファイルを一度formatする。

対象:

- Git管理対象の `.md`
- 必要かつ安全と判断した場合のみ `.mdx`

対象外:

- `.raw/`
- `.tmp/`
- `dist/`
- `.astro/`
- `node_modules/`
- `test-results/`
- `playwright-report/`
- 生成物
- base64画像を含む巨大Markdownなど、formatで破壊リスクが高いファイル

一括format後、差分を確認する。

確認観点:

- `*` が `-` に統一されている
- nested listが2 spaces indentになっている
- 見出し構造が壊れていない
- code fence内の内容が不要に変更されていない
- MDX構文を対象にした場合、import / Component usageが壊れていない
- フォーマット差分以外の本文変更が混ざっていない

## 初期スコープ外

このissueでは以下を行わない。

- Google Markdown Style Guideそのものの是非を再評価しない
- Google Markdown Style Guide全体に準拠させない
- Markdownの全style ruleを策定しない
- 文章表現、用語、句読点、行長、改行幅、強調記法まで規定しない
- ルール本文やゲーム本文の内容修正をしない
- Markdown format以外を目的とした大規模docs rewriteをしない
- UI、CSS、layout、page、Componentを変更しない
- `data/generated/` の生成JSONを手編集しない
- `.raw/`、`.tmp/`、Visual Review成果物をGit管理しない
- GitHub Issueを作成しない
- PRを作成しない
- commit / pushをしない

## 完了条件

- [x] Markdown style ruleが、見出しATX形式、`-`、2 spaces indentの3点に限定されている
- [x] Google Markdown Style GuideをMarkdown style判断の正本として扱う記述が削除または無効化されている
- [x] Fetch MCPは残っているが、Markdown style情報取得には使わない方針になっている
- [x] Markdown formatterがdev dependencyとして導入されている
- [x] 追加packageの追加理由、代替案、初期スコープに必要な理由が記録されている
- [x] `format:md` が追加されている
- [x] `check:md` または同等のMarkdown format未適用検出手段が追加されている
- [x] `npm run format` からMarkdown formatterが実行される
- [x] `npm run check` または専用checkでMarkdown format未適用を検出できる
- [x] `.md` ファイルを作成・編集したらMarkdown formatterをかける運用がエージェント向けruleに記録されている
- [x] Git管理対象の既存 `.md` ファイルを一度formatしている
- [x] `.mdx` をformat対象に含めていない
- [x] `.raw/`、`.tmp/`、生成物、Visual Review成果物、build成果物がformat対象外になっている
- [x] `npm run check` が通る
- [x] `npm run build` が必要な変更範囲の場合は通る
- [x] `docs/agent-failure-log.md` で3回以上積み重なっている同種失敗の有無を作業報告で報告している
- [x] commit / pushを実行していない

## チェックポイント

- [x] `AGENTS.md` のissue-first停止条件を弱めていない
- [x] `.agents/skills/issue-first-development/SKILL.md` の停止地点を弱めていない
- [x] `.agents/rules/mcp.md` でFetch MCP自体を消していない
- [x] Markdown style ruleがGoogle Markdown Style Guideより広い規約になっていない
- [x] formatter導入によってAstro / TypeScript / Biomeの既存format/checkが壊れていない
- [x] `package-lock.json` が追加packageと整合している
- [x] 既存ルートが壊れていない
- [x] GitHub Pagesのサブパス公開に影響しない
- [x] 不要な依存関係を追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] 関連する `docs/TODO.md` 項目と矛盾していない
- [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `AGENTS.md`
- `.agents/rules/README.md`
- `.agents/rules/mcp.md`
- `.agents/rules/markdown-style.md`
- `.agents/rules/work-report.md`
- `docs/content-writing-guide.md`
- `package.json`
- `package-lock.json`
- `dprint.json`
- Markdown formatter config file
- format対象の既存 `.md` ファイル

実装時の選定結果により、以下が追加される可能性がある。

- markdownlint config file
- prettier config file
- その他Markdown formatter / linter config file

## レビュー観点

人間レビューでは以下を確認する。

- Markdown style ruleが本当に3点だけに限定されているか
- Google Markdown Style Guide依存を消せているか
- Fetch MCPを残しつつ、Markdown style判断には使わない方針になっているか
- formatter選定が過剰ではないか
- dprint単体で足りるか、markdownlint等の補助が必要か
- `npm run format` / `npm run check` への接続が重すぎないか
- `.mdx` をformat対象に含めるべきか、`.md` 限定にすべきか
- 既存 `.md` 一括format差分が本文変更を含んでいないか
- エージェント規約として、今後のMarkdown作成・編集後にformatが確実に発火する粒度になっているか

## 備考

このissueは、Markdown style方針の変更、MCP利用方針の修正、formatter導入、既存Markdown一括formatをまとめて扱う。

ただし、目的はMarkdown運用の安定化であり、本文改善やドキュメント全面改稿ではない。

`docs/issue/todo-md-style-unification.md` は過去のMarkdown style統一issueとして存在するが、active TODOには残っていない。このissueでは、Google Markdown Style Guideへの依存をやめ、最小ルールとformatter運用へ切り替えることだけを扱う。

実装開始は、このissue内容をユーザーが承認してから行う。
