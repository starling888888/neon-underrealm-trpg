# ex-02-web-character-sheet Gate plan

## 親issue

- `docs/issue/ex-02-web-character-sheet.md`

## 共通の境界

- このplanはGateの列挙と着手候補の範囲を管理する。表の1行だけでは実装を開始しない。
- 各Gateは、着手時に現行の要件・アーキテクチャ・designなどの参照正本を読み、表に記載した子issueを作成してから実装する。子issueで完了境界、確認方法、実装判断、追加の参照正本を定義し、以後の実装中のSSoTとする。
- 各Gate子issueは、`docs/architectures/character-sheet.md`の`実装時のアーキテクチャ遵守`に従い、適用するarchitecture節と、許可する変更・禁止する変更・確認するテスト層を実装契約として明記する。この対応付けがない変更は実装しない。
- UIを含む各Gate子issueは、titleの直後に`## 最優先のデザイン入力`節を置く。この節で、requirements・ルール・対象`.tmp/design/<design-target>/`配下の承認済みdraft画像を照合し、このGateで扱う設計範囲を自己完結して明記する。draft画像は高優先の設計入力として遵守するが、同じ目的の既存実装UIがある場合はそちらをさらに優先し、draft画像を既存UIに整合するよう解釈する。ユーザーの最新指示はこれらのデザイン入力を上書きする。design notes、実装結果のscreenshot、reviewer出力をdraft画像または既存実装UIの代わりに使わず、不明点・競合は実装で補完せずに停止してユーザー判断を求める。
- UIを含むGateの子issue作成時は、design draftと実装指針を確認してからUI実装の詳細を決定する。不明点は実装都合で補完せず、子issueへユーザレビューまたは決定事項として保留し、明示的な決定を得るまで実装しない。
- UI Gateは、実装後にE2EとVRTのspecを追加・更新しても、ユーザーレビューが完了するまで実行しない。実装後のレビュー待ちではpreview serverを起動せず、既定portのdev serverを維持してユーザーが対象routeを確認できる状態にする。ユーザーレビュー完了の明示指示後にだけ、対象E2E、target限定VRT、actual screenshot確認を実行する。
- Gate完了時は、子issueの確定事項をdesign notes、architecture、requirementsへそれぞれの正本として差し戻し、後続Gateに必要な前提だけをこのplanへ記録する。完了条件、チェックポイント、レビュー記録は子issueに保持し、親planやほかの正本へ差し戻さない。その後、子issueを`docs/issue/done/`へ移す。
- 共通スキルボーナスは表示用データを参照するだけとし、構造化、文字列解析、自動算出を追加しない。
- 全Gateの参照正本は親issueと同じ`docs/requirements/character-sheet.md`、`docs/architectures/character-sheet.md`、`docs/design/character-sheet/notes.md`とする。必要なゲームデータは、子issueで追加して指定する。

## Gate一覧

