# 10-header-footer

## 目的

共通Layout内に仮実装されているHeader / Footerを、再利用可能なComponentとして分離・実装する。

このタスクでは、サイト共通のHeader / Footerを実装し、以下を達成する。

* Headerにサイトタイトルまたはユーザー提供のタイトル画像を表示する
* Headerからトップページへ遷移できるようにする
* Footerにコピーライトを表示する
* FooterにGitHubリポジトリ、X、Discordへのリンクを表示する
* アイコンリンクにアクセシビリティ属性を設定する

## 背景

`docs/plan.md` の Phase 2 では、`10-header-footer` として以下が未完了である。

* designを生成する
* `Header.astro` 作成
* `Footer.astro` 作成
* コピーライトを表示
* GitHub、X、Discordリンク枠をアイコンで表示
* アイコンリンクに `aria-label` を設定

現在の `BaseLayout.astro` にはHeader / Footerのプレースホルダーが直接記述されている。
後続の `11-site-menu`、`12-mobile-menu`、`13-page-toc` と接続しやすくするため、このタスクでHeader / FooterをComponent化する。

## ユーザー提供情報

### タイトル画像

* タイトル画像はユーザーが提供する。
* 現時点では本番用の白文字版タイトル画像が `public/` 配下に配置済みである。
  * `public/title_logo.png`
  * `public/title_logo.webp`
* 比較用の黒文字版タイトル画像は `docs/design/header-footer/` 配下に配置済みである。
  * `docs/design/header-footer/title_logo_black.png`
  * `docs/design/header-footer/title_logo_black.webp`
* 本番Headerでは白文字版の `public/title_logo.webp` を第一候補として使用する。
* PNGはWebP非対応環境向けのfallbackとして `public/title_logo.png` を扱う。
* 実装時は `<picture>` または同等の方法でWebP優先・PNG fallbackを成立させる。
* 画像は元寸法 `1091x198` のまま利用し、Header内ではCSSで表示サイズを制御する。現時点では縮小版画像を追加生成しない。
* 実装者がタイトル画像を生成・検索・推測して追加しない。
* ユーザー提供画像が未配置の場合は、ダミー画像を置かず、テキストタイトル表示を維持する。
* タイトル画像を使用する場合、GitHub Pagesのサブパス公開で壊れないようにパスを扱う。
* 黒文字版 `docs/design/header-footer/title_logo_black.png` / `docs/design/header-footer/title_logo_black.webp` は比較用であり、本番Headerでは使用しない。

### Footerリンク

以下のリンクはユーザー提供値として使用する。

* Discordサーバー招待リンク: `https://discord.gg/drQ8ERFrHK`
* Xアカウント: `https://x.com/neon_underrealm`
* GitHubリポジトリ: `https://github.com/starling888888/neon-underrealm-trpg`

実装者は、上記以外のDiscord / X / GitHubリポジトリURLを推測・生成しない。

## コピーライト

コピーライトの権利者表記は `椋鳥` とする。

表示文言は以下とする。

```text
© 2026 椋鳥
```

## 対象範囲

* `Header.astro` の作成
* `Footer.astro` の作成
* `BaseLayout.astro` からHeader / Footer Componentを利用するよう変更
* Header内のトップページ導線
* Header内のタイトル画像表示枠
* タイトル画像未提供時のテキストタイトル表示
* Desktop Header内の検索入力欄mock表示枠
* Mobile Header内のサイトメニューボタン表示枠
* Mobile Header内の検索ダイアログ表示アイコン枠
* Footer内のコピーライト表示
* Footer内のGitHubリポジトリリンク
* Footer内のXアカウントリンク
* Footer内のDiscordサーバー招待リンク
* アイコンリンクの `aria-label` またはスクリーンリーダー用テキスト
* 外部リンクの `target="_blank"` / `rel="noopener noreferrer"`
* GitHub Pagesサブパス公開への配慮
* 必要に応じたサイトリンク定義ファイルの追加
* 必要に応じたサイトメタ定義ファイルの追加

