# 41-2-support-page

## 目的

オンラインセッションの準備と運用方法を案内するサポートページ `/support` を静的ページとして追加する。多数のダイスを使う本作でオンラインセッションを選べるようにし、CCFOLIAを設定例として示すが、特定ツールの利用を必須にしない。

## 背景

`docs/plan.md` の `41-2-support-page` と `docs/TODO.md` の「`/support` のオンラインセッションサポートページを作成する」を回収する。ページ本文・可視構成は、ユーザー提供の `.raw/contents/support.md` を最優先の正本とする。

関連する参照先は以下とする。

- `docs/requirements/pages.md` の `/support` 要件
- `docs/requirements/layout-navigation.md` の共通FooterとPageToc要件
- `docs/requirements/assets-seo.md` の静的assetとGitHub Pagesサブパス要件
- `docs/out-of-scope.md` のダイスローラー、戦闘支援、投稿機能などの初期スコープ外
- `docs/design/site-layout/`、`docs/design/page-toc/`、`docs/design/mobile-page-toc/`、`docs/design/callout/` の既存共通design
- `docs/design/page-navigation-links/notes.md` の `/support` に前後ナビゲーションを追加しない方針

`docs/design/support/` は存在しないが、ユーザー指示により `design-image-generation` のinitial draftは作成しない。実装後のVisual Reviewでは既存共通designを比較対象とし、actual screenshotをユーザー承認なしにdesign正本へ転記しない。

`.raw/contents/support.md` のCCFOLIAに関する見出し・コマンド例は、特定ツールを必須化する文言ではなく、オンラインツールでの設定例として実装する。これは「特定のオンラインセッションツールを必須にしない」というplan・ページ要件と矛盾しない。

## 対象範囲

- `src/pages/support.mdx` を追加し、frontmatterのtitle、description、`showPageToc: true`を反映する。既存のMDX Layout、SiteMenu、PageToc、MobilePageToc、Footerを利用する。
- `src/lib/site/menu.ts` に既存形式の「サポート」項目を、`キャラクター成長` の直後かつ `更新履歴` の直前に追加し、PC・mobileのSiteMenuから `/support` へ到達でき、現在地表示が機能するようにする。
- `.raw/contents/support.md` の本文・HTMLコメントをもとに、オンラインセッション推奨、キャラクター登録項目、判定・ダメージロールのコマンド例、9×9戦闘マップの使い方、お問い合わせ先を配置する。
- 判定・ダメージロールの具体例は、読みやすい既存の `Callout` を使って表示する。CalloutのtitleをPageTocの見出しに混入させない。
- ユーザー提供の未追跡asset `public/images/battle-map.png` へのリンクを配置する。公開時は `public/` をURLに含めず、GitHub Pagesのbase path配下でも、別タブで正しく開けるURLを用いる。
- お問い合わせでは、Footerと同じ `siteLinks` のDiscord、公式X、GitHubリポジトリを再利用し、作者Xへの外部リンクも配置する。外部リンクは既存Footerと同じく別タブ・`rel="noopener noreferrer"`で開く。
- `/support` をVisual Review設定・testへ追加し、desktop・mobileのactual screenshotを取得する。既存共通designと比較して、本文、Callout、PageToc、MobilePageToc、マップリンク、SiteMenuに横overflowや可読性低下がないことを確認し、結果をcurrent issueへ記録する。
- このissueの実装中に確認した完了条件・チェックポイントだけを更新する。

## 初期スコープ外

- Web上のダイスローラー、達成値・効果値・気合獲得の自動計算、戦闘支援、マップ操作、キャラクター登録フォームを実装しない。
- CCFOLIAまたはほかの特定オンラインセッションツールを必須化しない。外部サービスとのAPI連携、ログイン、保存、投稿、CMSも実装しない。
- 戦闘ルール、キャラクター作成ルール、既存のFooterリンク定義、SiteMenuの再設計・階層変更、共通Calloutの仕様をこのページ都合で変更しない。
- `/support` のページ下部の前後ナビゲーション、hero画像、ページ固有design draft、仮画像、画像生成promptを追加しない。
- 新規npm package、Excel / JSON変換、検索、DB、認証、SSR、API、Google Driveへの書き込みを追加しない。
- `docs/plan.md` のチェックボックスを更新しない。初期スコープ外の項目は `docs/out-of-scope.md` に従う。

