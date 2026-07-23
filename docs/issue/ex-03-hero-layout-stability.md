# ex-03-hero-layout-stability

## 目的

トップページのタイトルロゴを共通 `ImageBlock` で表示する。TOPロゴを含む全ページhero画像が、取得・復号の前から最終表示と同じ領域を確保し、desktop / mobileとも後続コンテンツを移動させないようにする。

`public/` 直下のタイトルロゴとTOPロゴは `public/images/` 配下へ集約する。faviconと共通OGP画像は `public/` 直下に維持する。

## 背景

`docs/plan.md` の `ex-03-hero-layout-stability` は、ヒーロー画像の表示遅延によるコンテンツ位置ずれを防ぐtaskである。

現在、TOPロゴは直接 `<img>` で表示しており、`ImageBlock` を経由していない。また、共通 `ImageBlock` と流儀・生き様詳細の直接 `<img>` は `width` / `height` 属性を出力せず、画像取得前に正確な高さを予約できない。

ユーザーの決定により、通常hero画像はすべて `1672x941` に統一し、TOPロゴだけに専用寸法 `1015x762` を使う。これらの寸法は専用の定数ファイルへ集約し、各ページへ数値をベタ書きしない。

関連する参照先:

- `docs/requirements/pages.md` の FR-03、FR-03-02
- `docs/requirements/assets-seo.md` の FR-07
- `docs/out-of-scope.md` の高度な画像最適化、`ImageBlock`、ヒーロー領域確保
- `docs/plan.md` の `ex-03-hero-layout-stability`
- `docs/design/home/`
- `docs/design/header-footer/`
- `docs/issue/done/phase-3/18-1-common-image-block-component.md`
- `docs/issue/done/phase-3/18-2-home-page.md`

`docs/TODO.md` に、このtaskで直接回収する項目はない。ゲーム画像生成方針のTODOは `54-1-game-image-generation-policy` に残す。本issueでは既存ロゴ・hero画像を生成、加工、再デザインしない。

## 対象範囲

- `ImageBlock` に任意の `width` / `height` propsを追加し、`<img>` 属性へ出力すること
- `src/lib/site/imageDimensions.ts` に通常heroとTOPロゴの寸法定数を定義すること
- TOPロゴを `ImageBlock` に変更し、専用寸法 `1015x762` を渡すこと
- 通常hero画像を表示する全箇所に、寸法定数を使って `width="1672"` / `height="941"` を渡すこと
  - `/world`、`/advancement`、`/character-making`
  - `/rules`、`/rules/battle`、`/rules/scenario-play`
  - `/data`、`/data/ryugi`、`/data/ikizama`
  - `/data/items` と各アイテム種別ページ
  - 流儀・生き様詳細の動的hero
- 実装前に、通常hero素材がすべて `1672x941` に統一済みであることを確認すること
- `public/` 直下の以下4ファイルを `public/images/` へ移動すること
  - `title_logo.png`
  - `title_logo.webp`
  - `top_logo.png`
  - `top_logo.webp`
- 移動後の参照先を更新すること
  - `src/lib/site/siteMeta.ts`
  - `src/pages/index.astro`
  - `src/pages/-local/mdx-test.mdx`
  - `docs/design/home/notes.md`
  - `docs/design/header-footer/notes.md`
- desktop / mobileでTOPと各種heroの読み込み前後にレイアウトシフトが発生しないことを確認するための、必要最小限のtestを追加または更新すること
- GitHub Pagesのbase pathを通したタイトルロゴ・TOPロゴ・hero画像参照を確認すること

## 選定済み実装方針: 案A

- `src/lib/site/imageDimensions.ts` に `heroImageDimensions` と `topLogoImageDimensions` を定義する。
- `ImageBlock` に任意の `width` / `height` propsを追加する。
- 固定ページheroと動的detail heroを含む通常heroには、`heroImageDimensions` を渡す。
- TOPロゴには `topLogoImageDimensions` を渡す。
- TOPロゴも同じ `ImageBlock` のpropsを使い、現行の `.home-logo` CSSを維持する。
- ブラウザ標準のアスペクト比予約を使うため、クライアントJS、skeleton、画像読み込み状態の管理を追加しない。

`width` / `height` 属性はCSS上の表示幅を固定しない。TOPのdesktop最大 `36rem`・mobile本文幅いっぱい、および各heroの既存レスポンシブ表示を維持する。

## 初期スコープ外

