# ex-02-0-sheet-page-header

## 目的

`/character-sheet/`のAstroページとページ固有のサイトメニュー表示を追加し、後続GateがReact Islandと編集画面を配置できる静的な入口を用意する。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G0: Astro pageとページ固有のサイトメニュー表示`
- 依存Gate: なし

## 確定した実装境界

- `/character-sheet/`は静的Astro pageであり、後続GateのReact Islandは`src/pages/character-sheet.astro`へ直接配置する。
- ページ固有のサイトメニューはtabletの常設rail、desktopとmobileのHeader drawerとする。PageToc、MobilePageToc、キャラクターシート固有のsection navigationは置かない。
- desktopとtabletのmainは本文用の最大幅・中央寄せを使わず、利用可能な横幅を使う。
- キャラクターシートはPagefind検索indexの対象外とする。
- キャラクターシート固有のHeader、drawer、menu scriptはページ側へ閉じ込める。共通`AppContainer`、共通Header、共通layoutに固有の分岐を追加しない。

## 参照正本

- 画面表示とVRT扱い: `docs/design/character-sheet/notes.md`
- 実装境界: `docs/architectures/character-sheet.md`
- 機能・Pagefind要件: `docs/requirements/character-sheet.md`
- 後続Gateへの引継ぎ: `docs/issue/ex-02-web-character-sheet/plan.md`
