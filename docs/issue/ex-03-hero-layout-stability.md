# ex-03-hero-layout-stability

## 目的

トップページのタイトルロゴを共通 `ImageBlock` で表示する。TOPロゴを含む全ページhero画像が、取得・復号の前から最終表示と同じ領域を確保し、desktop / mobileとも後続コンテンツを移動させないようにする。

`public/` 直下のタイトルロゴとTOPロゴは `public/images/` 配下へ集約する。faviconと共通OGP画像は `public/` 直下に維持する。

## 背景

`docs/plan.md` の `ex-03-hero-layout-stability` は、ヒーロー画像の表示遅延によるコンテンツ位置ずれを防ぐtaskである。

現在、TOPロゴは直接 `<img>` で表示しており、`ImageBlock` を経由していない。また、共通 `ImageBlock` と流儀・生き様詳細の直接 `<img>` は `width` / `height` 属性を出力せず、画像取得前に正確な高さを予約できない。

ユーザーの決定により、通常hero画像はすべて `1672x941` に統一し、TOPロゴだけに専用寸法 `1015x762` を使う。これにより、ID別の画像寸法管理は不要とする。

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
- TOPロゴを `ImageBlock` に変更し、専用寸法 `1015x762` を渡すこと
- 通常hero画像を表示する全箇所に、固定の `width="1672"` / `height="941"` を渡すこと
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

- `ImageBlock` に任意の `width` / `height` propsを追加する。
- 固定ページheroと動的detail heroを含む通常heroには、すべて `1672x941` を渡す。
- TOPロゴには `1015x762` を渡す。
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

- [ ] 通常hero素材がすべて `1672x941` であることを確認する
- [ ] TOPロゴが `ImageBlock` を用いて表示され、`width="1015"` / `height="762"` 属性を持つ
- [ ] 通常heroの全表示箇所が `width="1672"` / `height="941"` 属性を持つ
- [ ] 画像取得・復号前から、TOPと各種heroの表示後と同じ高さの領域が確保される
- [ ] TOPロゴのdesktop / mobileの表示幅・余白、および各heroの既存レスポンシブ表示を変えない
- [ ] desktop / mobileでTOPと代表的な通常hero、アイテムhero、流儀詳細hero、生き様詳細heroの読み込み前後に後続コンテンツの位置ずれがないことを確認する
- [ ] `public/` 直下のタイトルロゴ・TOPロゴ4ファイルが `public/images/` 配下へ移動し、現行コード・現行design文書に旧パス参照が残らない
- [ ] HeaderロゴとTOPロゴが新パスで表示・解決される
- [ ] faviconと共通OGP画像が `public/` 直下に維持され、参照コードを変更しない
- [ ] 関連design noteのassetパスが新配置と一致する
- [ ] GitHub Pagesのサブパス配下でタイトルロゴ・TOPロゴ・hero画像URLが壊れない
- [ ] `npm run check` が通る
- [ ] `npm run build` が通る

## チェックポイント

- [ ] 既存ルートが壊れていない
- [ ] GitHub Pagesのサブパス公開に影響しない
- [ ] 不要な依存関係を追加していない
- [ ] 不要なクライアントJSを追加していない
- [ ] 初期スコープ外の機能を実装していない
- [ ] 関連する `docs/TODO.md` 項目と矛盾していない
- [ ] `docs/design/home/`、`docs/design/header-footer/` と矛盾していない
- [ ] 実装結果のVisual Review screenshotをdesign正本として直接コピーしていない
- [ ] ユーザーの未コミット変更を破壊していない

## 想定変更ファイル

- `docs/issue/ex-03-hero-layout-stability.md`
- `docs/design/home/notes.md`
- `docs/design/header-footer/notes.md`
- `src/components/_common/ImageBlock.astro`
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

- 通常heroを `1672x941` 固定、TOPロゴのみ `1015x762` とし、ID別寸法helperを導入しない構成でよいか。
- `width` / `height` 属性はCSS上の表示幅を固定せず、既存mobileレイアウトを維持する理解でよいか。
- TOPロゴと各種heroをまとめて、読み込み前の領域確保対象とする範囲でよいか。
- faviconと共通OGP画像を `public/` 直下に維持し、新規design targetを作らない範囲でよいか。

## 備考

- 現在の `ImageBlock` は `width: auto; max-width: 100%; height: auto` で表示する。`width` / `height` 属性を追加してもこのCSSは維持されるため、画像は従来どおりmobileでコンテナ幅に収まる。
- TOPロゴはdesktopで最大 `36rem`、mobileで本文幅いっぱいの現行表示を維持する。
- 新規design targetとdesign画像は作成しない。既存 `docs/design/home/` はTOPロゴの表示幅・余白を確認する参照として使う。
- faviconと共通OGP画像は `public/` 直下に維持し、`src/layouts/AppContainer.astro`、`src/lib/site/seo.ts`、`docs/deployment.md` を変更しない。
- 「旧パス参照が残らない」は移動対象であるタイトルロゴ・TOPロゴについての現行コードと現行design文書を対象とする。完了済みissueとdesignの `Historical source issue`、`Generation Source` にある履歴上の旧パスは書き換えない。