- タイトルロゴ、OGP、favicon、hero画像の新規生成・加工・再デザイン
- 画像の自動リサイズ、複数解像度生成、CDN連携、Astro Imageへの移行などの高度な画像最適化
- 読み込み完了の監視、fade animation、progressive image等のクライアントJSを使う画像ローダー
- skeletonの追加
- Headerのロゴデザイン、トップページの本文・導線・コンテンツ順の変更
- faviconと共通OGP画像の移動、参照パス変更、互換リダイレクト
- 新規design targetまたはdesign画像の作成
- `54-1-game-image-generation-policy` が扱う画像生成方針の決定
- `docs/plan.md` の完了チェック更新

## 完了条件

- [x] 通常hero素材がすべて `1672x941` であることを確認する
- [x] 寸法定数が `src/lib/site/imageDimensions.ts` に集約され、各ページに数値がベタ書きされていない
- [x] TOPロゴが `ImageBlock` を用いて表示され、`topLogoImageDimensions` 由来の `width="1015"` / `height="762"` 属性を持つ
- [x] 通常heroの全表示箇所が `heroImageDimensions` 由来の `width="1672"` / `height="941"` 属性を持つ
- [x] 画像取得・復号前から、TOPと各種heroの表示後と同じ高さの領域が確保される
- [x] TOPロゴのdesktop / mobileの表示幅・余白、および各heroの既存レスポンシブ表示を変えない
- [x] desktop / mobileでTOPと代表的な通常hero、アイテムhero、流儀詳細hero、生き様詳細heroの読み込み前後に後続コンテンツの位置ずれがないことを確認する
- [x] `public/` 直下のタイトルロゴ・TOPロゴ4ファイルが `public/images/` 配下へ移動し、現行コード・現行design文書に旧パス参照が残らない
- [x] HeaderロゴとTOPロゴが新パスで表示・解決される
- [x] faviconと共通OGP画像が `public/` 直下に維持され、参照コードを変更しない
- [x] 関連design noteのassetパスが新配置と一致する
- [x] GitHub Pagesのサブパス配下でタイトルロゴ・TOPロゴ・hero画像URLが壊れない
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## チェックポイント

- [x] 既存ルートが壊れていない
- [x] GitHub Pagesのサブパス公開に影響しない
- [x] 不要な依存関係を追加していない
- [x] 不要なクライアントJSを追加していない
- [x] 初期スコープ外の機能を実装していない
- [x] 関連する `docs/TODO.md` 項目と矛盾していない
- [x] `docs/design/home/`、`docs/design/header-footer/` と矛盾していない
- [x] 実装結果のVisual Review screenshotをdesign正本として直接コピーしていない
- [x] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `docs/issue/ex-03-hero-layout-stability.md`
- `docs/design/home/notes.md`
- `docs/design/header-footer/notes.md`
- `src/components/_common/ImageBlock.astro`
- `src/lib/site/imageDimensions.ts`
- `src/lib/site/siteMeta.ts`
- `src/pages/index.astro`
- `src/pages/-local/mdx-test.mdx`
- `src/pages/world.mdx`
- `src/pages/advancement.mdx`
- `src/pages/character-making.mdx`
- `src/pages/rules/index.mdx`
- `src/pages/rules/battle.mdx`
- `src/pages/rules/scenario-play.mdx`
- `src/pages/data/index.mdx`
- `src/pages/data/ryugi/index.astro`
- `src/pages/data/ryugi/[ryugiId].astro`
- `src/pages/data/ikizama/index.astro`
- `src/pages/data/ikizama/[ikizamaId].astro`
- `src/pages/data/items/index.mdx`
- `src/pages/data/items/{weapons,armors,omamori,cybernetics,nanomachines,drugs}.mdx`
- `public/images/title_logo.png`
- `public/images/title_logo.webp`
- `public/images/top_logo.png`
- `public/images/top_logo.webp`
- 通常hero素材のうち `1672x941` でない既存ファイル（存在する場合のみ）
- 必要最小限の `tests/visual/` または確認用test

## レビュー観点

- 通常heroを `heroImageDimensions`、TOPロゴのみ `topLogoImageDimensions` として、寸法定数を1ファイルへ集約する構成でよいか。
- `width` / `height` 属性はCSS上の表示幅を固定せず、既存mobileレイアウトを維持する理解でよいか。
- TOPロゴと各種heroをまとめて、読み込み前の領域確保対象とする範囲でよいか。
- faviconと共通OGP画像を `public/` 直下に維持し、新規design targetを作らない範囲でよいか。

## 備考