## 初期スコープ外

* タイトル画像そのものの作成、生成、加工
* Discord / X / GitHubリポジトリURLの追加推測
* 未提供URLへのダミーリンク設置
* 完成版SiteMenuの実装
* MobileMenuの開閉実装
* サイトメニューdrawer本体の実装
* PageTocの実装
* 検索UIの本実装
* Desktop Headerの検索入力欄mockに入力、submit、検索結果表示、focus時dialog表示などの挙動を実装すること
* 検索ダイアログ本体、検索結果表示、検索index生成、検索ロジック
* Footer内のクレジットリンク
* クレジット専用ページ `/credits` の作成
* SNSシェア機能
* OGP画像の個別生成
* 高度なアニメーション
* 外部UIライブラリ追加
* DB、認証、SSR、CMS、APIサーバーの追加

## 完了条件

* [ ] `Header.astro` が作成されている
* [ ] `Footer.astro` が作成されている
* [ ] `BaseLayout.astro` がHeader / Footer Componentを利用している
* [ ] Headerにトップページへのリンクがある
* [ ] Headerはユーザー提供タイトル画像を扱える
* [ ] Headerは `public/title_logo.webp` を本番表示の第一候補として扱っている
* [ ] `public/title_logo.png` がWebP非対応環境向けfallbackとして扱われている
* [ ] タイトル画像はCSSで表示サイズを制御し、不要な縮小版画像を追加生成していない
* [ ] タイトル画像未提供時は、ダミー画像を使わずテキストタイトル表示になる
* [ ] Desktop Headerに検索入力欄mock表示枠がある
* [ ] Desktop Headerの検索入力欄mock表示枠は入力、submit、検索結果表示、検索dialog表示などの挙動を実装していない
* [ ] Mobile Headerにサイトメニューボタン表示枠がある
* [ ] Mobile Headerに検索ダイアログ表示アイコン枠がある
* [ ] Mobile Headerのサイトメニューボタン表示枠はdrawer開閉挙動を実装していない
* [ ] Mobile Headerの検索ダイアログ表示アイコン枠は検索dialog本体や検索処理を実装していない
* [ ] Footerに `© 2026 椋鳥` が表示されている
* [ ] FooterにGitHubリポジトリリンク `https://github.com/starling888888/neon-underrealm-trpg` がある
* [ ] FooterにXアカウントリンク `https://x.com/neon_underrealm` がある
* [ ] FooterにDiscordサーバー招待リンク `https://discord.gg/drQ8ERFrHK` がある
* [ ] Discord / X / GitHubリポジトリURLはユーザー提供値として扱われ、推測値に置き換えられていない
* [ ] アイコンのみのリンクには `aria-label` またはスクリーンリーダー用テキストがある
* [ ] 外部リンクには `target="_blank"` と `rel="noopener noreferrer"` が設定されている
* [ ] GitHub Pagesのサブパス公開で内部リンク・画像パスが壊れない
* [ ] 不要な依存関係を追加していない
* [ ] `npm run build` が通る
* [ ] 必要に応じて `npm run check` が通る

## チェックポイント

* [ ] 既存ルート `/` が壊れていない
* [ ] `Seo.astro` のhead出力と競合していない
* [ ] Header / Footer が後続の `11-site-menu` / `12-mobile-menu` / `13-page-toc` と接続しやすい構造になっている
* [ ] Desktop Headerの検索入力欄mock表示枠が後続の検索UI実装と接続しやすい構造になっている
* [ ] Mobile Headerのサイトメニューボタン表示枠が後続の `12-mobile-menu` と接続しやすい構造になっている
* [ ] Mobile Headerの検索ダイアログ表示アイコン枠が後続の検索UI実装と接続しやすい構造になっている
* [ ] Layout内にHeader / Footerの詳細実装が過剰に残っていない
* [ ] CSSがComponent責務の範囲に収まっている
* [ ] 外部リンクのURLがユーザー提供値どおりである
* [ ] ユーザー提供アセット・URLを前提にしつつ、未提供時に壊れない
* [ ] 黒文字版タイトルロゴを本番Headerで使用していない
* [ ] 初期スコープ外の機能を実装していない
* [ ] 関連する `docs/TODO.md` 項目と矛盾していない
* [ ] 関連する `docs/design/` と矛盾していない

