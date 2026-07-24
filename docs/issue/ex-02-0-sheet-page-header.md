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

- [ ] `/character-sheet/`が静的Astroページとしてビルドされる。
- [ ] ページtitleが「キャラクターシート」である。
- [ ] サイトメニューに「キャラクターシート」が「キャラクター成長」と「サポート」の間で表示され、現在ページ状態を正しく示す。
- [ ] `PageToc`と`MobilePageToc`を表示しない。
- [ ] desktopおよびtabletではサイトメニューを表示し、mobileでは表示しない。
- [ ] HeaderとFooterの既存意匠・挙動を変更していない。
- [ ] `npm run check` が通る。
- [ ] `npm run build` が通る。
- [ ] 実装後、`docs/design/character-sheet/notes.md`に定めたdesktop（1440x1200）、tablet（820x1180）、mobile（390x900）の表示条件を限定VRTまたは同等の目視確認で確認する。canonical baselineの作成・更新は、差分を確認したうえでユーザーが明示指示した場合だけ行う。

## チェックポイント

- [ ] 既存ルートと既存のサイトメニュー表示が壊れていない。
- [ ] GitHub Pagesのサブパス公開で、`/character-sheet/`とサイトメニューのリンクが壊れない。
- [ ] `docs/design/character-sheet/notes.md`のページとナビゲーション要件、およびページlayoutとサイトメニュー要件と矛盾していない。
- [ ] `docs/requirements/non-functional.md`のアクセシビリティ・レスポンシブ基準と矛盾していない。
- [ ] 不要な依存関係を追加していない。
- [ ] 初期スコープ外の機能を実装していない。
- [ ] 関連する `docs/TODO.md` 項目をこのGateへ重複して取り込んでいない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/pages/character-sheet.astro`
- `src/lib/site/menu.ts`
- `src/layouts/`配下のキャラクターシート専用layoutまたは最小限の既存layout拡張
- `tests/visual/config.ts`、`tests/visual/vrt/character-sheet.spec.ts`（限定VRTを追加する必要がある場合）

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
