# character-sheet

## ノートの役割

- このノートは、`/character-sheet/`の現在の画面契約、比較観点、VRT参照情報を定めるdesign正本である。
- 実装の経緯、Gate名、snapshot枚数、過去の承認結果はここへ記録しない。履歴はissue、plan、Git履歴で扱う。
- 入力値、ゲーム規則、保存契約は`docs/requirements/character-sheet.md`を正本とする。このノートは画面構成・操作導線・視覚的な比較観点だけを定める。

## 対象とVRT baseline

- page: `/character-sheet/`
- VRT test: `frontend/tests/vrt/character-sheet.spec.ts`の`@vrt @character-sheet`
- viewports:
  - desktop: `1440x1200`
  - tablet: `820x1180`
  - mobile: `390x900`
  - ultrawide: `1920x1200`。本文の最大幅と中央寄せを確認するactual capture専用であり、canonical baselineは作成しない。
- canonical snapshotは`frontend/canonical-snapshots/visual/`にlocal-onlyで保持する。baselineの追加・更新には対象stateを指定したユーザーの明示承認が必要である。

### VRT対象

| 範囲            | 代表state                                                                      | 比較対象                          |
| --------------- | ------------------------------------------------------------------------------ | --------------------------------- |
| page            | default、`合計信用` tooltip                                                    | full page                         |
| action controls | desktop action rail、tablet / mobile floating controls、open menu、error state | action paneまたはcontrol locator  |
| navigation      | mobile site menu drawer                                                        | drawer locator                    |
| dialog          | error、Helpの先頭・中間・末尾、下書き破棄、CCFOLIAコピー、候補選択、確認dialog | dialog locator                    |
| form            | profile、各sectionのdefault / input / error、item picker                       | owner sectionまたはdialog locator |
| persistence     | local draft復元失敗、固定サイバネ部位error                                     | dialogまたはsection locator       |

- full-page比較はページ全体の構成と代表tooltipに限る。section、操作menu、dialogの局所状態は対象locatorだけを比較する。
- Firebase login、live API、D1 / R2、実ユーザーデータ、現在時刻に依存するstateはVRTで取得しない。必要なstateはlocal fixtureまたはbrowser API stubで再現し、再現できないものは対象外と理由をtestまたはこのノートへ記録する。
- VRTの成功だけで視覚確認済みとはしない。UI変更時はcurrent issueが指定するroute、state、viewportのactual screenshotを開いて比較する。

## 画面の方向性

- 既存サイトの明るい本文面、暗いHeader / Footer、控えめな青緑accent、読みやすい本文、実務的な情報密度を維持する。HeaderとFooterは再設計しない。
- desktop、tablet、mobileは別のlayoutとして扱う。広い画面の配置をそのまま縮小してmobileへ流用しない。
- 入力、算出値、警告、errorを色だけで区別しない。label、構造、accessible nameで状態と操作対象を識別できるようにする。
- 高密度の表や可変行はページ全体の横overflowを起こさない。局所scrollを使う場合は、操作の手がかりとkeyboard操作を提供する。

## ページlayoutとナビゲーション

- 公開routeは`/character-sheet/`、ページtitleは`キャラクターシート`とする。site navigationでは`キャラクター成長`の下、`サポート`の上に置く。
- formはdesktopを含めDOM順の1列に積む。`48rem`以上ではform本文を最大`44rem`にして中央寄せし、desktopではmain右端に通常のPageTocと同じ`15rem`幅の補助領域を置く。
- `64rem`以上ではsite menu railを表示する。`64rem`未満ではrailを隠し、Headerのsite menu buttonからdrawerを開く。
- desktopのtext action railは`84rem`以上だけで表示する。`84rem`未満ではfloating action controlsを使い、操作menuをtablet / mobileに合わせて表示する。
- このページにはPageToc / MobilePageTocを表示しない。character-sheet固有のsection navigationはdesktopの右補助領域と狭幅操作menuだけに置く。
- section navigationは第一階層sectionだけを対象とする。buttonには下向きiconと下線を置き、選択中をaccent表示しない。子section、行、入力項目へのjumpは置かない。
- desktop action railは本文scrollから独立してstickyに表示する。Header、Footer、site menu rail、main scroll領域の既存layoutは変更しない。
- `h1`はAstro page側でvisually hiddenに出力し、React Island内に重複させない。heading構造を保つための`h1`がvisual layoutの余白を作らないようにする。

## 操作領域と保存状態

