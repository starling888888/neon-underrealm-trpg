# Work Report Rules

At the end of implementation work, stop without committing unless the user explicitly asked for a commit.

Report in this shape:

```md
## 作業結果

- 実装した内容
- 変更したファイル
- 実行したコマンド
- 成功した確認
- 失敗または未確認の項目
- `docs/agent-failure-log.md` で3回以上積み重なっている同種失敗の有無
- レビューしてほしい点

## Git操作

- commit: 未実行
- push: 未実行
```

For grouped issues, use the group-specific report format from the issue file when it exists.

Run when appropriate and available:

```sh
npm run check
npm run build
```

If a command is not run, say why.

If a command fails, report the failing command and the relevant failure summary.

For TypeScript, JavaScript, Astro, or test file changes, use a targeted Biome check before repeating full validation when import order, formatting, or lint feedback is involved:

```sh
npx biome check --write <changed-code-files>
```

`npm run format` does not necessarily fix organize-imports feedback. If `npm run check` fails with Biome formatting or organize-imports feedback, run the targeted Biome fix on the affected files before rerunning `npm run check`.

If `.md` files were created or edited, run the Markdown formatter before reporting, unless the current issue explicitly says not to. If Markdown-only changes were made, `npm run build` may be skipped when no `.mdx`, Astro, TypeScript, CSS, config, package, generated data, image, or workflow files changed.

After work, inspect `docs/agent-failure-log.md` for categories with 3 or more active entries and report whether such categories exist.
