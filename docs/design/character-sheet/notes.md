# character-sheet

## モード

- 要件の復元とデザイン準備
- このノートは、承認済み要件から復元した画面内容、制約、将来の比較観点を記録する。最終レイアウトのドラフトでも、ページ実装の承認でもない。

## 対象とVRT参照情報

- ページ / コンポーネント: `/character-sheet/`で動作するWebキャラクターシート。コンポーネント境界は未決定。
- デザイン確認用ビューポート:
  - desktop: `1440x1200`
  - ultrawide: `1920x1200`。desktop本文の最大幅と中央寄せを確認するactual capture用であり、canonical baselineは作成しない。
  - tablet: `820x1180`
  - mobile: `390x900`
- desktop、tablet、mobileを初期scopeに含める。各viewportの具体的なlayoutとVRT状態は、対応するGateで定める。
- 現在のVRT対象: `tests/visual/vrt/character-sheet.spec.ts`の`@vrt @character-sheet`。routeは`/character-sheet/`で、full-pageのdefault / tooltip代表、section variation、dialog variationを対象とする。
- 2026-07-29、ユーザー承認により、G17の武器・防具sectionを含む現行画面へ`@character-sheet`のローカルcanonical snapshotを更新した。既存full-page snapshot 51件（desktop、ultrawide、tablet、mobileの既存対応分）を更新し、同じtargetの通常比較は51件成功した。G17の7 state × 3 viewportはlocator-onlyであり、full-page canonical snapshotは作成しない。
- 2026-07-29、ユーザー承認により、G18のお守りカテゴリと名称選択tooltipを含む現行画面へ`@character-sheet`のcanonical snapshotを更新した。お守りの候補dialog、選択済み行、mobile効果展開、各名称tooltipは、desktop / tablet / mobileのlocator screenshotで確認する。これらの局所状態はfull-page canonical snapshotを増やさない。
- 2026-07-29、ユーザー承認により、G19のサイバネカテゴリを含む現行画面へ`@character-sheet`の既存canonical snapshotを更新した。`cybernetics-default`、候補dialog、効果展開、その他行追加、名称tooltip、埋め込み点数合計／埋め込み上限tooltip、上限超過errorをdesktop / tablet / mobileのlocator screenshotで確認する。これらの局所状態はfull-page canonical snapshotを増やさない。
- 2026-07-29、ユーザー承認により、G20のナノマシン固定4行と候補dialogを含む現行画面へ`@character-sheet`のcanonical snapshotを更新する。`nanomachines-default`、選択済み、効果展開、埋め込み上限超過、候補dialogをdesktop / tablet / mobileのowner sectionまたはdialog locator screenshotで確認する。名称tooltipと埋め込み点数集計tooltipの文言・操作・配置はComponent / browser behavior testで確認する。これらの局所状態はfull-page canonical snapshotを増やさない。
- 承認済みドラフトから決定する将来のVRT状態:
  - 必須の初期値を持つ直接編集の初期状態
  - 可変のスキル、縁、アイテム行を含む入力済み状態
  - エラーと警告が見える状態
  - JSON importと全消去の破壊的操作に対する確認状態
  - CCFOLIAコピー成功の通知ダイアログ状態
  - 画像選択の失敗ダイアログ状態
- local canonical snapshotの更新は、以後もユーザーの明示承認を必要とする。親Gate planに従い、G31までGit管理へ追加・変更しない。
- 2026-07-29、ユーザー承認によりcharacter-sheetのcanonical baselineを再構成する。full-page比較はdefaultと`合計信用` tooltip代表のdesktop / tablet / mobileだけとし、sectionのdefault・入力・error variationはowner section、dialog stateはdialog本体を比較する。個別tooltip screenshotとstatic page用generic scenario helperは対象外とする。
- 同日の再構成後のcanonical baselineは133枚である。full-pageは6枚、sectionは94枚、dialogは33枚とする。`縁`、`combat`、`武器・防具`のvariationは見出しを含むsection frameを比較し、`スキル`と`生き様専用アイテム`はdefaultの全体frameだけを各3 viewportで1枚ずつ持つ。子sectionの入力・error variationは引き続き子section locatorだけを比較する。G20で`nanomachines-default`、選択済み、効果展開、上限超過のsection 12枚、候補dialog 3枚を追加した。個別tooltip screenshotは作成しない。
- 2026-07-29、ユーザー承認によりG21のドラッグを追加した。`drugs-default`、`drugs-input`、`drugs-expanded`、`drugs-picker`、`drugs-picker-duplicate`をdesktop / tablet / mobileのowner section / dialog locatorでlocal canonical snapshot化し、ドラッグ追加で変わるfull-page defaultと`special-items-overview`を更新した。local canonical snapshotは148枚となった。G31までGit管理へ追加・変更しない。mobile候補dialogは名称・信用・BT強度を1行目、使用タイミング・1セット数量・効果を詳細行に置く。
- 2026-07-29、ユーザー承認によりG22の未コミット差分を再確認し、`g22-credit-overage`と`g22-sumi-maximum-health`の各desktop / tablet / mobileを更新し、未選択で手動追加したwarningカテゴリの`g22-special-items-unselected-added`を同3 viewportで新規作成した。合計9枚のtarget限定比較は更新後にすべて通過し、local canonical snapshotは172枚となった。個別tooltip screenshotは作成せず、G31までGit管理へ追加・変更しない。
- 2026-07-30、ユーザー明示承認によりG23の操作ペインと共通button変更を含む`@character-sheet` targetを更新した。full-page 6枚、buttonを含むsection、dialogを含む既存targetに、desktop操作ペイン1枚、tablet / mobileのfloating controls各1枚、開いた操作menu各1枚を追加し、local canonical snapshotは180枚となった。更新後のtarget通常比較は180件すべて通過した。G31までGit管理へ追加・変更しない。
- 2026-07-29のGate外レビュー修正として、`判定` sectionはdesktopでも左列の`縁`の後に置く。right columnは`スキル`から開始する。`画像を選択`と各`〜を追加` buttonは、キャラクターシート内の共通styleでfont size、高さ、padding、border、hover / disabled stateを揃え、section固有CSSは配置だけを持つ。
- 2026-07-29のGate外レビュー修正として、削除操作は背景・囲みのないゴミ箱icon、clear操作は同じ寸法の消しゴムiconに統一する。通常使用不可の専用アイテムカテゴリの削除iconだけはwarning colorを使う。画像clearは画像を選択／差し替えbuttonの右に常時置き、未選択時はdisabledにする。選択／差し替えbuttonは固定幅とする。
- 同日、ユーザーは`@character-sheet`の全canonical baseline更新を明示承認した。`profile-image-selected`を含む対象stateは、修正後にdesktop / tablet / mobileで更新・通常比較する。
- 同日のGate外レビュー修正として、font familyは既存の`--font-sans`継承を保つ。field label、直接入力、重要な算出値、一覧本文、mobileの密集一覧をそれぞれ専用文字tokenで統一する。`体力増加`〜`精神力係数`、`共通スキルボーナス`、副能力値の`最大体力`〜`結べる縁`、覚悟効果の`気絶からの回復`〜`受動判定`は、`--text-xs`、muted color、bold（750）へ揃える。共通スキルボーナスを除く読み取り専用の数値枠と、文字・数値・selectの直接入力は`--text-xs`と共通の最小高を使う。縁の`対象`・`関係`・`覚悟`header、section見出し、dialog固有の情報密度は変更しない。
- スキル、武器・防具、各専用アイテムの一覧rowと列headerは、並べ替えcontrolsを収める`2.25rem`の共通最小高を使う。項目名・数値input・icon操作は同じrow高の中で配置する。

