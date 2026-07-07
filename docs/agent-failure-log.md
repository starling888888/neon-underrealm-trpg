# Agent Failure Log

このファイルは、生成AIエージェントの暴走、手順逸脱、実装中に観測した失敗を蓄積し、将来の恒久対応へ取り込むための記録である。

同種失敗の監査と恒久対応案の整理は `.agents/skills/failure-log-audit/SKILL.md` に従う。

このファイルは未反映・未確認failureを中心に管理するactive failure logである。対応済みfailureを退避する場合は、削除せず `docs/agent-failure-log-done.md` へ移す。

failureのdone退避は、恒久対応が完了し、反映先が記録され、ユーザー確認を受けた場合に限る。plan / TODOの完了退避とは条件を混ぜない。

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

通常の実装品質レビュー、設計改善提案、単発の軽微な修正依頼は、このファイルの記録対象ではない。

review-to-issueでレビュー指摘を扱う場合も、以下のいずれかに該当する指摘だけをfailure-log候補とする。

- ユーザー承認なしに進めた作業
- workflow上の停止地点を越えた作業
- current issueの範囲を誤って拡大した作業
- 検証していない内容を検証済みとして扱った作業
- remote snapshot、review draft、actual screenshot、design正本などの位置づけを混同した作業
- 同じcheck、build、formatter、test、型エラーを同一作業中に2回以上繰り返した作業
- 恒久的なrules / SKILL / checklist更新が必要になりうる判断ミス

source種別は以下を使う。

- `user`: ユーザーが直接指摘した失敗
- `self`: エージェント自身が作業中に観測した失敗
- `review`: review-to-issueで扱ったレビュー指摘から、agent failureとして妥当だと判断した失敗
- `unknown`: sourceを特定できないが記録が必要な失敗

---

## 運用方針

- このファイルは失敗の一次記録であり、恒久対応そのものではない。
- 恒久対応を行う場合は、別タスクとして `AGENTS.md`、該当SKILL、または関連docsへ反映する。
- 反映済みになった項目は、削除せず「恒久対応」欄へ反映先を追記する。
- current issueで扱うべき修正を、このファイルへ逃がさない。
- 通常の後続開発TODOは `docs/TODO.md` で管理する。
- 対応済みfailureは、ユーザー確認後に `docs/agent-failure-log-done.md` へ退避できる。
- review-to-issueでfailure-log候補を記録しても、review-to-issueの停止地点は変えない。記録後はユーザー確認を待つ。
- 同じ失敗カテゴリに3回以上の発生詳細が積み重なっている場合は、作業報告でユーザーに通知し、恒久対応候補として明示する。

---

## 記録テンプレート

```md
### short-title

#### YYYY-MM-DD

- source: user / self / review / unknown
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

### Unauthorized git publish

#### 2026-07-06

- 発生箇所: `13-page-toc` の `docs/issue/13-page-toc.md` 完了条件チェック反映後のGit操作
- 観測した失敗: ユーザーの指示は「issueの完了条件チェック入ってない」であり、commit / pushの明示許可ではなかったにもかかわらず、`docs: check page toc issue completion` をcommitし、既存PR branchへpushした。
- 一次対応: ユーザー指示に従い差し戻しは行わず、本ログへ手順逸脱として記録した。以後、直前にcommit / push許可がない修正指示では、作業ツリー上の変更に留めて報告する。

### Repeated formatter feedback during implementation

#### 2026-07-06

- 発生箇所: `12-mobile-menu` の `src/scripts/mobile-menu.ts`
- 観測した失敗: `npm run check` でBiome formatter指摘を受けた後、同じファイルで別のformatter指摘を再度発生させた。
- 一次対応: Biomeの指摘どおりに改行・インデントを修正し、`npm run check` を通した。

#### 2026-07-06

- 発生箇所: `13-page-toc` の `scripts/lib/page-toc-postprocess.ts` と `tests/page-toc-postprocess.test.ts`
- 観測した失敗: `npm run check` でBiome formatter / organize imports指摘を受けた後、同じStep 2作業中に追加のBiome指摘を再度発生させた。
- 一次対応: 対象ファイルに限定して `npx biome check --write` を実行し、`npm run check` を通した。

### Repeated design image conversion failure

#### 2026-07-06

- 発生箇所: `12-1-site-menu-layout-copy` の `docs/design/mobile-menu/design-mobile-open.png` 更新
- 観測した失敗: ImageMagick `convert` で `.tmp/mobile-menu-design-open.svg` をPNG化する際、同じ `non-conforming drawing primitive definition ','` エラーを複数回発生させた。
- 一次対応: SVG内のfont-family指定からImageMagickが解釈しづらいcomma指定を外し、SVGをPNG化した後に `メニュー` ラベルをImageMagick annotateで合成した。

### Mobile horizontal overflow missed after UI implementation

#### 2026-07-06

- 発生箇所: `14-mobile-page-toc` の `MobilePageToc.astro` / `BaseLayout.astro`
- 観測した失敗: 実装後のPlaywright確認で開閉挙動とスクリーンショットは確認したが、document全体の横方向overflowを数値確認しておらず、mobile PageTocのgrid item自動最小幅により右側余白が崩れた状態を見落とした。
- 一次対応: `MobilePageToc`、`desktop-layout`、`site-main` に `min-width: 0` / `width: 100%` を追加し、390px viewportで `documentElement.scrollWidth` が390pxに収まることを確認した。

### Design canonicalization from unprocessed dev output

#### 2026-07-07

- 発生箇所: `16-layout-screenshot-design-refresh` の `docs/design/site-layout/design-mobile-page-toc-open.png`
- 観測した失敗: build後postprocessでH1横へ移動するMobilePageTocを、dev server由来の未postprocess DOMから撮影してdesign正本化したため、実ブラウザ確認ではH1下に表示される目次がdesign正本ではH1上に表示されていた。
- 一次対応: visual testに `data-mobile-page-heading` の存在確認を追加し、build後previewのpostprocess済みDOMに対してスクリーンショットを再取得した。あわせてMobilePageTocのH1+trigger sticky挙動を実装・検証した。

### Excessive CSS added during targeted UI fix

#### 2026-07-07

- 発生箇所: `16-layout-screenshot-design-refresh` の `src/components/layout/MobilePageToc.astro`
- 観測した失敗: H1とMobilePageToc triggerをstickyにする修正で、必要な位置指定を超えて背景色、border、box-shadow、負margin、paddingを追加し、既存本文面と異なる背景ブロックを発生させた。
- 一次対応: stickyに必要な `position` / `top` / `z-index` だけを残し、追加した背景色、border、box-shadow、負margin、paddingを削除した。

### Sticky heading transparent background missed

#### 2026-07-07

- 発生箇所: `16-layout-screenshot-design-refresh` の `src/components/layout/MobilePageToc.astro`
- 観測した失敗: H1とMobilePageToc triggerをstickyにした際、背景を透過のままにしていたため、スクロール中の本文がH1背面に重なって読みにくくなる状態を見落とした。
- 一次対応: sticky heading rowに白背景を追加して上端の透過を防ぎ、通常H1位置を崩しにくい範囲で上paddingと同量の負marginを使ってsticky時の上余白と目次triggerの縦位置を調整した。
