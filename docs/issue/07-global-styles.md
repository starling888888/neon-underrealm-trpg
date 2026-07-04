# 07-global-styles

## 目的

サイト全体で共通利用するCSS基盤を追加し、以後のLayout、ナビゲーション、本文ページ、データ表示Componentが一貫した文字組み・余白・色を使える状態にする。

## 背景

Phase 1のAstro基盤として、MDX本文や後続Componentを実装する前に、CSS variablesによる基本トークン、サイト全体のリセット・ベーススタイル、Markdown / MDX本文向けのproseスタイルを分離して用意する必要がある。

関連する要件は以下を参照する。

- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/design/global-styles/notes.md`
- `docs/design/global-styles/style-tile.png`
- `docs/design/global-styles/style-tile-mobile.png`

`docs/design/global-styles/` 配下のstyle tile画像とnotesを、色、文字、余白、本文密度を決めるための参照資料として使う。これらは完成デザインを固定するものではなく、07で実装するCSS基盤の初期基準として扱う。

## 対象範囲

- `src/styles/tokens.css`
- `src/styles/global.css`
- `src/styles/prose.css`
- `docs/design/global-styles/notes.md` とstyle tile画像を参照した色・文字・余白・本文密度の反映
- 必要に応じた既存ページまたはエントリからのCSS読み込み設定
- 必要に応じた既存サンプルページの最小調整

## 初期スコープ外

- Header / Footer / SiteMenu / MobileMenu / PageToc などのレイアウト部品を実装しない
- `BaseLayout.astro` や `ContentLayout.astro` を新規作成しない
- SEO / OGP Componentを実装しない
- トップページの完成デザインを作り込まない
- データ表示カード、一覧、凡例Componentを実装しない
- 検索機能、Pagefind連携、検索UIを実装しない
- 高度なアニメーションを追加しない
- 機械的な画像diff、ピクセル差分取得、差分スコア算出は行わない
- 大規模UIライブラリを追加しない
- DB、認証、SSR、CMS、常駐サーバーを追加しない
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う

## 完了条件

- [ ] `src/styles/tokens.css` が作成され、色、文字、余白、枠線、本文幅などの基本CSS variablesが定義されている
- [ ] `src/styles/global.css` が作成され、全体のbox sizing、body、リンク、画像、フォーカス表示などの基本スタイルが定義されている
- [ ] `src/styles/prose.css` が作成され、Markdown / MDX本文向けの見出し、段落、リスト、引用、コード、表などの基本スタイルが定義されている
- [ ] `docs/design/global-styles/style-tile.png` と `style-tile-mobile.png` を参照し、白寄り背景、暗めグレーヘッダー、青緑系アクセント、本文可読性の方向性がCSS variablesと基本スタイルに反映されている
- [ ] Visual Reviewを行う場合は、Playwrightスクリーンショット取得と目視比較に留め、機械的な画像diffは行わない
- [ ] 既存ページで共通CSSが読み込まれ、`npm run build` 時にスタイルファイルが解決できる
- [ ] GitHub Pagesのサブパス公開を壊すパス指定を追加していない
- [ ] 不要なnpm packageを追加していない
- [ ] `npm run build` が通る
- [ ] `npm run check` が通る

## チェックポイント

- [ ] 既存ルートが壊れていない
- [ ] GitHub Pagesのサブパス公開に影響しない
- [ ] 不要な依存関係を追加していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] ユーザーの未コミット変更を破壊していない
- [ ] 後続のLayout / Componentタスクで再利用しやすいCSS構成になっている
- [ ] proseスタイルが通常のMDX本文に適用しやすい粒度になっている
- [ ] design notesの方針に反して、黒背景基調、過剰な発光、マゼンタ主体、紫・青紫だけに寄った配色になっていない

## 想定変更ファイル

- `src/styles/tokens.css`
- `src/styles/global.css`
- `src/styles/prose.css`
- `src/pages/index.astro`
- `src/pages/mdx-test.mdx`
- `docs/design/global-styles/notes.md` は参照のみで、原則変更しない
- `docs/design/global-styles/style-tile.png` は参照のみで、原則変更しない
- `docs/design/global-styles/style-tile-mobile.png` は参照のみで、原則変更しない

## レビュー観点

CSS基盤の粒度が、後続タスクで使い回しやすく、今回のタスクとして広すぎないかを確認する。

色・余白・文字サイズのトークンが、ルール本文を読みやすくするための最低限に留まっているかを確認する。

`global.css` と `prose.css` の責務が混ざりすぎていないかを確認する。

`docs/design/global-styles/` のstyle tile画像とnotesに対して、色、文字サイズ、余白、本文密度の方向性が大きく外れていないかを確認する。

## 備考

このタスクはCSS基盤の追加に限定する。具体的なページレイアウト、ヘッダー、サイドメニュー、ページ内目次、データカードUIは後続タスクで扱う。

新しいnpm packageの追加は想定しない。必要に見える場合は、このissueに理由・代替案・初期スコープに必要な理由を追記してから確認する。

既存の `docs/design/global-styles/style-tile.png` と `docs/design/global-styles/style-tile-mobile.png` は、実装時の参照資料として扱う。画像自体の差し替えや追加生成はこのタスクの対象外とする。

今回のVisual Reviewは、Playwrightで実装後のdesktop / mobileスクリーンショットを取得し、`docs/design/global-styles/` の参照資料と目視比較するところまでを想定する。ピクセル単位の画像diff、差分スコア、しきい値判定は行わない。
