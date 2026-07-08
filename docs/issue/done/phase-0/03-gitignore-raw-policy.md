# 03-gitignore-raw-policy

## 目的

Excel本体をGit管理しない方針を `.gitignore` と `data/generated/README.md` に明示し、生成JSONを置くためのディレクトリを用意する。

## 背景

`docs/plan.md` の Phase 0 にあるデータ管理方針タスクとして、ローカル作業用の `.raw/` と、Git管理する生成済みJSONの扱いを早い段階で固定する必要がある。

関連する要件は以下を参照する。

- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`

## 対象範囲

このタスクで変更してよい範囲は以下とする。

- `.gitignore`
- `data/generated/`
- `data/generated/README.md`

## 初期スコープ外

このタスクでは以下を実装しない。

- Excel変換スクリプトを作らない
- 仮JSONデータを作らない
- Zodスキーマを作らない
- データ取得層を作らない
- Excel変換仕様を確定しない
- `.raw/` 配下の実ファイルをGit管理しない
- 検索機能を実装しない
- UIやページを追加しない
- DB、認証、SSR必須機能、CMS、APIサーバーを追加しない
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う

## 完了条件

- [x] `.gitignore` に `.raw/` が追加されている
- [x] `.gitignore` に `*.xlsx`, `*.xlsm`, `~$*.xlsx` が追加されている
- [x] `data/generated/` が作成されている
- [x] `data/generated/README.md` に生成JSONの手編集禁止方針が書かれている
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## チェックポイント

- [x] 既存ルートが壊れていない
- [x] GitHub Pagesのサブパス公開に影響しない
- [x] 不要な依存関係を追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] `.raw/` 配下のファイルをGit管理していない
- [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `.gitignore`
- `data/generated/README.md`

## レビュー観点

- `.gitignore` の対象が過不足ないか
- `data/generated/README.md` の手編集禁止方針が明確か
- Excel変換や仮データ作成をこのタスクに含めない方針でよいか

## 備考

Gitは空ディレクトリを管理できないため、`data/generated/` は `data/generated/README.md` によって作成・管理する。
