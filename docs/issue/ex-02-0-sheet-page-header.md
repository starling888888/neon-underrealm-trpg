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
- `PageToc`と`MobilePageToc`を表示しない、キャラクターシート固有の静的構造を`src/pages/character-sheet.astro`へ直接追加する。
- tabletでは常設のサイトメニューrailを表示し、desktopとmobileではロゴの左に置くHeaderのボタンからサイトメニューdrawerを開くページ固有の表示条件を実装する。
- キャラクターシートのpage固有構造は`src/pages/character-sheet.astro`へ直接置き、desktopとtabletのmain領域を最大幅で中央寄せしない。
- キャラクターシートをPagefind検索indexから除外する。
- 後続GateでReact Islandを配置できる静的なmain領域を用意する。ただし、このGateでは入力UIを置かない。

## 初期スコープ外

- React、React Island、form state、schema、マスタデータ参照、入力欄、派生値計算、検証を実装しない。
- キャラクターシートのdesktop、tablet、mobileの編集画面layout、section navigation、floating操作、dialogを実装しない。
- Header、Footer、検索、共通サイトメニューの意匠または挙動を、desktopとmobileのサイトメニューdrawer操作を除いて再設計しない。
- PageToc、MobilePageToc、キャラクターシート固有のsection navigationを追加しない。
- 保存・復元、画像、JSON入出力、CCFOLIA出力、認証、サーバー・DB・クラウド保存を実装しない。
- 新しいnpm packageを追加しない。

## 完了条件

