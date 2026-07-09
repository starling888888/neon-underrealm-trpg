# 19-2-release-notes-page

## 目的

更新履歴ページ `/release-notes` を作成し、Git管理済みの `data/generated/release-notes.json` から全リリースノートを表示できるようにする。

このページでは、各リリースノートについて更新日と本文を表示する。本文が空欄の場合は概要を本文として表示し、本文内の改行は表示上も反映する。

また、ページ内目次を表示しないページの余白・本文幅・基本ラッパーを共通化するため、ToCなしページ用のラッパーComponent / Layoutを作成する。

## 背景

`docs/plan.md` の `19-2-release-notes-page` に対応するページ作成タスクである。

関連する前段タスクとして、`18-0-release-notes-data` でリリースノート用の変換仕様、検証スキーマ、生成JSON、データ取得処理が整備済みである。

現在、トップページでは `getLatestReleaseNotes(5)` を用いて最新リリースノート5件を表示し、`/release-notes` への導線も配置されている。したがって本タスクでは、その遷移先となる更新履歴ページ本体を実装する。

追加要求として、`/release-notes` ではページ内目次を表示しない。また、現段階でページ内目次が存在しないページは余白などのレイアウトを共通化するためのラッパーComponent / Layoutを使う。

参照する主な要件・仕様は以下。

- `docs/plan.md`
- `docs/requirements.md`
- `docs/requirements/pages.md`
- `docs/requirements/release-notes.md`
- `docs/requirements/layout-navigation.md`
- `docs/conversion/release-notes.md`
- `docs/out-of-scope.md`
- `docs/TODO.md`
- `docs/development-structure.md`
- `docs/design/release-notes/`

## 対象範囲