## 完了条件

- [x] `src/pages/support.mdx` が静的な `/support` ページとして生成され、title、description、`showPageToc: true`を設定している。
- [x] `src/lib/site/menu.ts` の「キャラクター成長」の直後かつ「更新履歴」の直前に「サポート」項目があり、desktop・mobileのSiteMenuから `/support` へ到達でき、現在地表示が機能する。
- [x] `.raw/contents/support.md` のfrontmatter、Markdown本文、HTMLコメント指示を、公開URLのbase path対応を除いて漏れなく反映している。
- [x] 多数のダイスを使うためオンラインセッションを推奨し、行動値、体力、精神力、気合、縁、使用済み覚悟数、バッドトリップ、毒、出血の9項目をキャラクター登録項目として表示している。
- [x] 判定の`nB10<=m`とダメージロールの`nd6+m`について、各記号の意味、CCFOLIAのコマンド・出力例、達成値・効果値・気合獲得・ダメージの説明を表示している。
- [x] CCFOLIAを設定例として扱い、特定ツールの利用を必須化していない。
- [x] 9×9戦闘マップの前景設定、縦横40、コマサイズ3を表示し、`public/images/battle-map.png` がGitHub Pagesのサブパス公開でも別タブで正しく開く。
- [x] ルール質問・プレイ希望・今後の展開と、サイトのバグ報告・機能要望の各問い合わせ用途に対応したDiscord、公式X、作者X、GitHubの導線を表示し、外部リンクの安全な別タブ表示を維持している。
- [x] ダイスローラー、戦闘支援、マップ操作、キャラクター登録フォームを実装していない。
- [x] support用Visual Review testを追加し、desktop・mobileのactual screenshotを取得して既存共通designと比較し、結果をcurrent issueへ記録している。
- [x] Visual Reviewの結果を、ユーザー承認なしにdesign正本へコピーしていない。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [x] 既存ルート、SiteMenu、PageToc、MobilePageToc、Footer、共通Calloutを壊していない。
- [x] desktop・mobileのSiteMenuで「サポート」が「キャラクター成長」の下かつ「更新履歴」の上に表示され、現在地表示を維持している。
- [x] 内部assetリンクがGitHub Pagesのサブパス公開で壊れず、`/public/images/...` を公開URLとして使用していない。
- [x] PageTocとMobilePageTocに不要なCallout titleを見出しとして含めていない。
- [x] desktop / mobileで本文、コード例、Callout、マップリンクに横overflowや可読性の低下がない。
- [x] 不要な依存関係を追加していない。
- [x] 関連TODOをこのissueで回収し、TODOの「特定ツールを必須にしない」「ダイスローラー・戦闘支援を作らない」方針と矛盾していない。
- [x] `docs/design/site-layout/`、`docs/design/page-toc/`、`docs/design/mobile-page-toc/`、`docs/design/callout/`、`docs/design/page-navigation-links/`の既存制約と矛盾していない。
- [x] ユーザーの未コミット変更である `public/images/battle-map.png` を破壊していない。

## 想定変更ファイル

- `docs/issue/41-2-support-page.md`
- `src/pages/support.mdx`
- `src/lib/site/menu.ts`
- `public/images/battle-map.png`（ユーザー提供の未追跡asset。issue準備では変更しない）
- `tests/visual/` 配下のsupport用Visual Review test
- 必要に応じてVisual Review用のtest設定

## レビュー観点

