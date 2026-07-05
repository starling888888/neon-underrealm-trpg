# site-menu

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
- `docs/issue/11-site-menu.md`
- `docs/design/global-styles/notes.md`
- `docs/design/base-layout/notes.md`
- `docs/design/header-footer/notes.md`

## Design direction

- visual direction: `base-layout` の左レールプレースホルダーを、ルールサイト全体の構造を静かに示すPC用サイトメニューへ置き換える。白寄り本文面、暗めHeader / Footer、控えめな青緑accentの方向性を維持し、左サイドだけが強く目立つ見た目にしない。
- layout direction: Header下の左サイドバー領域に、セクション見出しとリンク群を縦方向に配置する。本文カラムを圧迫しすぎない幅とし、右レールのPageToc予定領域とは機能的にも見た目にも混同しない。階層を持つ親リンクには、開閉できることが分かる disclosure indicator を付ける。
- typography direction: system fontを使い、メニュー見出し、親カテゴリ、子項目の階層が読み取れるサイズ差とweight差に留める。2階層目の親リンクはリンクとして認識できる程度に強調してよいが、太字だけを階層表現の主手段にしない。letter-spacingは0とし、長い日本語ラベルが詰まって見えない余白を確保する。
- color / accent usage: 通常状態は低彩度の濃いグレー文字と薄い境界線を基本にする。hover / focusは青緑accentを小さく使い、背景、左線、focus ringなど色以外の手がかりも併用できる方向にする。

## Existing design constraints

- `docs/design/global-styles/` の白寄り背景、暗めグレーHeader、青緑accent、実務的な密度を維持する。
- `docs/design/base-layout/` の3カラム構造を維持し、左レールだけを完成版SiteMenuへ差し替える前提にする。
- `docs/design/header-footer/` のHeader / Footerと競合しない。Header内の検索mockやmobile icon枠を、SiteMenu側で追加・変更しない。
- PC左サイドメニューは、本文を読むための補助ナビゲーションであり、landing page風の大きな装飾やカード群にしない。
- メニュー項目は後続の `12-mobile-menu` で再利用できる構造を想定するが、このdesign targetではmobile drawerの画面を描かない。
- 親カテゴリは対応する親ページのパスが存在する前提で、グループ見出しではなくリンクとして扱う。親リンクと子リンクの階層差が視覚的に分かるようにする。
- 階層構造は最大3階層を想定する。サイドメニュー幅は先に固定せず、3階層の親子関係が詰まりすぎず読めることをdesign画像で確認して判断する。
- 階層を持つ親リンクは、リンク本体とは別に開閉 affordance が分かる見た目にする。想定表現は小さな chevron / caret / disclosure marker とし、開いている状態と閉じている状態の違いが分かることを優先する。
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
- 親カテゴリもリンクとして見え、最大3階層の子項目との階層差が分かるが、情報量が過密になりすぎていない。
- 階層を持つ親リンクには disclosure indicator があり、折りたたみ可能であることが分かる。
- 2階層目の親リンクが太字だけで階層を示していない。強調は控えめで、インデント、余白、disclosure indicator と併用されている。
- 3階層目リンク左の縦線が、現在地表示や選択状態に見えない。縦線を使う場合も主役にせず、必要なら削除する。
- 標準画像では現在ページハイライトやhover / focus状態に見える強調を入れない。
- hover / focusは見た目が異なる場合のみ別state画像で確認し、現在ページハイライトと混同しない。
- 左サイドメニューが本文幅を不自然に狭めず、中央本文の読みやすさを保っている。
- Header / Footerの存在感と競合せず、ページ全体が同じデザイン体系に見える。
- 右レールのPageToc予定領域や検索UIをSiteMenu design内で実装済みのように見せていない。
- 未作成ページへのリンクは、正確な項目表示よりも親子階層が分かることを優先して表現されている。
- 差分として許容できるもの: メニュー項目名の最終文言、リンク数、セクション分割、余白の微調整、項目表示の正確性。
- レビューが必要な差分: 未作成ページを目立つ無効状態にする、現在地ハイライトに見える強調を入れる、mobile drawerやPageTocを描き込む、左レール幅を大きく変える、折りたたみ可能性が分からない階層表現にする。

## Generation source

- generator or capture source: SVGモックをImageMagick `convert` でPNGへ変換した。元SVGは `.tmp/site-menu-design-desktop.svg` に置く。hover / focusの見た目が異なる場合のみ、`design-desktop-hover.png` / `design-desktop-focus.png` のようなstate-specific imageを別途作成する。
- source branch / commit when applicable: `11-site-menu`
- route when applicable: `/`
- viewport: desktop `1440x1200`
- prompt summary or capture notes: PC左サイド常設サイトメニューのinitial draft画像を生成した。`base-layout` の左レールをSiteMenuへ置き換える前提で、global stylesとHeader / Footerの方向性を維持する。親カテゴリもリンクとして扱い、最大3階層の親子階層が分かることを優先する。階層を持つ親リンクには、折りたたみ可能であることが分かる disclosure indicator を表示する。項目表示の正確性はdesign画像では固定しないため、画像内ラベルはASCIIの短い代表ラベルにしている。サイドメニュー幅は3階層表示の読みやすさを見て判断する。mobile drawer、現在地ハイライト、PageToc、検索、パンくず、前後ナビゲーションなど後続タスクや初期スコープ外の機能は描き込まない。

## Open questions

- PC左サイドメニューの幅は、最大3階層が読めるdesign画像を見てから判断する。
- hover / focusの見た目が異なる場合はstate画像を分ける。見た目が同じ場合は標準画像とnotesの記述で扱う。