### G3 section frame comparison

- target: `縁`、`判定`、`武器・防具`、`スキル`、`専用アイテム`の5 section frame
- route: `/character-sheet/`
- state: 初期展開。開閉状態は保存しない。折りたたみ時は内容領域だけを`hidden`にし、childrenをunmountしない。
- viewports: desktop、tablet、mobile。G3では3 viewportのactual snapshotを`visual:capture`で出力する。canonical baselineは更新しない。
- comparison points: 見出しbutton、展開icon、枠線、visible focus、開閉後の内容領域、desktop 2列とtablet/mobile 1列における横overflow

### G4 profile and credit comparison

- target: `profile` slotの基本情報、開閉式の`設定`、信用表示。
- route: `/character-sheet/`。
- default state: PC名、PL名、二つ名、年齢、性別、設定は空欄。`設定`は閉じる。取得信用は`10`、融通した・融通された・小銭修正は`0`、合計信用・小銭は`10`、消費信用は`0`と表示する。
- viewports: desktop（`1440x1200`）、tablet（`820x1180`）、mobile（`390x900`）。ultrawideは既存の本文幅確認だけに使い、G4のcanonical比較対象に含めない。
- profile layout: profile slotはG3のsection frameを使わない。PC名、PL名、二つ名、年齢、性別は、それぞれlabelを上に置く独立したinputとする。desktopとtabletは3列のgridで、入力のDOM順と視覚順をPC名、PL名、二つ名、年齢、性別に一致させる。mobileでは1列に積む。
- setting layout: profile入力群の直下に`設定`とchevronだけを置く。展開時は、同じ位置にlabel付きtextareaを表示する。開閉状態はフォーム値、保存、JSONの対象に含めない。
- credit layout: 信用は、取得信用、融通した、融通された、合計信用、消費信用、小銭修正、小銭のDOM順を維持する。desktopとtabletでは7列のgrid、mobileでは1行目に取得信用・融通した・融通された、2行目に合計信用・消費信用・小銭修正・小銭を置くresponsive gridとする。編集可能な4入力は短い幅で右揃え、派生値は同じ視覚形式の読み取り専用値として表示する。
- comparison points: profile slotのG3 frame非適用、5入力のlabel対応と順序、設定の初期非表示と展開後のtextarea、信用の順序・初期値・右揃え、desktop / tablet / mobileでの横overflowなし。
- VRT: 既存の`tests/visual/vrt/character-sheet.spec.ts`にある`@vrt @character-sheet`のdefault routeを使い、G4ではdesktop、tablet、mobileだけをactual / 比較対象とする。設定の展開、信用の値変更、空欄からの`0`復帰はbrowser behavior testで確認する。canonical baselineの更新には別途ユーザー承認が必要である。

### G14 common skill summary comparison

- target: 基本情報の経験点表示と共通スキル区分の追加操作領域。
- desktop / tablet: design画像の既存5枠配置に従い、基本情報の経験点行を`取得経験点・消費経験点・残経験点・格・共通スキル値`とする。既存の共通スキル上限枠を、`FormulaTooltip`のlabel `共通スキルレベル合計／共通スキル上限`（desktop / tabletでは2行、mobileでは1行）と値`N／M`へ置き換える。tooltipの文言は`合計レベル上限 = 格 ÷ 2（端数切り上げ）`とする。共通スキル区分では、行一覧の下で追加buttonと`取得合計レベル：N／合計レベル上限：M`を下揃えで横並びに置く。いずれも横overflowさせない。
- mobile: design画像に従い、基本情報では取得・消費・残経験点を1行、格を左1列、tooltip付きの共通スキル値`N／M`を右2列として次行に置く。共通スキル区分では追加buttonと合計表示を縦に積み、追加buttonを先に置く。
- error: `N > M`では、基本情報の`N／M`枠と共通スキル区分だけをerror状態にする。流儀・生き様 / 能力値領域には共通スキル上限の表示・error feedbackを追加しない。個々の表示へ可視のエラー理由は追加しない。
- common skill bonuses: 流儀・生き様 / 能力値領域の`Lv 2で獲得`、`Lv 5で獲得`、`Lv 9で獲得`は、共通スキル取得合計Lvが対応する閾値へ到達した枠だけ`--color-accent`の太い枠線で示す。背景色と文字色は既存表示を維持する。未到達枠は既存の`--color-example-soft`と`--color-example-border`を維持し、ボーナス本文を通常ウェイトで表示する。アンロック済み枠の本文ウェイトは既存表示を維持する。
- comparison points: `N`が基本の一撃を含まないこと、未選択行を含まないこと、基本情報と区分表示が同じ`N`・`M`を示すこと、追加操作領域とsection外の横overflowがないこと。