- ユーザー向け操作名は`保存`、`複製`、`削除`、`下書き破棄`とする。`DB保存`、`コピー保存`、`DB削除`、`初期化`、JSON import / exportの操作は表示しない。
- desktop railは認証、`キャラクター一覧`、section navigation、`ヘルプ`、保存操作群、error statusを縦に配置する。保存操作群は`保存`、`複製`、`削除`、`下書き破棄`、`CCFOLIAコピー`で構成する。
- tablet / mobileは、`?`のHelp buttonと操作menu buttonを常時到達可能にする。menuを開くとdesktopと同じ操作群、section navigation、error summaryを表示する。
- 狭幅の操作menu buttonは右下のsticky controlとし、menuを開くとsection navigation、action button群、error summaryをこの順で表示する。form末尾にはfloating controlと重ならない下余白を設け、最後の入力・追加・削除操作を隠さない。
- idなしlocal draftではフォームと画像を端末内の作業状態として扱う。`下書き破棄`はこの状態だけで使え、確認後に入力・画像・可変行・端末内保存を初期状態へ戻す。
- remote characterではフォームと画像をbrowser persistenceへ混在させない。ownerは`保存`と`削除`を、ログイン済みのpublic non-ownerは`複製`を利用できる。non-ownerまたは未認証のremote characterは、編集とデータ変更操作をread-onlyまたはdisabledにする。
- 保存・複製・削除の成功または失敗はToastで通知する。確認や入力を必要とする操作、Help、errorの詳細はToastへ移さない。

## DialogとHelp

- `ヘルプ`は操作を変更しない独立dialogとし、headerと閉じる操作を固定して本文だけをscrollさせる。本文はユーザー確定copyを正本とし、design作業で独自に改稿しない。
- `下書き破棄`の確認dialogは`キャンセル`を初期focusとし、danger styleの`下書き破棄`で確定する。確認はブラウザのnative dialogに委ねない。
- `保存`、`複製`、`削除`は確認または入力dialogを使う。新規保存の`全員に公開する`は既定ON、複製時は既定OFFとする。
- current form errorは`エラー`dialogで確認できる。errorがない状態でも同じdialog構造で`エラーはありません。`を表示する。
- fatal error dialogは、`予期しないエラーが発生しました`と`ページを再読み込みしてください。未保存の変更は失われます。`を表示する。唯一の操作は`再読み込み`で、Escape、dialog外click、閉じるbuttonではdismissしない。
- candidate pickerは操作元へfocusを戻せる閉じる`×`buttonとEscapeを提供し、dialog外clickでは閉じない。
- 通常dialogはnative `dialog`のmodal表示を使い、白いsurface、通常border、`--radius-lg`、`--shadow-soft`を適用する。標準幅は`min(32rem, calc(100vw - 2 * var(--page-gutter)))`とし、長い本文・表はcontent領域だけをscrollさせる。
- Help dialogはaccent border、薄いグレーの背景、丸い`?`iconと`ヘルプ`のtitle行を使う。error dialogはerror時だけ太めのdanger borderを使い、empty stateでは通常のstrong borderと白い背景を使う。`閉じる`buttonはmuted outlineとする。

## 編集画面の情報構造

- profileはsection frameを使わない。PC名、PL名、二つ名、年齢、性別を独立inputとして置き、その直下の開閉式`設定`で複数行textareaを表示する。desktop / tabletは3列、mobileは1列とし、DOM順と視覚順を一致させる。
- 信用は取得信用、融通した、融通された、合計信用、消費信用、小銭修正、小銭の順に置く。編集可能な値は右揃え、派生値は同じ視覚形式のread-only値として示す。
- `縁`、`判定`、`武器・防具`、`スキル`、`専用アイテム`はsection frameでグループ化する。内容を折りたたむ場合もchildrenをunmountせず、開閉状態は保存しない。
- スキルとアイテムの候補選択は、行の左端にある選択iconからdialogで行う。browser native selectを使わず、選択済み名称はread-only textとして示す。
- 可変行は値と追加・削除・変更操作の関係を近接して示す。削除は背景・囲みのないゴミ箱iconとし、通常使用不可の専用アイテムカテゴリの削除だけはwarning colorを使う。防具と画像のclearには同じ寸法の消しゴムiconを使い、縁の通常行は削除と誤認しない横長の`クリア`text buttonを使う。
- 専用アイテムカテゴリは横に並べず縦に積む。ナノマシン、サイバネ、ドラッグの効果は初期状態で隠し、`効果を展開`で行の下に表示する。お守りはdesktop / tabletで効果を常時表示し、mobileでだけ展開式にする。
- 画像の選択と差し替えは同じ導線にし、画像clearをその右に置く。未選択時のclearはdisabledにする。画像処理中はIsland全体を操作不可にするloading overlayを表示する。

### 基本情報、ビルド、能力値

