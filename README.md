# ネオン・アンダーレルムTRPG ルールサイト

ネオン・アンダーレルムTRPGの公式ルールサイトを構築するmonorepoです。PL向けのルール、世界観、キャラクターメイキング、データ、Webキャラクターシートを静的サイトとして公開し、Cloudflare backendだけをキャラクターシートのcloud persistenceに用います。

## Workspaces

- [frontend](frontend/README.md): Astro静的サイト、Firebase / Google Cloud設定、Google Spreadsheetのlocal入力、contents作成、GitHub Pages公開
- [backend](backend/README.md): Cloudflare Worker、D1、R2、Firebase ID Token検証、cloud persistence API
- `packages/shared/`: frontendとbackendで共有する型・定数

## 共通セットアップとコマンド

repository rootで依存関係をinstallする。

```sh
npm install
```

共通のformat、lint、型検査はroot commandを使う。

```sh
npm run format
npm run format:md
npm run check
npm run lint
npm run typecheck
npm run check:md
```

workspace固有の開発、build、test、local設定は各workspaceのREADMEを参照する。

## リポジトリ共通の参照先

- [要件定義](docs/requirements.md)
- [初期スコープ外](docs/out-of-scope.md)
- [開発計画](docs/issue/milestone-02/plan.md)
- [テストと検証方針](docs/testing.md)
- [公開手順](docs/deployment.md)
- [TODO](docs/TODO.md)
- [AI Ops方針](docs/ai-ops.md)
- [本文作成ガイド](docs/content-writing-guide.md)

## 生成AIエージェント運用

最上位ルールは`AGENTS.md`、定型workflowは`.agents/skills/`、常設ruleは`.agents/rules/`に置く。実装はissue-first workflowで現在issueを確認してから始める。

remote snapshot draftやPRレビュー草案は、local repositoryで検証されるまで正式な作業記録ではない。Git非管理のレビュー入力は`.tmp/`へ置き、必要な内容だけをissueやTODOへ取り込む。

## データと一時ファイル

- `.raw/`: Git非管理のlocal作業入力。Google Spreadsheet同期の出力と手動contents入力を置く。
- `frontend/data/generated/`: Git管理する公開用生成JSON。原則として手編集せず、元データから変換し直す。
- `.tmp/`: Git非管理の一次レビュー出力、一時メモ、作業scratchを置く。

データ管理の詳細は[Data management rule](.agents/rules/data-management.md)を参照する。

## DesignとVisual Review

`docs/design/<design-target>/`はdesign intentとVRT参照情報を置くnotes-onlyの正本である。UI変更後はPR review直前に変更targetだけをVRTで比較し、canonical baselineの更新はユーザーの明示承認時だけに行う。

詳細は[Visual Review Tests](frontend/tests/vrt/README.md)と[visual implementation review skill](.agents/skills/visual-implementation-review/SKILL.md)を参照する。
