# 18-2-home-page

## 目的

トップページ `/` を作成する。

ユーザーが作成済みの `.raw/contents/home.md` をローカル作業入力として参照し、frontmatter、Markdown本文、HTMLコメント指示をもとに、サイト入口として以下を表示する。

- ゲームキャッチコピー
- タイトルロゴ
- 最新リリースノート5件
- ゲームのかんたんな説明
- `.raw/contents/home.md` に含まれる短いクレジットと利用案内

トップページではページ内目次を表示しない。

実装前に `docs/design/home/` の initial draft design を作成し、実装後に完成画面スクリーンショットを取得して、ユーザー承認後にdesign正本へ反映する。

## 背景

`docs/plan.md` の `18-2-home-page` は、Phase 3の最初の画面作成タスクであり、以下を求めている。

- designを生成する
- `/` を作成する
- `.raw/contents/home.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに画面を作成する
- キャッチコピー枠を作成する
- タイトルロゴ枠を作成する
- 最新リリースノート5件枠を作成する
- 簡単な説明枠を作成する
- 完成画面のスクリーンショットを取得し、design正本を更新する

`docs/requirements/pages.md` では、トップページ `/` はサイト入口、雰囲気提示、更新確認、主要導線のためのページとされている。表示順は以下である。

1. ゲームキャッチコピー
2. タイトルロゴ
3. 最新リリースノート5件
4. ゲームのかんたんな説明

また、最新リリースノートは `data/generated/release-notes.json` から自動抽出し、トップページ上に二重管理しない。

今回ユーザーは `.raw/contents/home.md` を作成済みとして提示しているため、このissueでは `.raw/contents/home.md` の作成・編集は行わず、そこに含まれる内容とHTMLコメント指示をもとにトップページへ反映する。

ただし `.raw/contents/*.md` はGit管理される最終ページ正本ではなく、ローカル作業入力である。最終的な画面本文・UI構造は `src/pages/index.astro` を中心とするGit管理ファイルへ反映する。

UI / layout / pageタスクであり、ローカルリポジトリでは `docs/design/home/` がまだ存在しないため、実装前に `design-image-generation` initial draft modeで `docs/design/home/` を作成する。

## 対象範囲

このタスクで変更してよい範囲は以下。

- `docs/design/home/notes.md`
- `docs/design/home/design-desktop.png`
- `docs/design/home/design-mobile.png`
- `src/pages/index.astro`
- トップページ実装に必要なページ内のscoped style
- 必要な場合のみ、既存Visual Review / capture設定へのトップページ確認対象追加
- 必要な場合のみ、`ImageBlock.astro` の再利用性を壊さない最小限の調整

参照する既存ファイルは以下。

- `.raw/contents/home.md`
  - ユーザー作成済みのローカル入力として扱う
  - このissueでは作成・編集しない
- `src/components/_common/ImageBlock.astro`
- `public/top_logo.webp`
- `src/lib/data/release-notes.ts`
- `data/generated/release-notes.json`
- `src/lib/utils/paths.ts`
- `src/layouts/ContentLayout.astro`
- `src/layouts/BaseLayout.astro`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`

実装方針は以下。

- 現在の `src/pages/index.astro` は初期化中の仮トップページとして扱い、正式なトップページに置き換える。
- `MDX表示確認` への仮リンクはトップページ本文から削除する。
- `.raw/contents/home.md` 内のHTMLコメントはagent向け指示として扱い、画面上に表示しない。
- `<!-- release-notes-list:auto latest=5 -->` は画面表示テキストではなく、最新リリースノート5件表示の実装指示として扱う。
- 汎用的なcontents markdown parserやHTMLコメントdirective engineは作らず、このページで必要な範囲に留める。
- タイトルロゴは既存の `public/top_logo.webp` を使用候補とする。ただしローカル検証時に、これがユーザー指定のTOPlogo画像であることを確認する。
- ロゴ表示は `ImageBlock` または同等のbase path対応済み実装を使う。
- リリースノートは `getLatestReleaseNotes(5)` など既存のデータ取得層を使い、日付と概要を表示する。
- `/release-notes` へのリンクを表示する。ただし `/release-notes` ページ本体の実装は `19-2-release-notes-page` に残す。
- `/introduction` へのリンクを表示する。ただし `/introduction` ページ本体の実装は `20-2-introduction-page` に残す。
- `ContentLayout` または `BaseLayout` の既存構造を尊重し、トップページでは `showPageToc={false}` を明示する。
- キャッチコピーはh1 / h2ではなく、本文より少し大きいリードコピーとして表示する。
- `近未来。`、`裏社会。`、`抗争。` は斜体で強調する。
- `.raw/contents/home.md` の `# 光都暗域〈ネオン・アンダーレルム〉TRPG` は、画面上に通常の大見出しとして表示しない。HTML構造上必要であれば、視覚的に非表示のh1として扱う。
- クレジットと利用案内は、今回の `.raw/contents/home.md` に含まれるトップページ末尾の短い本文として扱う。Footer導線や `/credits` 専用ページは作らない。

## 初期スコープ外

このタスクでは以下を実装しない。

- `.raw/contents/home.md` の作成・編集
- Google Drive上の正本更新
- 汎用contents markdown parser
- HTMLコメントdirectiveの汎用処理基盤
- リリースノートExcel変換処理の変更
- `data/generated/release-notes.json` の手編集
- `/release-notes` ページ本体の作成
- `/introduction` ページ本体の作成
- リリースノート全文表示
- 検索UI、検索index生成、検索結果ページ
- キャラクターシート機能
- ダイスローラー
- 戦闘処理支援ツール
- DB、認証、SSR、CMS、APIサーバー
- PWA対応
- 高度な画像最適化、レスポンシブ画像生成、CDN連携
- 新規ロゴ生成、AI画像生成、ロゴの描き直し
- Footerからのクレジット導線追加
- `/credits` 専用ページ作成
- サイトメニュー構造の再設計
- PageToc / MobilePageTocの仕様変更
- パンくずリスト
- ページ末尾の前後ナビゲーション
- ルールブック本文全体の移植
- GMガイド、NPC、シナリオ、キャンペーン本文の掲載

## 完了条件

- [x] `docs/design/home/` の initial draft design を作成している
  - [x] `docs/design/home/notes.md`
  - [x] `docs/design/home/design-desktop.png`
  - [x] `docs/design/home/design-mobile.png`
- [x] initial draft designが、既存のglobal style / site layout方針と矛盾していない
- [x] `/` が正式なトップページとして実装されている
- [x] `.raw/contents/home.md` のfrontmatterに対応する `title` / `description` 相当のSEO情報が設定されている
- [x] トップページでページ内目次が表示されていない
- [x] 可視の通常h1としてページタイトルを表示していない
- [x] HTML構造上h1が必要な場合、視覚的に非表示のh1として扱われている
- [x] キャッチコピーがh1 / h2ではなく、本文より少し大きいリードコピーとして表示されている
- [x] `近未来。`、`裏社会。`、`抗争。` が斜体で強調されている
- [x] タイトルロゴ画像が表示されている
- [x] タイトルロゴ画像の `alt` が `光都暗域〈ネオン・アンダーレルム〉TRPG` になっている
- [x] タイトルロゴ画像がGitHub Pagesサブパス公開でも壊れない参照になっている
- [x] スマホ幅でタイトルロゴが横幅いっぱいに近いサイズで表示されつつ、左右余白が確保されている
- [x] タイトルロゴ下の余白が過剰にならず、最新リリースノートへ自然につながっている
- [x] 最新リリースノートが最大5件表示されている
- [x] 最新リリースノートは `data/generated/release-notes.json` 由来のデータを参照している
- [x] トップページ上にリリースノート本文を二重管理していない
- [x] 各リリースノート項目に更新日と概要が表示されている
- [x] `/release-notes` へのリンクが表示されている
- [x] `/introduction` へのリンクが表示されている
- [x] ゲームのかんたんな説明が表示されている
- [x] `こんな人におすすめ` の箇条書きが表示されている
- [x] `.raw/contents/home.md` に含まれる短いクレジットと利用案内が表示されている
- [x] Footer導線や `/credits` 専用ページを追加していない
- [x] `.raw/contents/home.md` 内のHTMLコメントが画面上に表示されていない
- [x] 現行サイトの白〜薄灰背景、濃色テキスト、控えめな青緑系アクセントの方向性を維持している
- [x] 派手なランディングページ風heroや過剰なネオン表現になっていない
- [x] 完成画面のスクリーンショットを取得している
- [x] ユーザー承認後、完成画面スクリーンショットをもとに `docs/design/home/` のdesign正本を更新している
- [x] 関連TODOを扱った場合は、対応結果または未対応理由が記録されている
- [x] UI系タスクとして、参照するdesign targetとdesign画像の扱いが記録されている
- [x] `npm run build` が通る
- [x] `npm run check` が通る

## チェックポイント

- [x] 既存ルートが壊れていない
- [x] GitHub Pagesのサブパス公開に影響しない
- [x] 不要な依存関係を追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] 関連する `docs/TODO.md` 項目と矛盾していない
- [x] 関連する `docs/design/` と矛盾していない
- [x] ユーザーの未コミット変更を破壊していない
- [x] `.raw/contents/home.md` をGit管理対象にしていない
- [x] `.raw/contents/home.md` を実装中に勝手に編集していない
- [x] HTMLコメントを可視テキストとして描画していない
- [x] リリースノートをJSON由来ではなく手書き固定にしていない
- [x] `/release-notes` ページ本体をこのタスクで作っていない
- [x] `/introduction` ページ本体をこのタスクで作っていない
- [x] `public/top_logo.webp` がユーザー指定のTOPlogo画像であることをローカルで確認している
- [x] `ImageBlock` を変更した場合、トップページ以外での再利用性を壊していない
- [x] PageToc / MobilePageTocの既存仕様を変更していない
- [x] design initial draftを未レビューのまま最終design正本として扱っていない
- [x] 実装後スクリーンショットを、ユーザー承認なしにdesign正本へ置換していない
- [x] `npm run build` を実行して結果を記録している
- [x] `npm run check` を実行して結果を記録している

## 想定変更ファイル

- `docs/issue/18-2-home-page.md`
- `docs/design/home/notes.md`
- `docs/design/home/design-desktop.png`
- `docs/design/home/design-mobile.png`
- `src/pages/index.astro`

必要な場合のみ変更する。

- `tests/visual/*`
  - トップページの完成画面スクリーンショット取得に既存Visual Review設定の追加が必要な場合のみ
- `src/components/_common/ImageBlock.astro`
  - トップページ実装に必要で、かつ共通Componentの再利用性を壊さない最小限の調整が必要な場合のみ

参照のみを想定する。

- `.raw/contents/home.md`
- `public/top_logo.webp`
- `src/lib/data/release-notes.ts`
- `data/generated/release-notes.json`
- `src/lib/utils/paths.ts`
- `src/layouts/ContentLayout.astro`
- `src/layouts/BaseLayout.astro`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`

## レビュー観点

人間レビューでは、特に以下を確認する。

- `.raw/contents/home.md` 作成済み前提になっており、このissueでraw作成・raw編集を要求していないか
- トップページの表示順が、キャッチコピー、タイトルロゴ、最新リリースノート5件、ゲームのかんたんな説明の順になっているか
- クレジットと利用案内をトップページ末尾の短い本文として扱う方針が妥当か
- `docs/requirements/pages.md` の「クレジットは初期必須枠にしない」と、今回の `.raw/contents/home.md` に含まれるクレジット表示が矛盾していないか
- キャッチコピーが見出しではなくリードコピーとして成立しているか
- 可視h1を出さない判断が、アクセシビリティとHTML構造の両面で問題ないか
- タイトルロゴのサイズ、余白、スマホ表示が過剰でも不足でもないか
- 最新リリースノートがJSON由来であり、トップページ内で二重管理されていないか
- `/release-notes` へのリンクを、このタスクでページ本体未実装のまま出してよいか
- `/introduction` へのリンクを、このタスクでページ本体未実装のまま出してよいか
- `docs/design/home/` initial draftのデザインが、既存global style / site layoutと一貫しているか
- トップページだけランディングページ風に派手になりすぎていないか
- Footer導線、検索、パンくず、前後ナビゲーション等の初期スコープ外UIを混ぜていないか
- `ImageBlock` を変更した場合、その変更が共通Componentとして妥当か
- 実装後スクリーンショットをdesign正本化するタイミングに、ユーザー承認ゲートが残っているか

## 備考

branch名は以下とする。

```txt
18-2-home-page
```

issue file名は以下とする。

```txt
docs/issue/18-2-home-page.md
```

ユーザー指示により、`.raw/contents/home.md` は作成済みとして扱う。

ローカル検証で、以下を確認済み。

- `<repo-root>/.raw/contents/home.md` が存在する
- frontmatterが以下である
  - `page: home`
  - `route: /`
  - `title: 光都暗域〈ネオン・アンダーレルム〉TRPG`
- HTMLコメントがagent向け指示として残っている
- `:::` instruction blockが含まれていない
- `.raw/contents/home.md` がGit管理対象ではなく、`.gitignore` で除外されている

現在のローカル `src/pages/index.astro` は仮トップページである。

- `ContentLayout` を使っている
- `ImageBlock` で `/top_logo.webp` を表示している
- `ルールサイト初期化中です。` と表示している
- `MDX表示確認` への仮リンクがある

このタスクでは、上記の仮表示を正式なトップページへ置き換える。

ローカルリポジトリに `docs/design/home/` はまだ存在しないため、実装前に `design-image-generation` initial draft modeを実行すること。

想定するdesign targetは以下。

```txt
docs/design/home/
```

想定するdesign artifactは以下。

```txt
docs/design/home/notes.md
docs/design/home/design-desktop.png
docs/design/home/design-mobile.png
```

default viewportは、既存Visual Review方針に合わせて以下を基本とする。

```txt
desktop: 1440x1200
mobile: 390x900
```

## ローカル検証メモ

- mode: local repository mode
- branch: `18-2-home-page`
- issue file: `docs/issue/18-2-home-page.md`
- local working tree:
  - `src/pages/index.astro` を実装変更
  - `docs/issue/18-2-home-page.md` の完了条件と検証メモを更新
- checked files:
  - `.github/ISSUE_TEMPLATE/issue-first-development.md`
  - `.agents/skills/issue-first-development/SKILL.md`
  - `.agents/skills/design-image-generation/SKILL.md`
  - `.agents/rules/data-management.md`
  - `docs/plan.md`
  - `docs/requirements/pages.md`
  - `docs/requirements/release-notes.md`
  - `docs/out-of-scope.md`
  - `docs/TODO.md`
  - `docs/design/global-styles/notes.md`
  - `docs/design/site-layout/notes.md`
  - `.raw/contents/home.md`
  - `src/pages/index.astro`
  - `src/lib/data/release-notes.ts`
  - `public/top_logo.webp`
- local checks:
  - `.raw/contents/home.md` は存在する
  - `.raw/contents/home.md` はGit管理対象外である
  - `.raw/contents/home.md` に `:::` instruction block はない
  - `docs/design/home/` initial draft design は作成済みである
  - `src/pages/index.astro` は正式トップページとして実装済みである
  - `public/top_logo.webp` は存在する
  - `public/top_logo.webp` をトップページロゴとして表示している
  - actual rendered `/` pageをdesktop / mobileで確認した
  - GitHub Pages base path下のpreview URLで画像とリンクが壊れていないことを確認した
  - `npm run build` 成功
  - `npm run check` 成功

## 実装後検証メモ

- implementation files:
  - `src/pages/index.astro`
- actual screenshots:
  - `test-results/visual/home-actual-desktop.png`
  - `test-results/visual/home-actual-desktop-full.png`
  - `test-results/visual/home-actual-mobile.png`
  - `test-results/visual/home-actual-mobile-full.png`
- commands:
  - `npm run check`: success
  - `npm run build`: success
  - `npm run preview`: `http://localhost:4321/neon-underrealm-trpg`
  - `node .tmp/capture-home-actual.mjs`: success
- remaining:
  - 完成画面スクリーンショットは、ユーザー承認後に `docs/design/home/` のdesign正本として正本化済み。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/home/`
- reference desktop:
  - `docs/design/home/design-desktop.png`
  - `docs/design/home/design-desktop-full.png`
- reference mobile:
  - `docs/design/home/design-mobile.png`
  - `docs/design/home/design-mobile-full.png`
- notes: `docs/design/home/notes.md`

### 成果物

- actual desktop:
  - `test-results/visual/home-actual-desktop.png`
  - `test-results/visual/home-actual-desktop-full.png`
- actual mobile:
  - `test-results/visual/home-actual-mobile.png`
  - `test-results/visual/home-actual-mobile-full.png`
- report: Playwright screenshot output under `test-results/visual/`

### レビュー結果

| 領域                  | 判定 | 差分                                                                                 | 対応                                                  |
| --------------------- | ---- | ------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| レイアウト            | OK   | 既存Header / SiteMenuはdesign draftより実装済みsite-layoutに近い。                   | 既存layout方針を優先。                                |
| 余白                  | OK   | draftよりdesktop first viewportで本文card上部がやや下がる。                          | Header / SiteMenu込みの現行layoutとして許容。         |
| タイポグラフィ        | OK   | 見出しは既存prose寄りの罫線つき表示。                                                | global stylesとの整合を優先。                         |
| 色                    | OK   | 白から薄灰背景、濃色text、青緑link / accentを維持。                                  | 修正不要。                                            |
| 配置・整列            | OK   | logo、release notes、description、creditsの順序はdesign / issue通り。                | 修正不要。                                            |
| レスポンシブ          | OK   | mobileでlogoが横幅いっぱいに近く表示され、左右余白も確保されている。                 | 修正不要。                                            |
| overflow / scroll     | OK   | desktop / mobile full-pageで横overflowは見当たらない。                               | 修正不要。                                            |
| 既存デザインとの整合  | OK   | existing Headerに検索UIが残るが、このissueで新規追加したものではなく既存layout由来。 | このissueではHeader / global navigationを変更しない。 |
| 既存Componentとの整合 | OK   | `ImageBlock` は変更せず、top logoはbase path対応の直接表示にした。                   | 共通Componentの再利用性を壊していない。               |
| accessibility basics  | OK   | document h1は視覚的非表示、logo altあり、主要導線navあり。                           | 修正不要。                                            |

### 自己修正した項目

- [x] なし。実装後スクリーンショット確認で、issue範囲内の明らかなvisual mismatchは見つからなかった。

### 人間判断が必要な差分

- actual screenshotでは、既存Headerの検索UIが表示される。これはこのissueで追加したUIではなく既存Header由来のため、今回の修正対象外とした。
- actual screenshotでは、リリースノートが現行 `data/generated/release-notes.json` の1件のみ表示される。最大5件表示の実装としては正しいが、design draftの5件サンプルとは件数が異なる。

### design-image-generation への引き継ぎ

- [x] 実装スクリーンショットをdesign正本化する必要がある場合は、design fix modeへ引き継ぐ。

### design fix正本化メモ

- mode: design fix
- source test: `tests/visual/home.spec.ts`
- source actual artifacts:
  - `test-results/visual/home-desktop.png`
  - `test-results/visual/home-desktop-full.png`
  - `test-results/visual/home-mobile.png`
  - `test-results/visual/home-mobile-full.png`
- source route: `http://localhost:4321/neon-underrealm-trpg/`
- source commit: `f521a11`
- updated design artifacts:
  - `docs/design/home/notes.md`
  - `docs/design/home/design-desktop.png`
  - `docs/design/home/design-desktop-full.png`
  - `docs/design/home/design-mobile.png`
  - `docs/design/home/design-mobile-full.png`
- notes:
  - `tests/visual/home.spec.ts` で `test-results/visual/home-*.png` を出力し、ユーザー承認後のactual artifactをdesign正本へ反映した。

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

- 内部リンクは `InternalLink` Componentを使う。
- トップページ用の `spec.ts` ファイルを追加する。
- トップページ外側の枠線が不要で、見た目として弱い。
- `はじめに読む` は文言が不自然なため、`はじめに` のリンクにする。
- `はじめに` リンクは更新履歴リンクの横に置かず、外枠などを使って目立つリンクとして中央に置く。
- `description` を実装中に独自文言へ変更したことは手順として逸脱。今回の文言自体は問題ないため、この内容をdefault descriptionへ反映する。
- `description` 変更の逸脱をfailure-logへ記録する。

### 判定

- source: human
- classification: valid
- local validation:
  - `.tmp/human-review.md` は人間一次レビューであり、remote snapshotではない。
  - `src/components/_common/InternalLink.astro` が存在し、内部リンク用Componentとして利用できる。
  - `tests/visual/site-layout.spec.ts` など既存のvisual `*.spec.ts` があり、トップページ用spec追加は現在issueのUI確認範囲に収まる。
  - `src/pages/index.astro` は現在 `withBase()` で `/release-notes` と `/introduction` のリンクを作っているため、`InternalLink` へ置き換え可能。
  - `src/pages/index.astro` は現在ページ固有の `description` を定義している。`src/lib/site/seo.ts` の `defaultSeo.description` は旧文言のままであり、レビュー指摘どおりdefault descriptionへ反映する余地がある。
  - 外側の枠線、`はじめに読む` の文言、リンク配置は `docs/design/home/notes.md` の「落ち着いた見た目」「主要導線」方針と矛盾せず、現在issueのscoped style調整範囲に含まれる。
  - `/release-notes` ページ本体、`/introduction` ページ本体、検索UI、Footer導線、`/credits` は引き続き作らない。

### 対応方針

- `src/pages/index.astro` の内部リンクを `InternalLink` Componentへ置き換える。
- `はじめに読む` を `はじめに` に変更し、更新履歴リンクと横並びにせず、中央配置の目立つ導線として調整する。
- トップページ本文cardの外枠線を外し、既存global styleとdesign draftの範囲で余白と導線の見た目を整える。
- 今回作成したdescription文言を `src/lib/site/seo.ts` の `defaultSeo.description` へ反映し、トップページ側はdefault descriptionを使う。
- トップページ用のvisual specを追加し、desktop / mobile / full-page相当の確認対象を明示する。
- `docs/agent-failure-log.md` には、実装中にdescriptionを独自判断で変更したことをagent failureとして記録する。

### 対応完了チェックリスト

- [x] `InternalLink` Componentを使う
- [x] トップページ用の `spec.ts` ファイルを追加する
- [x] 外側の枠線を外す
- [x] `はじめに` リンクの文言と配置を調整する
- [x] default descriptionを更新する
- [x] failure-logへ記録する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 2

### 指摘事項

- トップページのキャッチコピーがdefault fontのままだと少し弱く見える。
- キャッチコピーは `.tmp/home-copy-fine-direction/` の案を採用候補にする。
- 採用候補では、02b相当の明朝寄りフォントと少し薄い文字色を使う。
- 太字キーワードは `＿近未来`、`＿裏社会`、`＿抗争` とし、キーワード後の `。` は付けない。
- キーワードと後続文章の間隔を少し広げる。
- mobileの見た目はよいが、desktopでは上下左右の余白が広く見える。
- desktop余白は `.tmp/home-desktop-spacing-options/` の `03-balanced-compact` を採用候補にする。
- 実装反映はまだ行わず、まずissueへ変更方針として記録する。

### 判定

- source: human
- classification: valid
- local validation:
  - `docs/design/home/notes.md` は、トップページを落ち着いたルールサイトとして扱い、first viewportでサイトID、タイトルロゴ、更新確認の役割が分かることを求めている。
  - `docs/design/home/notes.md` は、キャッチコピーをH1 / H2ではなく本文より少し大きいリードコピーとして扱い、キーワードを斜体で強調する方針を示している。
  - `src/pages/index.astro` の `.home-lead` は現在 `var(--color-text)`、`var(--text-xl)`、`var(--line-height-relaxed)` を使っており、page scoped styleで調整可能である。
  - `src/pages/index.astro` の `.home-page`、`.home-lead`、`.home-logo`、`.home-section` はpage scoped styleであり、このissueのトップページ見た目調整範囲に収まる。
  - `BaseLayout.astro` の `.site-main` 余白や幅は共通layoutであるため、実装時はhome page側のscoped styleで必要最小限に調整する方針が安全である。
  - `.tmp/home-copy-fine-direction/02b-fine-direction-desktop.png` と `.tmp/home-copy-fine-direction/02b-fine-direction-mobile.png` は、指示されたコピー装飾案の比較用画像である。
  - `.tmp/home-desktop-spacing-options/03-balanced-compact-desktop.png` は、desktop余白を詰める採用候補画像である。
  - mobileは現状案でよいという人間判断があるため、desktop向け余白調整はmobile media queryを壊さない範囲で行う。
  - `/release-notes` ページ本体、`/introduction` ページ本体、検索UI、Footer導線、`/credits` は引き続き作らない。

### 対応方針

- `src/pages/index.astro` のキャッチコピー文言を、`＿近未来`、`＿裏社会`、`＿抗争` に変更する。
- キャッチコピーのキーワード後の `。` を削除し、キーワードと後続文章の間隔を少し広げる。
- キャッチコピーのdesktop / mobile共通の見た目として、02b相当の明朝寄りフォント、少し薄い文字色、キーワードの太字斜体を反映する。
- desktopでは `.tmp/home-desktop-spacing-options/03-balanced-compact-desktop.png` 相当の余白へ近づける。
- desktop余白調整は、共通layout全体ではなくhome page scoped styleを中心に行う。
- mobileの良い見た目を維持するため、既存mobile media queryを壊さない。
- 実装後はdesktop / mobileの標準範囲とfull-page screenshotを再取得し、`npm run check` と `npm run build` を通す。

### 対応完了チェックリスト

- [x] キャッチコピーに `home-copy-fine-direction` の文言方針を反映する
- [x] キャッチコピーに02b相当のフォントと文字色を反映する
- [x] キーワードと後続文章の間隔を調整する
- [x] desktop余白を `03-balanced-compact` 相当に調整する
- [x] mobileの見た目を維持する
- [x] desktop screenshot を取得して確認する
- [x] mobile screenshot を取得して確認する
- [x] `npm run check` が通る
- [x] `npm run build` が通る
