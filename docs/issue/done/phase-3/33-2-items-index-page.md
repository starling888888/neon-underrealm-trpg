# 33-2-items-index-page

## 目的

`/data/items` を、アイテムの基本ルールと6種別への導線を示す静的なトップページとして実装する。

## 背景

- `docs/plan.md` の `33-2-items-index-page` は、アイテムトップページの作成を計画している。
- `.raw/contents/items.md` のfrontmatterはページmetadataとして使う。ユーザー更新済みH1以下のMarkdown本文とHTMLコメントは、ページ本文と可視の表示構成の正本である。H1より前の作業履歴コメントは実装指示に含めない。
- 現在の`src/pages/data/items/index.mdx`はサイトメニュー現在地ハイライト確認用のダミーであり、本実装へ置き換える。
- `docs/TODO.md` のダミーMDXページを本実装時に削除または置換するTODOは、このissueで`/data/items`分を回収する。`/data/items/weapons`分は後続の34-2で扱う。
- `docs/design/items/` は未作成である。UI実装前に、`.agents/skills/design-image-generation/SKILL.md` のinitial draft modeで、desktop・mobileのdesign画像を作成して人間レビューを受ける必要がある。実装後のVisual Reviewはactualとdesignを比較する工程であり、design正本の更新には別途ユーザーの明示承認とdesign fix modeが必要である。

関連資料:

