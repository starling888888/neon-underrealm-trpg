# 対応済みAgent Failure履歴

このファイルは、`docs/agent-failure-log.md` から退避した対応済みfailureの履歴を保持する。

`docs/agent-failure-log.md` は未反映・未確認failureを中心に保つ。failureを退避する場合は、削除ではなくこのファイルへ移す。

退避判断と恒久対応案の監査は `.agents/skills/failure-log-audit/SKILL.md` に従う。

## 退避条件

- 対象failureへの恒久対応が完了している
- 対応先の `AGENTS.md`、`.agents/skills/*`、`.agents/rules/*`、または関連docsが明記されている
- ユーザーが対応済み扱いを確認している
- コミット指示が出た直前、またはfailure-log監査の承認済み整理として実行する

plan / TODOの完了退避とは条件が異なる。単に作業が終わっただけ、または一時対応だけのfailureは退避しない。

## 記録形式

```md
### failure category

#### YYYY-MM-DD

- 発生箇所:
- 観測した失敗:
- 一次対応:
- 恒久対応:
- moved: YYYY-MM-DD
```

## 対応済み

### Repeated formatter feedback during implementation

#### 2026-07-09

- source: self
- 発生箇所: `18-0-release-notes-data` の `src/lib/schemas/release-notes.ts`、`scripts/convert-release-notes/lib.ts`、`tests/node/release-notes.test.ts`
- 観測した失敗: `npm run check` でTypeScriptの `unknown` 絞り込み不足を修正した後、Biome format / organize imports指摘を同じ作業中に複数回発生させた。さらにExcel読取依存を差し替えた後も、返り値型の `null` 考慮漏れとimport名順で `npm run check` を再度失敗させた。`npm run format` だけではorganize importsが解決しないことを見落とし、同じ `npm run check` 失敗を繰り返した。
- 一次対応: 対象ファイルのimport順と型を手修正し、`npx biome check` で局所確認してから `npm run check` を再実行して通した。`exceljs` は `npm audit` で推移依存のmoderate vulnerabilityが残ったため、`read-excel-file` と `fflate` へ差し替えた。

#### 2026-07-08

- source: self
- 発生箇所: `phase-2-prep-markdown-formatting` の `npm run format:md`
- 観測した失敗: Markdown formatter導入中、1回目はsandbox上read-only扱いの `.agents/skills/*.md` への書き込みで失敗し、2回目は `markdownlint-cli2` のglob除外設定が不十分で `node_modules/**/*.md` までlint対象に含めて失敗した。
- 一次対応: 既存Markdown一括formatの承認範囲に従って権限付きでformatterを再実行し、`markdownlint-cli2` の対象globをGit管理対象のMarkdown配置先へ限定した。

#### 2026-07-06

- 発生箇所: `12-mobile-menu` の `src/scripts/mobile-menu.ts`
- 観測した失敗: `npm run check` でBiome formatter指摘を受けた後、同じファイルで別のformatter指摘を再度発生させた。
- 一次対応: Biomeの指摘どおりに改行・インデントを修正し、`npm run check` を通した。

#### 2026-07-06

- 発生箇所: `13-page-toc` の `scripts/lib/page-toc-postprocess.ts` と `tests/page-toc-postprocess.test.ts`
- 観測した失敗: `npm run check` でBiome formatter / organize imports指摘を受けた後、同じStep 2作業中に追加のBiome指摘を再度発生させた。
- 一次対応: 対象ファイルに限定して `npx biome check --write` を実行し、`npm run check` を通した。

#### 恒久対応

- `.agents/rules/work-report.md` へ、TypeScript、JavaScript、Astro、test file変更時にBiomeのformat / organize-imports指摘が関係する場合は、`npm run check` を繰り返す前に対象ファイルへ `npx biome check --write <changed-code-files>` を実行する手順を追記した。
- moved: 2026-07-11

### PR creation through gh caused body corruption

#### 2026-07-08

- source: user
- 発生箇所: `phase-2-prep-markdown-formatting` のPR #25作成
- 観測した失敗: `gh pr create --body "..."` にMarkdown本文を直接渡したため、shellがバッククォート内をコマンド置換として解釈し、PR本文の `docs/issue/...`、`review-to-issue`、`docs/agent-failure-log.md` が壊れた。さらに `gh pr edit` はGitHub側GraphQLのclassic Projectsフィールドエラーで失敗し、REST API fallbackが必要になった。
- 一次対応: PR本文をREST APIで修正した。
- 恒久対応: PR作成とPR metadata更新をGitHub connector経由で行い、`gh pr create` / `gh pr edit` / `gh api` を標準のPR書き込み経路にしないよう `AGENTS.md`、`.agents/skills/create-pr/SKILL.md`、`.agents/skills/README.md`、`.agents/rules/git-operations.md` へ反映した。
- moved: 2026-07-08