- `src/pages/release-notes.astro`
  - `/release-notes` ルートを作成する
  - ToCなしページ用ラッパーComponent / Layoutを使用する
  - `AppContainer` 経由でToCなし本文用Layoutを使用し、`showPageToc={false}` 相当の構造にする
  - `.raw/contents/release-notes.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとにページ本文・構造を作成する
  - `getReleaseNotes()` を使って全リリースノートを表示する
  - `getReleaseNoteBody(note)` を使って本文fallbackを扱う
- `src/layouts/NoTocPageLayout.astro` または同等のToCなしページ用ラッパー
  - `AppContainer` からToCなし本文用Layoutとして選択される
  - ToCなしページで共通化したい外側grid、左サイトメニュー、本文 `main` の基本構造を提供する
  - ページ固有の本文 `article`、`prose`、余白、幅指定は各ページ側に閉じる
- `src/pages/index.astro`
  - 既存トップページがToCなしページであるため、表示を大きく変えない範囲でToCなしページ用ラッパーを適用する
  - SEO要件に従い、トップページ `/` では `defaultSeo.title` をそのまま使うため、Layoutへ `title` を渡さない
  - トップページ固有のfirst viewport調整やロゴ・キャッチコピー表現は、このissueの主目的を超えて作り替えない
- `src/components/seo/Seo.astro` またはSEO title生成を担当する既存層
  - ページ固有 `title` が渡された場合、ブラウザタブや `<title>` に表示する文言を `<page title> | defaultSeo.title` 形式にする
  - ページ固有 `title` が渡されない場合は `defaultSeo.title` をそのまま使う
  - `og:site_name` は `defaultSeo.siteName` を使い、`defaultSeo.siteName` は原則として `defaultSeo.title` と同じサイト名を使う
- `src/lib/data/release-notes.ts`
  - 原則として既存関数を利用する
  - ページ実装に必要な不足がある場合のみ、issue範囲内で最小限の調整を行ってよい
- `src/styles/*`
  - 原則としてページ固有styleは `src/pages/release-notes.astro` 内に閉じる
  - 複数ページへ波及させる必要がある場合のみ、既存style方針と整合する範囲で調整してよい
- `docs/design/release-notes/`
  - 実装前に `design-image-generation` initial draft mode でdesign targetを作成する
  - 想定成果物は以下
    - `docs/design/release-notes/notes.md`
    - `docs/design/release-notes/design-desktop.png`
    - `docs/design/release-notes/design-mobile.png`
  - 実装後、完成画面のスクリーンショットを取得し、プロジェクトのdesign / Visual Review運用に従ってdesign正本を更新する
- `.raw/contents/release-notes.md`
  - ローカル作業入力として参照する
  - Git管理対象にしない
  - このissueではDrive正本や `.raw/` 入力そのものを書き換えない

## 初期スコープ外

- リリースノートExcel変換処理の新規作成・再設計は行わない
- `data/generated/release-notes.json` の手編集は行わない
- `ReleaseNote` / `ReleaseNotesJson` スキーマの再設計は行わない
- トップページの最新リリースノート表示仕様は変更しない
- リリースノートの検索、絞り込み、タグ、カテゴリ、ページネーションは実装しない
- 個別リリースノート詳細ページは作成しない
- CMS、編集UI、投稿フォーム、管理画面は作成しない
- DB、SSR、APIサーバー、認証、外部検索サービスを追加しない
- ページ内目次を表示しない
- パンくずリストを追加しない
- 初期スコープ外の項目は `docs/out-of-scope.md` に従う

## 完了条件

- [x] `docs/design/release-notes/` のdesign targetが作成・参照されている
- [x] design画像がない場合、実装前に `design-image-generation` initial draft mode を実行する前提が記録されている
- [x] `/release-notes` で更新履歴ページが表示される
- [x] `src/pages/release-notes.astro` が作成されている
- [x] ToCなしページ用ラッパーComponent / Layoutが作成されている
- [x] `AppContainer` が `showPageToc` に応じてToCあり/なし本文用Layoutを選択している
- [x] ToCなし本文用LayoutでPageToc / MobilePageTocが表示されない
- [x] `/release-notes` がToCなしページ用ラッパーを使用している
- [x] 既存のToCなしページであるトップページが、表示を大きく変えない範囲でToCなしページ用ラッパーを使用している
- [x] トップページ `/` はLayoutへ `title` を渡さず、`defaultSeo.title` をブラウザタイトルとして使っている
- [x] ページ固有 `title` が渡されたページでは、ブラウザタイトルが `<page title> | defaultSeo.title` 形式になる
- [x] ページ固有 `title` が渡されないページでは、ブラウザタイトルが `defaultSeo.title` になる
- [x] `og:site_name` が `defaultSeo.siteName` を使っている
- [x] ページ内目次が表示されない
- [x] `.raw/contents/release-notes.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに画面が作成されている
- [x] `getReleaseNotes()` から取得した全リリースノートが表示される
- [x] 各リリースノートに更新日が表示される
- [x] 更新日は可能な範囲で `<time datetime="YYYY-MM-DD">` としてマークアップされている
- [x] 各リリースノートに本文が表示される
- [x] `body` が `null` または空文字相当の場合、`summary` が本文として表示される
- [x] 本文内の改行が表示に反映される
- [x] リリースノートが0件でもページが壊れず、簡潔な空状態が表示される
- [x] トップページの「更新履歴を見る」導線から遷移できる
- [x] サイトメニューの「更新履歴」項目とルートが整合している
- [x] GitHub Pagesのサブパス公開でリンク・ルートが壊れない
- [x] 完成画面のスクリーンショットを取得し、design正本更新の扱いが記録されている
- [x] 関連TODOを扱った場合は、対応結果または未対応理由が記録されている
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## チェックポイント

- [x] 既存ルートが壊れていない
- [x] `/` から `/release-notes` への内部リンクが壊れていない
- [x] `src/lib/site/menu.ts` の既存メニュー項目と `/release-notes` ルートが整合している
- [x] `data/generated/release-notes.json` を直接ページ側で複雑に加工していない
- [x] ページ側では既存の `src/lib/data/release-notes.ts` を優先して利用している
- [x] Excel本体がない状態でも静的サイトビルドが成立する
- [x] 本文fallbackは `getReleaseNoteBody(note)` の責務と重複実装していない
- [x] 改行反映は `white-space: pre-line` など、最小限の表示制御で実現している
- [x] ToCなしページ用ラッパーの共通余白が、トップページと更新履歴ページで不自然な差を生んでいない
- [x] ToCなしページ用ラッパーが、ToCありページの `ContentLayout` や既存MDXページへ不要に影響していない
- [x] SEO title生成変更が `description`、`og:description`、`og:image`、`og:url` の既存挙動を壊していない
- [x] ページ固有CSSが他ページへ不要に波及していない
- [x] 不要なnpm packageを追加していない
- [x] 検索、絞り込み、ページネーションなど初期スコープ外機能を混ぜていない
- [x] 関連する `docs/TODO.md` 項目と矛盾していない
- [x] 関連する `docs/design/` と矛盾していない
- [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `docs/issue/19-2-release-notes-page.md`
- `docs/design/release-notes/notes.md`
- `docs/design/release-notes/design-desktop.png`
- `docs/design/release-notes/design-mobile.png`
- `src/layouts/NoTocPageLayout.astro` または同等のToCなしページ用ラッパー
- `src/pages/release-notes.astro`
- `src/pages/index.astro`
- `src/components/seo/Seo.astro`

必要になった場合のみ変更するファイル。

- `src/lib/data/release-notes.ts`
- `src/lib/site/seo.ts`
- `src/styles/global.css`
- `src/styles/prose.css`
- `tests/visual/*`

参照するが、原則として変更しないファイル。

- `data/generated/release-notes.json`
- `src/lib/schemas/release-notes.ts`
- `src/lib/site/menu.ts`
- `.raw/contents/release-notes.md`

## レビュー観点

- `/release-notes` が、トップページの最新リリースノート表示と同じデータソースを参照しているか
- 全件表示、更新日表示、本文表示、本文fallback、改行反映が要件通りか
- ページ内目次が表示されていないか
- `/` のブラウザタイトルが `defaultSeo.title` のみになっているか
- `/release-notes` などページ固有titleを持つページのブラウザタイトルが `<page title> | defaultSeo.title` 形式になっているか
- `og:site_name` が `defaultSeo.siteName` を使い、サイト名として妥当か
- ToCなしページ用ラッパーにより、トップページと更新履歴ページの基本余白・本文幅が共通化されているか
- ToCなしページ用ラッパーの導入でトップページの見た目が不必要に変わっていないか
- スマホ表示で日付と本文が読みやすいか
- PC表示で本文幅、余白、更新履歴の密度が既存トップページ・全体Layoutと整合しているか
- 空状態表示が過剰でなく、静的サイトとして自然か
- リリースノートの検索・絞り込み・ページネーションなど、初期スコープ外の機能が混入していないか
- design target `docs/design/release-notes/` の前提が妥当か
- 実装後スクリーンショットをdesign正本へ反映する扱いが、既存のdesign / Visual Review運用と矛盾していないか

## 備考

このissueはremote snapshot draftを元に作成され、ローカルリポジトリで検証した。

ローカル検証で確認済みの項目は以下。

- 現在branchは `19-2-release-notes-page`
- `docs/plan.md` に `19-2-release-notes-page` が存在する
- `docs/issue/19-2-release-notes-page.md` が存在する
- `docs/TODO.md` に `19-2-release-notes-page` へ直接紐づく未対応TODOは見つからなかった
- `data/generated/release-notes.json`、`src/lib/data/release-notes.ts`、`src/pages/index.astro`、`src/lib/site/menu.ts` は存在する
- `src/pages/release-notes.astro` と `src/pages/release-notes.mdx` はまだ存在しない
- 現段階でToCなしページとして実装済みなのは `src/pages/index.astro`
- `.raw/release-notes.xlsx` は存在する
- `docs/design/release-notes/` は作成済みで、`notes.md`、`design-desktop.png`、`design-mobile.png` が存在する

実装前に必要な未準備項目は以下。

- `.raw/contents/release-notes.md` がまだ存在しないため、ユーザー編集済みcontents markdownを配置してから画面本文・構造へ反映する
- `docs/design/release-notes/` は作成済み。実装前に `docs/design/release-notes/notes.md`、`design-desktop.png`、`design-mobile.png` を参照する

追加SEO要件として、`defaultSeo.title` はトップページ `/` のtitle、共通site name、未指定時fallbackとして扱い、元々トップページ `/` に設定されていた `光都暗域〈ネオン・アンダーレルム〉TRPG` を使う。この文字列はサイト共通のゲームタイトル定数 `gameTitle` として保持し、`defaultSeo.title`、`defaultSeo.siteName`、title系の共通表示はこの定数を参照する。ページ固有 `title` が渡された場合は、ブラウザタイトルを `<page title> | defaultSeo.title` 形式にする。トップページ `src/pages/index.astro` ではLayoutへ `title` を渡さない。

本issue-first検証では `npm run check`、`npm run build`、`npm run visual:capture` は未実行。

SEO title生成変更の実装後検証では `npm run check` と `npm run build` を実行済み。`npm run visual:capture` は未実行。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/release-notes/`
- reference desktop: `docs/design/release-notes/design-desktop.png`
- reference mobile: `docs/design/release-notes/design-mobile.png`
- notes: `docs/design/release-notes/notes.md`

### 成果物

- visual test: `tests/visual/release-notes.spec.ts`
- actual desktop: `test-results/visual/release-notes-desktop.png`
- actual mobile: `test-results/visual/release-notes-mobile.png`
- report: `VISUAL_BASE_PORT=4321 npm run visual:capture -- --grep "@release-notes"` output

### レビュー結果

| 領域                  | 判定 | 差分                                                                 | 対応                                         |
| --------------------- | ---- | -------------------------------------------------------------------- | -------------------------------------------- |
| レイアウト            | OK   | design画像は複数件、実装は現行データ1件のため縦量が少ない            | 現行データに従う差分として許容               |
| 余白                  | OK   | designと同じくH1下に一覧を直接配置し、ToC枠はなし                    | `NoTocPageLayout` 側でdesktop余白を共通化    |
| タイポグラフィ        | OK   | 初回確認で本文weightが強かった                                       | 本文weightを通常に修正                       |
| 色                    | OK   | 初回確認でH1下線が既存prose accentの灰色だった                       | 更新履歴ページ内だけ `--color-accent` に修正 |
| 配置・整列            | OK   | 日付が上、本文が下の単純な縦積み                                     | 修正不要                                     |
| レスポンシブ          | OK   | desktop / mobileで横overflowなし                                     | 修正不要                                     |
| overflow / scroll     | OK   | `scrollWidth` と `clientWidth` が一致                                | 修正不要                                     |
| 既存デザインとの整合  | OK   | Header / SiteMenu / Footerは既存Layoutを使用                         | 修正不要                                     |
| 既存Componentとの整合 | OK   | `NoTocPageLayout` が `BaseLayout` と `Seo` の既存propsを透過している | 修正不要                                     |
| accessibility basics  | OK   | H1、`time datetime`、現在ページ `aria-current` を確認                | 修正不要                                     |

### 自己修正した項目

- [x] 更新履歴本文の `font-weight` を通常にした
- [x] 更新履歴ページのH1下線をdesign notesのaccent方向に合わせた
- [x] ToCなしページ共通のdesktop余白を `NoTocPageLayout` に寄せ、トップページ固有の余白上書きを削除した
- [x] `node -e` の独自Playwright実行ではなく、`tests/visual/release-notes.spec.ts` 経由でスクリーンショットを取得する形に修正した

### 人間判断が必要な差分

- design画像は複数件の代表リリースノートを描いているが、現行 `data/generated/release-notes.json` は1件のみ。実装は現行データを正として1件表示にしている。

### design-image-generation への引き継ぎ候補

- [x] 実装スクリーンショットをdesign正本化する必要がある場合は、design fix modeへ引き継ぐ

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

- `src/layouts/NoTocPageLayout.astro` に `.no-toc-page.release-notes-page` の幅指定があり、ToCなし共通Layoutが更新履歴ページ固有のclassに依存している。
- issueでは、ページ固有styleは原則として `src/pages/release-notes.astro` 内に閉じる方針になっているため、責務境界としてはページ側へ寄せる方が明確。

### 判定

- source: pr-review-draft
- classification: valid
- local validation: `.tmp/review.md` はremote PR snapshot由来で、local validation requiredと明記されていた。ローカルではbranch `19-2-release-notes-page` が `origin/19-2-release-notes-page` と同期済みで、working treeはclean。`src/layouts/NoTocPageLayout.astro` に `.no-toc-page.release-notes-page { max-width: min(100%, 54rem); }` が存在し、`src/pages/release-notes.astro` が `contentClass="release-notes-page"` を渡していることを確認した。`docs/issue/19-2-release-notes-page.md` の対象範囲にも、ページ固有styleは原則として `src/pages/release-notes.astro` 内に閉じる方針が記録されている。

### 対応方針

- `NoTocPageLayout.astro` から `release-notes-page` 固有の幅指定を削除する。
- 更新履歴ページだけ本文幅を狭める必要がある場合は、同等の指定を `src/pages/release-notes.astro` 側へ移し、ページ固有styleとして閉じる。
- 共通Layout側の `contentClass` は、ページ側のclass付与用途に留め、Layout内部CSSのページ別切り替えAPIとして扱わない。

### 対応完了チェックリスト

- [x] `NoTocPageLayout.astro` から `release-notes-page` 固有styleを削除した
- [x] 必要な幅調整がある場合は `src/pages/release-notes.astro` 側へ移した
- [x] 修正後のスクリーンショットについてユーザー確認を得た
- [x] 必要に応じてdesign正本を更新した
- [x] `npm run check` が通る
- [x] `npm run build` が通る
- [x] `VISUAL_BASE_PORT=4321 npm run visual:capture -- --grep "@release-notes"` が通る

## レビュー指摘 2

### 指摘事項

- `NoTocPageLayout` の `article` に `contentClass` を差し込み、子ページ側から `:global(.release-notes-page)` で制御する作りは責務境界が曖昧である。
- `BaseLayout` がアプリ全体の共通ロジック、共通UI、ToCあり/なしの分岐、各ページ本文の包み方をまとめて持っており、ToCなしページ固有の構造をきれいに分離しにくい。
- コード重複を許容してでも、アプリ共通ロジック層と表示用Layoutを分け、ToCありLayoutとToCなしLayoutを完全に別Componentとして扱う方が明確。

### 判定

- source: human
- classification: valid
- local validation: `BaseLayout.astro` は `Seo`、`Header`、mobile menu、`SiteMenu`、`PageToc` / `MobilePageToc`、`Footer`、`showPageToc` によるgrid分岐をまとめて持っている。`NoTocPageLayout.astro` は `BaseLayout` に `showPageToc={false}` を渡しつつ、`article.no-toc-page.prose` と `contentClass` を内包している。`src/pages/release-notes.astro` は `contentClass="release-notes-page"` を渡しており、ページ固有styleをLayout内のclassへ依存させる構造になっている。

### 対応方針

- アプリ共通ロジック層を `AppContainer.astro` として分離する。
- `AppContainer.astro` は `html` / `head` / `body`、global CSS import、`Seo`、`Header`、mobile menu、`Footer`、mobile menu script、`showPageToc` に応じたLayout選択を担当する。
- ToCあり本文用LayoutとToCなし本文用Layoutを、`AppContainer` から選ばれる別Componentとして分ける。
- ToCありLayoutは `SiteMenu`、本文 `main`、`PageToc`、`MobilePageToc` を持つ。
- ToCなしLayoutは `SiteMenu` と本文 `main` を持ち、ToCなし用のgrid、余白、`site-main` 相当の制御を自分の中に閉じる。
- `NoTocPageLayout` は `BaseLayout` の再利用ではなく、ToCなし用Layoutとして独立させる。必要に応じて既存の `BaseLayout` はToCありLayout相当へ整理または改名する。
- `NoTocPageLayout` は `no-toc-page` 共通ラッパーを持ち、ToCなしページ共通の本文幅と余白をそこで扱う。
- 各ページは自分の `article` / `div` を自分で持つ。`prose`、`home-page`、`release-notes-page` など本文側classはページ側へ置き、ページ固有styleは通常のscoped CSSで扱う。
- `contentClass` は廃止し、Layout内部CSSのページ別切り替えAPIとして使わない。
- `レビュー指摘 1` の最小対応差分は、この構成変更へ吸収する。

### 対応完了チェックリスト

- [x] `AppContainer.astro` を作成し、アプリ共通ロジック層を分離した
- [x] ToCあり本文用LayoutとToCなし本文用Layoutを別Componentとして分離した
- [x] `BaseLayout` / `NoTocPageLayout` の責務と名前を、分離後の構造に合わせて整理した
- [x] `contentClass` を廃止した
- [x] `NoTocPageLayout` が `no-toc-page` 共通ラッパーを持つ構造にした
- [x] 各ページが自分の `article` / `div` とページ固有本文classを持つ構造にした
- [x] 更新履歴ページ固有styleが `src/pages/release-notes.astro` のscoped CSSで完結している
- [x] トップページがToCなしLayoutで表示され、既存表示を大きく崩していない
- [x] MDX / データページがToCありLayoutで表示され、PageToc / MobilePageTocが壊れていない
- [x] 既存のdesign target対象ページでもスクリーンショットを取得し、表示が壊れていないことを確認した
- [x] 修正後のスクリーンショットについてユーザー確認を得た
- [x] 必要に応じてdesign正本を更新した
- [x] `npm run check` が通る
- [x] `npm run build` が通る
- [x] `VISUAL_BASE_PORT=4321 npm run visual:capture -- --grep "@release-notes"` が通る
