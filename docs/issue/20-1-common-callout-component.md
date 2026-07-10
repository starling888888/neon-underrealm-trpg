# 20-1-common-callout-component

## 目的

Markdown / MDX本文内で注意書き、補足、例、警告、変更点を表示する共通Callout Component `Callout.astro` を作成する。

このタスクでは、以下を満たす。

- `note`, `tip`, `warning`, `danger`, `example`, `version` の6種を扱える
- 種別ごとに既定ラベルを持ち、必要に応じて表示タイトルを上書きできる
- 本文をdefault slotとして受け取れる
- 色だけに依存せず、ラベルと種別マーカーでも種別を識別できる
- PC / mobileの本文幅で破綻しない
- はじめにページ以外の後続ページでも再利用できる
- MDX本文から簡潔な記法で利用できる
- 実装前にComponent単体のdesignを作成し、人間レビューを受ける

## 背景

`docs/plan.md` の `20-1-common-callout-component` を実施する。

後続の `20-2-introduction-page`、`23-2-rules-page` をはじめとするルール本文ページでは、通常本文と区別したうえで、補足、運用上のコツ、注意、重大注意、例、バージョン変更点を提示する必要がある。

`docs/requirements/components.md` では、以下のCallout種別が定義されている。

- `note`: 補足
- `tip`: 運用のコツ
- `warning`: 注意
- `danger`: 重大注意
- `example`: 例
- `version`: 変更点・V1.5注記

また、Calloutは色だけに依存せず、見出し、アイコン、ラベルなどでも種別が判別できる必要がある。

現在の `src/styles/prose.css` には、CSS基盤作成時に追加された暫定的な以下のスタイルが存在する。

- `.callout`
- `.callout-note`
- `.callout-warning`
- `.callout-danger`

これらは6種のCallout Componentを実装したものではなく、`tip`, `example`, `version` を扱っていない。`Callout.astro` の実装時には、既存スタイルを意図的に再利用・拡張するか、Component側へ移管したうえで不要な暫定スタイルを削除し、スタイル責務が重複しないよう整理する。

関連TODO:

- `docs/TODO.md` に、このタスクへ直接回収すべき未対応TODOは見当たらない。
- 「既存 `docs/design/*/notes.md` を `design-image-generation` のnotes構造へ寄せる」TODOは存在するが、既存design target全体の整理はこのIssueへ取り込まない。
- 新規作成する `docs/design/callout/notes.md` は、最初から現行の `design-image-generation` notes構造に従う。

関連design target:

- 新規作成:
  - `docs/design/callout/`
- 既存整合参照:
  - `docs/design/global-styles/notes.md`
  - 必要に応じて `docs/design/base-layout/notes.md`
  - 必要に応じて `docs/design/site-layout/notes.md`

design-image-generation前提条件:

- `Callout.astro` の実装前に `.agents/skills/design-image-generation/SKILL.md` のinitial draft modeを実行する。
- 以下をComponent designの草案として作成する。
  - `docs/design/callout/notes.md`
  - `docs/design/callout/design-desktop.png`
  - `docs/design/callout/design-mobile.png`
- design画像では6種すべてを比較できるようにする。
- initial draftは、ユーザーが承認するまでdesign正本として確定扱いしない。
- design承認前に `Callout.astro` の実装へ進まない。

## 対象範囲

### Component design

このタスクで以下を扱う。

- `docs/design/callout/` の新規作成
- `design-image-generation` initial draft modeによるComponent design作成
- `notes.md` への以下の記録
  - mode
  - target
  - viewport
  - 表示対象となる6種のCallout
  - 参照したSSoT
  - 既存global stylesとの整合方針
  - 色、罫線、ラベル、種別マーカーの方針
  - mobile表示方針
  - 初期スコープ外
  - 実装後の比較観点
  - 未確定事項
- desktop designで6種の見た目を比較できること
- mobile designで6種を縦に配置した場合の余白、折り返し、本文幅を確認できること
- 長い正確なルール本文ではなく、短い代表文を使用すること
- ページ全体ではなく、本文カラム内で使われるComponentとして設計すること

### Callout Component

以下を実装対象とする。

- `src/components/_common/Callout.astro` の作成
- Callout種別のTypeScript union定義

```ts
type CalloutType =
  | "note"
  | "tip"
  | "warning"
  | "danger"
  | "example"
  | "version";
```