### G6 character image comparison

- target: 基本情報内のプロフィール入力群、`設定`、画像入力、経験点・信用の位置関係。
- desktop: 基本情報の左カラムで、プロフィール入力群と`設定`を左、画像入力を右に置く。画像入力はプロフィール入力群と`設定`の高さを跨ぎ、経験点・信用はこのprofile / image行の下に置く。
- tablet: site menu railの右にある基本情報内でdesktopと同じprofile / imageの横組みを保つ。画像入力の横幅だけを縮め、プロフィール・画像・信用の関係を崩さない。
- mobile: プロフィール入力、`設定`、画像入力、経験点・信用の順に1列で積む。desktop / tabletの右側画像を縮小して残さない。
- image state: 未選択時は既存draftと同じコンパクトな破線の画像領域、D&Dの案内、容量表示、直下のファイル選択操作を示す。選択済み画像は同じ領域に表示し、同じ導線で差し替える。画像専用のdialog、確認用preview、画像編集UIは追加しない。
- comparison: desktop（`1440x1200`）、tablet（`820x1180`）、mobile（`390x900`）で、画像だけでなくprofile、設定、信用との位置関係、画像表示位置、操作位置を確認する。実装結果は既存target限定の`visual:capture`でactualを確認し、個別Playwright screenshot commandを代替にしない。canonical VRT baselineは更新しない。

## 確定したデザイン要件

### 操作領域

- 対象操作は、細かな説明を開く`?`、JSON出力、JSON入力、初期化、CCFOLIAコピーである。`?`は操作領域の左端に丸いボタンとして置き、説明モーダルを開く。
- tabletとmobileでは、右下にメニューボタンを配置し、クリックすると各操作ボタンを表示する。
- tabletとmobileの右下メニューボタンは、scroll中も操作できるsticky controlとする。
- tabletとmobileでは、編集領域の末尾に右下のfloating操作と重ならない十分な下余白を設ける。最下部までscrollしたときも、最後の入力・追加・削除操作をfloating操作の下へ隠さない。
- tabletでは、右下のメニューアイコンの上に、独立した青緑の丸い`?`ヘルプアイコンを置く。ヘルプアイコンを操作すると、メニュー内ではなく独立したヘルプダイアログを開く。
- tabletでメニューを開くと、2行2列のJSON出力、JSON入力、初期化、CCFOLIAコピーbuttonを表示する。
- tabletの開いたメニューでは、エラー欄に個別のエラーを直接表示する。エラー確認のために別のダイアログを開かない。
- tabletの右下メニューアイコンは、エラーがあるときエラーカラーで表示する。
- mobileの展開メニューはtabletと同じく2行2列の操作buttonと直接表示するエラー一覧を持つ。外側クリック時の扱いとキーボード操作は実装Gateでアクセシビリティ要件とともに定める。
- 初期scopeでは、画面内に段階式の作成順ガイドや必須項目チェックリストを追加しない。最低限ヘルプへ書く内容と本文の統一は後続のdesign対話で決める。

### ページとナビゲーション

- 公開routeは`/character-sheet/`とする。
- ページtitleは「キャラクターシート」とする。
- サイトナビゲーションでは「キャラクター成長」の下、「サポート」の上に配置する。

### 画像選択

- 画像表示領域をdrag and dropの対象とする。画像表示領域の下にある固定幅buttonからも画像を選択できるようにし、その右に透明なゴミ箱iconの画像clear操作を常時置く。画像未選択時のclear操作はdisabledにする。
- 画像は基本情報のprofile / setting / creditとの位置関係に従って置き、独立したcardまたは別sectionにしない。
- 画像選択のためのアプリ内ダイアログは開かない。選択後に確認用プレビューも表示しない。
- 画像の形式、容量、decode、変換、IndexedDB書込みで失敗した場合は、エラー一覧へ積まずに失敗ダイアログを表示する。画像の変換・保存中はIsland全体を操作不可にするloading overlayを表示し、reduced motionではindicatorを回転させない。

### ページlayoutとサイトメニュー

- このページにはPageToc / MobilePageTocを表示しない。
- キャラクターシート固有のsection navigationは設けない。
- character-sheetでは、既存ページのサイトメニュー表示をそのまま適用しない。`64rem`以上`80rem`未満では常設のサイトメニューrailを表示し、キャラクターシート領域はスキル以降のセクションを下へ移す配置とする。desktop、`48rem`以上`64rem`未満、mobileでは、ロゴの左に置くHeaderのサイトメニューボタンからdrawerを開く。
- desktopとtabletのHeaderは、タイトルロゴを高さ3remのままとし、メニューボタンとロゴの間を`--space-3`にする。mobileでは既存の小さいタイトルロゴと左右のHeader操作を維持する。
- キャラクターシートのmain領域は利用可能な横幅を使い、main自身の左右paddingは均等にする。desktopではsheet本文を最大`90rem`（1440px）に制限し、それを超える横幅では中央寄せにする。縦1列のsheet formの最小幅は`44rem`とし、`64rem`以上`80rem`未満では15remのサイトメニューrailの右側の残り幅をmainに使う。`48rem`以上`64rem`未満ではmobile用のレイアウトへ切り替えず、site menu railだけを隠す。
- sheet本文の`h1`はbrowser既定marginを使わない。main上端から直接置き、下余白だけを`12px`にする。page固有のheading余白はAstro page側で扱い、React Islandへglobal heading styleを追加しない。
- tabletとmobileの基本レイアウトでは、右下のfloatingなメニューアイコンをデフォルト表示にする。

