# ex-02-2-sheet-layout

## 目的

`/character-sheet/` のReact Islandに、後続Gateが編集セクションを配置できる基本レイアウトを作る。desktopでは編集領域を中央で等分した2列、tabletとmobileでは縦一列とする。

## 背景

G0で `/character-sheet/` の静的ページ、G1でReact IslandとRHFの実行基盤を用意した。G2はフォームの入力、編集セクション、操作ペインを先行実装せず、後続Gateが共有するresponsiveな配置契約だけを定める。

このissueで確定するlayout判断は次のとおり。

- desktop（`80rem`以上）では、React Islandの編集領域を中央で等分した2列のgridにする。各列は `minmax(0, 1fr)` とし、長い後続コンテンツが横overflowを起こさないようにする。
- tablet（`48rem`以上かつ`80rem`未満）とmobile（`48rem`未満）では、同じ編集領域を一列にする。
- desktopの左列は、DOM順とtablet/mobileの表示順を保つため、基本情報、ビルド・能力値、副能力値、縁を置く主領域とする。右列は、判定、武器・防具、スキル、専用アイテムなどの後続領域とする。各Gateはこの列責務を基準にsectionを配置する。
- 画像入力はG6の範囲とする。G2では画像表示領域や画像選択buttonを置かず、他の入力群とのdesktop整合を求めない。

関連する正本:

- `docs/issue/done/ex-02-web-character-sheet.md`
- `docs/issue/ex-02-web-character-sheet/plan.md`
- `docs/requirements/character-sheet.md`
- `docs/architectures/character-sheet.md`
- `docs/design/character-sheet/notes.md`
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`

## Gate関係

- 親issue: `docs/issue/done/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G2: desktop、tablet、mobileの基本レイアウト`
- 依存Gate: G0（`docs/issue/done/ex-02-web-character-sheet/ex-02-0-sheet-page-header.md`）、G1（`docs/issue/done/ex-02-web-character-sheet/ex-02-1-sheet-runtime.md`）

このissueはG2だけを実装する自己完結した契約である。G0が定めたページ固有のHeader・サイトメニュー・Pagefind除外と、G1が定めたReact Island / RHF / CSS Modulesの境界を維持する。

## 対象範囲

- `CharacterSheetFormPresenter` とそのCSS Moduleに、desktop 2列・tablet/mobile 1列の編集領域と、後続sectionを受け入れる左右のlayout regionを追加する。
- desktopの2列とtablet/mobileの一列を、既存のページ固有Headerと同じ境界である`80rem` / `48rem`に合わせてCSSで定義する。
- 後続Gateがsectionを挿入できる安定したregion名またはdata attributeを定義し、DOM順を「左列の基本情報、ビルド・能力値、副能力値、縁」から「右列の判定、武器・防具、スキル、専用アイテム」へ連続する順に保つ。
- 既存のPlaywright browser testへ、desktopで2列、tablet/mobileで1列になることに加え、`1279px`で1列、`1280px`で2列となる`80rem`境界の確認を追加する。
- G2でcomponentまたはhook用のtest libraryは導入しない。今回のlayoutは既存Playwrightによるviewport別のDOM/CSS確認で検証でき、React固有の独立したhook・入力操作がまだないためである。実装中にこの方法で確認不能なComponent/hookの振る舞いが生じた場合は、具体的候補、代替案、初期scopeに必要な理由をissueへ追記し、ユーザーの再承認後にだけ導入する。

## 初期スコープ外

- section frame、開閉操作、入力欄、初期値、フォーム値、マスタデータ、派生値、検証、エラー・警告を実装しない。
- 画像表示、drag and drop、ファイル選択、画像変換・保存・失敗dialogを実装しない。画像入力のdesktopでの列内整合もG2では決めない。
- 操作ペイン、floating menu、dialog、JSON入出力、保存・復元、CCFOLIA、全消去、ヘルプを実装しない。
- 共通`AppContainer`、共通Header、共通layout、既存サイト全体をReact化またはSPA化しない。
- UI library、CSS framework、state management library、test libraryを予防的に導入しない。
- character-sheet用VRTのtest spec、canonical snapshot、比較artifactを更新しない。
- 初期スコープ外のDB、認証、SSR、クラウド保存、共有、PDF出力、キャラクター作成ウィザードを追加しない。

## 完了条件

- [x] React Islandの編集領域に、後続section用の左右layout regionがある。
- [x] desktop（`80rem`以上）で、編集領域が`minmax(0, 1fr)`を使う等分2列になる。
- [x] tablet（`48rem`以上かつ`80rem`未満）とmobile（`48rem`未満）で、編集領域が一列になる。
- [x] DOM順とtablet/mobileの表示順が、基本情報、ビルド・能力値、副能力値、縁、判定、武器・防具、スキル、専用アイテムの順を受け入れられる構造である。
- [x] 画像入力の配置を追加・固定せず、G6が独立して決められる余地を残している。
- [x] 既存Playwright browser testでdesktop / tablet / mobileの列数を確認できる。
- [x] 既存Playwright browser testで、`1279px`では一列、`1280px`では2列となる`80rem`境界を確認できる。
- [x] componentまたはhook用test libraryを導入しない。必要性が判明した場合は、導入前に具体的候補・理由・代替案をissueへ追記し、ユーザーの再承認を得る。
- [x] 参照するdesign targetとVRT baselineの扱いを記録している。
- [x] `npm run check` と `npm run build` が通る。

## チェックポイント

- [x] 既存ルート、既存のHeader、Footer、ページ固有のサイトメニューが壊れていない。
- [x] GitHub Pagesのサブパス公開と静的ホスティングに影響しない。
- [x] Island以外をSPA化せず、不要な依存関係を追加していない。
- [x] Pagefind検索index対象外を維持している。
- [x] section、入力、画像、操作、保存、出力を後続Gateから前倒ししていない。
- [x] `docs/TODO.md`の永続スキル参照ID変更検出は、永続保存を扱う将来taskのままとし、このGateでは扱っていない。
- [x] design targetのdesktop / tablet / mobile viewportとVRT扱いに矛盾していない。
- [x] ユーザーの未追跡`canonical-snapshots/visual/character-sheet/`を変更していない。

## 想定変更ファイル

- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/components/CharacterSheetFormPresenter.module.css`
- `tests/visual/character-sheet.spec.ts`
- `docs/issue/ex-02-web-character-sheet/plan.md`（G2完了後の耐久的な引継ぎ）

## レビュー観点

- `80rem`をdesktop開始、`48rem`をmobile開始とする既存ページ固有Headerの境界に合わせ、desktopは中央等分2列、tablet以下は一列とする判断が妥当か。
- desktopの左列から右列へ続くDOM順が、tablet/mobileで要件の縦積み順を保てるか。
- 画像入力の配置をG2で固定せずG6へ残す境界が明確か。
- staticなresponsive layout確認に既存Playwrightを使い、component/hook test libraryを現時点で導入しない判断が妥当か。
- design targetの既存VRT baselineを更新せず、G2の範囲に限定できているか。

## 備考

`docs/TODO.md`の関連項目は、永続スキル参照のID変更検出である。永続保存を追加する将来taskの範囲であり、このGateでは対応しない。

親Gate planは実装可能な粒度への分割、実行順、進行状況、完了Gateの耐久的な引継ぎを管理する。G2の詳細な実装契約はこの子issueに置く。実装完了時には、後続Gateに必要なlayout境界と確定したbreakpointだけを親planのG2へ戻す。