- [x] `/character-sheet/`が静的Astroページとしてビルドされる。
- [x] ページtitleが「キャラクターシート」である。
- [x] サイトメニューに「キャラクターシート」が「キャラクター成長」と「サポート」の間で表示され、現在ページ状態を正しく示す。
- [x] `PageToc`と`MobilePageToc`を表示しない。
- [x] tabletでは常設のサイトメニューrailを表示し、desktopとmobileではロゴの左に置くHeaderのボタンからサイトメニューdrawerを開く。
- [x] `src/pages/character-sheet.astro`へpage固有構造を直接置き、desktopとtabletのmain領域を最大幅で中央寄せしていない。
- [x] キャラクターシートがPagefind検索indexの対象外である。
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
- `src/scripts/character-sheet-menu.ts`
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
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts` の `@vrt @character-sheet`。ユーザー承認によりdesktopとtabletのcanonical baselineをローカル更新した。mobile baselineは未作成である。
- route / states / viewports: `/character-sheet/` のdefault状態。desktop `1440x1200`、tablet `820x1180`、mobile `390x900`。

### レビュー結果

| 対象    | 判定     | 差分         | 対応                                                 |
| ------- | -------- | ------------ | ---------------------------------------------------- |
| desktop | 要再確認 | baseline更新 | 更新後の比較はChromium sandbox起動失敗により未実施。 |
| tablet  | 要再確認 | baseline更新 | 更新後の比較はChromium sandbox起動失敗により未実施。 |
| mobile  | 要再確認 | 未更新       | Headerのボタンからサイトメニューdrawerを開く。       |

### 自己修正した項目

- [x] desktopとmobile Headerのサイトメニュー操作とdrawerを、character-sheetページで表示する。
- [x] page固有のContainer／Layoutと単なるimport用Componentを廃止し、`src/pages/character-sheet.astro`へ直接置いた。desktopとtabletのmainから最大幅・中央寄せを外した。
- [x] `data-pagefind-body`を置かず、`data-pagefind-ignore`を付与してPagefind検索indexから除外した。

### 人間判断が必要な差分

- character-sheet用desktop/tablet canonical baselineはローカル更新済みだが、親issueの最終Gate G31のレビュー完了までコミットしない。mobile baselineは未作成である。

### 全VRT実行結果（ユーザー指示）

- 実行コマンド: `npm run visual:test -- --max-failures=0 --reporter=dot`
- 138件のVRTを開始した。desktopとtabletの既存targetは、サイトメニューへ「キャラクターシート」を追加した差分でscreenshot比較に失敗した。一方、同じtargetのmobileは通過した。
- artifactで確認した404 pageのdesktop/tablet差分は、左railへ追加された「キャラクターシート」行と、それにより下へ移動した「サポート」「更新履歴」である。本文、Header、Footerの差分はない。
- 実行環境では10件目のdesktop/tablet failure後にPlaywright processが終了し、138件すべての最終集計は取得できなかった。
- ユーザー承認により、desktopとtabletの93 targetを`npm run visual:update -- --grep '@vrt.*@(desktop|tablet)(?:\\s|$)'`で更新した。character-sheetのdesktop/tablet snapshotを含め、mobile snapshotは更新していない。更新後比較はChromium sandbox起動失敗により未実施である。

### 対応完了チェックリスト

- [ ] 変更targetだけをVRT比較した（canonical baselineが未作成のため未実施）。
- [x] desktop、tablet、mobileの一時screenshotを取得した。
- [x] 目視で確認した差分を修正した。
- [x] baseline更新が必要な差分を人間判断として記録した。
- [x] `npm run check` が通る。
- [x] `npm run build` とPagefind index生成が通る。

## レビュー指摘 1

### 指摘事項

- `/character-sheet/`のページ固有のresponsive契約（tabletの常設サイトメニュー、desktop・mobileのHeaderサイトメニューdrawer、ToC非表示、現在ページの`aria-current`）を自動テストしていない。

### 判定

- source: local-agent
- classification: valid
- local validation: `src/pages/character-sheet.astro`・`CharacterSheetHeader`、サイトメニュー定義、追加したbrowser behavior testを確認した。現在のG0実装は、共通`AppContainer`へキャラクターシート固有の分岐を追加せず、当該routeのresponsiveな表示条件とPagefind除外をCIで検知する。

### 対応方針

- canonical VRT baselineを作らず、`tests/visual/character-sheet.spec.ts`へ`/character-sheet/`を対象にしたbrowser behavior testを追加する。
- desktop・tablet・mobileのサイトメニュー表示条件と開閉、ToC非表示、`aria-current`、subpath付きリンクを必要最小限で検証する。

### 対応完了チェックリスト

- [x] ページ固有のresponsive契約を検証するtestを追加する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。
- [x] 必要なtarget testが通る。

## レビュー指摘 2

### 指摘事項

- 専用Headerにmobile scroll時の退避用CSSがなく、`setupMobileHeader()`が付与する`is-hidden`が画面上の非表示へ反映されない。
- mobileのbrowser behavior testが、CSSで隠すサイトメニューrailの非表示を検証していない。

### 判定

- source: local-agent
- classification: valid
- local validation: `src/pages/character-sheet.astro`が`setupMobileHeader()`を実行し、`CharacterSheetHeader`が`data-site-header`を持つことを確認した。専用Headerには`is-hidden`に対するtransformがない。mobile testにはメニューボタンとdrawerの不在確認だけがあり、`.character-sheet-menu-rail`の非表示確認がない。

### 対応方針

- 専用Headerへ共通Headerと同じscroll退避のtransform／transitionを追加する。
- mobile testへ`.character-sheet-menu-rail`の非表示確認を追加する。

ユーザー指示により、個別のscroll挙動testは追加しない。既存のページ固有responsive契約testを維持し、退避CSSは実装と通常の静的検証で確認する。

### 対応完了チェックリスト

- [x] mobile scroll時のHeader退避と復帰を実装・静的確認する。
- [x] mobileのサイトメニューrail非表示を検証する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。
- [x] 必要なtarget testが通る。

## レビュー指摘 3

### 指摘事項

- 検索を開いたまま専用サイトメニューdrawerを開くと、両方のoverlayが同時に開く。専用drawerが共通の`layout-overlay-change`通知を発行していない。

### 判定

- source: local-agent
- classification: valid
- local validation: 検索を開いた状態でdesktopの専用サイトメニューdrawerを開くと、検索panelとdrawerがともに表示され、`body`に`search-open`と`character-sheet-menu-open`が残ることを確認した。

### 対応方針

- 専用drawerの開閉時にも`layout-overlay-change`を発行し、既存の検索overlay契約に従って検索panelを閉じる。
- 新規caseは作らず、既存のdesktop drawer testへ検索open時の排他確認を追加する。

### 対応完了チェックリスト

- [x] 検索と専用drawerが同時に開かないようにする。
- [x] 既存drawer testで検索overlayとの排他を確認する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。
- [x] 必要なtarget testが通る。