### 編集画面の情報architecture

- tabletは、基本情報（経験点・信用を含む）、流儀・生き様と能力値、副能力値、縁、判定、武器・防具、スキル、専用アイテムの順に縦積みする。
- 信用は経験点と近接して配置する。消費信用と合計信用超過のエラーはキャラクター情報側で確認できるようにする。
- 信用の入力・派生値は、流儀・生き様の下へ置かず、基本情報内で取得経験点の隣または直下にまとめる。
- 共通スキルレベル合計と合計レベル上限は、共通スキルの取得可否と経験点消費を確認するための値として、基本情報の経験点表示に置く。`共通スキルレベル合計／合計レベル上限`は、上限式を説明する`FormulaTooltip`のlabelとする。これは算出値の一般的なsummaryを増やさない原則の、要件で指定された例外である。
- 流儀・生き様と能力値は、左カラム内で最も重要な入力群として、副能力値と縁より大きく、目立つ密度・視覚的強さで扱う。副能力値と縁は必要な情報を保ちながらコンパクトにする。
- 副能力値は既存のsection frameに入れる。tabletでは、体力系と精神力系、移動力系と行動値系、行動回数と結べる縁（それぞれの補正入力を含む）の3行に圧縮する。各項目は`自動算出値 + ユーザー入力欄 = 最終値`とcheckboxを一つの枠に入れ、左上の項目名を少し大きく表示する。移動力・行動値では`一時修正を適用`を項目名の右に置き、項目名をformula tooltipのtrigger、`一時修正を適用`を一時能力値の説明tooltip triggerにする。計算式は項目枠の横幅全体を使う。各行の余白、入力高を抑え、流儀・生き様と能力値より目立たない密度にする。
- 縁は、対象と関係の列ヘッダーを置き、短い対象入力と長い関係入力を各行に並べる。覚悟の効果は縁の下に置き、`覚悟の効果`見出しの横に灰色で`通常の縁／今生の縁`を表示する。通常行のclearは囲みのない消しゴムicon、上限外の未覚悟行とその他流儀の削除は囲みのないゴミ箱iconとerror colorで示す。操作列をicon寸法に縮めた分は関係または名称列へ配分する。
- 縁、判定、武器・防具、スキル、専用アイテムは個別セクションとして折りたたんで隠せるようにする。全ての折りたたみ領域は初期状態で開く。複数セクションを同時に開ける。
- キャラクター設定は基本情報のプロフィール入力群の下に、`設定`と展開アイコンだけを初期表示する。操作すると自由入力欄を表示する。
- 数値入力欄は右揃えとし、必要以上に横へ広げず、値に見合う短い幅にする。空いた横幅は、算出値、ラベル、マスタ由来の読み取り専用情報へ配分する。
- 全ての折りたたみ領域は初期状態で開く。複数セクションを同時に開ける。
- 折りたたみの開閉状態はブラウザ内保存、JSON export、JSON importの対象に含めない。
- 算出値を別領域へ再掲するsummaryは設けない。要件で定める算出値は、それぞれの該当領域で表示する。
- 計算式の文字列は、該当する自動算出値または最終値のlabelを操作すると開くtooltipで表示する。通常表示に固定の算出式文字列は置かない。
- formula tooltipはsectionまたはviewportの上端に近いtriggerで下方向へ開き、上下左右とも読める範囲に表示する。副能力値だけの局所配置にはしない。すべてのtooltip triggerは対象文字列の直後に、薄いアクセントカラーの小さな丸い`?`indicatorを表示する。indicatorはtriggerの操作領域へ含め、支援技術へ重複して読ませない。

### G3 編集section frame

- G3で共通frameを適用するのは、`縁`、`判定`、`武器・防具`、`スキル`、`専用アイテム`だけとする。基本情報、ビルド、副能力値は後続Gateで表示構成を定める。
- frameは既存tokenのsurface、border、radiusを使い、見出しbuttonは薄いmuted surfaceに置く。見出しの右端にはCSSで描く青緑のchevronを置く。外部icon assetやsection navigationは追加しない。
- 見出しbuttonはsection titleをそのままaccessible nameに含め、`aria-expanded`と`aria-controls`で内容領域との関係を伝える。既存global styleのfocus colorを使い、frameの角丸内に収まるinset focus ringをvisible focusとして使う。
- すべてのframeは初期状態に開く。複数frameを独立して開閉でき、開閉は見出しbuttonの標準keyboard操作で行う。判定の非戦闘技能はFrameを拡張せずに専用Componentとして初期状態で折りたたみ、得意技能だけを表示する。折りたたんだ通常内容は表示しないが、後続Gateの入力値と局所表示状態を維持する。
- 内容領域は見出しとborderで区切り、後続Gateの入力を追加できる内側余白を持つ。G3では個別の入力、説明文、算出値、summaryを追加しない。
- character-sheetのReact Islandは情報密度を優先する。scopeをIsland内へ限定して、見出しは`h2`を`16px`、`h3`を`14px`、`h4`を`13px`とする。site全体のglobal headingやproseのtype scaleは変えない。
- section frameの見出しbuttonは、操作targetを36px以上に保ちながら、上下padding、section間gap、内容余白を通常ページより小さくする。空の内容領域には最小高を設けず、後続Gateの実際の入力が必要な高さを決める。desktopではsection間20px・内容余白12px、mobileでは16px・8pxを基準にする。
- chevronは8pxの視覚要素とし、操作targetの大きさとは分けて扱う。小さいiconでもbutton全体を操作対象にし、keyboard操作とvisible focusを維持する。

