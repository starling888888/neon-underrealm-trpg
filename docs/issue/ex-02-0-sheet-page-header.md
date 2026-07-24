# ex-02-0-sheet-page-header

## 目的

`/character-sheet/` のAstroページとページ固有のサイトメニュー表示を追加し、後続GateがReact Islandと編集画面を配置できる静的な入口を用意する。

## 背景

親issue `docs/issue/ex-02-web-character-sheet.md` の G0 である。Webキャラクターシートは既存Astroサイトへ限定的なReact Islandとして追加する構成であり、Astroページと共通ナビゲーションの接続を先に確立する。

参照する正本:

- `docs/issue/ex-02-web-character-sheet.md`
- `docs/issue/ex-02-web-character-sheet/plan.md`
- `docs/requirements/character-sheet.md`
- `docs/architectures/character-sheet.md`
- `docs/design/character-sheet/notes.md`
- `docs/requirements/non-functional.md`
- `docs/out-of-scope.md`
- `docs/plan.md`

`docs/TODO.md` のキャラクターシート関連項目は、永続スキル参照のID変更検出とJSON schema versionの将来互換性である。このGateでは保存、復元、JSON形式を実装しないため扱わず、後続Gateへ残す。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G0: Astro pageとページ固有のサイトメニュー表示`
- 依存Gate: なし

このGateは、`/character-sheet/`のページ入口とサイトメニューだけを対象とする。後続のG1（React Island実行基盤）およびG2（3 viewportの基本レイアウト）は、このGateのページrouteとメニュー導線を前提にする。

## 対象範囲

- `/character-sheet/`を公開routeとするAstroページを追加する。
- ページtitleを「キャラクターシート」に設定する。
- サイトナビゲーションへ「キャラクターシート」を追加し、「キャラクター成長」の下かつ「サポート」の上へ配置する。
- `PageToc`と`MobilePageToc`を表示しない、キャラクターシート専用のページlayoutまたは既存layoutの最小限の拡張を追加する。
- desktopとtabletではサイトメニューを表示し、mobileではサイトメニューを表示しないページ固有の表示条件を実装する。
- 後続GateでReact Islandを配置できる静的なmain領域を用意する。ただし、このGateでは入力UIを置かない。

## 初期スコープ外

- React、React Island、form state、schema、マスタデータ参照、入力欄、派生値計算、検証を実装しない。
- キャラクターシートのdesktop、tablet、mobileの編集画面layout、section navigation、floating操作、dialogを実装しない。
- Header、Footer、検索、共通サイトメニューの意匠または挙動を再設計しない。
- PageToc、MobilePageToc、キャラクターシート固有のsection navigationを追加しない。
- 保存・復元、画像、JSON入出力、CCFOLIA出力、認証、サーバー・DB・クラウド保存を実装しない。
- 新しいnpm packageを追加しない。

## 完了条件

- [x] `/character-sheet/`が静的Astroページとしてビルドされる。
- [x] ページtitleが「キャラクターシート」である。
- [x] サイトメニューに「キャラクターシート」が「キャラクター成長」と「サポート」の間で表示され、現在ページ状態を正しく示す。
- [x] `PageToc`と`MobilePageToc`を表示しない。
- [x] desktopおよびtabletではサイトメニューを表示し、mobileでは表示しない。
- [x] HeaderとFooterの既存意匠・挙動を変更していない。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。
- [x] 実装後、`docs/design/character-sheet/notes.md`に定めたdesktop（1440x1200）、tablet（820x1180）、mobile（390x900）の表示条件を限定VRTまたは同等の目視確認で確認する。canonical baselineの作成・更新は、差分を確認したうえでユーザーが明示指示した場合だけ行う。

## チェックポイント

- [x] 既存ルートと既存のサイトメニュー表示が壊れていない。
- [x] GitHub Pagesのサブパス公開で、`/character-sheet/`とサイトメニューのリンクが壊れない。
- [x] `docs/design/character-sheet/notes.md`のページとナビゲーション要件、およびページlayoutとサイトメニュー要件と矛盾していない。
- [x] `docs/requirements/non-functional.md`のアクセシビリティ・レスポンシブ基準と矛盾していない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] 関連する `docs/TODO.md` 項目をこのGateへ重複して取り込んでいない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/pages/character-sheet.astro`
- `src/lib/site/menu.ts`
- `src/components/character-sheet/CharacterSheetHeader.astro`
- `src/layouts/CharacterSheetAppContainer.astro`
- `src/layouts/CharacterSheetPageLayout.astro`
- `tests/visual/config.ts`
- `tests/visual/character-sheet.spec.ts`
- `tests/visual/vrt/character-sheet.spec.ts`

