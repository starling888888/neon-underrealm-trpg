# 50-2-layout-scroll-behavior

## 目的

共通レイアウトのスクロール挙動を要件どおりに整え、長い本文でもナビゲーションを利用し続けられるようにする。

## 背景

`/world` を preview で確認した結果、デスクトップでは Header が本文とともに画面外へ移動し、PC 左の SiteMenu と PC 右の PageToc はいずれも独立スクロールできなかった。

また、モバイルでは Header が下スクロールで画面外へ移動するものの、上スクロール時に画面上部へ再表示されなかった。一方で、短い画面高で項目を展開した MobileMenu は内部で独立スクロールでき、本文のスクロール位置は変化しなかった。

関連する要件と参照先は以下。

- `docs/requirements/layout-navigation.md` の FR-01-01（PC Header の固定、モバイル Header の下スクロール非表示・上スクロール再表示、メニュー／目次を開いている間の表示状態固定）
- `docs/requirements/layout-navigation.md` の FR-01-03（PC 左 SiteMenu）と FR-01-05（PC 右 PageToc の固定表示）
- `docs/requirements/non-functional.md` の NFR-03（desktop / tablet / mobile のレイアウト切替）
- `docs/plan.md` の `50-responsive-pass`。本 issue はそのうち Header と desktop のレールスクロール挙動だけを扱う子タスクとする。
- `docs/design/site-layout/` を横断レイアウトの正本、`docs/design/header-footer/`、`docs/design/site-menu/`、`docs/design/page-toc/`、`docs/design/mobile-menu/`、`docs/design/mobile-page-toc/` を関連 design target とする。

既存の design target には desktop / mobile の必要な design 画像がある。今回追加するのはスクロール状態の実装であり、ユーザー指定と上記要件で挙動を確定できるため、`design-image-generation` は前提にしない。

## 対象範囲

- デスクトップおよびタブレット（`768px` 以上）で Header を画面上部に固定し、本文スクロールで画面外へ移動しないようにする。`768px` 以上では現行 Header が desktop 形式で表示されるため、PC Header 固定の要件を適用する。
- デスクトップで、固定 Header の下にある SiteMenu と PageToc をそれぞれ独立した縦スクロール領域にする。長いメニューまたは目次を展開しても、本文と他方のレールを伸長させない。
- モバイル（`768px` 未満）で、本文を下へスクロールしている間は Header を隠し、上へスクロールすると Header を画面上部に再表示する。ページ最上部では Header を表示する。
- モバイルでサイトメニューまたは MobilePageToc を開くとき、Header が隠れていれば表示へ戻し、開いている間は表示状態を維持する。
- 固定または再表示した Header によって、ページ内アンカーの移動先、および `1024px` 未満で表示する sticky heading と MobilePageToc trigger が隠れないようにする。
- モバイル SiteMenu の既存の内部スクロール、MobilePageToc の開閉と本文内 sticky heading を回帰させない。
- 実装に対応するブラウザ検証を追加または更新し、desktop / mobile の対象挙動を確認する。

## 初期スコープ外

- Header / Footer の色、ロゴ、寸法、検索 UI の再設計
- SiteMenu の項目構造、順序、現在地ハイライト、disclosure 仕様の変更
- PageToc の見出し抽出、アンカー ID、現在位置ハイライトの変更
- MobileMenu / MobilePageToc の UI 再設計、検索 UI の実装
- スクロール連動の装飾的アニメーション、外部 UI ライブラリ、新規 npm package の追加
- `docs/TODO.md` の表レイアウト対策、および `50-1-vrt-css-regression-guards` の VRT 導入
- 初期スコープ外の機能は `docs/out-of-scope.md` に従う

## 完了条件