- `.raw/contents/support.md` の9項目の登録値、具体的なCCFOLIA例、マップ設定値、問い合わせ用途を保ちつつ、特定ツールの必須化を避けられているか。
- オンラインセッション準備、キャラクター登録、ダイスコマンド、マップ、問い合わせの順序が、初めてオンラインで遊ぶPLにとって理解しやすいか。
- 9×9戦闘マップへのリンクがGitHub Pagesのサブパスで正しく機能し、assetの公開URLに`public/`を含めない方針が明確か。
- SiteMenuに既存形式の「サポート」項目を「キャラクター成長」の下かつ「更新履歴」の上へ追加する最小範囲で、PC・mobileの到達性と現在地表示を満たせるか。
- `/support` のページ下部に前後ナビゲーションを追加しない境界が明確か。
- desktop・mobileのactual screenshotと既存共通designを比較してVisual Reviewを記録する方針、およびdesign initial draftを作成しないユーザー指示が明確か。
- 関連TODOをこのissueで回収する範囲が妥当か。

## 備考

`.raw/contents/support.md` はGit管理外のローカル作業入力である。Google Driveへの同期は `raw-to-drive-sync` の明示指示があるまで実行しない。

`public/images/battle-map.png` はissue準備開始時点で存在したユーザー提供の未追跡assetである。issue準備では追加・変更・削除せず、実装後にユーザーがcommitを明示指示した場合だけ対象差分を確認してGitへ追加する。

ユーザー指示により、`design-image-generation` のinitial draftは不要とする。Visual Review screenshotは実装結果であり、ユーザー確認なしに `docs/design/` の正本へ転記しない。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/site-layout/`、`docs/design/page-toc/`、`docs/design/mobile-page-toc/`、`docs/design/callout/`、`docs/design/page-navigation-links/`
- reference desktop: `docs/design/site-layout/design-desktop.png`、`docs/design/page-toc/design-desktop-visible.png`
- reference mobile: `docs/design/site-layout/design-mobile.png`、`docs/design/mobile-page-toc/design-mobile-closed.png`
- notes: ユーザー指示により、ページ固有のinitial design draftは作成していない。既存の本文レイアウト、SiteMenu、PageToc、MobilePageToc、Calloutを比較対象とした。

### 成果物

- actual desktop: `test-results/visual/support-desktop.png`
- actual mobile: `test-results/visual/support-mobile.png`
- report: `test-results/visual/capture-manifest.json`、`tests/visual/support.spec.ts`

### レビュー結果

| 領域                  | 判定 | 差分                                                                                      | 対応 |
| --------------------- | ---- | ----------------------------------------------------------------------------------------- | ---- |
| レイアウト            | OK   | 既存の3カラム本文layout内に収まり、desktopでは左右のSiteMenuとPageTocが本文を圧迫しない。 | 不要 |
| 余白                  | OK   | 見出し、リスト、Callout、問い合わせの間隔は既存本文ページと整合する。                     | 不要 |
| タイポグラフィ        | OK   | H2からH4、コード例、リンクの読み順を維持する。                                            | 不要 |
| 色                    | OK   | 既存の青緑リンクとexample Calloutを利用し、追加の強い装飾を加えていない。                 | 不要 |
| 配置・整列            | OK   | SiteMenuの「サポート」は「キャラクター成長」の下・「更新履歴」の上に表示される。          | 不要 |
| レスポンシブ          | OK   | 390px mobileでMobilePageToc、本文、Callout、Footerが成立する。                            | 不要 |
| overflow / scroll     | OK   | ページ全体の横overflowはない。長いコマンドは既存のコードブロック内で横スクロールできる。  | 不要 |
| 既存デザインとの整合  | OK   | 既存共通designの本文ページ制約と矛盾しない。                                              | 不要 |
| 既存Componentとの整合 | OK   | `Callout`、SiteMenu、PageToc、MobilePageTocを既存仕様のまま利用する。                     | 不要 |
| accessibility basics  | OK   | 外部リンクの別タブ・`rel`、SiteMenuの現在地表示、MobilePageTocの開閉を確認した。          | 不要 |

### 自己修正した項目

- [x] mobile SiteMenuがドロワー内にあるため、Visual testをドロワーを開いて現在地表示を確認する手順へ修正した。

### 人間判断が必要な差分

- なし。

### design-image-generation への引き継ぎ候補

- [ ] 実装スクリーンショットをdesign正本化する必要がある場合は、design fix modeへ引き継ぐ。

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る
