# header-footer

## モード

- initial draft

## 対象

- page / component: `Header.astro` / `Footer.astro`
- route: 共通Layout Component。最初の適用先は `BaseLayout.astro`
- viewport: desktop `1440x1200`, mobile `390x900`
- states: Header標準状態、Desktop Headerの検索入力欄mock配置、タイトルロゴ未使用時のテキストfallback、mobile Headerの左右アイコン枠配置、Footer標準状態、Footer外部リンクfocus / hover。

## 参照したSSoT

- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/issue/10-header-footer.md`
- `docs/design/global-styles/notes.md`
- `docs/design/base-layout/notes.md`
- `docs/design/header-footer/title_logo_black.png`
- `docs/design/header-footer/title_logo_black.webp`
- `public/title_logo.png`
- `public/title_logo.webp`

## デザイン方針

- visual direction: `base-layout` の暗めニュートラルグレーHeaderを維持しつつ、プレースホルダーのタイトル表現をユーザー提供の白文字タイトルロゴへ置き換える。Headerはコンパクトなルールサイトのmastheadとして扱い、landing page heroのように大きくしない。
- layout direction: Desktop Headerは左側にトップページへ戻るロゴリンク、右側に検索入力欄mockを配置する。Mobile Headerは左にmenu系アイコン枠、中央にフルロゴ、右にsearch系アイコン枠を配置する。
- typography direction: 画像ロゴを主要なタイトル表現とする。画像を使えない場合のfallback textは既存のsystem font、太めのweight、letter-spacing 0を使う。
- color / accent usage: Header背景は暗めニュートラルグレーを維持する。accent colorはfocus ring、控えめなhover、リンクの小さな状態表現に限定する。magenta、強い発光、大きなneon演出は使わない。
- footer visual direction: FooterもHeaderと同じ暗めニュートラルグレーを基調にし、ページ全体の下端を静かに締める。装飾的なhero footerや大きなCTA領域にはしない。
- footer layout direction: Desktop Footerはコピーライトを左側、クレジット / GitHub / X / Discordのアイコンリンク群を右側に置く。Mobile Footerは縦方向に積み、コピーライトとリンク群が狭い幅で折り返しても読めるようにする。
- footer typography direction: コピーライトは小さめだが読めるサイズにし、リンクの可視ラベルは必要最小限にする。アイコンのみのリンクは実装側で `aria-label` またはスクリーンリーダー用テキストを持つ。
- footer color / accent usage: Footerの通常状態は低彩度に抑え、hover / focusだけ青緑accentを使う。アイコンリンクは白寄りまたは薄いグレーで、本文面より目立ちすぎない。

## 既存デザイン制約

- `global-styles` の方向性を維持する。白寄りの本文面、暗めグレーHeader、控えめな青緑accent、ルール参照に耐える実務的な密度を守る。
- `base-layout` の前提を維持する。Header / Footerは共通Layout領域であり、Componentへ置き換えやすい単純な構造にする。
- Headerの本番表示では、ユーザー提供の白文字ロゴを使う。
  - primary: `public/title_logo.webp`
  - fallback: `public/title_logo.png`
- 元画像寸法は `1091x198`。このタスクでは縮小版画像を追加生成しない。表示サイズはCSSで制御する。
- 本番ロゴは暗めHeader上で読める必要がある。ただしHeaderをhero風の大きな帯にしない。
- `docs/design/header-footer/` 配下の黒文字ロゴは比較用であり、本番Header用assetではない。
- Headerのトップページリンクは、支援技術とキーボード操作で意味が伝わる必要がある。見た目は画像ロゴでもよいが、`alt` または同等のaccessible textでサイト名を保持する。
- Desktop Header画像では、右側に検索入力欄mockがある状態を示す。この実装責務は `docs/issue/10-header-footer.md` に従う。
- Mobile Header画像では、左右に後続導線用のアイコン枠がある状態を示す。これらの実装責務は `docs/issue/10-header-footer.md` に従う。
- 生成画像では、Desktop Header高さを `88px`、Desktopロゴ表示高さを `48px` とする。
- 生成画像では、Mobile Header高さを `64px`、Mobileロゴ表示高さを `30px` とする。
- Mobile Headerではフルロゴを維持する。狭い幅でも、初期draftではテキストfallbackへ切り替えない。
- FooterはHeaderと同じ `docs/design/header-footer/` targetで扱う。desktop / mobileの両方でFooter画像を作成する前提とする。
- Footerには `© 2026 椋鳥`、クレジット、GitHub、X、Discordのリンク枠を含める。
- FooterのGitHub / X / Discordは外部リンクとして扱う。design画像ではリンク先文字列を長く描かず、アイコンまたは短い代表表示で示す。
- クレジットリンクは内部リンクとして扱う。design画像では他の外部リンクと混同しない控えめなテキストリンクまたはアイコン+短いラベルで示す。
- Mobile Footer画像では、リンク群を1行に詰め込みすぎず、必要なら2段に分ける。タップ対象は窮屈にしない。

## スコープ外

- 完成版PC `SiteMenu`
- Mobile menu drawer、開閉状態、hamburger button挙動
- Search dialog本体、検索結果表示、検索index生成、検索ロジック
- Page table of contents
- Breadcrumbs
- Previous / next navigation
- Current-position TOC highlighting
- FooterからのSNS share機能
- Footerからの投稿、コメント、問い合わせフォーム、外部サービス連携
- Footerの大きなCTA、newsletter登録、analytics表示
- Login、CMS、comments、character sheet tools、dice roller、battle simulator、DB、SSR、API-backed behavior
- 新しいlogo生成、title image加工、追加の縮小logo derivative
- Global color systemの置き換えや、新しいvisual themeの導入

## 実装時の比較観点

- Headerが暗めニュートラルグレー上に白文字の本番ロゴを表示している。
- ロゴがトップページへのリンクになっており、GitHub Pagesのsubpath公開で壊れないURL処理になっている。
- Desktop Header右側に検索入力欄mockがあり、ロゴと重ならない。
- WebPを優先し、PNG fallbackが残っている。
- ロゴ表示サイズがCSSで制御され、Headerがhero風の大きな帯になっていない。
- 画像が使えない場合でも、fallback textでサイト名が分かる。
- Desktop Headerに完成版site navigation、検索結果UI、breadcrumbs、page TOCを含めていない。
- Mobile Headerには左右のアイコン枠を表示しているが、menu drawer、検索dialog本体、検索結果UIは表示していない。
- Mobile Headerでフルロゴが中央に収まり、左右のbuttonと重ならない。
- focus / hover状態が見えるが、青緑accent方針に沿って控えめである。
- 黒文字比較ロゴは `docs/design/header-footer/` に留まり、本番assetとして参照されていない。
- Footerに `© 2026 椋鳥` が表示される。
- Footerにクレジット / GitHub / X / Discordのリンク枠がある。
- FooterのGitHub / X / Discordは外部リンクとして見えるが、投稿・share・ログインなどの追加機能に見えない。
- Desktop Footerではコピーライトとリンク群が水平配置で整理され、本文領域や右左レールと視覚的に競合しない。
- Mobile Footerではコピーライトとリンク群が縦方向に読みやすく、タップ対象が詰まりすぎない。

## 生成元

- generator or capture source: ImageMagickで一時PNGを合成し、`public/title_logo.webp` を配置した。
- source branch / commit when applicable: `10-header-footer`
- route when applicable: `/` を含む共通Layout route
- viewport: desktop `1440x1200`, mobile `390x900`
- header / logo sizes: desktop Header `88px`, desktop logo `48px`; mobile Header `64px`, mobile logo `30px`
- footer sizes: desktop Footer `80px`; mobile Footer `120px`
- prompt summary or capture notes: Header / Footer design targetの初期draft画像を生成した。Headerのロゴ利用、WebP優先とPNG fallback、CSSによる表示サイズ制御、Desktop Headerの検索入力欄mock配置、mobile Headerの左右アイコン枠配置を視覚条件として定義した。検索入力欄mockとアイコン枠の実装責務は `docs/issue/10-header-footer.md` に置く。Footerについてはdesktop / mobile両方の画像に、コピーライトとリンク群の配置を反映した。

## 決定事項

- Desktop Headerの高さは `88px` とし、Desktopロゴ表示高さは `48px` とする。
- Desktop Headerの右側には検索入力欄mockを置く。具体的な実装責務は `docs/issue/10-header-footer.md` に従う。
- Mobile Headerの高さは `64px` とし、Mobileロゴ表示高さは `30px` とする。
- Mobile Headerではフルロゴを維持する。
- Mobile Headerの左側にはmenu系アイコン枠、右側にはsearch系アイコン枠を置く。具体的な実装責務は `docs/issue/10-header-footer.md` に従う。
- Header / Footerは同じ `docs/design/header-footer/` targetで扱う。
- Footer画像はdesktop / mobileの両方を作成する。
- Footerは暗めニュートラルグレー基調とし、コピーライトとクレジット / GitHub / X / Discordリンク枠を含める。
- Desktop Footer高さは `80px` とする。
- Mobile Footer高さは `120px` とする。
- Desktop Footerはコピーライト左、リンク群右を基本とする。
- Mobile Footerはコピーライトとリンク群を縦積みにし、リンク群は必要に応じて2段に分ける。