### mobileの情報密度

- mobileはシート全体を縦一列にする。基本情報では、画像領域を`設定`の下へ置く。
- 経験点は取得・消費・残経験点を1行、tooltip付きの共通スキルレベル合計／合計レベル上限と`N／M`を次行へ置く。信用は、取得信用、融通した、融通されたを1行目、合計信用、消費信用、小銭修正、小銭を2行目に置く。
- 流儀、生き様、その他流儀の入力の下に能力値入力を置く。流儀増加値、生き様係数、共通スキルボーナスは、読める範囲で横方向へ圧縮する。
- 副能力値は1項目ずつ縦に並べるが、各項目内の`自動算出値 + 修正入力 = 最終値`は横並びを維持する。縁は行間と余白を縮める。縁の覚悟効果は、気絶からの回復、気合獲得、能動判定、受動判定の順を維持した4行1列に並べ、各式を折り返さない。
- 判定では攻撃判定の下にリアクションを置き、非戦闘技能は2列にする。武器・防具は列幅・余白を圧縮して表示する。入力欄と表の最終的な細部は実装時に再検討する。
- 判定の攻撃・リアクション・非戦闘技能、縁の覚悟の効果、武器・防具の武器・防具は、親section内でも`h3`の共通frameで区切り、個別に開閉できる。

### エラー表示

- エラーは、該当する入力欄そのもの、または次の該当枠全体の色を変えることで通知する。
  - 能力値
  - 流儀
  - 生き様
  - 縁
  - 共通スキル
  - 専用アイテム
- 本来使用できない専用アイテムのWarningカラーとは、エラーカラーを区別する。
- 入力欄の直下や個々の枠の中に、エラー理由の可視文言は表示しない。行ごとの文言によってlayoutが不揃いになる表現は採用しない。
- desktopの固定幅error statusは、エラーなしでは通常色の外枠・`エラーはありません。`・通常の`確認`buttonを示す。エラー時は、外枠、`エラーがN件あります。`の文言、`確認`buttonをdangerカラーにする。
- tabletとmobileでは、右下のsticky controlから開くメニュー内に、現在のエラー全件を直接表示する。エラー時はメニューbuttonと`エラーがN件あります。`をdangerカラーにし、error本文は通常本文色の順序なしリストで示す。
- 色による通知に加え、入力のエラー状態を支援技術へ伝え、desktop dialogおよびtablet / mobile menuのエラー一覧にはテキストを置く。これにより、個々の入力欄へ可視のエラー文言を増やさずに、色だけへ依存しない。
- エラー一覧から該当入力へ移動できるかは、後続のdesign対話で決める。
- エラー一覧に現在値・条件・差分をどこまで表示するか、または該当入力への移動を付けるかは、実装Gateで詳細を検討する。

### ダイアログ

- 警告、破壊的操作の確認、CCFOLIAコピー完了、画像選択の失敗はダイアログで表示する。
- ブラウザ組み込みの`alert`は使わない。
- CCFOLIAコピー成功の通知ダイアログ本文は「クリップボードにコピーしました。」とする。
- 初期化確認ダイアログ本文は「本当に初期化してよろしいですか？」とし、`OK`と`キャンセル`のbuttonを置く。
- desktopのエラー確認ダイアログは、太めのdangerカラーの枠線と白い背景に黒い文字で表示する。visible titleは置かず、アクセシブル名を`エラー`とする。本文は空状態`エラーはありません。`またはdangerカラーの`エラーがN件あります。`と、通常本文カラーの順序なしerror一覧から始める。`閉じる`buttonはmuted outlineとする。
- ヘルプダイアログは青緑のアクセントカラーの枠線、薄いグレーの背景、青緑の丸い`?`アイコンと「ヘルプ」のタイトル行を使う。最大高さを定め、本文だけを独立してscrollできるようにする。
- それ以外のダイアログのbutton配置、dismiss操作、focus処理、Clipboard API失敗時の扱いは、後続のdesign対話で決める。

### G5 dialog common foundation

