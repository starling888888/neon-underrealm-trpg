# 04-basic-project-docs

## 目的

READMEと初期開発手順ドキュメントを整備し、プロジェクトの起動、確認、公開方針、本文管理方針を参照できる状態にする。

## 背景

`docs/plan.md` の Phase 0 にある基本ドキュメント整備タスクとして、以後の開発者や生成AIエージェントが共通の手順を参照できるようにする必要がある。

関連する要件は以下を参照する。

- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`

## 対象範囲

このタスクで変更してよい範囲は以下とする。

- `README.md`
- `docs/deployment.md`
- `docs/content-writing-guide.md`
- 必要な場合のみ、既存ドキュメントから上記への参照リンク

## 初期スコープ外

このタスクでは以下を実装しない。

- GitHub Actionsを作らない
- デプロイ設定を実装しない
- Astro設定を変更しない
- MDX対応を追加しない
- 新規ページやLayoutを作らない
- 本文コンテンツを本格執筆しない
- Excel変換処理を作らない
- 仮JSONデータを追加しない
- データスキーマやデータ取得層を作らない
- 検索機能を実装しない
- アクセス解析を追加しない
- DB、認証、SSR必須機能、CMS、APIサーバーを追加しない
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う

## 完了条件

- [ ] `README.md` にプロジェクト概要が書かれている
- [ ] `README.md` に主要コマンドが書かれている
- [ ] `README.md` に主要ドキュメントへの導線がある
- [ ] `docs/deployment.md` に初期公開方針と将来のGitHub Pages公開手順の枠が書かれている
- [ ] `docs/content-writing-guide.md` にMarkdown / MDX本文管理の初期方針が書かれている
- [ ] 初期開発・ビルド手順が記載されている
- [ ] `npm run check` が通る
- [ ] `npm run build` が通る

## チェックポイント

- [ ] 既存ルートが壊れていない
- [ ] GitHub Pagesのサブパス公開に影響しない
- [ ] 不要な依存関係を追加していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] ドキュメントに未実装機能を実装済みのように書いていない
- [ ] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `README.md`
- `docs/deployment.md`
- `docs/content-writing-guide.md`

## レビュー観点

- READMEの情報量が初期段階として過不足ないか
- `docs/deployment.md` が実装済み事項と将来予定を混同していないか
- `docs/content-writing-guide.md` が本文管理方針として実用的か
- デプロイ実装やMDX導入など、後続タスクを先取りしていないか

## 備考

このタスクでは、公開用GitHub Actionsやbase path対応は実装しない。具体的なデプロイ設定は後続タスクで扱う。
