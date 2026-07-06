# Agent Failure Log

このファイルは、生成AIエージェントの暴走、手順逸脱、実装中に観測した失敗を蓄積し、将来の恒久対応へ取り込むための記録である。

現時点では、このファイルに対応する専用SKILL定義は作成しない。

---

## 目的

- ユーザーが指摘したエージェントの不適切な振る舞いを失われない形で残す
- 実装中にユーザーまたはエージェント自身が観測した失敗、手順違反、判断ミス、検証不足を記録する
- build、check、formatter、型検査、テストで同種の失敗を繰り返した場合に、エージェント自身が後から分析できる形で蓄積する
- 後続で `AGENTS.md`、`.agents/skills/*/SKILL.md`、docs、チェックリスト、レビュー手順へ恒久対応として反映する
- 同じ失敗を繰り返さないための判断材料にする

---

## 記録対象

以下に該当するものを記録する。

- ユーザーの明示指示より先に実装、生成、commit、push等を進めた
- issue-first workflow、design workflow、review workflowなどの停止地点を誤った
- スコープ外の機能、導線、UI、design要素を作った
- 既存SSoTと矛盾する判断をした
- 未検証の内容を検証済みのように扱った
- 生成物、画像、スクリーンショット、remote draft、実装結果の位置づけを混同した
- ユーザーの未コミット変更や未追跡ファイルを誤って扱うリスクがあった
- build、check、formatter、型検査、テストで同種のエラーや指摘を繰り返した
- 同じ修正方針で複数回失敗し、別の調査や恒久対応が必要になった
- 恒久対応としてルール、skill、チェック手順に反映した方がよい失敗

---

## 運用方針

- このファイルは失敗の一次記録であり、恒久対応そのものではない。
- 恒久対応を行う場合は、別タスクとして `AGENTS.md`、該当SKILL、または関連docsへ反映する。
- 反映済みになった項目は、削除せず「恒久対応」欄へ反映先を追記する。
- current issueで扱うべき修正を、このファイルへ逃がさない。
- 通常の後続開発TODOは `docs/TODO.md` で管理する。

---

## 記録テンプレート

```md
### short-title

#### YYYY-MM-DD

- 発生箇所:
- 観測した失敗:
- 一次対応:
```

---

## 未反映

### Workflow stopping point overrun

#### 2026-07-05

- 発生箇所: `09-base-layout` のissue-first / design準備
- 観測した失敗: ユーザーが「まずはlayoutにベタ書き」「今回の作成範囲はデスクトップレイアウトのみ」と指示した後、実装前のdesign準備として `docs/design/base-layout/` のdesign artifact作成まで進めた。
- 一次対応: `docs/issue/09-base-layout.md` を画像未生成前提へ戻し、そのissueファイルだけをcommitした。

#### 2026-07-05

- 発生箇所: `09-base-layout` のdesign画像生成準備
- 観測した失敗: `docs/design/base-layout/notes.md` のユーザーレビューを挟まずに、`design-desktop.png` の画像生成へ進んだ。
- 一次対応: 生成済みdesign artifactはcommitせず未追跡に残し、`docs/issue/09-base-layout.md` から画像生成済み扱いを取り除いた。

### Design draft overproduction and method drift

#### 2026-07-05

- 発生箇所: `09-base-layout` のdesign画像生成
- 観測した失敗: design画像が未レビューのドラフトであるにもかかわらず、SiteMenu風の文言やスコープ外導線の混入にこだわって複数回画像生成を行い、最終的にSVGを手作りしてPNGへ変換するという、当初の画像生成手順から逸脱した生成へ進んだ。
- 一次対応: 生成済みdesign artifactはcommitせず未追跡に残し、`docs/issue/09-base-layout.md` から画像生成済み扱いを取り除いた。

### Out-of-scope UI leakage in design artifacts

#### 2026-07-05

- 発生箇所: `09-base-layout` の `design-desktop.png`
- 観測した失敗: パンくずリストをdesign画像に含めない方針を `notes.md` に記録した後も、`Chapter 1 / Foundation` というスラッシュ付きラベルが残り、パンくずリストのように見える状態になっていた。
- 一次対応: `design-desktop.png` の該当ラベルを `Rule text sample` に変更し、パンくず風のスラッシュ表現を削除した。

### Uncommitted work disappeared despite editor history

#### 2026-07-05

- 発生箇所: `.mcp.json`、`AGENTS.md`、`README.md` のContext7関連作業
- 観測した失敗: VS Code HistoryやCodexセッション履歴にはContext7関連の `.mcp.json` 作成、`AGENTS.md` 追記、`README.md` 追記の作業記録が残っていたが、該当変更がcommitされておらず、現在の作業ツリーから消えていた。
- 一次対応: 履歴に残っていた内容を参照し、`.mcp.json`、`AGENTS.md` のMCP / Context7利用方針、`README.md` の任意開発支援設定を再作成した。

### Visual verification gap after UI-affecting change

#### 2026-07-05

- 発生箇所: `09-base-layout` の `src/pages/mdx-test.mdx` frontmatter layout変更
- 観測した失敗: MDXページのLayout適用方法を本文内Componentからfrontmatter `layout` 指定へ変更した後、`npm run check` と `npm run build` は実行したが、MDXページで実際にLayoutが表示されているかVisual確認を再実行しないまま報告した。
- 一次対応: `/mdx-test/` を対象にVisual captureを再実行し、MDXページで共通Layoutが表示されていることを確認する。

### Text labels treated as icon implementation

#### 2026-07-05

- 発生箇所: `10-header-footer` の Footerリンク実装
- 観測した失敗: issueとdesign notesで「アイコンリンク」として扱うべきGitHub / X / Discordリンクを、`GH` / `X` / `DC` の文字ラベルで実装し、ユーザーからアイコンライブラリを使った実装へ修正するよう指摘された。
- 一次対応: `simple-icons` を追加し、FooterリンクをGitHub / X / DiscordのブランドSVGアイコン表示へ変更した。

### Error page exposed as normal navigation

#### 2026-07-06

- 発生箇所: `11-site-menu` の `src/lib/site/menu.ts`
- 観測した失敗: 404ページを通常のサイドメニュー導線に含め、ユーザーから不要であると指摘された。
- 一次対応: `src/lib/site/menu.ts` から404リンクを削除した。

### Repeated formatter feedback during implementation

#### 2026-07-06

- 発生箇所: `12-mobile-menu` の `src/scripts/mobile-menu.ts`
- 観測した失敗: `npm run check` でBiome formatter指摘を受けた後、同じファイルで別のformatter指摘を再度発生させた。
- 一次対応: Biomeの指摘どおりに改行・インデントを修正し、`npm run check` を通した。

### Repeated design image conversion failure

#### 2026-07-06

- 発生箇所: `12-1-site-menu-layout-copy` の `docs/design/mobile-menu/design-mobile-open.png` 更新
- 観測した失敗: ImageMagick `convert` で `.tmp/mobile-menu-design-open.svg` をPNG化する際、同じ `non-conforming drawing primitive definition ','` エラーを複数回発生させた。
- 一次対応: SVG内のfont-family指定からImageMagickが解釈しづらいcomma指定を外し、SVGをPNG化した後に `メニュー` ラベルをImageMagick annotateで合成した。
