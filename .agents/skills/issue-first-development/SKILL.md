---

name: issue-first-development
description: Use this skill when the user asks to start a task from docs/plan.md, create a task branch, or prepare docs/issue/*.md before implementation. This skill must stop before code implementation and wait for human review.
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Issue-first Development Skill

This skill prepares a development task safely before implementation.

Use this skill when the user asks to:

* start a task from `docs/plan.md`
* create a branch for a planned task
* prepare an issue file before development
* begin work using the project’s issue-first workflow
* create `docs/issue/X-hogehoge.md`
* split a planned task into a child task

This skill does **not** implement code.
This skill only prepares the branch and issue document, then stops for human review.

---

## Core rule

Do not implement the task immediately.

The workflow is:

1. Read the requested task from `docs/plan.md`
2. Determine the branch name
3. Check the current git state
4. Create a dedicated branch
5. Create `docs/issue/X-hogehoge.md`
6. Write the task goal, scope, completion criteria, checkpoints, and review points
7. Stop and wait for user review

Implementation may begin only after the user explicitly approves the issue file.

---

## Preconditions

Before doing anything, inspect the current repository state.

Run:

```sh
git status
git branch --show-current
```

If there are uncommitted changes, inspect them before making changes.

Do not overwrite, delete, format, or move existing user changes unless the user explicitly approves it.

If the working tree is unsafe or ambiguous, stop and ask the user.

---

## Branch naming

Use the task number and slug from `docs/plan.md`.

Normal task:

```txt
NN-slug
```

Child task:

```txt
NN-M-slug
```

Examples:

```txt
01-docs-requirements
06-config-base-path
12-1-mobile-menu-drawer
39-2-ryugi-detail-template
```

Rules:

* Use lowercase English
* Use numbers and hyphens
* Do not use Japanese in branch names
* Do not use spaces
* Keep the slug short and descriptive

If the branch already exists, do not overwrite it. Stop and ask the user.

---

## Issue file naming

Create the issue file under:

```txt
docs/issue/
```

The issue filename must match the branch name.

Examples:

```txt
docs/issue/01-docs-requirements.md
docs/issue/06-config-base-path.md
docs/issue/12-1-mobile-menu-drawer.md
```

Create `docs/issue/` if it does not exist.

---

## Issue file template

Use this template.

```md
# NN-slug

## 目的

このタスクで達成する目的を書く。

## 背景

このタスクが必要になった理由を書く。

関連する要件がある場合は、以下を参照する。

- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`

## 対象範囲

このタスクで変更してよい範囲を書く。

例：

- `astro.config.mjs`
- `src/lib/utils/paths.ts`
- `docs/deployment.md`

## 初期スコープ外

このタスクで実装してはいけないことを書く。

例：

- 検索機能を実装しない
- UIデザインを作り込まない
- Excel変換処理を作らない
- キャラクターシート機能を作らない
- アクセス解析を追加しない
- DB、認証、SSR、CMSを追加しない
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う

## 完了条件

- [ ] 条件1
- [ ] 条件2
- [ ] 条件3
- [ ] `npm run build` が通る
- [ ] 必要に応じて `npm run check` が通る

## チェックポイント

- [ ] 既存ルートが壊れていない
- [ ] GitHub Pagesのサブパス公開に影響しない
- [ ] 不要な依存関係を追加していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `path/to/file`
- `path/to/file`

## レビュー観点

人間レビュー時に確認してほしい観点を書く。

## 備考

必要な補足を書く。
```

---

## Required stopping point

After creating the branch and issue file, stop.

Do not modify source code.

Do not implement the task.

Do not run broad formatting.

Do not commit.

Report the following to the user:

```md
## 作業前準備完了

- branch: `NN-slug`
- issue: `docs/issue/NN-slug.md`

## このissueで定義した内容

- 目的
- 対象範囲
- 完了条件
- チェックポイント

## レビューしてほしい点

- タスク範囲が広すぎないか
- 初期スコープ外が明確か
- 完了条件がレビュー可能か

ユーザー承認後に実装を開始します。

Git commit / push は未実行です。
```

---

## Explicit approval required

Implementation may begin only after the user says something like:

```txt
OK、進めて
この内容で実装して
レビューした。開発して
承認。実装開始
```

Without explicit approval, stop after issue creation.

---

## Forbidden actions

Never run these commands unless the user explicitly instructs it:

```sh
git commit
git push
git tag
git reset --hard
git clean -fd
git rebase
git merge
```

Never update `docs/plan.md` checkboxes by yourself.

Never mark a task complete without human review.

---

## Scope discipline

If the requested task appears to require work outside the issue scope, do not expand the task silently.

Instead:

1. Add a note to the issue file under `備考`
2. Explain the risk to the user
3. Ask whether to split it into a child task

Examples of work that should be split:

* Adding search while building layout
* Adding Excel conversion while building card UI
* Adding analytics while preparing deployment
* Adding character sheet features during rule site work
* Introducing a large UI library for a small component

---

## Reference priority

Follow this priority order:

1. Latest user instruction
2. `AGENTS.md`
3. This skill
4. `docs/plan.md`
5. `docs/requirements.md`
6. `docs/out-of-scope.md`
7. Existing code

If these conflict, stop and ask the user.
