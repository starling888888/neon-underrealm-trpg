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
  - `tip`: `運用のコツ`
  - `warning`: `注意`
  - `danger`: `重要な注意`
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
- 種別マーカーはブランドアイコンに依存せず、シンプルな記号マーカーとして表示する
- 初期マーカー案は `note`: `i`、`tip`: `?`、`warning`: `!`、`danger`: `!!`、`example`: `#`、`version`: `v` とする
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

- `src/pages/-local/mdx-test.mdx` での利用確認
- `src/pages/-local/callouts.mdx` で、目視確認とdesign正本作成に使うCallout一覧確認ページを作成する
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
  - `dist/-local/`
- 除外処理は `src/pages` のソースを削除・移動せず、build成果物だけを削除する
- `_astro` assetはAstroのchunk共有とinline化に任せ、公開build後処理では削除しない

### READMEへの記載サンプル追加

以下を扱う。

- `README.md` に、contents指示書でCallout配置を指定する場合の記載サンプルを追加する
- サンプルでは、`.raw/contents/*.md` の本文内またはHTMLコメント指示で、後続実装者がMDXへ `Callout` を配置できる粒度の書き方を示す
- サンプルでは、少なくとも `type` と任意の `title` を指定する例を示す
- サンプルはCallout Componentの利用方法に限定し、contents markdown全体の運用ルールやGoogle Drive同期手順をこのIssueで拡張しない
- `.raw/contents/*.md` の実ファイルは作成・編集しない

### Visual Review用capture

以下を扱う。

- `/-local/callouts/` で、6種をまとめて確認できる状態にする
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
- Callout用の新規アイコンpackage追加
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
- [x] 6種すべてでブランドアイコンに依存しない記号マーカーが表示される
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
- [x] `npm run build:public` では `dist/-local/` が削除される
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