## レビュー観点

- G0の範囲が、route、ページtitle、サイトメニュー、ToC非表示、サイトメニューのresponsive表示だけに限定されているか。
- 「キャラクターシート」がサイトメニューで「キャラクター成長」の下、「サポート」の上にあるか。
- HeaderとFooterの再設計、およびG1以降が担当するReact Island・編集画面・操作UIを混入させていないか。
- design notesに未作成と記録されたVRT baselineを、ユーザー承認なく更新しない前提が適切か。

## 備考

- 作業開始時の現在branchは `ex-02-web-character-sheet`。ユーザー指示により、この準備では子branch `ex-02-0-sheet-page-header` を作成しない。実装開始時のbranch運用は、ユーザーが別途指示する。
- issue reviewerは、ユーザー指示により実行しない。
- design targetは `docs/design/character-sheet/notes.md`。design-image-generationの実行は、このGateのissue準備では不要とする。必要なroute、viewport、ナビゲーション、ToC非表示のdesign intentは同ファイルに存在する。編集画面固有のlayoutと操作デザインは後続Gateで扱う。
- 現在、character-sheet用VRT route・テスト・canonical snapshotはいずれも未作成である。VRTの対象追加やbaseline更新は実装後の限定Visual Reviewで判断し、baseline更新はユーザーの明示指示が必要である。

## ビジュアルレビュー 1

### VRT対象

- design target: `docs/design/character-sheet/notes.md`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts` の `@vrt @character-sheet`。canonical baselineは未作成のため、比較・更新は行わない。
- route / states / viewports: `/character-sheet/` のdefault状態。desktop `1440x1200`、tablet `820x1180`、mobile `390x900`。

### レビュー結果

| 対象    | 判定 | 差分 | 対応                                                     |
| ------- | ---- | ---- | -------------------------------------------------------- |
| desktop | OK   | なし | サイトメニュー、current状態、ToC非表示を確認した。       |
| tablet  | OK   | なし | 常設サイトメニューとToC非表示を確認した。                |
| mobile  | OK   | なし | サイトメニューの操作・drawerを表示しないことを確認した。 |

### 自己修正した項目

- [x] mobile Headerのサイトメニュー操作とdrawerを、character-sheetページでは表示しないようにした。

### 人間判断が必要な差分

- character-sheet用のcanonical VRT baselineは未作成である。baselineの初回作成はユーザー指示が必要である。

### 対応完了チェックリスト

- [ ] 変更targetだけをVRT比較した（canonical baselineが未作成のため未実施）。
- [x] desktop、tablet、mobileの一時screenshotを取得した。
- [x] 目視で確認した差分を修正した。
- [x] baseline更新が必要な差分を人間判断として記録した。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 1

### 指摘事項

- `/character-sheet/`のページ固有のresponsive契約（desktop・tabletの常設サイトメニュー、mobileのメニューボタン・drawer非表示、ToC非表示、現在ページの`aria-current`）を自動テストしていない。

### 判定

- source: local-agent
- classification: valid
- local validation: `CharacterSheetAppContainer`・`CharacterSheetHeader`・`CharacterSheetPageLayout`、サイトメニュー定義、追加したbrowser behavior testを確認した。現在のG0実装は、共通`AppContainer`へキャラクターシート固有の分岐を追加せず、当該routeのresponsiveな表示条件をCIで検知する。

### 対応方針

- canonical VRT baselineを作らず、`tests/visual/character-sheet.spec.ts`へ`/character-sheet/`を対象にしたbrowser behavior testを追加する。
- desktop・tablet・mobileのサイトメニュー表示条件、ToC非表示、`aria-current`、subpath付きリンクを必要最小限で検証する。

### 対応完了チェックリスト

- [x] ページ固有のresponsive契約を検証するtestを追加する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。
- [x] 必要なtarget testが通る。
