# site-menu

## VRT baseline

- test: `tests/visual/vrt/site-menu.spec.ts` の `@vrt @site-menu @<state> @<viewport>`
- route: `/world/`
- state: default
- snapshots:
  - desktop `1440x1200`: `site-menu-default-desktop.png`
  - tablet `820x1180`: `site-menu-default-tablet.png`
  - mobile `390x900`: `site-menu-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- initial draft

## Target

- page / component: `SiteMenu.astro`
- route: 共通Layout内のPC左サイドメニュー。最初の確認対象は `/`
- viewport: desktop `1440x1200`
- states: PC左サイド常設表示の標準状態。階層リンクの展開 / 折りたたみ affordance を含める。hover / focusは別state画像で扱う。

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/requirements.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/base-layout/notes.md`
- `docs/design/header-footer/notes.md`

## Historical source issues

- `docs/issue/done/phase-2/11-site-menu.md`
- `docs/issue/done/phase-2/12-1-site-menu-layout-copy.md`

## Design direction

- visual direction: `base-layout` の左レールプレースホルダーを、ルールサイト全体の構造を静かに示すPC用サイトメニューへ置き換える。白寄り本文面、暗めHeader / Footer、控えめな青緑accentの方向性を維持し、左サイドだけが強く目立つ見た目にしない。
- layout direction: Header下の左サイドバー領域に、リンク群を縦方向に配置する。サイドバー本体には `SITE MENU` / `サイトメニュー` 相当の可視見出しを置かず、メニュー項目そのものを上に詰める。本文カラムを圧迫しすぎない幅とし、右レールのPageToc予定領域とは機能的にも見た目にも混同しない。階層を持つ項目には、階層レベルに関係なく同じ右端ラインに開閉できることが分かる disclosure indicator を付ける。
- typography direction: system fontを使い、親カテゴリ、子項目、3階層目の階層が読み取れるサイズ差とweight差に留める。サイドバー本体の可視見出しには依存しない。2階層目の親リンクはリンクとして認識できる程度に強調してよいが、太字だけを階層表現の主手段にしない。letter-spacingは0とし、長い日本語ラベルが詰まって見えない余白を確保する。
- color / accent usage: 通常状態は低彩度の濃いグレー文字と薄い境界線を基本にする。hover / focusは青緑accentを小さく使い、背景、左線、focus ringなど色以外の手がかりも併用できる方向にする。

## Existing design constraints

- `docs/design/global-styles/` の白寄り背景、暗めグレーHeader、青緑accent、実務的な密度を維持する。
- `docs/design/base-layout/` の3カラム構造を維持し、左レールだけを完成版SiteMenuへ差し替える前提にする。
- `docs/design/header-footer/` のHeader / Footerと競合しない。Header内の検索mockやmobile icon枠を、SiteMenu側で追加・変更しない。
- PC左サイドメニューは、本文を読むための補助ナビゲーションであり、landing page風の大きな装飾やカード群にしない。
- メニュー項目は後続の `12-mobile-menu` で再利用できる構造を想定するが、このdesign targetではmobile drawerの画面を描かない。
- 親カテゴリは対応する親ページのパスが存在する前提で、グループ見出しではなくリンクとして扱う。親リンクと子リンクの階層差が視覚的に分かるようにする。
- 階層構造は最大3階層を想定する。サイドメニュー幅は先に固定せず、3階層の親子関係が詰まりすぎず読めることをdesign画像で確認して判断する。
- 階層を持つ項目は、リンク本体とは別に開閉 affordance が分かる見た目にする。想定表現は小さな chevron / caret / disclosure marker とし、開いている状態と閉じている状態の違いが分かることを優先する。
- `12-1-site-menu-layout-copy` では、子項目開閉トグルを項目左側ではなく右端へ移動する。親階層と子階層でトグル位置を段階的にずらさず、すべて同じ右端ラインに揃える。階層差はリンク本文の左インデントだけで表現する。子項目を持たない項目の左側には、トグル用の不要なspacerを置かない。
- `12-1-site-menu-layout-copy` では、サイドバー本体から `SITE MENU` / `サイトメニュー` の可視見出しを削除する。ただし実装時の `nav aria-label="サイトメニュー"` は維持する。
- 3階層目リンクの左に縦線だけを置く表現は、現在地表示やタイムラインに見える可能性があるため避ける。必要な場合でも、縦線は補助的なガイドに留め、disclosure indicator とインデントで階層を示す。
- design画像上の項目名やリンク数は正確な最終メニュー定義を固定するためのものではない。親子階層、リンクとしての見え方、密度、余白を確認できることを優先する。
- 後続の `15-current-menu-highlight` で現在地表示を追加できる余地は残すが、このdesign targetでは現在ページハイライトを完成状態として描かない。
- 右レールはPageToc予定領域として残す。SiteMenu designで右レールのPageToc実装を進めたように見せない。