- propsの初期API

```ts
interface Props {
  type: CalloutType;
  title?: string;
}
```

- `type` は必須とする
- `title` は省略可能とする
- `title` 省略時は、種別ごとの既定ラベルを表示する
- 既定ラベルの初期案は以下とする
  - `note`: `補足`
  - `tip`: `コツ`
  - `warning`: `注意`
  - `danger`: `重大注意`
  - `example`: `例`
  - `version`: `変更点`
- `title` 指定時は既定ラベルの代わりに指定されたタイトルを表示する
- `version` の具体的な版表記はCallout本文内で扱い、`versionLabel` や `meta` 等の追加propsは初期実装では設けない
- Callout本文をdefault slotとして受け取る
- slot内で少なくとも以下を表示できる
  - 段落
  - 箇条書き
  - リンク
  - inline code
  - `strong`
- slot内の先頭要素と末尾要素に不要な余白を残さない
- ラベルまたはタイトルを常に視覚表示する
- 種別ごとに識別可能なアイコン、記号、形状等の種別マーカーを表示する
- 種別マーカーは既存依存の `simple-icons` を使って表示する
- 初期アイコン案は `note`: `siNote`、`tip`: `siLighthouse`、`warning`: `siAdguard`、`danger`: `siOpenbugbounty`、`example`: `siBookstack`、`version`: `siGit` とする
- 装飾目的のアイコンは支援技術へ重複して読み上げられないようにする
- 色、ラベル、種別マーカーの複数要素で種別を識別できるようにする
- Callout内のタイトルによってページ見出し階層やPageTocを汚染しない
- Calloutタイトルには、ページ内目次対象となる `h2` / `h3` を使用しない
- 静的な本文要素として扱い、通常状態では `role="alert"` を使用しない
- client-side JavaScriptを使用しない
- Astroのhydration directiveを使用しない
- 特定ページの文言やレイアウトをComponentへ埋め込まない

### スタイル整理

以下を扱う。

- `src/styles/tokens.css` の既存トークンを優先利用する
- 以下の既存色系統との整合
  - neutral / prose accent
  - teal accent
  - warning
  - danger
- 6種すべてを高彩度の別色へ分けるのではなく、ラベルと種別マーカーを併用する
- `note`, `tip`, `example`, `version` の意味差が識別できること
- `warning` と `danger` の強度差が識別できること
- 白寄り背景、暗めの本文色、低彩度の境界線という既存方針を維持する
- 過剰な発光、グラデーション、ぼかしを追加しない
- `src/styles/prose.css` の暫定Calloutスタイルを整理する
- Component scoped styleまたはglobal prose styleのどちらを正本とするかを決める
- 同じセレクタに対する競合するスタイルを残さない
- 新しいsemantic color tokenが必要な場合も、必要最小限に留める

### 利用確認

以下を扱う。

- `src/pages/mdx-test.mdx` での利用確認
- `src/pages/local/callouts.mdx` で、目視確認とdesign正本作成に使うCallout一覧確認ページを作成する
- 6種すべてのCalloutを表示する
- `title` 省略時の既定ラベルを確認する
- `title` 指定時の表示を確認する
- 段落、箇条書き、リンク、inline codeを含むslot表示を確認する
- desktop幅での表示確認
- mobile幅での表示確認
- Componentが本文幅を超えてページ全体の横スクロールを発生させないことの確認
- Markdown由来の本文を最終的なMDXページへ配置する現在の運用を妨げないことの確認

### 公開buildからのローカル確認ページ除外

以下を扱う。

- GitHub Pages deploy用に、ローカル確認ページを `dist/` から削除する公開buildコマンドを追加する
- `npm run build` はローカル確認ページを含む通常buildとして維持する
- `npm run build:public` を追加し、`npm run build` 後に公開しないrouteを `dist/` から削除する
- GitHub Actions deployでは `npm run build:public` を使う
- 初期除外対象は以下とする
  - `dist/local/`
  - `dist/mdx-test/`
- 除外処理は `src/pages` のソースを削除・移動せず、build成果物だけを削除する

### READMEへの記載サンプル追加

以下を扱う。