- target: `CharacterSheetDialog`と、共通基盤を確認する可視のダミー確認button。routeは`/character-sheet/`で、defaultではdialogを閉じる。
- open state: ダミーbutton「確認ダイアログを開く」を操作すると、`確認`の見出し、「この操作は確認用です。キャラクターシートの内容は変更されません。」の本文、`キャンセル`と`OK`のactionを持つ確認dialogを開く。どちらのactionもdialogを閉じるだけで、副作用を起こさない。
- placement: ダミーbuttonはReact Islandのformの直前に独立して置く。desktopとtabletでは右寄せのコンパクトなbutton、mobileでは読みやすい幅を保つ。G23以降で実操作を接続するときに置換または削除し、最終公開UIには残さない。
- dialog surface: native `dialog`のmodal表示を使い、白いsurfaceに通常のborder、`--radius-lg`、`--shadow-soft`を適用する。標準幅は`min(32rem, calc(100vw - 2 * var(--page-gutter)))`、block-sizeはviewport内に収める。候補選択など幅が必要なdialogは専用Componentで幅を定義し、長い本文・表はcontent領域だけを独立scrollにする。
- composition: `CharacterSheetDialog`は開閉、modal、Escape、focus復帰、accessible nameを担うshellとする。`CharacterSheetDialogHeader`、`CharacterSheetDialogContent`、`CharacterSheetDialogActions`は必要なものだけを組み合わせる。`variant`で全dialogの構造や配色を切り替えない。確認、エラー、通知、ヘルプ、候補選択は、各Gateで専用Componentまたは専用内容を作る。
- dismiss and focus: Escapeと、各dialogに置く少なくとも一つの可視の閉じる操作で閉じる。右上の閉じる`×`は必要なdialogだけ`Header`に置き、全dialogへ強制しない。dialog外側clickでは閉じない。開くと各dialogが明示する初期focus対象へfocusし、破壊的確認では非破壊action（`キャンセル`）を選ぶ。見出し、複数段落、リスト、表を読む必要があるdialogでは、本文先頭の静的要素へfocusできるようにする。閉じた後は原則としてdialogを開いたbuttonへfocusを戻す。native `alert` / `confirm`は使わない。
- semantics: dialogは可視見出しへの`aria-labelledby`、または`aria-label`のいずれかでaccessible nameを必須にする。短く構造を持たない主文だけは`aria-describedby`で関連付け、複数段落、リスト、表を含む本文には指定しない。`title`と`description`を全用途で必須のstring propsにはしない。標準headerの可視見出しはページの`h1`に続く`h2`とする。開閉状態・選択対象はContainerが持ち、RHF、保存、JSONへ含めない。
- viewports and comparison points: desktop（`1440x1200`）、tablet（`820x1180`）、mobile（`390x900`）で、button、dialogの幅、actionの到達性、visible focus、Escape、操作元へのfocus復帰、ページ全体の横overflowなしを確認する。G5のVRTはcanonical baselineを更新せず、PRレビュー直前の`@character-sheet` targetだけを比較する。

## 参照正本と制約

- `docs/requirements/character-sheet.md`は、キャラクターシートの入力、表示、算出、検証、保存、出力要件の正本である。
- `docs/issue/ex-02-web-character-sheet.md`と`docs/issue/ex-02-web-character-sheet/plan.md`は、デザイン承認、アーキテクチャ、実装Gateの順序を定義する。このノートはその順序を変更しない。
- ゲーム用語、数値ルール、マスタ値は、要件が示す`src/pages/`と`data/generated/`を正本とする。
- `docs/out-of-scope.md`は、直接編集式のキャラクターシートとブラウザ内の最新1件保存を許可する。作成質問票、サーバーまたはクラウド保存、複数端末同期、汎用的な効果文解析、ダイスロール、セッション状態管理は含めない。
- 共通スキルボーナスの専用構造化データと文字列解析は追加しない。UIは共通スキルボーナスや自由文のスキル効果が自動算出されるかのように表示してはならない。
- 既存サイトの視覚的方向性を文脈として維持する。すなわち、明るいルール本文面、暗いHeaderとFooter、控えめな青緑アクセント、読みやすい本文、実務的な情報密度である。HeaderとFooterの意匠は再設計しない。サイトメニューとToCの表示方式は、このページに限り「ページlayoutとサイトメニュー」の要件を優先する。
- `.tmp/character-sheet-design-draft.jpg`はdesktopの過去の配置参考である。要件の正本ではなく、初期scopeのdesktop、tablet、mobileのレイアウトを定めず、必須入力も網羅していない。

## 必須の画面範囲

後続のドラフトでは、以下の全グループを直接編集または読み取り専用の確認対象として利用可能にする。視覚的なグループ分けは変更できるが、過去のdesktop配置参考に存在しないことを理由に省略してはならない。

### プロフィールとキャラクター設定

- PC名、PL名、二つ名、年齢、性別を、それぞれ独立した1行の自由入力
- 改行を保持する複数行のプレーンテキストによるキャラクター設定。基本情報内の開閉式`設定`から表示する。
- キャラクター画像の選択、および形式・decode・5 MiB上限に対する失敗ダイアログ
- 既存のキャラクターメイキング解説への見える導線。シート自体にはコンストラクションまたはフルスクラッチの作成方式選択を設けない。

### ビルド、能力値、経験点

- プライマリ流儀と生き様の選択、およびレベル入力。初期状態では両者を未選択にできる。格は選択状態にかかわらず両レベルの合計として初期値`2`を、成長可能点は格から算出して、経験点の派生値は選択済みの流儀だけを集計して消費`0`・残り`50`を表示する。プライマリ流儀だけで決まる基礎能力値・流儀増加値・共通スキルボーナスと、生き様だけで決まる能力値ポイント候補・生き様係数は、片方だけ選択済みでも表示する。常時能力値、一時能力値は両マスタが選択済みの場合だけ`-`以外を表示する。生き様が未選択の能力値ポイント候補は`-`、5つの能力値ポイント入力はすべて`0`とする。生き様の選択後も能力値ポイントを自動配分せず、生成JSONとの不一致を局所エラーで示す。
- 未選択状態は、両方未選択、プライマリ流儀だけ選択、生き様だけ選択、両方選択を視覚的に同じ入力画面で扱う。格、成長可能点、経験点の派生値は全状態で表示する。基礎能力値・流儀増加値・共通スキルボーナスはプライマリ流儀の選択時だけ、能力値ポイント候補・生き様係数は生き様の選択時だけ表示する。常時能力値、一時能力値は両方選択時だけ表示し、それ以外は`-`とする。
- その他流儀の追加・削除行。対応スキルを削除する場合の確認導線を含む。
- 格、成長点、筋力・敏捷・感覚・肉体・精神の5能力値
- 能力値表の右側領域の上に通常サイズで置く`{生き様名}：能力値ポイント X, X, X, X, X`と成長点、および各能力値ポイントの入力欄、成長、常時修正、一時修正、算出された常時・一時能力値。能力値ポイントは生き様名ではなく列ヘッダーとして表し、5つの入力値は生き様由来の4値と`0`の組み合わせを検証する。
- 取得経験点、消費経験点、残経験点、検証状態。初期値は取得経験点50、プライマリ流儀と生き様は各1レベル、その他流儀と共通スキルは0レベル、消費経験点は0。
- 取得信用、融通した、融通された、合計信用、消費信用、小銭修正、小銭。消費信用はキャラクター情報側で経験点に近接して表示する。