- 基本情報は、profile / `設定` / 画像入力の上段と、その下の経験点・信用で構成する。desktopとtabletではprofile / `設定`を左、画像を右に置き、画像領域はprofileと`設定`の高さをまたぐ。mobileではprofile、`設定`、画像、経験点・信用の順に1列で積む。
- 未選択の初期状態でも、格、成長可能点、取得・消費・残経験点を表示する。プライマリ流儀だけで決まる基礎能力値・流儀増加値・共通スキルボーナス、生き様だけで決まる能力値ポイント候補・係数は、それぞれの選択時だけ表示する。常時能力値と一時能力値は両方選択時だけ値を表示し、それ以外は`-`とする。
- 能力値領域の上には`{生き様名}：能力値ポイント X, X, X, X, X`と成長点を置く。能力値ポイント、成長、常時修正、一時修正の入力と、算出された常時・一時能力値を同じ表で対応付ける。能力値ポイントを自動配分せず、不一致は局所errorで示す。
- 共通スキルレベル合計と合計レベル上限は、基本情報の経験点表示で確認できるようにする。`共通スキルレベル合計／合計レベル上限`は上限式を説明する`FormulaTooltip`のlabelとし、共通スキル区分にも取得合計と上限を示す。
- desktop / tabletでは、経験点を`取得経験点・消費経験点・残経験点・格・共通スキル値`として同じ情報群に置く。mobileでは取得・消費・残経験点を1行、格とtooltip付き共通スキル値を次行に置く。信用はdesktop / tabletで7列、mobileで3項目と4項目の2行に分ける。
- 数値入力は右揃えで値に見合う短い幅にする。空いた幅は算出値、label、マスタ由来のread-only情報へ配分し、算出値だけを別summary領域へ再掲しない。

### section frame、tooltip、mobileの情報密度

- section frameは既存tokenのsurface、border、radiusを使い、見出しbuttonはmuted surfaceに置く。見出しの右端には青緑のchevronを置き、button全体を操作targetとする。`aria-expanded`と`aria-controls`で内容領域との関係を伝え、既存global styleのfocus colorによるinset focus ringを維持する。
- section frameの見出しbuttonは36px以上の操作targetとする。section間gapと内容余白は情報密度に合わせて通常ページより小さくし、desktopではsection間`20px`・内容余白`12px`、mobileでは`16px`・`8px`を基準にする。空の内容領域に最小高を設けない。
- Island内のheadingは`h2`を`16px`、`h3`を`14px`、`h4`を`13px`とする。site全体のglobal headingとproseのtype scaleは変更しない。field label、直接入力、重要な算出値、一覧本文、mobileの密集一覧には既存の専用text tokenを使う。
- font familyは既存の`--font-sans`継承を保つ。`体力増加`から`精神力係数`、`共通スキルボーナス`、副能力値の`最大体力`から`結べる縁`、覚悟効果の`気絶からの回復`から`受動判定`は、`--text-xs`、muted color、bold（750）で揃える。読み取り専用の数値枠と文字・数値・selectの直接入力は`--text-xs`と共通の最小高を使う。
- スキル、武器・防具、専用itemの一覧rowとcolumn headerは、並べ替えcontrolを収める`2.25rem`の共通最小高を使う。項目名、数値input、icon操作は同じrow高の中で配置する。
- 計算式は、対応する自動算出値または最終値のlabelから開くtooltipに置く。tooltip triggerの直後に薄いaccent colorの小さな丸い`?`indicatorを置き、indicatorはtriggerの操作領域へ含める。tooltipはviewport内で上下左右に読める位置へ表示する。
- mobileでは副能力値を1項目ずつ縦に積むが、項目内の`自動算出値 + 修正入力 = 最終値`は横並びを保つ。縁の覚悟効果は、気絶からの回復、気合獲得、能動判定、受動判定の順に4行1列で置き、式を折り返さない。攻撃・リアクションの下に非戦闘技能を置き、非戦闘技能は2列にする。

### 副能力値、縁、判定

- 副能力値はsection frame内で、体力系と精神力系、移動力系と行動値系、行動回数と結べる縁の3行へ圧縮する。各項目は`自動算出値 + ユーザー入力欄 = 最終値`とcheckboxを1枠に入れ、流儀・生き様と能力値より控えめな密度にする。移動力・行動値の項目名はformula tooltipのtriggerとし、`一時修正を適用`は一時能力値の説明tooltip triggerとする。
- 縁は対象と関係の列header、覚悟checkbox、短い対象input、長い関係inputを持つ。左端には上下の順序入れ替えcontrolを置き、移動できない方向のcontrolは表示しない。覚悟済み行は編集lockと解除後の再編集可能性を視覚的に示す。
- `覚悟の効果`には灰色の`通常の縁／今生の縁`を並べ、元値、修正値、最終値の関係をread-only backgroundで示す。desktop / tabletは2行2列、mobileは4行1列とする。
- 攻撃とリアクションは使用能力値、常時・一時能力値、手動修正、常時・一時の最終判定数を示す。非戦闘技能は得意技能チェック、技能名、固定対応能力値、手動修正、常時 / 一時の判定数をこの順で示し、能力値選択は設けない。非戦闘技能は個別に開閉でき、折りたたみ時は得意技能チェック済みの行だけを残す。