- `docs/requirements/pages.md`
- `docs/requirements/assets-seo.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `.raw/contents/items.md`
- `.agents/skills/design-image-generation/SKILL.md`

## 対象範囲

- `src/pages/data/items/index.mdx`を、`.raw/contents/items.md`のfrontmatter、およびH1以下のMarkdown本文とHTMLコメントに従うページへ置き換える。H1より前の作業履歴コメントは実装指示として採用しない。
- H1直後に、ユーザー提供済みの`public/images/data/items_hero.webp`を表示する。内容は変更せず、公開assetとしてGit管理へ含める。`public/images/data/items/`配下の後続個別ページ用画像は含めない。
- hero画像は装飾画像として扱い、空`alt`を設定する。
- 必要信用、生き様専用アイテム、同一アイテムの効果が原則重複しないこと、および戦闘ルールへの参照を本文どおりに配置する。
- 「アイテムの種類」で、武器、防具、お守り、サイバネ、ナノマシン、ドラッグをこの順の表として表示する。
- 表内で、各種別を`/data/items/`配下の一覧ページへ、お守り・サイバネ・ナノマシン・ドラッグに対応する生き様名を`/data/ikizama/`配下の詳細ページへリンクする。
- `docs/design/items/notes.md`、`docs/design/items/design-desktop.png`、`docs/design/items/design-mobile.png`を、承認済みのdesign-image-generation workflowで用意する。
- `tests/visual/config.ts`へ`/data/items`のrouteを追加し、`tests/visual/items-index.spec.ts`でdesktop・mobileのVisual Review captureを定義する。
- 実装完了後にVisual Reviewを行い、actual screenshotと`docs/design/items/`を比較する。design正本化が必要な場合は、Visual Reviewで候補として記録して停止し、ユーザーの明示承認後にdesign fix modeで扱う。
- `docs/plan.md`と`docs/requirements/pages.md`を、contentsの正本に追従させる。
- 単一見出しのページでも目次リンクを表示し、目次対象の見出しが0件のページでは「見出しがありません」と表示する共通PageToc仕様へ、`/data/items`と関連テストを整合させる。

## 初期スコープ外

- 武器、防具、お守り、サイバネ、ナノマシン、ドラッグの個別一覧ページ、データ変換、Item系Card Component、カード凡例を作成・変更しない。
- 検索、絞り込み、ソート、ページネーション、比較・計算、アイテム選択支援、入力フォーム、保存機能を追加しない。
- 新しいnpm package、CMS、DB、認証、SSR、API、PWA、クライアント状態管理を追加しない。
- Header、Footer、SiteMenu、PageToc、MobilePageTocを再設計しない。ただし、レビュー指摘1でユーザーが承認した、単一見出しの表示と0件時の空状態に限る共通PageToc変更は対象範囲に含める。
- `public/images/data/items_hero.webp`の内容を再生成、加工、置換しない。`public/images/data/items/`配下の後続個別ページ用画像を変更・追加しない。
- `.raw/contents/items.md`をGoogle Driveへ同期しない。

## 完了条件

- [x] `docs/design/items/`のinitial draftとdesktop・mobile design画像を作成し、人間レビューを受けている。
- [x] `src/pages/data/items/index.mdx`がcontentsのfrontmatter、およびH1以下のMarkdown本文とHTMLコメントの指示に従っている。H1より前の作業履歴コメントを実装指示として採用していない。
- [x] H1直後に`public/images/data/items_hero.webp`を表示し、内容を変更せずGit管理へ含めている。
- [x] hero画像を装飾画像として扱い、空`alt`を設定している。
- [x] 信用、生き様専用アイテム、同一アイテムの効果の原則非重複、戦闘ルールへの参照をcontentsどおりに表示している。
- [x] 「アイテムの種類」表が、武器、防具、お守り、サイバネ、ナノマシン、ドラッグの順で表示されている。
- [x] 各アイテム種別と、ブライ、ケジメ、スミ、ヤクの生き様リンクがcontents指定のrouteへ遷移する。
- [x] ダミーの`/data/items`ページを本実装へ置き換え、関連TODOの`/data/items`分を解消している。
- [x] `tests/visual/config.ts`と`tests/visual/items-index.spec.ts`で、desktop・mobileのcaptureを再現可能にしている。
- [x] desktop・mobileの完成画面をVisual Reviewでdesignと比較している。
- [x] design正本化が必要な場合は、Visual Reviewへ候補を記録し、ユーザーの明示承認後にdesign fix modeで更新している。今回はビジュアルレビュー 2で更新不要と判断した。
- [x] `npm run check`と`npm run build`が通る。
- [x] 1件の見出しをdesktop・mobileのPageTocへ表示し、0件のPageTocでは空状態を表示している。

## チェックポイント

- [x] contentsのH1以下の表形式、項目順、本文リンクを、下位のplan、requirements、既存ダミー実装より優先している。H1より前の作業履歴コメントは実装指示として採用していない。
- [x] `InternalLink`など既存のbase path対応の仕組みを用い、GitHub Pagesのサブパス公開で内部リンクと画像参照が壊れない。
- [x] 未実装の各種別ページへのリンクを、将来routeとして残し、このissueで新設していない。
- [x] `docs/TODO.md`のダミーMDXページTODOは`/data/items`分だけを解消し、`/data/items/weapons`分を後続taskへ残している。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。レビュー指摘1で承認された共通PageToc変更を除く。
- [x] 既存の未追跡アイテム画像を破壊していない。

## 想定変更ファイル

- `src/pages/data/items/index.mdx`
- `public/images/data/items_hero.webp`
- `docs/design/items/notes.md`
- `docs/design/items/design-desktop.png`
- `docs/design/items/design-mobile.png`
- `tests/visual/config.ts`
- `tests/visual/items-index.spec.ts`
- `scripts/postprocess-page-toc/lib.ts`
- `src/components/layout/PageToc.astro`
- `src/components/layout/MobilePageToc.astro`
- `tests/node/page-toc-postprocess.test.ts`
- `docs/plan.md`
- `docs/requirements/pages.md`
- `docs/requirements/layout-navigation.md`
- `docs/issue/33-2-items-index-page.md`

## レビュー観点

- `.raw/contents/items.md`のH1以下に定義された本文、表形式、項目順、アイテム種別・生き様リンクを過不足なく反映できているか。
- hero画像が装飾画像として空`alt`を設定し、本文の理解に必要な情報を画像だけへ置いていないか。
- H1直後のhero画像と、本文・表が既存のsite layoutと整合し、desktop・mobileで読みやすいか。
- `docs/design/items/`のinitial draftがcontentsの可視構成を優先し、カード一覧や検索などの範囲外UIを追加していないか。
- `/data/items`のダミー置換と、レビュー指摘1で承認された単一見出し・0件空状態の共通PageToc変更に留まり、個別アイテムページや他の共通ナビゲーション再設計へ変更を広げていないか。
- Visual Review後にdesign正本化が必要か。必要な場合、design fix modeを明示承認するか。
- `docs/TODO.md`のダミーMDX TODOを`/data/items`分だけ完了にしてよいか。

## 備考

- `.raw/contents/items.md`はGit管理外のローカル作業入力である。Google Driveへの書込みは、ユーザーが`raw-to-drive-sync`を明示するまで行わない。
- `public/images/data/items_hero.webp`と`public/images/data/items/`は、作業開始時から未追跡のユーザー変更である。実装時は前者だけを内容を変えずに公開assetとして含め、後者は後続個別ページtaskまで変更しない。
- `npm run check`、`npm run build`、design生成、Visual Reviewは実装後の未検証項目である。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/items/`
- reference desktop: `docs/design/items/design-desktop.png`
- reference mobile: `docs/design/items/design-mobile.png`
- notes: `docs/design/items/notes.md`

### 成果物

- actual desktop: `test-results/visual/items-index-desktop.png`
- actual mobile: `test-results/visual/items-index-mobile.png`
- report: `test-results/visual/capture-manifest.json`

### レビュー結果