### 副能力値、縁、判定

- 基本値と最終値の体力、精神力、移動力、行動値、行動回数、縁最大数。要件で定める手動修正入力を含む。
- `覚悟の効果`見出しの横に灰色の`通常の縁／今生の縁`を置き、気絶からの回復、気合獲得、能動判定、受動判定の各見出しの下に`通常の縁使用時の元値 ／ 今生の縁使用時の元値 + 修正値 = 通常の縁使用時の最終値 ／ 今生の縁使用時の最終値`で示す覚悟効果。気絶からの回復、能動判定、受動判定の最終値は固定ダイス式のダイス数へ修正値を加え、気合獲得は通常の縁の数値へ加え、今生の縁の`1d6`へは符号付き修正値を付記する。元値と最終値は計算値のread-only backgroundで示す。desktop / tabletは2行2列、mobileは4行1列とし、式は折り返さない。
- 対象、関係、覚悟checkboxを持つ、縁最大数に応じた固定行。対象と関係は列ヘッダーで示し、行ごとのラベルは置かない。対象入力は短く、関係入力は長く取る。ポジティブ／ネガティブの種別は管理しない。覚悟checkboxのlabelには既存`FormulaTooltip`を付け、既存の`?`indicatorを含むtooltip triggerはcheckboxの操作targetとは分ける。tooltipは「シナリオ中、覚悟にした縁にチェックを入れます。チェックが入っている限り、変更もクリアもできません」と示す。通常行は行削除と誤認しない角丸の横長`クリア` text buttonでクリア操作を示す。覚悟済みの行は編集ロックと、チェック解除後に再編集できることを見た目で伝える。最大数が減った時は空行を減らして入力済み行を保持し、入力済み行が上限を超える時は上限外行をerror colorとsolid circle `×` delete buttonで示す。覚悟済み行は削除できない。
- 攻撃とリアクションの判定行は、5能力値すべてから選べる使用能力値、常時能力値と一時能力値、手動修正、常時・一時の最終判定数を持つ。非戦闘技能は、得意技能チェック、技能名、マスタで定義された固定の対応能力値と手動修正、得意技能チェックと手動修正を反映した`常時 / 一時`の判定数併記の順に表示する。能力値選択は設けない。判定セクション全体は開閉できる。非戦闘技能は個別に開閉でき、折りたたみ時は得意技能チェック済みの行だけを残して表示する。

### スキル

- プライマリ流儀、生き様、共通スキル、その他流儀を識別できる個別のスキル領域。この順で縦に積む。
- 流儀・生き様と能力値の直下で、共通スキルボーナスの前に、選択中プライマリ流儀の体力増加値・精神力増加値と、選択中生き様の現在レベルで適用される体力係数・精神力係数を表示する。続けて選択中プライマリ流儀の共通スキルボーナスをレベル2・5・9の到達条件ごとに全件表示する。共通スキル合計レベルを併記し、到達済みの行だけを色で強調する。この一覧は参照用であり、行動回数、縁最大数、判定数、攻撃力などへ自動反映しない。
- スキル全体と各スキル区分は独立して開閉でき、初期状態はすべて開く。各スキル区分の見出しには開閉を示すエクスパンドアイコンを置く。開閉状態は保存しない。
- 所属マスタに限定した候補、ボーナススキルの自動表示、通常スキルの可変行、レベル入力、追加・削除・変更時の扱い。各一覧の先頭には、プライマリスキルボーナス、生き様ボーナス、基本の一撃を置く。その他流儀はビルド領域で追加した時点で対応するスキル領域を自動表示し、スキル領域からは追加しない。
- 各スキル行へ、名称選択、Lv、最大レベル、コスト、技能、使用制限、対象、射程、右端の効果展開を1行で表示する。名称列は行全体の約4分の1とする。展開操作により、その行の取得制限と効果を直下に表示する。自動習得スキルもヘッダー直下の同じ行形式に置き、展開対象とする。効果は初期状態で折りたたみ、文章条件は表示するが自動検証しない。選択済みスキルのための別詳細枠は設けない。
- 重複スキル、レベル、advanced条件、共通スキル上限を含む構造化検証の明示的なエラー表示

### スキル・アイテムの選択UI

- マスタ由来のスキル名とアイテム名は、ブラウザnativeのdropdown selectで編集しない。選択済み名称は、行内の読み取り専用の文字列として表示する。
- 名称列の左端に、候補選択を開く小さな選択アイコンを置く。アイコンと名称の組はbuttonとして操作可能にし、未選択時は「スキルを選択」または該当アイテム種別の「〜を選択」を表示する。
- 選択アイコンを操作すると、その行のスキル区分またはアイテムカテゴリで選べる候補だけを一覧表示するダイアログを開く。名称を選ぶとダイアログを閉じ、その行へ選択値を適用する。
- 武器の候補ダイアログは、名称、信用、射程、種別、技能、攻撃力、ガード値のヘッダーを持つ単純な表にする。候補はユーザー入力を含まない1行にまとめ、各候補行の直下に全列をまたぐ効果行を置く。名称をbuttonにして選択操作を担わせる。
- mobileでは、武器候補の攻撃力とガード値を1セルへ圧縮して表示し、候補表がページ全体の横overflowを生じさせないようにする。
- お守り、防具、サイバネ、ナノマシン、ドラッグ、各スキル区分の候補ダイアログは、候補の列と効果行の詳細を個別に決める。武器の表をそのまま流用することは決定しない。
- キャンセルの常設導線はダイアログ右上の閉じる`×`アイコンとする。キーボードのEscapeでも閉じ、閉じた後は操作元の選択アイコンへfocusを戻す。ダイアログ外側clickで閉じる操作は設けない。
- この選択UIは、流儀、生き様、能力値の編集・選択方式を変更しない。自動習得スキルは選択アイコンを表示せず、既存の読み取り専用行として扱う。

