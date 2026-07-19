# 44-search-modal-ui

## 目的

サイト内検索の実検索連携に先立ち、全ページ共通で利用する検索UI基盤を作る。desktop Headerの検索入力欄とその直下の結果panel、mobile Header下の検索panelを用意し、後続のPagefind連携で結果内容を差し替えられる構造にする。

## 背景

`docs/plan.md` の Phase 4 は、検索モーダルUI、Pagefind検索連携、検索メタデータを分けて進める計画である。このissueは検索UIとmobile検索挙動を一体で扱い、検索インデックスの生成や検索実行は後続taskで扱う。

関連するSSoTは以下である。

- `docs/requirements/search.md` の FR-02（現在画面上のポップアップ、モーダル、またはオーバーレイ内への検索結果表示）
- `docs/requirements/layout-navigation.md` の FR-01-01（共通Headerの検索UIまたは検索アイコン）
- `docs/requirements/architecture.md` の Pagefind導入・subpath公開方針
- `docs/out-of-scope.md` の外部検索サービスを使わない方針
- `docs/design/header-footer/notes.md` の既存Headerにある検索入力欄mockとmobile検索アイコン枠

`docs/design/search-modal/` のinitial draft（notesとdesktop / mobile design画像）は作成済みであり、ユーザー確認を受けた。UI実装ではこのdesign targetを参照する。

`docs/TODO.md` にtask 44へ直接紐づく未対応項目はない。

## 対象範囲

- `docs/design/search-modal/` をdesign-image-generationの別作業で作成する前提を定義する。
  - artifact: `notes.md`、desktopの検索入力欄と結果panel、mobileの検索panelを示すdesign画像
  - 既存の `docs/design/global-styles/`、`docs/design/header-footer/`、`docs/design/site-layout/` の色、余白、Header配置方針を維持する。
- `src/components/search/SearchButton.astro` を作成する。
  - desktop Headerの既存検索入力欄mockを、検索語を入力できる検索入力欄へ置き換える。
  - mobile Headerの既存検索アイコンを検索panelを開く操作要素として接続し、検索表示中は同じ位置のアイコンを `×` の閉じる操作へ切り替える。
- `src/components/search/SearchModal.astro` を作成する。
  - desktopではHeader検索入力欄の直下に検索結果を表示するpanel、mobileではHeader下に表示する検索panelを備える。
  - desktopではHeaderを除く背景を控えめなグレーscrimで抑え、検索入力欄と結果panelを明るく保つ。
  - mobileではHeaderを表示したまま、その下に検索panelを表示する。panel内に重複した閉じるbuttonは置かず、Header右側の `×` を閉じる操作に使う。
  - 実検索結果が未接続であることをUI上で明確にし、固定の検索結果、検索語に応じた絞り込み、Pagefind API呼び出しは実装しない。
  - desktop結果panelとmobile検索panelは検索UIとして意味付ける。Headerに閉じる操作を残すため、`aria-modal` dialogとしては扱わない。検索起点の `aria-expanded` / `aria-controls`、入力欄への初期focus、EscとHeader右側の `×` による閉鎖、キーボード操作後のfocus復帰を実装する。
  - mobileでは、検索を開く前に既に開いているsite menu / page TOC overlayを閉じる。検索を開いている間にsite menuまたはpage TOCを開いた場合は検索を閉じ、複数のoverlayを同時に開かない。
  - mobileでは既存の `layout-overlay-change` 通知と連動し、検索中に背景本文が不用意にスクロールせず、検索表示中はHeaderを表示状態に維持する。
- `src/components/layout/Header.astro` と共通layout（必要な場合は `src/layouts/AppContainer.astro`）を更新し、どの既存ページからも同一の検索UIを利用できるようにする。
- 必要最小限の既存scriptまたは新規の検索UI用client scriptとCSSを追加する。

## 初期スコープ外

- Pagefindのimport、検索index生成、公開workflowの変更、検索語による検索実行は行わない（task 45）。
- 検索対象・除外設定、ページタイトル、見出し、抜粋、種別ラベルなどの検索結果メタデータ設計は行わない（task 46）。
- 外部検索サービス、APIキー、認証、DB、SSR、サーバーサイド検索を追加しない。
- 検索専用ページ、検索履歴、保存検索、絞り込み、ソート、ページネーション、検索候補を追加しない。
- 既存のSiteMenu、PageToc、MobilePageToc、Footerの機能・デザインを再設計しない。
- 新規npm packageを追加しない。既存依存だけでUIを実現できない場合は、実装を止めて理由と代替案を報告する。

