# ex-02-1-sheet-runtime

## 目的

`/character-sheet/`へ`client:load`のReact Islandを接続し、後続GateがReact Hook Form（RHF）を唯一の編集stateとして使うための、最小の実行基盤を用意する。

## 背景

親issueのG0で、静的な`/character-sheet/`ページとページ固有のサイトメニューを作成した。G1では、既存サイト全体をSPA化せず、キャラクターシートだけをReact Islandとしてhydrateする。

関連する正本:

- `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/ex-02-web-character-sheet.md`
- `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/plan.md`
- `docs/requirements/character-sheet.md`
- `docs/architectures/character-sheet.md`
- `docs/design/character-sheet/notes.md`
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/issue/milestone-01/plan.md`
- `docs/TODO.md`

## 実装開始の前提条件

- 親Gate planへ、現行templateが要求するG1の自己完結したGate briefを追加し、本issueとの目的、許可範囲、参照正本、依存、完了境界、引継ぎを照合する。親plan全体のGate brief不足を解消する方法は、親issueの管理としてユーザー承認を得て決める。
- React Componentのスタイル方式は、`docs/architectures/character-sheet.md`で確定したCSS Modules（`*.module.css`、追加依存なし）を使う。G1では、この方式を適用・検証する。
- ユーザーの明示指示「branch切らなくて良い」に従い、G1専用branchは作成せず、現在の`ex-02-web-character-sheet` branchでこの子issueを管理する。この例外は、子issue名とbranch名の通常の一致規則より優先する。既存の未追跡`canonical-snapshots/visual/character-sheet/`は取り込まず、変更しない。

## Gate関係

- 親issue: `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/plan.md`
- Gate: `G1: React Islandなどの実行基盤`
- 依存Gate: `G0`（`docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/ex-02-0-sheet-page-header.md`）

このissueは、G1だけを実装するための自己完結した契約である。G0で確定した`src/pages/character-sheet.astro`へIslandを直接配置する境界、共通layoutへ固有分岐を追加しない境界、Pagefind対象外の維持を前提とする。

## 対象範囲

- `@astrojs/react`、`react`、`react-dom`、`react-hook-form`と、型検査で実際に必要なReact型定義を追加し、AstroのReact integrationを設定する。
- `src/character-sheet/CharacterSheetContainer.tsx`を、`client:load`でhydrateするIslandのRoot / Containerとして追加する。formのDOM配置は`components/CharacterSheetFormPresenter.tsx`へ分離する。
- IslandはRHFの`useForm`と`FormProvider`を持てる構成にする。ただし、具体的な入力値の型、初期値、schema、可変行、マスタデータ、派生値、検証、保存・復元、ブラウザAPIは実装しない。
- `src/pages/character-sheet.astro`へIslandを直接配置し、既存の静的Header、Footer、サイトメニュー、Pagefind除外を維持する。
- React ComponentにはCSS Modules（`*.module.css`、追加依存なし）を適用する。
- `CharacterSheetContainer`は実際にRHFの`useForm`でform instanceを生成し、`FormProvider`でIsland配下を構成する。Container直下にはFormPresenterと、Rootで扱う必要があるdialog Componentだけを置く。
- G1はユーザーが操作できる入力をまだ持たないため、hydrate状態を示す検証専用のDOM・state・E2E testを追加しない。実際の操作によるIslandの動作確認は、入力を追加する後続Gateで行う。視覚表現とVRT対象は変更しない。

## 初期スコープ外

- desktop、tablet、mobileの編集画面layout、section frame、入力欄、操作ペインを実装しない。
- 具体的なフォーム値、初期値、Zod schema、可変行、マスタデータadapter、派生値算出、エラー・警告を実装しない。
- localStorage、IndexedDB、`idb-keyval`、画像、JSON入出力、CCFOLIA、dialog、clipboard、downloadを実装または導入しない。`idb-keyval`の導入は画像保存を扱うG6へ委ねる。
- 既存のAstroページ、共通`AppContainer`、共通Header、共通layoutをReact化またはSPA化しない。
- UIライブラリ、CSS framework、state management library、フォーム同期ライブラリ、ルールエンジンを追加しない。
- character-sheet用VRTのtest spec、canonical snapshot、比較artifactを更新・コミットしない。
- 初期スコープ外のDB、認証、SSR、クラウド保存、共有、PDF出力、キャラクター作成ウィザードを追加しない。

## 完了条件

- [x] `@astrojs/react`、React、React DOM、RHFが、選定済みアーキテクチャに沿って必要最小限の依存として追加されている。
- [x] `/character-sheet/`の`src/pages/character-sheet.astro`が、`client:load`の`CharacterSheetContainer`を直接配置している。
- [x] `CharacterSheetContainer`が、実際の`useForm`と`FormProvider`を持つ、後続Gateで入力セクションを接続できるRHFのフォームRoot / Containerになっている。
- [x] `CharacterSheetFormPresenter`がformのDOM配置を担い、Containerが画面配置を持たないContainer / Presenter境界を確認した。
- [x] Island固有の実装が`src/character-sheet/`配下に閉じ込められ、既存の共通layout、Header、Footer、ナビゲーションへ固有分岐を追加していない。
- [x] React ComponentのスタイルにCSS Modulesを使い、CSS Modules用の追加依存を導入していない。
- [x] `/character-sheet/`が静的公開routeかつPagefind検索index対象外のままである。
- [x] hydrate状態を示す検証専用のDOM・state・E2E testを追加していない。実際のユーザー操作による動作確認は、入力を追加する後続Gateへ委ねている。
- [x] character-sheet用VRTのtest spec、canonical snapshot、比較artifactを変更していない。
- [x] `npm run check`、`npm run build`、既存の対象browser testが通る。

## チェックポイント

- [x] 既存ルート、既存のHeader、Footer、ページ固有のサイトメニューが壊れていない。
- [x] GitHub Pagesのサブパス公開と静的ホスティングに影響しない。
- [x] Island以外をSPA化せず、不要な依存関係を追加していない。
- [x] RHF以外に編集値を複製するstate storeを追加していない。
- [x] `idb-keyval`、保存同期、画像・JSON・CCFOLIAの実装を後続Gateから前倒ししていない。
- [x] `docs/TODO.md`の「永続スキル参照でID変更を検出してエラーにする」は、キャラクターシートの永続保存を追加する将来taskのままとし、このGateで扱っていない。
- [x] design targetのviewport・VRT扱いと矛盾していない。
- [x] ユーザーの未追跡`canonical-snapshots/visual/character-sheet/`を変更していない。

## 想定変更ファイル

- `package.json`
- `package-lock.json`
- `astro.config.mjs`
- `src/pages/character-sheet.astro`
- `src/character-sheet/CharacterSheetContainer.tsx`
- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `docs/architectures/character-sheet.md`
- 必要最小限のテストファイル
- `docs/issue/milestone-01/done/cross-phase/ex-02-web-character-sheet/plan.md`（G1完了後の耐久的な引継ぎのみ）

## レビュー観点

- React Islandの範囲が`/character-sheet/`に限られ、サイト全体のSPA化や共通layoutへの固有分岐を招かないか。
- G1を実行基盤に限定し、layout・入力・保存・画像・出力を後続Gateに残せているか。
- `idb-keyval`をG6まで導入しない分割が、画像保存の採用方針と矛盾しないか。
- CSS Modulesを追加依存なしで使い、既存Astro scoped CSSと共存できているか。
- `useForm`と`FormProvider`により、実行基盤を後続Gateの実際のユーザー操作へ接続できる状態にしつつ、内部hydrateを観測する検証専用実装を置いていないか。
- `docs/design/character-sheet/notes.md`のVRT運用（G31までコミットしない）を守れているか。

## 備考

親Gate planにはG1の概要と共通境界はあるが、現行templateが求める自己完結したGate briefは未記載である。本issueは、親planのG1記載と参照正本からG1の作業契約を具体化するが、実装前に親planの不足を解消する必要がある。実装完了時には、後続Gateに必要な確定事項だけを親planのG1へ戻す。

`docs/TODO.md`の関連項目は永続スキル参照のID変更検出であり、初期scope外の将来taskであるため、このGateでは対応しない。