## Out of scope

- mobile drawer / overlay
- ヘッダーのメニューボタン開閉挙動
- メニュー項目選択後にdrawerを閉じる挙動
- Escキーでメニューを閉じる挙動
- 現在ページハイライトの完成表現
- `aria-current="page"` の本実装を示す状態
- 親カテゴリの自動展開状態
- 開閉状態の永続化
- PageToc / ページ内目次
- ページ内目次の現在位置ハイライト
- パンくずリスト
- ページ末尾の前後ナビゲーション
- 検索UI、検索結果、Pagefind導入
- 新規ページ本文、未作成ページの内容表示
- Excel変換、JSON生成、データカード表示
- ログイン、CMS、DB、SSR、APIサーバー
- キャラクターシート、ダイスローラー、戦闘シミュレーター等のツール導線
- 高度なアニメーション、発光表現、過剰なネオン装飾

## Comparison points for implementation

- 左レールプレースホルダーが、PC用サイトメニューとして認識できる構造に置き換わっている。
- メニューは `nav` landmarkとして成立し、実装時に `aria-label` を設定できる見た目・構造になっている。
- サイドバー本体に `SITE MENU` / `サイトメニュー` の可視見出しが表示されていない。
- 親カテゴリもリンクとして見え、最大3階層の子項目との階層差が分かるが、情報量が過密になりすぎていない。
- 階層を持つ項目には、階層レベルに関係なく同じ右端ラインに disclosure indicator があり、折りたたみ可能であることが分かる。
- 子項目を持たない項目の左側に、トグル用の空白が残っていない。
- 2階層目の親リンクが太字だけで階層を示していない。強調は控えめで、インデント、余白、disclosure indicator と併用されている。
- 3階層目リンク左の縦線が、現在地表示や選択状態に見えない。縦線を使う場合も主役にせず、必要なら削除する。
- 標準画像では現在ページハイライトやhover / focus状態に見える強調を入れない。
- hover / focusは見た目が異なる場合のみ別state画像で確認し、現在ページハイライトと混同しない。
- 左サイドメニューが本文幅を不自然に狭めず、中央本文の読みやすさを保っている。
- Header / Footerの存在感と競合せず、ページ全体が同じデザイン体系に見える。
- 右レールのPageToc予定領域や検索UIをSiteMenu design内で実装済みのように見せていない。
- 未作成ページへのリンクは、正確な項目表示よりも親子階層が分かることを優先して表現されている。
- 差分として許容できるもの: メニュー項目名の最終文言、リンク数、セクション分割、右端トグルの共通ラインを保った範囲での微調整、インデント量の微調整、項目表示の正確性。
- レビューが必要な差分: `SITE MENU` / `サイトメニュー` の可視見出しを戻す、未作成ページを目立つ無効状態にする、現在地ハイライトに見える強調を入れる、mobile drawerやPageTocを描き込む、左レール幅を大きく変える、折りたたみ可能性が分からない階層表現にする。

## Generation source

- source branch / commit when applicable: initial version `11-site-menu`; updated for `12-1-site-menu-layout-copy`
- route when applicable: `/`
- viewport: desktop `1440x1200`
- comparison notes: PC左サイド常設サイトメニューでは、`base-layout` の左レールをSiteMenuへ置き換える前提で、global stylesとHeader / Footerの方向性を維持する。サイドバー本体から `SITE MENU` / `サイトメニュー` 相当の可視見出しを削除し、メニュー項目を上に詰めた。親カテゴリもリンクとして扱い、最大3階層の親子階層が分かることを優先する。階層を持つ項目には、折りたたみ可能であることが分かる disclosure indicator を階層レベルに関係なく同じ右端ラインへ表示する。サイドメニュー幅は3階層表示の読みやすさを見て判断する。mobile drawer、現在地ハイライト、PageToc、検索、パンくず、前後ナビゲーションなど、このdesignの対象外である後続taskの機能は含めない。

## Open questions

- PC左サイドメニューの幅は、最大3階層が読めるVRT baselineを確認して判断する。
- hover / focusの見た目が異なる場合はstate tagを分ける。見た目が同じ場合はnotesで扱う。

## site-layout正本化後の扱い

- `site-menu` はPC左サイトメニュー単体の初期draftとして維持する。
- 現在ページハイライトを含む完成状態は、`docs/design/current-menu-highlight/` と `docs/design/site-layout/` を参照する。
- `site-layout`のdesktop VRT baselineは、Header / Footer / SiteMenu / PageTocを含む横断layout内でのPC左サイトメニューを確認する。
- `site-layout`のmobile menu open VRT stateは、スマホdrawer内SiteMenuで現在ページとancestor表示を含む状態を確認する。