## 完了条件

- [x] 実装前に `docs/design/search-modal/` のinitial draft（notesとdesktop / mobile design画像）が作成・承認済みである。
- [ ] `SearchButton.astro` と `SearchModal.astro` が作成され、共通Header / layoutから利用されている。
- [ ] desktop Headerの検索入力欄から結果panelを開け、mobile Header右側の検索アイコンから検索panelを開ける。mobileの検索表示中は同じ位置が `×` の閉じる操作へ切り替わる。
- [ ] 検索UIには検索語入力欄と、検索結果を同一画面内に表示する空の枠がある。
- [ ] Pagefind、固定結果、検索実行、検索index生成を実装していない。
- [ ] desktop結果panelとmobile検索panelの検索UIとしての意味付け、検索起点の `aria-expanded` / `aria-controls`、入力欄への初期focus、EscとHeader右側の `×` による閉鎖、各検索起点へのfocus復帰を確認できる。
- [ ] mobileで検索panelを開く前にsite menu / page TOC overlayが開いている場合はそれらを閉じ、検索表示中にsite menu / page TOCを開いた場合は検索panelを閉じる。複数のoverlayを同時に開かない。
- [ ] mobileで検索panelを開いている間、背景本文の不用意なスクロールを抑止し、`layout-overlay-change` によりHeaderを表示状態に維持する。
- [ ] desktopで検索表示中、Headerを除く背景に控えめなグレーscrimが表示され、検索入力欄と結果panelは読みやすい明るさを保つ。
- [ ] `npm run check` が通る。
- [ ] `npm run build` が通る。

## チェックポイント

- [ ] 既存ルート、Header、mobile site menu、PageTocが壊れていない。
- [ ] GitHub Pagesのサブパス公開に影響しない。検索UIの接続で `/` 固定のURLを追加していない。
- [ ] 不要な依存関係を追加していない。
- [ ] Pagefind連携、検索メタデータなど後続taskの範囲を先取りしていない。
- [ ] `docs/requirements/search.md`、`docs/requirements/layout-navigation.md`、`docs/out-of-scope.md` と矛盾していない。
- [ ] `docs/design/search-modal/` のdesktop / mobile design、および既存Header / global layout designと矛盾していない。
- [ ] mobile search、site menu、page TOCの任意の操作順で、overlayが1つだけ開き、Header表示状態とbodyのスクロール抑止が既存overlayと矛盾しない。
- [ ] ユーザーの未コミット画像変更を破壊していない。

## 想定変更ファイル

- `docs/design/search-modal/notes.md` とdesign画像（design-image-generationの別作業）
- `src/components/search/SearchButton.astro`
- `src/components/search/SearchModal.astro`
- `src/components/layout/Header.astro`
- `src/layouts/AppContainer.astro`
- `src/scripts/search-modal.ts` または同等の最小限のclient script
- 必要最小限の既存style / scriptファイル

## レビュー観点

- 検索input / panelのdesktop / mobile visual directionと既存Headerとの接続が、`docs/design/search-modal/` に承認済みdraftとして記録されているか。
- task 44へmobile検索挙動を統合しつつ、Pagefind連携・結果メタデータはtask 45〜46へ明確に残せているか。
- `SearchButton.astro` をdesktopとmobileの共通検索起点として使い、`SearchModal.astro` を共通layoutに配置する想定が妥当か。
- 未接続状態の結果枠の文言・視覚表現を、実検索が動作していると誤認させないものにできるか。
- desktop検索入力欄とその直下の結果panel、mobileのHeader右側 `×` による閉鎖、Esc / close、検索起点へのfocus復帰と、mobileの背景スクロール抑止・overlay排他・Header表示維持をこのissueの完了条件としてよいか。

## 備考

- 現在の `Header.astro` はdesktopの検索入力欄mockと、disabledのmobile検索アイコンを表示している。task 44では前者を入力欄、後者を開く / `×` で閉じる操作へ移行する想定だが、Header全体の再設計は含めない。
- design画像は作成・ユーザー確認済みである。実装後のVisual Review actual screenshotをdesign正本として扱わず、正本化には別途の明示承認を要する。
- `docs/TODO.md` の既存項目はtask 44に直接関係しないため、変更しない。