| Gate | 状態    | 依存Gate                                                                                                                                        | 子issue                                                                          | 範囲                                                                                               |
| ---- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| G0   | done    | なし                                                                                                                                            | `docs/issue/done/ex-02-web-character-sheet/ex-02-0-sheet-page-header.md`         | Astro pageとページ固有のサイトメニュー表示を作成する。HeaderとFooterは再設計しない。               |
| G1   | done    | G0                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-1-sheet-runtime.md`             | React Islandなどの実行基盤を整備する。                                                             |
| G2   | done    | G0, G1                                                                                                                                          | `docs/issue/done/ex-02-web-character-sheet/ex-02-2-sheet-layout.md`              | desktopでは`80rem`以上で等分2列、tablet/mobileでは一列の基本レイアウトを提供する。                 |
| G3   | done    | G2                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-3-sheet-section-frame.md`       | 編集セクションの共通枠と開閉操作を作成する。                                                       |
| G4   | done    | G1, G2, G3                                                                                                                                      | `docs/issue/done/ex-02-web-character-sheet/ex-02-4-sheet-profile.md`             | 基本情報、キャラクター設定、信用を扱う。                                                           |
| G5   | done    | G1, G2, G3                                                                                                                                      | `docs/issue/done/ex-02-web-character-sheet/ex-02-5-sheet-dialogs.md`             | ダイアログの共通基盤を整備する。                                                                   |
| G6   | done    | G4, G5                                                                                                                                          | `docs/issue/done/ex-02-web-character-sheet/ex-02-6-sheet-image.md`               | 承認済みdraftのprofile / setting / image / credit配置を保ち、キャラクター画像を扱う。              |
| G7   | done    | G1, G2, G3                                                                                                                                      | `docs/issue/done/ex-02-web-character-sheet/ex-02-7-sheet-build.md`               | 流儀、生き様、能力値、経験点を扱う。                                                               |
| G8   | done    | G7                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-8-sheet-secondary.md`           | 副能力値を扱う。                                                                                   |
| G9   | done    | G7, G8                                                                                                                                          | `docs/issue/done/ex-02-web-character-sheet/ex-02-9-sheet-bonds.md`               | 縁と覚悟を扱う。                                                                                   |
| G10  | done    | G7                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-10-sheet-attack-reaction.md`    | 攻撃とリアクションを扱う。                                                                         |
| G11  | done    | G7                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-11-sheet-noncombat.md`          | 非戦闘技能を扱う。                                                                                 |
| G12  | done    | G7                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-12-sheet-primary-skills.md`     | プライマリ流儀のスキルを扱う。                                                                     |
| G13  | done    | G7                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-13-sheet-ikizama-skills.md`     | 生き様のスキルを扱う。                                                                             |
| G14  | done    | G7, G12                                                                                                                                         | `docs/issue/done/ex-02-web-character-sheet/ex-02-14-sheet-common-skills.md`      | 共通スキルを扱う。                                                                                 |
| G15  | done    | G7, G12                                                                                                                                         | `docs/issue/done/ex-02-web-character-sheet/ex-02-15-sheet-other-ryugi-skills.md` | その他流儀のスキルを扱う。                                                                         |
| G16  | active  | G7, G12, G13, G14, G15                                                                                                                          | `docs/issue/ex-02-16-sheet-experience-consistency.md`                            | 消費経験点の算出整合性を確認する。                                                                 |
| G17  | planned | G4, G7                                                                                                                                          | `docs/issue/ex-02-17-sheet-weapons-armor.md`                                     | 武器と防具を扱う。                                                                                 |
| G18  | planned | G4                                                                                                                                              | `docs/issue/ex-02-18-sheet-omamori.md`                                           | お守りの専用入力領域だけを実装し、生き様連動・追加・削除は扱わない。                               |
| G19  | planned | G4                                                                                                                                              | `docs/issue/ex-02-19-sheet-cybernetics.md`                                       | サイバネの専用入力領域だけを実装し、生き様連動・追加・削除は扱わない。                             |
| G20  | planned | G4                                                                                                                                              | `docs/issue/ex-02-20-sheet-nanomachines.md`                                      | ナノマシンの専用入力領域だけを実装し、生き様連動・追加・削除は扱わない。                           |
| G21  | planned | G4                                                                                                                                              | `docs/issue/ex-02-21-sheet-drugs.md`                                             | ドラッグの専用入力領域だけを実装し、生き様連動・追加・削除は扱わない。                             |
| G22  | planned | G4, G7, G17, G18, G19, G20, G21                                                                                                                 | `docs/issue/ex-02-22-sheet-special-items-integration.md`                         | 消費信用の一元算出、生き様別デフォルト表示、その他の追加・削除、生き様変更時の入れ替えを実装する。 |
| G23  | planned | G2, G3, G5                                                                                                                                      | `docs/issue/ex-02-23-sheet-action-pane.md`                                       | 操作ペインとモックのコントロールボタンを作成する。                                                 |
| G24  | planned | G4, G6, G7, G8, G9, G10, G11, G12, G13, G14, G15, G17, G18, G19, G20, G21, G22                                                                  | `docs/issue/ex-02-24-sheet-persistence.md`                                       | 自動保存と保存済み項目の自動復元を扱う。                                                           |
| G25  | planned | G4, G6, G7, G8, G9, G10, G11, G12, G13, G14, G15, G17, G18, G19, G20, G21, G22, G23                                                             | `docs/issue/ex-02-25-sheet-error-summary.md`                                     | エラーと警告の集約表示を扱う。                                                                     |
| G26  | planned | G4, G6, G7, G8, G9, G10, G11, G12, G13, G14, G15, G17, G18, G19, G20, G21, G22, G23                                                             | `docs/issue/ex-02-26-sheet-json-export.md`                                       | JSON出力を扱う。                                                                                   |
| G27  | planned | G5, G24, G25, G26                                                                                                                               | `docs/issue/ex-02-27-sheet-json-import.md`                                       | JSON入力を扱う。                                                                                   |
| G28  | planned | G5, G22, G23, G25, G26                                                                                                                          | `docs/issue/ex-02-28-sheet-ccfolia.md`                                           | CCFOLIA出力を扱う。                                                                                |
| G29  | planned | G5, G22, G23, G24, G25                                                                                                                          | `docs/issue/ex-02-29-sheet-reset.md`                                             | 全クリアを扱う。                                                                                   |
| G30  | planned | G5, G23, G24, G25, G26, G27, G28, G29                                                                                                           | `docs/issue/ex-02-30-sheet-help.md`                                              | ヘルプを扱う。                                                                                     |
| G31  | planned | G0, G1, G2, G3, G4, G5, G6, G7, G8, G9, G10, G11, G12, G13, G14, G15, G16, G17, G18, G19, G20, G21, G22, G23, G24, G25, G26, G27, G28, G29, G30 | `docs/issue/ex-02-31-sheet-integration.md`                                       | 統合とエラーチェック、およびcanonical VRT baselineを管理しないVisual Reviewを行う。                |

## 完了Gateの引継ぎ

### G0

- `/character-sheet/`はAstroの静的ページとして存在し、後続Gateは`src/pages/character-sheet.astro`へReact Islandを直接配置する。
- ページ固有のサイトメニューはtabletの常設rail、desktopとmobileのHeader drawerとする。PageToc / MobilePageTocは追加しない。
- 共通`AppContainer`、共通Header、共通layoutへcharacter-sheet固有の条件分岐を追加しない。ページ固有のHeader、drawer、menu scriptだけを変更対象とする。
- desktopとtabletのmainは本文用の最大幅・中央寄せを使わない。Pagefind検索indexから除外する。

### G2

- `CharacterSheetFormPresenter`の`data-character-sheet-layout`は、`80rem`以上で`minmax(0, 1fr)`の等分2列、`80rem`未満で一列とする。
- 後続Gateは`primary`と`secondary`のlayout regionへsectionを置く。DOM順は基本情報、ビルド・能力値、副能力値、縁、判定、武器・防具、スキル、専用アイテムとする。
- `tests/visual/character-sheet.spec.ts`はdesktop、tablet、mobileと、`1279px` / `1280px`の列数境界を確認する。G2ではVRT baselineを更新していない。

### G3

- `CharacterSheetSectionFrame`は`bonds`、`checks`、`weapons-and-armor`、`skills`、`special-items`だけへ適用する。`profile`、`build`、`secondary`は後続Gateで扱う。
- frameは初期展開・独立開閉とし、内容を`hidden`にするだけでchildrenをunmountしない。開閉stateは保存・JSON入出力へ含めない。
- `headingAs`は`span`または`h1`〜`h6`だけを受け、既定は`span`である。G3の5 top-level frameは`h2`を指定し、後続の入れ子sectionは適切なheading levelを指定する。
- `CharacterSheetFormPresenter`のIsland scopeは、compact density用のsection gap、content padding、toggle heightを提供する。後続Gateはこのscopeを使い、site全体のglobal type scaleを変更しない。
- canonical VRT baselineは更新していない。PRレビュー直前には、`@character-sheet` targetだけをVisual Reviewし、baseline更新はユーザーの明示承認時だけとする。

### G4

- `CharacterSheetContainer`は`profile`と`credit`を意味単位でまとめたRHF valueとして持つ。profileの文字列defaultは`""`、creditは取得信用`10`、融通した・融通された・小銭修正`0`で、`null`は持ち込まない。
- `characterSheetFormSchema`を`zodResolver`でRHFへ接続する。信用の数値制約とブラウザの生入力値の正規化はschema / RHF adapterの責務であり、Presenter以下のComponentはpropsとcallbackだけを扱う。
- 信用のnative number inputはuncontrolledとして、focus中の`-`など未確定な入力をDOMに保持する。確定可能な値だけをRHFへ渡し、blur時には正規化された値をDOMへ戻す。G24の復元、G29の全クリアなど外部更新をinputへ同期する契約は、各Gateで明示する。
- G4時点の消費信用は`0`である。G22ではアイテム値の合計をRHF adapter hookから入力し、Presenterで算出・保持しない。
- Playwrightは領域表示と代表操作だけの最終smokeとし、入力境界、算出式、Tooltip、表示Componentの局所挙動はNode / Component / hook testで扱う。canonical VRT baselineは更新していないため、PRレビュー直前に必要なcharacter-sheet targetだけをVisual Reviewする。

### G5

- `CharacterSheetDialog`はnative modalの開閉、Escape、操作元へのfocus復帰、accessible nameを担う制御式shellである。呼出し側は`aria-labelledby`または`aria-label`のどちらかと、用途に合う初期focus対象を必ず指定する。
- `CharacterSheetDialogHeader`、`CharacterSheetDialogContent`、`CharacterSheetDialogActions`を必要なものだけ組み合わせる。全用途を`variant`、必須`title`、必須`description`で表さない。短い主文だけを`aria-describedby`で関連付け、複数段落、リスト、表を含む本文には指定しない。
- 確認とエラーは専用Component候補であり、ヘルプと候補選択は専用Componentまたはshellの合成で実装する。固有の構造、幅、色、icon、業務副作用は各後続Gateの責務である。
- G5の可視ダミー確認buttonは、G23以降で実操作buttonへ置換または削除する。dialogの開閉状態・選択対象はContainerが持ち、RHF、保存、JSONへ含めない。
- canonical VRT baselineは更新していない。PRレビュー直前に、G5の`@character-sheet` targetだけをVisual Reviewし、baseline更新はユーザーの明示承認時だけ行う。

### G6

- 画像recordは`neon-underrealm-character-sheet` database、`character-images` store、`current-character-image` keyへ、変換済みWebPのMIME typeとbase64をIndexedDB保存する。RHF、localStorage、URL、JSONへ混在させない。
- 基本情報内の画像はdesktop / tabletでprofile・settingの右、mobileでsettingの下かつ信用の上に置く。選択済み時は差し替えと個別の`画像をクリア`を表示し、書込み・削除成功後だけ表示を更新する。G29は全クリアに伴う画像削除を扱う。
- Root操作ロックとloading overlayは画像専用にせず、表示文言を渡して後続Gateの保存・出力・入力操作でも共有する。画像の失敗通知は`CharacterImageErrorDialog`でG5 dialog shellを合成し、操作元へfocusを復帰する。

### G7

- プライマリ流儀・生き様・その他流儀、能力値、経験点の入力・局所エラーを実装した。経験点は基本情報の信用近傍に置き、G7で扱う流儀費用だけを集計する。共通スキルなど後続Gateの費用は加えず、G16で全費用の整合性を確認する。
- プライマリ流儀・生き様は未選択を許容する。格と成長可能点は両レベルから常に算出し、初期値は`2`と`0`である。片方だけの選択時も、そのマスタだけで決まる参照値と経験点を表示する。常時能力値・一時能力値だけは両方の選択が揃うまで`-`とする。
- 未算出の`-`は辞書と表示format関数へ集約した。後続Gateはcomponentごとのfallbackを追加せず、この契約を再利用する。
- 共通スキルボーナスはG7では選択中プライマリ流儀の表示用データをLv別cardとして参照するだけである。共通スキルLv・上限・実際の取得状態との接続はG14で扱う。
- canonical VRT baselineは更新していない。後続GateのVisual Reviewでも既存baselineとの差分をbaseline更新の根拠にせず、更新はユーザーの明示承認時だけ行う。

### G8

- 副能力値は`secondary` layout regionの`CharacterSheetSectionFrame`内に置く。最大体力、最大精神力、移動力、行動値、行動回数、結べる縁は、`自動算出値 + 修正 = 最終値`として表示し、手動修正はRHFの`secondaryAttributes`にだけ保持する。移動力・行動値は一時修正適用で一時能力値の導出を選ぶ。
- `FormulaTooltip`はtriggerとtooltip本文を分離し、viewport gutter内へfixed配置する共有Componentである。Component外tap用dismiss layerはComponent固有classで扱い、section CSSから内部buttonを広く選択しない。tooltipの局所操作と配置はComponent test、実画面のopen stateはtarget限定VRT、最終browser E2Eは代表的な入力・checkbox操作だけを扱う。
- `character-sheet`のcanonical VRT baselineはG8後のdefault・tooltip open stateをまだ採用していない。後続のVisual Reviewでもtarget限定actual確認は行うが、baseline更新はユーザーの明示承認時だけ行う。

### G9

- 縁は`bonds` slotに置き、対象、関係、覚悟checkbox、通常行の角丸の横長`クリア`操作を持つ。覚悟済み行は編集・clear・deleteをできず、解除後に再編集できる。
- 縁最大数の増減では入力済み・覚悟済み行を順序どおり保持し、空行だけを増減する。上限外の未覚悟行はerror colorと共有solid circle `×` delete buttonで示し、section内warningを表示する。
- 覚悟効果は、気絶からの回復、気合獲得、能動判定、受動判定の順で、`通常の縁／今生の縁 + 修正値 = 最終値`を示す。気絶からの回復、能動判定、受動判定は固定ダイス式のダイス数へ修正値を加え、気合獲得は通常の縁の数値へ加え、今生の縁の`1d6`へ符号付き修正値を付記する。自由文・任意ダイス式は解析しない。
- 覚悟効果はdesktop / tabletで2行2列、mobileで4行1列とし、元値・最終値はread-only backgroundで表示する。canonical VRT baselineは更新していない。

### G10

- `checks` slotに攻撃とリアクションを実装した。desktopではright secondary columnの最上段、tablet / mobileでは縁の後に置く。攻撃は1〜5行で、技能候補と対応能力候補は指定順、最後の1行は削除不可、5行目は追加不可とする。リアクションは4固定行で、対応能力だけを変更できる。
- 判定数は`対応能力 + 手動修正`で常時・一時をそれぞれ導出する。判定数に影響するスキル・アイテム効果は各行の修正へ手入力し、効果文・能力値変化の自動解析はしない。
- G10のレビュー指摘2として、通常の縁行のクリアを角丸の横長`クリア` text buttonに変え、上限外行の`×` delete buttonと形状・文言で区別した。
- canonical VRT baselineは更新していない。G10と縁クリアbuttonの局所Visual Reviewは、test-owned locator screenshotを出力できないため未実施のままユーザー指示でGateをcloseした。G31で必要なら再確認する。

### G11

- `checks` slotに、固定15技能の非戦闘技能を追加した。展開時は対応能力別の小見出しと15行、折りたたみ時は得意技能だけを表示する。desktop / tabletは2列、mobileは1列で、得意技能、修正、常時／一時判定数を一行のcard gridに置く。
- 表示名はGameDomain、技能ID・順序・対応能力は読み取り専用master data、得意技能と修正はform値、判定数はpure logicの導出値として分離する。得意技能は能力値だけを2倍にし、修正を2倍にしない。
- G9 / G10の再受入として、縁の削除callbackを未覚悟かつ上限外行だけに制限し、縁・攻撃・リアクションの編集行を`fieldset` / `legend`で意味付けた。mobileの縁`クリア`buttonのgrid overflowも解消した。
- `FormulaTooltip`のindicatorは共通flex boxへ移した。G31のコンテンツレビューで残る違和感が指摘された場合だけ、個別labelではなく共通Componentを再調整する。
- canonical VRT baselineは管理しない。G31は各Gateのactual locator screenshotをrequirements・design・ユーザー指示へ照合して、統合Visual Reviewを行う。

### G12

- プライマリ流儀のbonus skillは自動表示の固定Lv1、通常skillは最低1行を保持した可変行として実装した。通常行は選択、Lv、追加・削除、上下buttonによる並べ替えを扱い、重複、最大Lv超過、通常skill合計Lvのプライマリ流儀Lv超過をsection / row / inputのerror状態へ伝える。
- `components/skills/SkillSection`と`SkillPickerDialog`は、RHF・流儀種別・field pathを受け取らないshared表示Componentである。G13〜G15はcategory固有adapterからrow、候補group、選択済みID、callbackを渡して再利用し、同じ表・dialogを複製しない。
- 通常行の未選択表示は可視文言を維持しつつ、操作用accessible nameを行番号で一意にする。候補dialogの選択済み行はdisabled表示とし、読み取り専用metadataにも非視覚ラベルを持たせる。
- desktop / tabletは名称、Lv、最大Lv、タイミング、コスト、使用制限、展開を要約行に置き、技能・取得制限・効果を展開詳細に置く。mobileは名称、Lv、最大Lv、タイミング、展開、削除だけを要約行とし、コスト・使用制限・技能・取得制限・効果を展開詳細へ置く。
- 4状態（選択済み、候補dialog、行詳細展開、流儀変更確認）のdesktop / tablet / mobile actual locator screenshotを確認済み。12状態のcanonical VRT baselineは未作成のため比較不能であり、baseline更新は行わない。

### G13

- 生き様のbonus skillと通常skillを、G12のshared表示Componentとcategory固有adapterで編集する。通常skillは初期2行・最低0行とし、選択、Lv編集、追加・削除・並べ替えを扱う。
- bonus skillはLv1だけを無料とする。通常skillの取得LvとbonusのLv2以上を合計し、生き様Lv超過をBuildと生き様skill sectionの局所error状態へ伝える。G16の全区分validationは前倒ししない。
- 生き様通常skillが選択済みの流儀変更は、G12の確認dialog UIを再利用してconfirm時だけ選択を解除する。cancel / Escapeでは入力を保持し、操作元selectへfocusを戻す。
- `SkillSection`のautomatic input groupと詳細toggleの関連付けを補い、長い名称はdesktop / tabletの列幅と狭幅の改行保持でclip / ellipsisさせない。各skill section間に縦gapを設ける。
- `@character-sheet`の対象stateをpreviewで確認し、desktop / tablet / mobileのactual locator screenshotを開いた。canonical VRT baselineは更新していない。skill Lvの入力自動補正・復元・JSON入力時の契約はG24 / G27のTODOで扱う。

### G14

- 共通スキルは、生き様スキルの下、その他流儀スキルの上に置く。基本の一撃は読み取り専用で、通常スキルだけを最低1行の`useFieldArray`として追加・削除・並べ替えできる。
- 通常スキルの取得Lv合計`N`は基本の一撃を除外し、経験点へ`N * 5`を加算する。上限`M`は`ceil(格 / 2)`であり、`N > M`のerror feedbackは基本情報の`N／M`枠と共通スキルsectionだけに置く。
- 共通スキルの合計Lvが`2`、`5`、`9`へ到達したとき、流儀・生き様 / 能力値領域の対応する共通スキルボーナス枠だけをaccent色の太い枠線で示す。背景色・文字色は既存表示を維持し、ボーナス効果を派生値へ自動加算しない。
- locator-only Visual Reviewで、default、候補dialog、tooltip、選択後、上限超過、Lv 2・5・9到達のdesktop / tablet / mobile actualを確認した。canonical VRT baselineは更新していない。

### G15

- その他流儀の各build `rowId`へ、通常スキルのflatなRHF field arrayを`ryugiRowId`で結び付けた。新設スキル行だけを`useFieldArray`で追加・削除・移動し、複数流儀が混在しても所有流儀以外の行を操作しないことをhook testで確認した。
- 候補は対象流儀の通常スキルだけとし、`bonus`と`プライマリ限定`を除外する。Lv6以上で`advanced`を加え、選択・別skillへの変更時はLvを1へ戻す。取得Lv合計超過は対応するbuild行とskill sectionの局所error状態へ渡す。
- 選択済みskillを持つその他流儀の変更・削除には確認dialogを使う。確定時だけ選択を消去または行を削除し、キャンセル・Escapeは値を保持する。削除確定後のfocusは、削除済みbuttonではなく残存する「その他流儀を追加」buttonへ戻す。
- shared `SkillSection` / `SkillPickerDialog`を再利用し、候補・確認文言・RHF pathを表示Componentへ渡していない。変更確認本文はdictionaryの共通キーへ集約し、共有行値型・確認dialogは中立名へ改めた。
- G13で残っていた生き様通常スキル0行とschemaの不一致は、ユーザー承認により本Gateで修正した。bonus最大LvはG16、復元時のbonus resetはG24 / G27のTODOに残す。
- その他流儀の5状態をdesktop / tablet / mobileでactual locator screenshotにより確認した。これらはlocator-only VRTとしてcapture時だけ実行し、canonical full-page baselineの比較・更新はしない。Gate Technical Reviewの指摘はすべて修正済み。

### G16

- 全通常スキルと生き様bonusの最大Lv違反・Lv`1`未満は、値を保持しつつ該当入力・行だけをerror状態にする。区分合計超過、重複、経験点不足など区分全体の不整合だけはsectionもerror状態にする。
- 共通スキルの取得Lv合計と経験点は、選択済み行の非負値だけから導出する。Lv`0`・負数は局所errorを保ち、消費経験点を減算または正のLvと相殺しない。最大Lv超過値は保持して合計・費用へ反映する。
- `SkillSection`の技能Lv inputはuncontrolledで、focus中の未確定number inputをDOMに保持する。受理済み値の外部更新は同じDOM inputへ同期し、RHFの`reset`後もrow IDと最大Lv超過値を保つ。G24 / G27はこの契約を保存・復元・JSON adapterへ適用する。
- `build.otherRyugi`、`bonds.rows`、`checks.attacks` / `checks.reactions`、全skill arrayの追加・削除・移動・置換は`useFieldArray`操作へ統一した。row ID、最小行数、確認dialog、focus復帰を維持する。
- 最大Lv超過4 stateをdesktop / tablet / mobileでactual locator screenshotにより再確認した。canonical VRT baselineは更新していない。
- 2026-07-28に`.tmp/chatgpt-review.md`のローカル照合で未達を確認してactiveへ戻した。最大Lv違反のsection伝播、`advanced`条件、プライマリ以外の重複validation、可変行の`useFieldArray`更新境界とrow identityをG16で回収する。既存の経験点算出とuncontrolled input同期の達成部分は維持する。

状態は `planned`、`in progress`、`active`、`done` を使う。`active`は、完了済みとしていたGateをreview指摘で再openし、修正または再reviewが終わるまでの状態を表す。