- `README.md` に、contents指示書でCallout配置を指定する場合の記載サンプルを追加する
- サンプルでは、`.raw/contents/*.md` の本文内またはHTMLコメント指示で、後続実装者がMDXへ `Callout` を配置できる粒度の書き方を示す
- サンプルでは、少なくとも `type` と任意の `title` を指定する例を示す
- サンプルはCallout Componentの利用方法に限定し、contents markdown全体の運用ルールやGoogle Drive同期手順をこのIssueで拡張しない
- `.raw/contents/*.md` の実ファイルは作成・編集しない

### Visual Review用capture

以下を扱う。

- `/mdx-test` または専用の既存確認ルートで、6種をまとめて確認できる状態にする
- desktop / mobileの実装結果を取得できる、対象を絞ったVisual Review用captureを追加または既存テストへ追加する
- 実装結果を `docs/design/callout/` のinitial draftと比較する
- `test-results/` やPlaywright actual screenshotはGit管理しない
- 実装結果をdesign正本へ反映する場合は、ユーザーの明示承認後に `design-image-generation` design fix modeで扱う
- Visual Reviewの都合だけでinitial draft画像を自動的に上書きしない

### 検証

以下を実行する。

- `npm run check`
- `npm run build`
- 対象を絞った `npm run visual:capture`

## 初期スコープ外

このIssueでは以下を扱わない。

- `20-2-introduction-page` の実装
- `/introduction.mdx` の作成
- はじめにページの本文配置
- `23-2-rules-page` その他の後続ページ実装
- Callout本文に掲載する正式なゲームルール文章の作成
- `.raw/contents/*.md` の作成または編集
- Google Drive上の原稿更新
- Markdown parserの拡張
- remark / rehype pluginの追加
- `:::warning` 等の独自directive記法
- raw `.md` ファイル内でAstro Componentを直接実行する新しい変換機構
- Calloutの開閉機能
- Calloutの折り畳み機能
- Calloutの閉じるボタン
- Calloutの表示状態保存
- 動的通知
- toast
- modal
- form validation message
- `role="alert"` を使う即時通知UI
- nested Callout専用処理
- 任意色を指定するprops
- 任意アイコンを指定するprops
- 任意HTML classを外部から注入するAPI
- `version` 専用の版番号props
- `meta` 等の汎用補助ラベルprops
- `size`, `compact`, `outlined` 等の追加variant
- hover animation
- 発光表現
- 大規模なアイコンライブラリの追加
- `simple-icons` 以外の新規アイコンpackage追加
- UI frameworkの追加
- client-side state managementの追加
- 検索UI
- ダイスローラー
- キャラクターシート機能
- 戦闘シミュレーター
- CMS
- DB
- 認証
- SSR
- API server
- PWA
- design承認前のComponent実装
- 実装結果の無承認なdesign正本化
- `docs/plan.md` のチェック更新
- GitHub Issue作成
- PR作成
- commit / push
- `docs/out-of-scope.md` で初期スコープ外とされているその他の機能

## 完了条件

### Component design

- [x] `docs/design/callout/notes.md` が作成されている
- [x] `docs/design/callout/design-desktop.png` が作成されている
- [x] `docs/design/callout/design-mobile.png` が作成されている
- [x] design画像で `note`, `tip`, `warning`, `danger`, `example`, `version` の6種を比較できる
- [x] design画像で、色以外のラベルと種別マーカーによる識別方法が確認できる
- [x] desktop / mobileそれぞれで本文、ラベル、余白、折り返しが確認できる
- [x] `docs/design/global-styles/` の方向性と矛盾していない
- [x] design画像に初期スコープ外の機能を描いていない
- [x] `notes.md` に実装時の比較観点と未確定事項が記録されている
- [x] initial draftがユーザーにレビューされ、実装に使用してよいdesignとして明示承認されている

### Component実装

- [x] `src/components/_common/Callout.astro` が作成されている
- [x] `type` propが6種のTypeScript unionとして定義されている
- [x] 未定義のCallout種別をTypeScript上で指定できない
- [x] `title` propを省略できる
- [x] `title` 省略時に種別ごとの既定ラベルが表示される
- [x] `title` 指定時に指定されたタイトルが表示される
- [x] `version` の具体的な版表記を専用propsではなく本文内で扱う方針になっている
- [x] default slotに本文を配置できる
- [x] slot内の段落、箇条書き、リンク、inline code、`strong` が破綻しない
- [x] slot内の先頭・末尾要素に不要な余白が残らない
- [x] 6種すべてでラベルまたはタイトルが視覚表示される
- [x] 6種すべてで色以外の種別マーカーが表示される
- [x] 6種すべてで既存依存の `simple-icons` アイコンが表示される
- [x] 種別マーカーが装飾目的の場合、支援技術による重複読み上げを避けている
- [x] Calloutのタイトルがページ内目次へ混入しない
- [x] 静的Calloutに不適切な `role="alert"` を付与していない
- [x] client-side JavaScriptやhydrationを使用していない
- [x] PC / mobile幅でComponent表示が破綻しない
- [x] Componentがページ全体の横スクロールを発生させない
- [x] 特定ページ専用ではなく後続ページでも再利用できるAPIになっている
- [x] 新規npm packageを追加していない