- [x] `src/pages/-local/callouts.mdx` で6種すべてを確認できる
- [x] `src/pages/-local/mdx-test.mdx` または同等の確認ページでMDX本文からの利用を確認できる
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
- [x] `/-local/mdx-test/` の変更がComponent確認に必要な範囲に留まっている
- [x] Visual Review actual screenshotをGit管理していない
- [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `docs/issue/20-1-common-callout-component.md`
- `docs/design/callout/notes.md`
- `docs/design/callout/design-desktop.png`
- `docs/design/callout/design-mobile.png`
- `README.md`
- `src/components/_common/Callout.astro`
- `src/pages/-local/callouts.mdx`
- `src/pages/-local/mdx-test.mdx`

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
| marker               | OK   | 6種すべてでブランドアイコンに依存しない記号マーカーが表示される。                             |
| responsive           | OK   | mobile幅で折り返し、本文幅、縦積みに破綻なし。                                                |
| overflow             | OK   | Visual captureでページ全体の横スクロールがないことを確認。                                    |
| accessibility basics | OK   | 装飾アイコンは `aria-hidden="true"`、静的本文なので `role="alert"` は付与しない。             |

### セルフ修正

- `_local` 配下のAstro pageは直接route化されないため、最終的に `-local` prefixの通常routeへ変更した。
- Callout一覧確認ページ内の内部リンクを `InternalLink` 経由へ変更した。
- Visual captureにAstro dev toolbarが写り込まないよう、capture時にtoolbar要素を除去した。

### 人間確認事項

- `test-results/visual/callout-*.png` はactual screenshotであり、design正本ではない。実装結果を新しいdesign正本にする場合は、別途 `design-image-generation` design fix modeで扱う。
- `simple-icons` はブランドアイコン集のためCallout種別マーカーには使わず、新規依存のない記号マーカーへ変更した。汎用アイコンライブラリは、Callout初期実装では新規依存を増やすほどの必要性がないため採用しない。

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

## レビュー指摘 1

### 指摘事項

- ローカル確認ページは `src/pages/local/` と公開rootの `src/pages/mdx-test.mdx` に分散させず、ローカル確認用のprefix付きpath配下へまとめる。当初は `_local` を検討したが、Astroで直接route化されないため、最終的に `src/pages/-local/` 配下へまとめる。
- `mdx-test` も確認用ページ群として扱い、`-local` 配下へ移す。preview / postprocess前提の確認ページは `-local` に置かない前提にする。
- production deployから外すrouteは明示指定でよい。削除対象HTMLからだけ参照されるJS / CSS assetが残る場合に追加削除が必要か再検討する。
- `example` Calloutは色で区別できるため、破線borderで囲む必要はない。
- default titleの `コツ` と `重大注意` は日本語として不自然なため再検討する。
- `simple-icons` はブランドアイコン集であり、Callout種別マーカー用途として適切ではない。よりシンプルな汎用アイコン、または記号系マーカーを検討し、必要なら別アイコンライブラリを検討する。

### 判定

- source: human
- classification: valid
- local validation:
  - `src/pages/local/callouts.mdx` が存在し、Callout一覧確認ページは `/local/callouts/` として実装されていた。
  - `src/pages/mdx-test.mdx` が公開root直下に残っていた。
  - `scripts/remove-private-routes/main.ts` は `dist/local/` と `dist/mdx-test/` を削除していたが、削除対象HTMLからのみ参照される `_astro` assetの有無までは判定していなかった。
  - `src/components/_common/Callout.astro` の `.callout-example` は `border-style: dashed` を指定している。
  - `src/components/_common/Callout.astro` のdefault titleは `tip: "コツ"`、`danger: "重大注意"` である。
  - `src/components/_common/Callout.astro` は `simple-icons` から `siNote`, `siLighthouse`, `siAdguard`, `siOpenbugbounty`, `siBookstack`, `siGit` をimportしている。
  - `docs/requirements/components.md` はCalloutの種別として `tip: 運用のコツ`、`danger: 重大注意` を定義しているが、表示ラベルをこの文言へ固定してはいない。
  - `docs/issue/20-1-common-callout-component.md` と `docs/design/callout/notes.md` は `simple-icons` 利用を前提にしているため、別ライブラリへ変更する場合はissue本文またはレビュー対応記録へ、追加理由、代替案、初期スコープ上の必要性を明記する必要がある。

### 対応方針

- `src/pages/local/callouts.mdx` と `src/pages/mdx-test.mdx` を `src/pages/-local/` 配下へ移し、dev serverでアクセスできるか確認する。
- `-local` 配下への移動に合わせて、import path、Visual capture route、README、issue内の対象ファイル・公開build除外説明を更新する。
- `build:public` は、private routeがbuild成果物に出る場合だけ明示削除を行う。private route HTMLからだけ参照されるJS / CSS assetの追加削除は、Astroのasset出力を確認して必要性を再判断する。
- `example` Calloutの破線borderをやめ、色、ラベル、マーカーで識別する。
- default titleは、初期案として `tip: "運用のコツ"`、`danger: "重要な注意"` へ変更する。別案が必要な場合は実装前に指定を受ける。
- Callout種別マーカーは `simple-icons` 前提を取り下げる。対応時に汎用アイコンライブラリまたは記号系マーカーを比較し、採用案と不採用案、依存追加の有無をissueへ記録する。新規npm packageを追加する場合は、AGENTS.mdに従い追加理由、代替案、初期スコープに必要な理由を記録する。
- design正本画像はこのレビュー対応では直接上書きしない。実装結果を新しいdesign正本にする場合は、別途 `design-image-generation` design fix modeで扱う。

### 対応完了チェックリスト

- [x] `src/pages/local/callouts.mdx` を `src/pages/-local/` 配下へ移している
- [x] `src/pages/mdx-test.mdx` を `src/pages/-local/` 配下へ移している
- [x] `-local` 配下の確認ページがdev serverで表示できる
- [x] production build / public buildに確認ページが公開routeとして残らないことを確認している
- [x] private route HTMLからだけ参照されるJS / CSS assetの有無を確認し、追加削除が不要であることを確認している
- [x] Visual capture routeを移動後の確認ページへ更新している
- [x] `example` Calloutの破線borderを削除している
- [x] `tip` / `danger` のdefault titleを見直している
- [x] Callout種別マーカーを `simple-icons` 前提から見直している
- [x] 新規npm packageを追加する場合、追加理由、代替案、初期スコープに必要な理由をissueへ記録している
- [x] READMEとissue本文の確認ページ配置・公開build除外説明を実装後の状態へ更新している
- [x] design正本画像を直接上書きしていない
- [x] `npm run check` が通る
- [x] `npm run build` が通る
- [x] `npm run build:public` が通る
- [x] 対象を絞った `npm run visual:capture` が通る

### 対応メモ

- `src/pages/_local/*.mdx` は直接route化されなかった。route wrapper案は二重Layout等の複雑さが出たため採用せず、特別なローカル確認用prefixとして `src/pages/-local/` を使う方針へ変更した。
- `build:public` は `dist/-local/` だけを削除する。Astro 7.0.6の現在の出力では `-local` pageが参照する外部assetは公開pageも参照する共有CSSのみで、private route専用の外部JS / CSSは生成されていない。小さいpage固有style / scriptはHTMLへinline化されるため、`dist/-local/` の削除で一緒に除外される。
- `_astro` assetの参照解析とprivate専用asset削除は、現状の出力規模と公開リスクに対して複雑さが勝つため採用しない。将来、local確認ページが大きなroute固有assetを生成し、それが実際に問題になる場合に再検討する。
- Callout種別マーカーは新規npm packageを追加せず、`i`, `?`, `!`, `!!`, `#`, `v` の記号マーカーで実装した。`simple-icons` はFooterの外部リンクアイコンでは引き続き使うが、Callout用途からは外した。
- 汎用アイコンライブラリ案は、今回の静的Calloutでは記号マーカーで要件を満たせるため採用しない。新規依存を追加しない方が初期スコープと保守性に合う。

## レビュー指摘 2

### 指摘事項

- `docs/design/callout/notes.md` が、旧 `simple-icons` マーカー案と `example` の破線borderを実装比較基準として残している。
- `Callout.astro` とissue本文は記号マーカー方針へ更新済みのため、design target単体を参照した後続作業者が旧design方針を現行基準と誤読するリスクがある。
- design画像自体を現行実装へ正本化するかどうかは、別途 `design-image-generation` design fix modeの明示承認が必要である。

### 判定

- source: pr-review-draft
- classification: valid
- local validation:
  - review sourceは `.tmp/pr-31-review-draft.md` のremote PR review draftであり、ローカル検証が必要な入力として扱った。
  - `docs/design/callout/notes.md` は `simple-icons` 利用、`example` の破線border、実装比較観点としての `simple-icons` 由来マーカーを残している。
  - `src/components/_common/Callout.astro` は `i`, `?`, `!`, `!!`, `#`, `v` の記号マーカーを使っている。
  - `docs/issue/20-1-common-callout-component.md` は、`simple-icons` をCallout用途から外し、記号マーカーへ変更した判断を記録している。
  - `docs/design/callout/design-desktop.png` と `docs/design/callout/design-mobile.png` はinitial draft画像だったが、ユーザー承認に基づきdesign fix modeで現行実装へ正本化する。

### 対応方針

- ユーザー承認に基づき、`design-image-generation` design fix modeとして、現行実装を `docs/design/callout/` の新しいdesign正本へ反映する。
- `docs/design/callout/notes.md` に、initial draftの `simple-icons` / 破線border案は実装レビューで置き換え済みであることを追記する。
- `docs/design/callout/notes.md` の実装比較観点から、`simple-icons` 必須に読める表現を外し、現行の記号マーカー方針を優先するよう更新する。
- `docs/design/callout/design-desktop.png` と `docs/design/callout/design-mobile.png` を、現行実装の `/-local/callouts/` desktop / mobile表示へ更新する。
- 通常の実装修正ではなくdesign notes整理のため、UI実装・source code変更は行わない。

### 対応完了チェックリスト

- [x] `docs/design/callout/notes.md` が旧 `simple-icons` / 破線border案を現行実装基準として読ませない記述になっている
- [x] `docs/design/callout/notes.md` が現行の記号マーカー方針を参照できる
- [x] `docs/design/callout/design-desktop.png` を現行実装のdesktop表示へ正本化している
- [x] `docs/design/callout/design-mobile.png` を現行実装のmobile表示へ正本化している
- [x] source codeを変更していない
- [x] `npm run format:md` が通る
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー観点

人間レビュー時に確認してほしい観点。

- design targetを `docs/design/callout/` とする方針でよいか
- desktop / mobile designで6種すべてを一度に比較する方針でよいか
- `type` を必須、`title` を省略可能とするAPIでよいか
- `title` 省略時に日本語の既定ラベルを出す方針でよいか
- 既定ラベルを以下とする方針でよいか
  - `補足`
  - `運用のコツ`
  - `注意`
  - `重要な注意`
  - `例`
  - `変更点`
- `version` の既定ラベルを `変更点` とし、具体的な版表記を本文内に書く方針でよいか
- `version` 専用propsや `meta` propsを追加しない方針でよいか
- `title` 指定時に既定ラベルを置き換える方針でよいか
- Calloutタイトルを見出し要素ではなく、ラベル相当の要素として扱う方針でよいか
- 種別マーカーを記号マーカーで実装する方針でよいか
- `note`: `i`、`tip`: `?`、`warning`: `!`、`danger`: `!!`、`example`: `#`、`version`: `v` の割り当てでよいか
- `note`, `tip`, `example`, `version` の違いを、色数を増やしすぎず識別できるdesignになっているか
- `warning` と `danger` の視覚的な強度差が適切か
- 既存 `.prose .callout*` スタイルを拡張するか、`Callout.astro` 側へ移管するか
- Component scoped styleとglobal prose styleの責務境界が明確か
- slot内で許容するMarkdown要素が初期実装として十分か
- `/-local/callouts/` で6種すべてを表示する方針でよいか
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
- `src/pages/-local/mdx-test.mdx` がMDX Componentの確認ページとして存在する
- `src/styles/prose.css` に暫定的な `.callout*` スタイルが存在する
- `src/styles/tokens.css` にneutral、accent、warning、danger系の既存tokenが存在する
- `tests/visual/` に既存のVisual Review capture構成が存在する

remote snapshot draft由来の未検証事項は、上記の範囲でローカル検証済み。design画像の生成、design画像のユーザー承認、実装、表示確認、`npm run check`、`npm run build`、`npm run visual:capture` は実装フェーズ以降の確認項目として未実行のまま残す。

ローカルissue承認だけではComponent実装を開始せず、`docs/design/callout/` のinitial draft作成とユーザー承認を完了してから実装へ進む。
