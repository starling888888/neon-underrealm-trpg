# 完了済みTODO履歴

このファイルは、`docs/TODO.md` から退避した完了済みTODOの履歴を保持する。

`docs/TODO.md` は未対応TODOを中心に保つ。完了済みTODOを退避する場合は、削除ではなくこのファイルへ移す。

## 退避条件

- TODOが対応済みである
- 対応内容がmerge済み、またはユーザーが完了扱いを承認している
- 完了日、対応PRまたはcommit、元TODOのsourceが記録できる
- ユーザーがTODO整理またはpost-merge tracking更新を指示している

## 記録形式

```md
- [x] TODO title
  - completed: YYYY-MM-DD
  - PR: #N または commit: `<hash>`
  - source:
  - handling:
```

## 完了済み

- [x] 現在地ハイライト目視確認用のダミーMDXページ`/data/index.mdx`を、本実装時に削除または置き換える
  - completed: 2026-07-13 via PR #42 / `27-2-data-index-page`
  - source: `15-current-menu-highlight` 実装中の目視確認用追加
  - classification: follow-up
  - plan: `docs/plan.md` の `27-2-data-index-page`
  - handling: `src/pages/data/index.mdx`をデータトップページの本実装へ置き換えた。

- [x] 戦闘ルール実装後、シナリオ終了後処理から死亡・覚悟の詳細へフラグメントリンクを置く
  - completed: 2026-07-12 via PR #39 / `25-2-battle-page`
  - source: `24-2-scenario-play-page` のユーザー指示
  - classification: cross-page follow-up
  - plan: `docs/plan.md` の `25-2-battle-page`
  - handling: 戦闘ルールの「気絶と死亡」「覚悟」のbuild後フラグメントIDを確認し、`src/pages/rules/scenario-play.mdx` と `.raw/contents/scenario-play.md` の参照を対応するインラインリンクへ更新した。

- [x] 既存MarkdownドキュメントのstyleをGoogle Markdown Style Guideに沿って統一する
  - completed: 2026-07-08 via `todo-md-style-unification` / main direct commit
  - source: `.tmp/追加要望.md` 01
  - classification: follow-up
  - plan: 関連planなし。ユーザーの明示指示により、plan作成なしの独立タスクとして扱った。
  - handling: Google Markdown Style Guideを基準に、既存Markdownドキュメントのunordered list markerを `-` に統一した。本文内容、要件、planチェック状態、Markdown以外のファイルは変更していない。

- [x] サイトメニューの表示文言と階層レイアウトを調整する
  - completed: 2026-07-06 via PR #16 / `12-1-site-menu-layout-copy`
  - source: `12-mobile-menu` 実装後のユーザー指摘
  - classification: follow-up
  - plan: `docs/plan.md` の `12-1-site-menu-layout-copy`
  - handling: `サイトメニュー` という表示文言を削除または別文言へ変更し、子項目開閉トグルを項目右端へ移動した。トグル用の左スペースでリンク群が右に寄りすぎないよう、PC左サイトメニューとスマホdrawer内メニューの両方で全体を左寄せに調整した。

- [x] `Seo.astro` を共通Layoutへ組み込む
  - completed: 2026-07-05 via PR #11 / `09-base-layout`
  - source: `08-seo-component` 実装後の確認 / `レビュー指摘 1`
  - handling: `BaseLayout.astro` の `<head>` 内で `Seo.astro` を利用し、Layout props経由で `title` / `description` / `og:*` を渡せるようにした。
