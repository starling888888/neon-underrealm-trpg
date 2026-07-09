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

- [ ] `docs/design/home/` の initial draft design を作成している
  - [ ] `docs/design/home/notes.md`
  - [ ] `docs/design/home/design-desktop.png`
  - [ ] `docs/design/home/design-mobile.png`
- [ ] initial draft designが、既存のglobal style / site layout方針と矛盾していない
- [ ] `/` が正式なトップページとして実装されている
- [ ] `.raw/contents/home.md` のfrontmatterに対応する `title` / `description` 相当のSEO情報が設定されている
- [ ] トップページでページ内目次が表示されていない
- [ ] 可視の通常h1としてページタイトルを表示していない
- [ ] HTML構造上h1が必要な場合、視覚的に非表示のh1として扱われている
- [ ] キャッチコピーがh1 / h2ではなく、本文より少し大きいリードコピーとして表示されている
- [ ] `近未来。`、`裏社会。`、`抗争。` が斜体で強調されている
- [ ] タイトルロゴ画像が表示されている
- [ ] タイトルロゴ画像の `alt` が `光都暗域〈ネオン・アンダーレルム〉TRPG` になっている
- [ ] タイトルロゴ画像がGitHub Pagesサブパス公開でも壊れない参照になっている
- [ ] スマホ幅でタイトルロゴが横幅いっぱいに近いサイズで表示されつつ、左右余白が確保されている
- [ ] タイトルロゴ下の余白が過剰にならず、最新リリースノートへ自然につながっている
- [ ] 最新リリースノートが最大5件表示されている
- [ ] 最新リリースノートは `data/generated/release-notes.json` 由来のデータを参照している
- [ ] トップページ上にリリースノート本文を二重管理していない
- [ ] 各リリースノート項目に更新日と概要が表示されている
- [ ] `/release-notes` へのリンクが表示されている
- [ ] `/introduction` へのリンクが表示されている
- [ ] ゲームのかんたんな説明が表示されている
- [ ] `こんな人におすすめ` の箇条書きが表示されている
- [ ] `.raw/contents/home.md` に含まれる短いクレジットと利用案内が表示されている
- [ ] Footer導線や `/credits` 専用ページを追加していない
- [ ] `.raw/contents/home.md` 内のHTMLコメントが画面上に表示されていない
- [ ] 現行サイトの白〜薄灰背景、濃色テキスト、控えめな青緑系アクセントの方向性を維持している
- [ ] 派手なランディングページ風heroや過剰なネオン表現になっていない
- [ ] 完成画面のスクリーンショットを取得している
- [ ] ユーザー承認後、完成画面スクリーンショットをもとに `docs/design/home/` のdesign正本を更新している
- [ ] 関連TODOを扱った場合は、対応結果または未対応理由が記録されている
- [ ] UI系タスクとして、参照するdesign targetとdesign画像の扱いが記録されている
- [ ] `npm run build` が通る
- [ ] `npm run check` が通る

## チェックポイント

- [ ] 既存ルートが壊れていない
- [ ] GitHub Pagesのサブパス公開に影響しない
- [ ] 不要な依存関係を追加していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] 関連する `docs/TODO.md` 項目と矛盾していない
- [ ] 関連する `docs/design/` と矛盾していない
- [ ] ユーザーの未コミット変更を破壊していない
- [ ] `.raw/contents/home.md` をGit管理対象にしていない
- [ ] `.raw/contents/home.md` を実装中に勝手に編集していない
- [ ] HTMLコメントを可視テキストとして描画していない
- [ ] リリースノートをJSON由来ではなく手書き固定にしていない
- [ ] `/release-notes` ページ本体をこのタスクで作っていない
- [ ] `/introduction` ページ本体をこのタスクで作っていない
- [ ] `public/top_logo.webp` がユーザー指定のTOPlogo画像であることをローカルで確認している
- [ ] `ImageBlock` を変更した場合、トップページ以外での再利用性を壊していない
- [ ] PageToc / MobilePageTocの既存仕様を変更していない
- [ ] design initial draftを未レビューのまま最終design正本として扱っていない
- [ ] 実装後スクリーンショットを、ユーザー承認なしにdesign正本へ置換していない
- [ ] `npm run build` を実行して結果を記録している
- [ ] `npm run check` を実行して結果を記録している

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
  - `docs/issue/18-2-home-page.md` が未追跡
  - それ以外の未コミット差分はなし
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
  - `docs/design/home/` は未作成である
  - `src/pages/index.astro` は仮トップページである
  - `public/top_logo.webp` は存在する
- not yet verified:
  - `public/top_logo.webp` が最終的なユーザー指定TOPlogo画像であること
  - `docs/design/home/` initial draft design
  - actual rendered `/` page
  - actual desktop / mobile screenshots
  - GitHub Pages base path behavior
  - `npm run build`
  - `npm run check`