## 想定変更ファイル

* `src/layouts/BaseLayout.astro`
* `src/components/layout/Header.astro`
* `src/components/layout/Footer.astro`
* `src/lib/site/links.ts` または同等のサイトリンク定義ファイル
* `src/lib/site/siteMeta.ts` または同等のサイトメタ定義ファイル
* 必要に応じて `docs/design/header-footer/notes.md`
* 必要に応じて `docs/design/header-footer/design-desktop.png`
* 必要に応じて `docs/design/header-footer/design-mobile.png`

## design参照

* 既存の全体方向性は `docs/design/base-layout/` と `docs/design/global-styles/` を参照する。
* Header / Footer 専用のdesign target `docs/design/header-footer/` は、比較用タイトル画像の配置先として作成済み。
* Header / Footer 専用のdesign画像は、ローカル検証時点では未作成。
* UI実装前に `design-image-generation` initial draft mode を実行し、Header / Footer用のdesign画像を作成・確認する。
* 想定される成果物は以下。
  * `docs/design/header-footer/notes.md`
  * `docs/design/header-footer/design-desktop.png`
  * `docs/design/header-footer/design-mobile.png`

## 実装メモ

### リンク定義

Footerリンクは、Component内に直接ベタ書きするより、後続更新しやすい定義ファイルに分離することが望ましい。

例:

```ts
export const siteLinks = {
  discord: "https://discord.gg/drQ8ERFrHK",
  x: "https://x.com/neon_underrealm",
  github: "https://github.com/starling888888/neon-underrealm-trpg",
} as const;
```

### `aria-label` 案

* GitHub: `GitHubリポジトリを開く`
* X: `Xアカウントを開く`
* Discord: `Discordサーバーに参加する`

### 外部リンク属性

GitHub、X、Discordは外部リンクとして扱い、以下を設定する。

```html
target="_blank"
rel="noopener noreferrer"
```

### 依存追加メモ

* 追加package: `simple-icons`
* 追加理由: FooterのGitHub / X / Discordリンクを文字ラベルではなく、ブランドアイコンとして表示するため。3種のブランドアイコンが同一packageで揃い、SVG pathをAstro Component内で静的に描画できる。
* 代替案: 手書きSVGをComponent内に直接埋め込む、または `GH` / `X` / `DC` の文字ラベルを継続する。
* 初期スコープに必要な理由: このissueの完了条件に「GitHub、X、Discordリンク枠をアイコンで表示」「アイコンリンクにアクセシビリティ属性を設定」が含まれており、Footerリンクを公開サイトの共通部品として成立させるため。

## レビュー観点

* Header / Footer が単なるプレースホルダーではなく、公開サイトの共通部品として成立しているか
* 後続タスクのSiteMenu / MobileMenu / PageToc / 検索UI本体まで先取りしていないか
* Desktop Headerの検索入力欄mock表示枠が、表示枠に留まり、入力挙動・submit・検索結果表示・検索dialog表示を実装していないか
* Mobile Headerのサイトメニューボタン表示枠と検索ダイアログ表示アイコン枠が、表示枠に留まり、開閉挙動や検索UI本体を実装していないか
* タイトル画像をユーザー提供情報として扱い、生成・推測・ダミー配置していないか
* 本番Headerで白文字WebP版を優先し、PNG fallbackが成立しているか
* 元画像をCSSで適切な表示サイズに抑え、不要な縮小版画像を追加していないか
* 黒文字比較版を本番Headerに使っていないか
* 黒文字比較版が `docs/design/header-footer/` の比較用資料に留まり、本番配信アセットとして扱われていないか
* Discord / X / GitHubリポジトリURLがユーザー提供値どおりに扱われているか
* `© 2026 椋鳥` の表記が正しく表示されているか
* アイコンリンクがキーボード操作・スクリーンリーダーで破綻していないか
* GitHub Pagesサブパス公開時のリンク・画像パスが安全か
* 既存のBaseLayoutの視覚方向性を崩していないか