- [x] `768px` 以上で Header が固定され、本文をスクロールしても画面外へ移動しない。
- [x] デスクトップで SiteMenu が Header 下の利用可能な高さに収まり、展開時も内部だけを縦スクロールできる。
- [x] デスクトップで PageToc が Header 下の利用可能な高さに収まり、長い目次を内部だけで縦スクロールできる。
- [x] モバイルで下スクロール時に Header が隠れ、上スクロール時とページ最上部で Header が画面上部に表示される。
- [x] モバイルでサイトメニューまたはページ内目次を開くと、Header が表示され、閉じるまでその状態を維持する。
- [x] desktop の PageToc と `1024px` 未満の MobilePageToc のリンクで移動した見出し、同じ幅の sticky heading と目次 trigger が Header に隠れない。
- [x] モバイルの SiteMenu は短い画面高・全階層展開時にも内部スクロールでき、本文はスクロールしない。
- [x] MobilePageToc の開閉と sticky heading、既存ルートの PageToc 表示／非表示を回帰させない。
- [x] GitHub Pages のサブパス配下で既存のナビゲーションリンクとページ内アンカーが壊れない。
- [x] 不要な依存関係を追加していない。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [x] `1024px` 以上、`768px` 以上 `1024px` 未満、`768px` 未満で Header とレイアウトの表示対象が要件どおりである。
- [x] desktop で Header、SiteMenu、PageToc の固定／独立スクロールが本文と干渉しない。
- [x] desktop で SiteMenu の展開操作と PageToc リンクが利用できる。
- [x] mobile で Header の下スクロール非表示・上スクロール再表示、メニュー／目次を開く際の表示復帰をブラウザで確認する。
- [x] desktop、`768px` 以上 `1024px` 未満、`768px` 未満のページ内アンカー移動で、移動先の見出しと該当する sticky heading / MobilePageToc trigger が Header に隠れない。
- [x] mobile で MobileMenu と MobilePageToc の開閉時に本文の意図しないスクロールや表示崩れがない。
- [x] 既存ルートが壊れていない。
- [x] GitHub Pages のサブパス公開に影響しない。
- [x] 初期スコープ外の機能を実装していない。
- [x] 関連する `docs/TODO.md` 項目と矛盾していない。
- [x] 関連する `docs/design/` と矛盾していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/components/layout/Header.astro`
- `src/layouts/AppContainer.astro`
- `src/layouts/TocPageLayout.astro`
- `src/components/layout/SiteMenu.astro`
- `src/components/layout/PageToc.astro`
- `src/scripts/` 配下の Header スクロール制御（必要な場合）
- `tests/visual/site-layout.spec.ts`
- `tests/visual/world.spec.ts`
- 必要最小限の関連スタイルまたはテスト補助ファイル

## レビュー観点

- `768px` 以上では Header が固定され、その下で左右のレールだけが独立スクロールするか。
- モバイルでは Header が下スクロールで隠れ、上スクロール時またはメニュー／目次を開く時に不自然なちらつきなく画面上部へ戻るか。
- PageToc / MobilePageToc のアンカー移動先と、`1024px` 未満の sticky heading が Header に隠れないか。
- サイトメニューを全階層展開した状態でも、desktop の本文や右 PageToc、mobile の本文スクロールを阻害しないか。
- `docs/design/site-layout/` の 3 カラム構造、暗め Header、MobileMenu と MobilePageToc の役割差を保てているか。
- `50-responsive-pass` の残る responsive 確認、表レイアウト対策、`50-1-vrt-css-regression-guards` をこの issue に広げていないか。

## 備考

- 関連 TODO の「表全体が初期表示で収まらない場合のレイアウト対策」は同じ `50-responsive-pass` に紐づくが、本 issue の対象外として残す。
- 「VRT実装時に、mobile layout / MobilePageToc のCSS回帰検知を追加する」は `50-1-vrt-css-regression-guards` で扱うため、本 issue ではスクロール挙動を確認するテストに限定する。
- issue 作成時点の作業ツリーには `public/images/data/` 配下の未追跡画像がある。今回の task では変更・削除・stage しない。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/site-layout/`
- reference desktop: `docs/design/site-layout/design-desktop.png`
- reference mobile: `docs/design/site-layout/design-mobile.png`、`design-mobile-menu-open.png`、`design-mobile-page-toc-open.png`
- notes: 3カラムのレール背景、暗め Header、MobileMenu と MobilePageToc の役割差を維持する。

### 成果物