### 公開build除外

- [x] `npm run build` ではローカル確認ページを含むbuildができる
- [x] `npm run build:public` では `dist/local/` と `dist/mdx-test/` が削除される
- [x] GitHub Actions deployが `npm run build:public` を使っている
- [x] 削除対象routeがソースファイルではなく `dist/` に限定されている

### 既存スタイルとの統合

- [x] `src/styles/prose.css` の既存 `.callout*` スタイルの扱いが明確になっている
- [x] 既存スタイルを再利用・拡張する場合は6種すべてへ対応している
- [x] Component側へ移管する場合は不要な暫定スタイルを削除している
- [x] Component scoped styleとglobal styleが競合していない
- [x] 既存CSS tokensを優先利用している
- [x] 新規tokenを追加した場合は、用途と追加理由が明確である
- [x] `warning` と `danger` の強度差が視覚的に分かる
- [x] `note`, `tip`, `example`, `version` を色だけで区別していない
- [x] 既存の白寄り背景、低彩度、実務的な情報密度を維持している

### 利用・表示確認

- [x] `src/pages/local/callouts.mdx` で6種すべてを確認できる
- [x] `src/pages/mdx-test.mdx` または同等の確認ページでMDX本文からの利用を確認できる
- [x] MDX本文からimportして利用できる
- [x] `title` 省略時と指定時の両方を確認している
- [x] 段落以外のslot内容も確認している
- [x] `README.md` にcontents指示書でのCallout記載サンプルが追加されている
- [x] READMEのサンプルが `.raw/contents/*.md` 実ファイルの作成・編集を要求していない
- [x] desktop表示を確認している
- [x] mobile表示を確認している
- [x] 実装結果を `docs/design/callout/` のdesignと比較している
- [x] designとの差分がある場合は、その理由と扱いが記録されている
- [x] Playwright actual screenshotを `docs/design/` へ直接コピーしていない
- [x] 関連TODOをこのIssueへ取り込まない判断が記録されている
- [x] `npm run check` が通る
- [x] `npm run build` が通る
- [x] 対象を絞った `npm run visual:capture` が通る

## チェックポイント