## User Provided Values

* Discordサーバー招待リンク: `https://discord.gg/drQ8ERFrHK`
* Xアカウント: `https://x.com/neon_underrealm`
* GitHubリポジトリ: `https://github.com/starling888888/neon-underrealm-trpg`
* コピーライト権利者: `椋鳥`
* タイトル画像: `public/title_logo.png`, `public/title_logo.webp`
* 本番Header用タイトル画像: `public/title_logo.webp`
* fallback用タイトル画像: `public/title_logo.png`
* 比較用タイトル画像: `docs/design/header-footer/title_logo_black.png`, `docs/design/header-footer/title_logo_black.webp`

## Local Validation Summary

* mode: local repository mode
* branch: `10-header-footer`
* issue: `docs/issue/10-header-footer.md`
* `docs/plan.md`: `10-header-footer` は未完了タスクとして存在する
* `docs/TODO.md`: 直接このissueで回収すべき関連TODOはなし
* `docs/design/base-layout/`: 既存Layout方向性として参照可能
* `docs/design/global-styles/`: 既存style方向性として参照可能
* `docs/design/header-footer/`: 作成済み。比較用黒文字版タイトル画像を配置済み
* Header / Footer design images: 未作成。実装前に `design-image-generation` initial draft mode が必要
* title logo assets: 本番用白文字版は `public/` 配下、比較用黒文字版は `docs/design/header-footer/` 配下に配置済み
* validation commands: `npm run build` / `npm run check` は未実行