| 領域                  | 判定       | 差分                                                                                | 対応                                   |
| --------------------- | ---------- | ----------------------------------------------------------------------------------- | -------------------------------------- |
| レイアウト            | 要人間判断 | desktopのPageTocは項目を1件だけでは生成しない既存処理により、見出しだけ表示される。 | 共通PageTocの変更はscope外として扱う。 |
| 余白                  | OK         | 段落量に伴う縦方向の差分。                                                          | contents本文を優先する。               |
| タイポグラフィ        | OK         | -                                                                                   | -                                      |
| 色                    | OK         | -                                                                                   | -                                      |
| 配置・整列            | OK         | hero、本文、表の順序は一致する。                                                    | -                                      |
| レスポンシブ          | OK         | mobileの種別名は1行を維持し、説明列が折り返される。                                 | -                                      |
| overflow / scroll     | OK         | desktop・mobileとも横overflowなし。                                                 | -                                      |
| 既存デザインとの整合  | 要人間判断 | initial draftのdesktop PageTocには「アイテムの種類」がある。                        | design正本は更新しない。               |
| 既存Componentとの整合 | OK         | 既存の`ImageBlock`、`InternalLink`、表スタイルを使用する。                          | -                                      |
| accessibility basics  | OK         | heroは空`alt`、内部リンクは既存component経由。                                      | -                                      |

### 自己修正した項目

- [x] mobile表の横overflowがないことをVisual testで確認した。

### 人間判断が必要な差分

- PageTocの項目を1件でも表示する共通仕様へ変更するか。変更は初期design画像・共通layoutへ影響するため、このissueでは行わない。

### design-image-generation への引き継ぎ候補

- [x] 実装スクリーンショットをdesign正本化する必要がある場合は、design fix modeへ引き継ぐ（ビジュアルレビュー 2で不要と判断）

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

- 単一H2の`/data/items`で、desktopには空の目次見出しだけが表示され、mobileでは目次トリガーが非表示になる。

### 判定

- source: local-pr-review
- classification: valid
- local validation: `scripts/postprocess-page-toc/lib.ts`は目次項目が1件以下の場合に内容を空にしていた。`docs/design/items/design-desktop.png`と`design-mobile.png`は「アイテムの種類」への目次導線を示しており、ユーザーは「1件以上は表示、0件は『見出しがありません』」と共通方針を明示した。

### 対応方針

- postprocessを0件と1件以上で分岐し、1件以上では通常の目次リンク、0件では空状態をdesktop・mobileへ描画する。
- Node testと`/data/items`のVisual testで、単一見出し・0件・mobile目次の状態を検証する。

### 対応完了チェックリスト

- [x] PageTocの単一見出し・空状態を実装する
- [x] Node testとVisual testを更新する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 2

### デザイン参照

- design target: `docs/design/items/`
- reference desktop: `docs/design/items/design-desktop.png`
- reference mobile: `docs/design/items/design-mobile.png`
- notes: `docs/design/items/notes.md`

### 成果物

- actual desktop: `test-results/visual/items-index-desktop.png`
- actual mobile: `test-results/visual/items-index-mobile.png`
- report: `test-results/visual/capture-manifest.json`

### レビュー結果

| 領域                  | 判定 | 差分 | 対応                                                          |
| --------------------- | ---- | ---- | ------------------------------------------------------------- |
| レイアウト            | OK   | -    | 単一見出しでもdesktop・mobileのPageTocを表示する。            |
| レスポンシブ          | OK   | -    | mobileの目次トリガー開閉とリンク表示をVisual testで確認した。 |
| 既存デザインとの整合  | OK   | -    | initial designの「アイテムの種類」導線と一致する。            |
| 既存Componentとの整合 | OK   | -    | 0件時はdesktop・mobile双方で空状態を表示する。                |

### 自己修正した項目

- [x] PageToc postprocessを、0件と1件以上で分岐した。
- [x] 0件時の「見出しがありません」空状態を追加した。

### 人間判断が必要な差分

- なし。

### design-image-generation への引き継ぎ候補

- [x] design正本の更新は不要。

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 2

### 指摘事項

- 共通PageTocの単一見出し・0件空状態を実装した後も、issueの初期スコープ外とreview観点、design notesにはPageToc / MobilePageToc変更を禁止する旧記述が残っている。

### 判定

- source: local-pr-review
- classification: valid
- local validation: ユーザーはレビュー指摘1に対し、「1件以上は表示、0件は『見出しがありません』」と方針を明示し、実装を承認した。`docs/requirements/layout-navigation.md`、`docs/plan.md`、実装・テストは新方針に一致する一方、`docs/issue/33-2-items-index-page.md`と`docs/design/items/notes.md`の旧記述が矛盾する。

### 対応方針

- 初期スコープ外とreview観点を、単一見出し・0件空状態のPageToc変更だけを承認済み例外として明記する形へ更新する。
- design notesにも同じ共通PageToc仕様を記録し、その他のHeader、Footer、SiteMenu、PageToc、MobilePageTocの再設計は引き続き範囲外とする。

### 対応完了チェックリスト

- [x] issueのscope・review観点を更新する
- [x] design notesを更新する
- [x] `npm run check` が通る