- [x] 既存ルートが壊れていない
- [x] GitHub Pagesのサブパス公開に影響しない
- [x] 不要な依存関係を追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] 関連する `docs/TODO.md` 項目と矛盾していない
- [x] 関連する `docs/design/` と矛盾していない
- [x] `docs/design/callout/` のinitial draftが実装前に承認されている
- [x] 6種の違いを、6種類の強いアクセントカラーだけで表現していない
- [x] warning / danger以外へ暖色を過剰使用していない
- [x] 青緑accentを本文装飾へ過剰使用していない
- [x] Calloutを通常本文より目立たせすぎていない
- [x] `danger` がページ全体の視線を常に奪うほど過剰な表現になっていない
- [x] `version` が `note` や `tip` と識別できる
- [x] Calloutタイトルがページの見出し階層を壊していない
- [x] CalloutタイトルがPageTocへ追加されていない
- [x] screen reader向けの情報が、色や装飾アイコンだけに依存していない
- [x] static contentへ不必要なalert semanticsを付けていない
- [x] slot内のMarkdown要素へComponent外の想定外スタイルを広げていない
- [x] `src/styles/prose.css` に使用されない暫定Callout CSSを残していない
- [x] 特定ページの都合を共通Componentへ持ち込んでいない
- [x] `/mdx-test` の変更がComponent確認に必要な範囲に留まっている
- [x] Visual Review actual screenshotをGit管理していない
- [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `docs/issue/20-1-common-callout-component.md`
- `docs/design/callout/notes.md`
- `docs/design/callout/design-desktop.png`
- `docs/design/callout/design-mobile.png`
- `README.md`
- `src/components/_common/Callout.astro`
- `src/pages/local/callouts.mdx`
- `src/pages/mdx-test.mdx`

実装方針に応じて変更する可能性があるファイル:

- `package.json`
  - `build:public` scriptを追加する場合。
- `.github/workflows/deploy.yml`
  - GitHub Pages deployで公開buildコマンドを使う場合。
- `scripts/remove-private-routes/main.ts`
  - 公開build後にローカル確認routeを `dist/` から削除する場合。
- `src/styles/prose.css`
  - 既存の暫定Calloutスタイルを再利用、拡張、移管または削除する場合。
- `src/styles/tokens.css`
  - 既存tokenだけではdesignを表現できず、最小限のsemantic token追加が必要な場合のみ。
- `tests/visual/callout.spec.ts`
  - Callout専用のVisual Review captureを新設する場合。
- 既存の `tests/visual/*.spec.ts`
  - 既存のMDX確認captureへCallout確認を追加する方が責務上適切な場合のみ。

原則として変更しないファイル:

- `src/layouts/*`
- `src/components/layout/*`
- `src/scripts/*`
- `src/lib/data/*`
- `src/pages/index.astro`
- `src/pages/release-notes.astro`
- `docs/requirements/*`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `package.json`
- `package-lock.json`

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/callout/`
- reference desktop: `docs/design/callout/design-desktop.png`
- reference mobile: `docs/design/callout/design-mobile.png`
- notes: `docs/design/callout/notes.md`

### 成果物

- actual desktop: `test-results/visual/callout-desktop.png`
- actual mobile: `test-results/visual/callout-mobile.png`
- report: Playwright output

### レビュー結果

| 観点                 | 結果 | メモ                                                                                          |
| -------------------- | ---- | --------------------------------------------------------------------------------------------- |
| layout               | OK   | 実装は実ページ上の本文カラムで確認。designはComponent単体なのでSiteLayoutの有無だけが異なる。 |
| spacing              | OK   | desktop / mobileともCallout同士の余白と本文内余白に破綻なし。                                 |
| typography           | OK   | タイトルは見出し要素ではなくラベル相当で表示され、本文階層を汚染しない。                      |
| color                | OK   | `example` は `version` より視認性が高く、`warning` / `danger` の強度差も確認できる。          |
| marker               | OK   | 6種すべてで `simple-icons` 由来のアイコンが表示される。                                       |
| responsive           | OK   | mobile幅で折り返し、本文幅、縦積みに破綻なし。                                                |
| overflow             | OK   | Visual captureでページ全体の横スクロールがないことを確認。                                    |
| accessibility basics | OK   | 装飾アイコンは `aria-hidden="true"`、静的本文なので `role="alert"` は付与しない。             |

### セルフ修正

- `_local` 配下のAstro pageはbuild対象にならないため、一覧確認ページを `src/pages/local/callouts.mdx` とし、公開buildで `dist/local/` を削除する方針へ変更した。
- Callout一覧確認ページ内の内部リンクを `InternalLink` 経由へ変更した。
- Visual captureにAstro dev toolbarが写り込まないよう、capture時にtoolbar要素を除去した。

### 人間確認事項

- `test-results/visual/callout-*.png` はactual screenshotであり、design正本ではない。実装結果を新しいdesign正本にする場合は、別途 `design-image-generation` design fix modeで扱う。
- `simple-icons` はブランドアイコン集のため、`siNote`, `siLighthouse`, `siAdguard`, `siOpenbugbounty`, `siBookstack`, `siGit` の種別割り当てが意味的に十分かは人間レビュー対象に残す。

### 実行確認

- [x] desktop screenshotを取得した
- [x] mobile screenshotを取得した
- [x] design参照と実装結果を比較した
- [x] Visual Review内で必要なセルフ修正を実施した
- [x] actual screenshotを `docs/design/` へコピーしていない
- [x] `npm run check` が通った
- [x] `npm run build` が通った
- [x] `npm run build:public` が通った
- [x] `npm run visual:capture -- --grep "@callout"` が通った

## レビュー観点

人間レビュー時に確認してほしい観点。

- design targetを `docs/design/callout/` とする方針でよいか
- desktop / mobile designで6種すべてを一度に比較する方針でよいか
- `type` を必須、`title` を省略可能とするAPIでよいか
- `title` 省略時に日本語の既定ラベルを出す方針でよいか
- 既定ラベルを以下とする方針でよいか
  - `補足`
  - `コツ`
  - `注意`
  - `重大注意`
  - `例`
  - `変更点`
- `version` の既定ラベルを `変更点` とし、具体的な版表記を本文内に書く方針でよいか
- `version` 専用propsや `meta` propsを追加しない方針でよいか
- `title` 指定時に既定ラベルを置き換える方針でよいか
- Calloutタイトルを見出し要素ではなく、ラベル相当の要素として扱う方針でよいか
- 種別マーカーを既存依存の `simple-icons` で実装する方針でよいか
- `note`: `siNote`、`tip`: `siLighthouse`、`warning`: `siAdguard`、`danger`: `siOpenbugbounty`、`example`: `siBookstack`、`version`: `siGit` の割り当てでよいか
- `note`, `tip`, `example`, `version` の違いを、色数を増やしすぎず識別できるdesignになっているか
- `warning` と `danger` の視覚的な強度差が適切か
- 既存 `.prose .callout*` スタイルを拡張するか、`Callout.astro` 側へ移管するか
- Component scoped styleとglobal prose styleの責務境界が明確か
- slot内で許容するMarkdown要素が初期実装として十分か
- `/mdx-test` で6種すべてを表示する方針でよいか
- READMEへ追加するcontents指示書サンプルの粒度が、後続ページ実装者にとって十分か
- READMEのサンプルが、このIssueで `.raw/contents/*.md` を作成・編集する誤解を生まないか
- Callout専用Visual Review captureを追加することが過剰品質になっていないか
- raw Markdown向けの独自directiveをこのIssueで作らない判断でよいか
- collapsible、dismissible、任意色、任意アイコン等を初期スコープ外とする判断でよいか

## 備考

このIssueの推奨実行順は以下とする。

1. ローカルリポジトリ状態を確認する
2. branch `20-1-common-callout-component` を作成または確認する
3. local issue `docs/issue/20-1-common-callout-component.md` を作成または検証する
4. ユーザーがlocal issueを承認する
5. `design-image-generation` initial draft modeを実行する
6. `docs/design/callout/` のdesign草案をユーザーがレビューする
7. ユーザーがdesignを実装に使用してよいものとして明示承認する
8. `Callout.astro` の実装を開始する
9. Visual Reviewでdesignとの差分を確認する
10. 実装結果をdesign正本へ反映する必要がある場合は、別途明示承認を得てdesign fix modeを実行する

ローカル検証では、以下を確認した。

- current branch: `20-1-common-callout-component`
- local issue: `docs/issue/20-1-common-callout-component.md`
- `docs/plan.md` に `20-1-common-callout-component` が存在する
- `docs/requirements/components.md` に6種のCallout要件が存在する
- `docs/requirements/non-functional.md` に「色だけに依存して情報を表現しない」要件が存在する
- `docs/out-of-scope.md` は、このIssueの初期スコープ外と矛盾しない
- `docs/TODO.md` に、このIssueへ直接回収すべきCallout関連TODOは見当たらない
- `docs/design/callout/` は未作成であり、実装前に `design-image-generation` initial draft mode が必要である
- `docs/design/global-styles/notes.md`、`docs/design/base-layout/notes.md`、`docs/design/site-layout/notes.md` を既存整合参照として使える
- `src/components/_common/` は共通Component配置先として使われている
- `src/components/_common/ImageBlock.astro` が既存の共通Componentとして存在する
- `src/pages/mdx-test.mdx` がMDX Componentの確認ページとして存在する
- `src/styles/prose.css` に暫定的な `.callout*` スタイルが存在する
- `src/styles/tokens.css` にneutral、accent、warning、danger系の既存tokenが存在する
- `tests/visual/` に既存のVisual Review capture構成が存在する

remote snapshot draft由来の未検証事項は、上記の範囲でローカル検証済み。design画像の生成、design画像のユーザー承認、実装、表示確認、`npm run check`、`npm run build`、`npm run visual:capture` は実装フェーズ以降の確認項目として未実行のまま残す。

ローカルissue承認だけではComponent実装を開始せず、`docs/design/callout/` のinitial draft作成とユーザー承認を完了してから実装へ進む。