### スキル、候補選択、アイテム

- スキルはプライマリ流儀、生き様、共通スキル、その他流儀の順に縦に積む。各区分は独立して開閉でき、初期状態では開く。ボーナススキルは各一覧の先頭にread-only行として置き、その他流儀のスキル領域はビルド側で追加した時点で表示する。
- スキル行は名称、Lv、最大レベル、コスト、技能、使用制限、対象、射程、右端の`効果を展開`を1行で示す。名称列は行幅のおよそ4分の1とし、展開時に取得制限と効果を直下へ表示する。文章条件の自動検証は行わない。
- 武器候補dialogは名称、信用、射程、種別、技能、攻撃力、ガード値の表と、全列をまたぐ効果行を使う。mobileでは攻撃力とガード値を1セルへ圧縮する。武器の表を、他のitem categoryやスキル候補dialogへ機械的に流用しない。
- 武器と防具は別tableにする。武器は名称、信用、射程、種別、技能、攻撃力、ガード値、効果展開を、防具は名称、信用、防御力、ダメージ軽減、効果展開、clearをheaderに置く。武器は確認なしで削除し、防具clearは選択IDと両修正を初期値へ戻す。
- ナノマシン、サイバネ、ドラッグは効果を初期表示せず、お守りだけはdesktop / tabletで効果を常時表示する。生き様と一致しない保持済み専用item categoryは、通常選択不可であることを見出しに示し、category全体をwarning borderで示す。

### エラー、一覧、通知

- errorは該当inputまたは能力値、流儀、生き様、縁、共通スキル、専用アイテムの該当枠を色で示す。通常使用不可の専用item categoryのwarning colorとerror colorを混同しない。個別inputの直下にerror理由を追加しない。
- desktop error statusは、errorなしで通常border、`エラーはありません。`、通常の`確認`buttonを示し、error時はborder、`エラーがN件あります。`、`確認`buttonをdanger colorにする。tablet / mobileはopen menu内で全errorをtext listとして示す。
- tablet / mobileの可変長error listだけを最大`12rem`で縦scroll可能にする。section navigation、action button群、`エラーがN件あります。`はscroll領域外に置き、メニューbuttonのaccessible nameには開閉状態とerror statusを含める。
- `キャラクター一覧`は固定高のdialogにし、header、説明・filter、paginationを固定して行領域だけを縦scrollさせる。PC名、PL名、流儀／生き様、格を表示し、desktop / tabletでは長い文字列をellipsisにして横scrollを起こさない。mobileはPC名とPL名だけを表示する。page、radio、filterの切替時は行領域を先頭へ戻す。
- 成功・失敗の結果通知はsuccess / error、5秒後の自動消去、新着順stack、manual closeなしのToastで示す。警告と破壊的操作の確認にはdialogを使い、browser native `alert` / `confirm`は使わない。

## 比較観点

- desktopでは本文幅、右側action rail、section navigation、sticky動作が共存し、横overflowしないこと。
- tablet / mobileではfloating action controls、open action menu、site menu drawer、dialogが画面内で到達・操作できること。
- action controlのenabled / disabled、error status、read-only stateがlocal draft、owner remote、public non-owner remoteで区別できること。
- Help本文のscroll、`下書き破棄`確認、CCFOLIAコピーの確認・結果、candidate picker、current error dialogでfocusとclose導線が一貫すること。
- profile、信用、可変行、item table、section error、tooltipが各viewportでclipやページ全体の横overflowを起こさないこと。

## 制約と変更境界

- 作成質問票、複数端末同期、共有URL、汎用効果文解析、ダイスロール、セッション状態管理は初期scopeに含めない。
- Firebase Authenticationとcharacter sheet cloud persistence以外の保存・認証機能を追加しない。
- JSONの入出力導線、ファイルdownload、外部JSON読込みを追加しない。snapshotはserver storageと端末内作業状態のための内部形式であり、ユーザー向けimport / export機能ではない。
- layout、操作導線、breakpoint、VRT対象を変更する場合は、実装前にdesign draftまたは現行actual screenshotを用いてユーザー承認を得る。baseline更新は承認済みtargetだけに限定する。