### アイテムと信用消費

- 武器、防具、お守り、サイバネ、ナノマシン、ドラッグのマスタ由来かつ読み取り専用の詳細
- 武器、防具、お守り、サイバネ部位とその他枠、ナノマシン部位、ドラッグ行の固定・可変slot
- 既存選択を隠さず、最小・最大枠の制約を理解できる追加・削除操作
- スキルとアイテムの名称選択は「スキル・アイテムの選択UI」に従い、各行の左端の選択アイコンから候補ダイアログを開いて行う。
- 武器・防具を別テーブルにし、武器は名称、信用、射程、種別、技能、攻撃力、ガード値、効果展開を、防具は名称、信用、防御力、ダメージ軽減、効果展開、clear iconをヘッダーに置く。武器はゴミ箱iconで確認dialogなしに削除し、防具の消しゴムiconは確認dialogを開かずに選択IDと両修正を初期値へ戻す。各行の効果展開で行の下に効果を表示する。武器テーブルの下には追加操作を置く。攻撃力・ガード値、防御力・ダメージ軽減の手動修正入力と最終数値を扱う。マスタ値が数値以外の場合、関連修正を明示入力するまでは最終数値を表示しない。
- サイバネ埋込点数合計と、閾値による非戦闘の標準修正へのフィードバック
- 専用アイテムは横に並べず、各カテゴリを縦に積む。カテゴリ追加後の内容は下へ続けて表示する。
- ナノマシン、サイバネ、ドラッグを含む専用アイテムは、効果本文を初期表示しない。各行の`効果を展開`操作で効果を確認する。この方針はdesktop、tablet、mobileで共通とする。お守りは例外として、desktop / tabletでは効果本文を常時表示し、mobileだけ`効果を展開`操作で行下へ表示する。
- 生き様がスミの入力済み状態では、既定のナノマシンに加えて、お守り、サイバネ、ドラッグも各カテゴリの入力表を表示できる。これら既定外3カテゴリは、選択中の生き様では通常選択不可の保持済みカテゴリとして、その文言を見出しに表示し、カテゴリ全体をwarningカラーの枠で示す。追加カテゴリの削除はwarningカラー、追加した可変行の削除は通常色の、いずれも囲みのないゴミ箱iconで示す。

### 検証、作業継続、出力

- 現在のエラーの概要、および該当行・該当セクションを特定できる表示。色だけに依存しない。現在の生き様では通常使用不可の保持済み専用アイテムカテゴリのwarningは、既存のカテゴリ見出し・warningカラーの局所feedbackに留め、全体一覧へ含めない。
- ブラウザ内の最新1キャラクター自動保存・復元。復元完了前に保存済みデータを上書きしない状態を伝える。
- 構造・型・現在のマスタIDとの照合に失敗して自動復元できない場合は、title / headerなしの既存dialogで本文「自動復元に失敗しました。」と`確認`buttonだけを表示する。確認後は初期フォーム値を編集できる。localStorage APIの読取り・書込み例外は`console.error`だけで握りつぶし、dialogを表示しない。
- VRTは`@persistence-restore-error`と`@cybernetics-part-error`で、復元失敗dialogおよび復元後の固定サイバネ部位errorをdesktop / tablet / mobileの局所snapshotとして比較する。
- JSON export、現在状態の置換確認を伴うJSON import、編集内容を維持する失敗フィードバック、確認を伴う全消去
- CCFOLIAキャラクターデータのcopy操作、およびClipboard APIの成功・失敗フィードバック
- スキルとアイテム効果は現在のマスタデータを参照するため、ルール更新に伴い表示が変わりうることを説明するhelp

## レスポンシブと操作の制約

- desktop、tablet、mobileは別々のレイアウト課題である。desktopまたはtabletの配置をそのまま縮小してmobileにしてはならない。
- 全ビューポートで、必須入力、算出値、検証メッセージ、破壊的操作に到達できること。必須グループをhoverだけの操作に隠さない。
- 可変行では、値と追加・削除・変更操作の関連を明確にする。狭幅で行が縦積みになる場合も、後続ドラフトでこの関連の読みやすさを決める。
- 高密度の数値比較はresponsive tableまたは縦積み表現を使えるが、ページ全体の横overflowを生じさせない。局所的なscroll領域を提案する場合は、操作の手がかりとkeyboard操作を明示的に承認する。
- 算出値、手動編集値、エラー、警告は、色に加えてlabelと構造で区別する。エラーの可視文言は「エラー表示」の要件に従い、個々の入力欄へは置かない。
- focus順、visible focus、accessible label、説明、エラーとの紐付け、確認dialogのfocus処理は、実装前にデザインで定める。
- import、全消去、対応スキルを持つその他流儀の削除は確認を必要とする。最終ドラフトでは、browser native dialogを暗黙の決定とせず、メッセージ階層とcancel導線を定める。

## 未決定事項

- 必須状態を表す入力済みfixtureデータと、正確なVRTシナリオ

## design承認の境界

このノートは、これから行うデザイン対話の出発点である。後続のdesktop、tablet、mobileに関するユーザー要望が実際のドラフトを定める。ドラフト承認後に限り、このノートを最終layout intentとVRT scenarioで更新し、その後に`ex-02`が求めるアーキテクチャと実装Gateの計画へ進む。