- 現在の `ImageBlock` は `width: auto; max-width: 100%; height: auto` で表示する。`width` / `height` 属性を追加してもこのCSSは維持されるため、画像は従来どおりmobileでコンテナ幅に収まる。
- TOPロゴはdesktopで最大 `36rem`、mobileで本文幅いっぱいの現行表示を維持する。
- 新規design targetとdesign画像は作成しない。既存 `docs/design/home/` はTOPロゴの表示幅・余白を確認する参照として使う。
- faviconと共通OGP画像は `public/` 直下に維持し、`src/layouts/AppContainer.astro`、`src/lib/site/seo.ts`、`docs/deployment.md` を変更しない。
- 「旧パス参照が残らない」は移動対象であるタイトルロゴ・TOPロゴについての現行コードと現行design文書を対象とする。完了済みissueとdesignの `Historical source issue`、`Generation Source` にある履歴上の旧パスは書き換えない。

## ビジュアルレビュー 1

- 実施日: 2026-07-23
- 対象: トップページのTOPロゴ（desktop / mobile）
- 参照: `docs/design/home/design-desktop.png`、`docs/design/home/design-mobile.png`
- actual screenshot: `test-results/visual/hero-layout-stability-desktop.png`、`test-results/visual/hero-layout-stability-mobile.png`

| 観点     | 結果                                                                                                                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop  | TOPロゴの幅・中央配置・最新リリースノートとの余白は参照designと一致し、`ImageBlock` のfigure余白は追加されていない。                                                                                  |
| mobile   | 本文幅に収まるTOPロゴの幅・中央配置・後続セクションまでの余白は参照designと一致する。                                                                                                                 |
| hero領域 | `@hero-layout-stability` testが固定ページhero全箇所と流儀・生き様詳細hero、TOPロゴの属性を確認する。代表4ケースは画像request保留中と取得後の後続要素Y座標、response成功、subpath付き`src`も確認する。 |

- `npm run visual:capture` は追加したhero testを含む83件が通過した。検索modalの3件は`-local/data-cards`を含む既存Pagefind indexによるstrict locator重複で失敗し、本issueの変更対象外とした。
- `npm run check` と `npm run build` は通過した。
- actual screenshotはVisual Review成果物として`test-results/visual/`にのみ置き、design正本は更新していない。

## レビュー指摘 1

### 指摘事項

- `hero-layout-stability` Visual Testは寸法属性を確認するが、画像requestを遅延した読み込み前状態と復号後で後続要素の位置が不変であること、移動後assetが実際に取得できることまでは確認していない。
- Pagefindが`-local/data-cards`をindex化した場合の既存検索Visual Test失敗は、本issue外のfollow-upとして`docs/TODO.md`へ追跡する。

### 判定

- source: local-pr-review
- classification: valid（画像読み込み前後の位置不変とasset取得を回帰テストする不足） / follow-up（既存Pagefind検索Visual Testの安定化）
- local validation: `tests/visual/hero-layout-stability.spec.ts`は`width` / `height`と表示可否を確認するのみで、遅延request中の後続要素位置、`naturalWidth`、response成功をassertしていない。`docs/plan.md`の`53-content-smoke-test`には検索確認があるため、検索Visual Testの安定化を同taskへ紐付けた。

### 対応方針

- current issueでは、代表的なTOPロゴ、通常hero、アイテムhero、動的heroについて、画像request遅延中と読み込み完了後の後続要素Y座標が一致すること、GitHub Pagesサブパス付きの画像URLと正常取得を確認するtestへ強化する。
- `-local`ページのindex除外または既存検索Visual Testのlocator調整は、`53-content-smoke-test`で扱う。

### 対応完了チェックリスト

- [x] 読み込み前後の後続要素位置と移動後asset取得を確認するVisual Testへ強化する
- [x] GitHub Pagesサブパス付き画像URLをtestで確認する
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 2

- 実施日: 2026-07-23
- 対象: `ImageBlock`に寸法propsがある画像の領域予約
- 参照: `docs/design/home/design-desktop.png`、`docs/design/home/design-mobile.png`
- actual screenshot: `test-results/visual/hero-layout-stability-desktop.png`、`test-results/visual/hero-layout-stability-mobile.png`

| 観点     | 結果                                                                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop  | TOPロゴの幅・中央配置・後続の最新リリースノートまでの余白はdesign正本と一致する。                                                                           |
| mobile   | TOPロゴの本文幅・中央配置・後続セクションまでの余白はdesign正本と一致する。                                                                                 |
| hero領域 | `width` / `height` を持つ`ImageBlock`画像はコンテナ幅を取得前から確保し、代表4ケース×desktop / mobileで画像request保留中と取得後の後続要素Y座標が一致した。 |

- `npm run visual:capture -- --grep @hero-layout-stability` は9件すべて通過した。
- actual screenshotはVisual Review成果物として`test-results/visual/`にのみ置き、design正本は更新していない。