- actual desktop: `test-results/visual/site-layout-desktop.png`、`world-desktop.png`
- actual mobile: `test-results/visual/site-layout-mobile.png`、`site-layout-mobile-menu-open.png`、`site-layout-mobile-page-toc-open.png`、`world-mobile.png`
- report: `test-results/visual/capture-manifest.json`

### レビュー結果

| 領域                  | 判定 | 差分                                           | 対応                                                   |
| --------------------- | ---- | ---------------------------------------------- | ------------------------------------------------------ |
| レイアウト            | OK   | 3カラム背景を維持                              | レール本体ではなく内部ナビゲーションを独立スクロール化 |
| 余白                  | OK   | Header 下の配置を維持                          | `--site-header-height` を共通利用                      |
| タイポグラフィ        | OK   | 変更なし                                       | 変更なし                                               |
| 色                    | OK   | 変更なし                                       | 変更なし                                               |
| 配置・整列            | OK   | 固定 Header と sticky heading が競合しない     | sticky heading の top を Header 高さに合わせた         |
| レスポンシブ          | OK   | 768px 以上は固定 Header、768px 未満は方向連動  | browser testで確認                                     |
| overflow / scroll     | OK   | desktop の SiteMenu / PageToc が独立スクロール | 展開状態を含む browser testで確認                      |
| 既存デザインとの整合  | OK   | 左右レール背景を本文末尾まで維持               | visual review中に自己修正                              |
| 既存Componentとの整合 | OK   | MobileMenu / MobilePageToc の開閉を維持        | overlay状態イベントで Header 表示を同期                |
| accessibility basics  | OK   | アンカー先が固定 Header に隠れない             | `scroll-padding-top` と browser確認                    |

### 自己修正した項目

- [x] 独立スクロールで左右レール背景が viewport 高で終わる差分を、内部ナビゲーションの sticky / overflow 化で修正した。
- [x] `1024px` 未満の目次アンカーが sticky H1 エリアに隠れる差分を、H1 実測高を含む scroll padding と tablet / mobile の自動テストで修正した。
- [x] 上スクロール時に Header と sticky H1 エリアの間へ一瞬の隙間が出る差分を、両者の 180ms transition 同期と途中時点の自動テストで修正した。

### 人間判断が必要な差分

- なし。

### design-image-generation への引き継ぎ候補

- [ ] 実装スクリーンショットをdesign正本化する必要がある場合は、design fix modeへ引き継ぐ

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 1

### 指摘事項

- mobile／tablet では目次リンクの移動先が固定 Header には隠れないが、本文上部に固定される H1 エリアに隠れる。

### 判定

- source: human
- classification: valid
- local validation: tablet で PageToc のアンカー先が Header 下端と同じ位置になり、sticky H1 エリアと重なることを確認した。`1024px` 未満の scroll padding が Header 高さだけを考慮していた。

### 対応方針

- `ResizeObserver` で sticky H1 エリアの実測高さを取得し、`1024px` 未満の scroll padding に Header 高さ、H1 高さ、最小余白を加える。
- tablet／mobile の目次リンク後、移動先の見出しが sticky H1 エリアの下にあることを Visual Test で確認する。

### 対応完了チェックリスト

- [x] sticky H1 エリアの実測高さを scroll padding に反映した。
- [x] tablet／mobile の目次アンカーが sticky H1 エリアに隠れない Visual Test を追加した。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 2

### 指摘事項

- モバイルで Header が隠れている状態から上スクロールした直後、sticky H1 エリアと Header の間に一瞬のスペースが表れる。

### 判定

- source: human
- classification: valid
- local validation: 実ブラウザで上スクロール直後に最大 64px の隙間を確認した。Header の `transform` と sticky H1 エリアの `top` の遷移タイミングが異なることが原因だった。

### 対応方針

- Header と sticky H1 エリアを同じ `180ms ease` で遷移させる。
- 上スクロール開始から 40ms 時点で両者の隙間が 1px 以下であることを Visual Test に追加する。

### 対応完了チェックリスト

- [x] Header と sticky H1 エリアの遷移を同期した。
- [x] 上スクロール途中の隙間を検証する Visual Test を追加した。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。
