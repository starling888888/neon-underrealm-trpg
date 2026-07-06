# TODO

このファイルは、現在のissueでは対応しないが、将来対応すべきレビュー指摘・改善候補を一時的に追跡するための一覧である。

`docs/TODO.md` は、`review-to-issue` workflowで以下のような項目を受ける。

- 現在のissue範囲を超える指摘
- 後続タスクで対応すべき改善
- 既存の `docs/plan.md` タスクに紐づく補足対応
- `docs/plan.md` に新しい計画項目を追加したうえで追跡すべき作業

TODO項目は、可能な限り `docs/plan.md` の計画項目へ紐づける。

---

## 未対応

- [ ] サイトメニューの表示文言と階層レイアウトを調整する
  - source: `12-mobile-menu` 実装後のユーザー指摘
  - classification: follow-up
  - plan: `docs/plan.md` の `12-1-site-menu-layout-copy`
  - handling plan: `サイトメニュー` という表示文言を削除または別文言へ変更し、子項目開閉トグルを項目右端へ移動する。トグル用の左スペースでリンク群が右に寄りすぎないよう、PC左サイトメニューとスマホdrawer内メニューの両方で全体を左寄せに調整する。

- [ ] 生成JSONとデータ取得層ができた後、サイドメニューに流儀リストと生き様リストを表示する
  - source: `11-site-menu` 実装中のユーザー判断
  - classification: follow-up
  - plan: `docs/plan.md` の `28-sample-generated-data` / `29-data-access-layer` 後に、必要なら `39-ryugi-pages` / `40-ikizama-pages` または別のナビゲーション補完タスクで扱う
  - handling plan: 現時点では生成JSONが存在しないため `11-site-menu` では実装しない。`data/generated/ryugi.json` / `data/generated/ikizama.json` と `src/lib/data/ryugi.ts` / `src/lib/data/ikizama.ts` が整った後、手書き固定ではなく生成JSONまたはデータ取得層から流儀・生き様の項目を取得し、サイドメニューへ表示する。

- [ ] `/data/common-skills` のページ作成を計画項目として追跡する
  - source: `.tmp/11-review.md` / PR #14 review draft
  - classification: follow-up
  - plan: `docs/plan.md` の `36-1-common-skills-page`
  - handling plan: `requirements.md` とサイドメニューに `/data/common-skills` が追加済みのため、データ表示UIフェーズで共通スキル一覧ページを作成し、スキル一覧Componentまたは同等の表示方針に接続する。

- [ ] 既存 `docs/design/*/notes.md` を `design-image-generation` のnotes構造へ寄せる
  - source: `design-image-generation` skill 追加時の整合確認
  - classification: follow-up
  - plan: `docs/plan.md` のdesign / Visual Review / UI実装関連タスクに紐づける。適切な既存planがない場合は、design運用整理タスクを追加する
  - handling plan: 既存design targetごとに、mode / target / referenced SSoT / existing design constraints / out of scope / comparison points / generation source / open questions を必要範囲で追記する。既存design画像そのものは、このTODOだけでは変更しない

<!--
例:

- [ ] TODO title
  - source: `.tmp/pr-N-review.md`
  - classification: follow-up / out-of-scope
  - plan: `docs/plan.md` の該当項目
  - handling plan: 将来どのタスクでどう扱うか
-->

---

## 完了済み

- [x] `Seo.astro` を共通Layoutへ組み込む
  - completed: 2026-07-05
  - PR: #11
  - source: `08-seo-component` 実装後の確認 / `レビュー指摘 1`
  - handling: `BaseLayout.astro` の `<head>` 内で `Seo.astro` を利用し、Layout props経由で `title` / `description` / `og:*` を渡せるようにした

<!-- 完了したTODOは、完了日と対応PRまたはcommitを添えてここへ移動する。 -->