このissueはローカル検証済みだが、実装開始には人間レビューと明示承認が必要。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/header-footer/`
- reference desktop: `docs/design/header-footer/design-desktop.png`
- reference mobile: `docs/design/header-footer/design-mobile.png`
- notes: `docs/design/header-footer/notes.md`

### 成果物

- actual desktop: `test-results/visual/actual-desktop.png`
- actual mobile: `test-results/visual/actual-mobile.png`
- report: Playwright output

### レビュー結果

| 領域 | 判定 | 差分 | 対応 |
|---|---|---|---|
| レイアウト | OK | Desktopは左ロゴ・右検索mock、Mobileは左メニュー・中央フルロゴ・右検索アイコンの構成で参照画像と一致。 | 対応不要 |
| 余白 | OK | Desktopの左右余白は実装済みLayoutのtokenに寄せており、参照画像と大きな破綻なし。 | 対応不要 |
| タイポグラフィ | OK | Header内はタイトルロゴ画像を使用し、テキストfallbackは視覚非表示。 | 対応不要 |
| 色 | OK | Header背景、ロゴ白文字、アイコン、検索mockの色味は参照画像と同系統。 | 対応不要 |
| 配置・整列 | OK | Mobileで操作アイコンとロゴがviewport内に収まるよう修正済み。 | `Header.astro` のMobile幅指定を修正 |
| レスポンシブ | OK | 390px幅でHeaderの3要素が横並びで表示される。 | 対応不要 |
| overflow / scroll | OK | 既存本文Layoutの横スクロール幅にHeader配置が引っ張られる問題を修正。本文Layoutの横幅はHeader範囲外。 | `BaseLayout.astro` と `Header.astro` を局所修正 |
| 既存デザインとの整合 | OK | `base-layout` / `global-styles` のHeader色・全体骨格と整合。 | 対応不要 |
| 既存Componentとの整合 | OK | `BaseLayout.astro` からHeader Componentを利用し、詳細実装を分離。 | 対応不要 |
| accessibility basics | OK | ロゴリンクにトップ導線の `aria-label`、mobile buttonに用途の `aria-label` がある。未実装操作は `disabled`。 | 対応不要 |

### 自己修正した項目

- [x] Mobile actualでHeaderが既存本文Layoutの横スクロール幅に引っ張られ、検索アイコンが390px viewport外に出ていたため、`BaseLayout.astro` のmobile `site-shell` と `Header.astro` のmobile幅指定を修正した。

### 人間判断が必要な差分

- Footerと本文Layoutは今回の「ヘッダー確認」対象外。actual screenshotには未実装Footerと既存本文プレースホルダーが含まれる。
- Mobile full-page screenshot自体は既存本文Layoutの横幅を含むため `1360x900` で出力される。Header表示は390px viewport内に収まるが、本文Layoutのmobile最適化は別issue範囲として扱う。

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

## ビジュアルレビュー 2

### デザイン参照

- design target: `docs/design/header-footer/`
- reference desktop: `docs/design/header-footer/design-desktop.png`
- reference mobile: `docs/design/header-footer/design-mobile.png`
- notes: `docs/design/header-footer/notes.md`

### 成果物

- actual desktop: `test-results/visual/actual-desktop.png`
- actual mobile: `test-results/visual/actual-mobile.png`
- report: Playwright output

### レビュー結果

| 領域 | 判定 | 差分 | 対応 |
|---|---|---|---|
| レイアウト | OK | Desktopはコピーライト左、サイト名とブランドアイコンリンク右配置。Mobileはコピーライト、サイト名、リンク群の縦積みで参照画像と一致。 | 対応不要 |
| 余白 | OK | Mobile Footerの初回actualは内容量により正本の120pxより高かった。 | mobile時のpaddingとgapを調整 |
| タイポグラフィ | OK | コピーライト、サイト名、リンク種別ラベルは参照画像と同等のサイズ感。 | 対応不要 |
| 色 | OK | Headerと同じ暗めニュートラルグレー基調で、リンク枠も低彩度。 | 対応不要 |
| 配置・整列 | OK | Desktop / Mobileとも要素の整列とリンクボタン間隔は参照画像と大きな差分なし。 | 対応不要 |
| レスポンシブ | OK | 390px幅でFooter本体がviewport内に収まり、リンク群が詰まりすぎていない。 | 対応不要 |
| overflow / scroll | OK | Footer本体は390px viewport内に収まる。既存本文Layoutの横スクロール幅はFooter実装範囲外。 | 対応不要 |
| 既存デザインとの整合 | OK | `base-layout` / `global-styles` の暗色共通領域と整合。 | 対応不要 |
| 既存Componentとの整合 | OK | `BaseLayout.astro` からFooter Componentを利用し、詳細実装を分離。リンク値は `siteLinks` に分離し、ブランドアイコンは `simple-icons` から参照。 | 対応不要 |
| accessibility basics | OK | アイコン相当のリンクに `aria-label` があり、外部リンクに `target="_blank"` / `rel="noopener noreferrer"` がある。 | 対応不要 |

### 自己修正した項目

- [x] Mobile Footerが正本の `120px` より高く出ていたため、`Footer.astro` のmobile paddingとgapを調整した。
- [x] Footerリンクが文字ラベル表示に留まっていたため、`simple-icons` を追加し、GitHub / X / Discord のブランドSVGアイコン表示へ変更した。

### 人間判断が必要な差分

- Mobile full-page screenshot自体は既存本文Layoutの横幅を含むため `1360x940` で出力される。Footer表示は390px viewport内に収まるが、本文Layoutのmobile最適化は別issue範囲として扱う。
- 今回のcaptureはAstro dev toolbarの重なりを避けるため、`npm run build` 後の `npm run preview` で取得した。
- `docs/design/header-footer/design-*.png` ではリンク種別を `GH` / `X` / `DC` として表現しているが、実装ではユーザー指示に従いブランドアイコンを使用する。

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
