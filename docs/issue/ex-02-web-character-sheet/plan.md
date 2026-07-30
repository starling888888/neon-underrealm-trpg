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

| Gate | 状態    | 依存Gate                                                                                                                                        | 子issue                                                                                 | 範囲                                                                                                                                                                                                                                                    |
| ---- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G0   | done    | なし                                                                                                                                            | `docs/issue/done/ex-02-web-character-sheet/ex-02-0-sheet-page-header.md`                | Astro pageとページ固有のサイトメニュー表示を作成する。HeaderとFooterは再設計しない。                                                                                                                                                                    |
| G1   | done    | G0                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-1-sheet-runtime.md`                    | React Islandなどの実行基盤を整備する。                                                                                                                                                                                                                  |
| G2   | done    | G0, G1                                                                                                                                          | `docs/issue/done/ex-02-web-character-sheet/ex-02-2-sheet-layout.md`                     | desktopでは`80rem`以上で等分2列、tablet/mobileでは一列の基本レイアウトを提供する。                                                                                                                                                                      |
| G3   | done    | G2                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-3-sheet-section-frame.md`              | 編集セクションの共通枠と開閉操作を作成する。                                                                                                                                                                                                            |
| G4   | done    | G1, G2, G3                                                                                                                                      | `docs/issue/done/ex-02-web-character-sheet/ex-02-4-sheet-profile.md`                    | 基本情報、キャラクター設定、信用を扱う。                                                                                                                                                                                                                |
| G5   | done    | G1, G2, G3                                                                                                                                      | `docs/issue/done/ex-02-web-character-sheet/ex-02-5-sheet-dialogs.md`                    | ダイアログの共通基盤を整備する。                                                                                                                                                                                                                        |
| G6   | done    | G4, G5                                                                                                                                          | `docs/issue/done/ex-02-web-character-sheet/ex-02-6-sheet-image.md`                      | 承認済みdraftのprofile / setting / image / credit配置を保ち、キャラクター画像を扱う。                                                                                                                                                                   |
| G7   | done    | G1, G2, G3                                                                                                                                      | `docs/issue/done/ex-02-web-character-sheet/ex-02-7-sheet-build.md`                      | 流儀、生き様、能力値、経験点を扱う。                                                                                                                                                                                                                    |
| G8   | done    | G7                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-8-sheet-secondary.md`                  | 副能力値を扱う。                                                                                                                                                                                                                                        |
| G9   | done    | G7, G8                                                                                                                                          | `docs/issue/done/ex-02-web-character-sheet/ex-02-9-sheet-bonds.md`                      | 縁と覚悟を扱う。                                                                                                                                                                                                                                        |
| G10  | done    | G7                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-10-sheet-attack-reaction.md`           | 攻撃とリアクションを扱う。                                                                                                                                                                                                                              |
| G11  | done    | G7                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-11-sheet-noncombat.md`                 | 非戦闘技能を扱う。                                                                                                                                                                                                                                      |
| G12  | done    | G7                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-12-sheet-primary-skills.md`            | プライマリ流儀のスキルを扱う。                                                                                                                                                                                                                          |
| G13  | done    | G7                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-13-sheet-ikizama-skills.md`            | 生き様のスキルを扱う。                                                                                                                                                                                                                                  |
| G14  | done    | G7, G12                                                                                                                                         | `docs/issue/done/ex-02-web-character-sheet/ex-02-14-sheet-common-skills.md`             | 共通スキルを扱う。                                                                                                                                                                                                                                      |
| G15  | done    | G7, G12                                                                                                                                         | `docs/issue/done/ex-02-web-character-sheet/ex-02-15-sheet-other-ryugi-skills.md`        | その他流儀のスキルを扱う。                                                                                                                                                                                                                              |
| G16  | done    | G7, G12, G13, G14, G15                                                                                                                          | `docs/issue/done/ex-02-web-character-sheet/ex-02-16-sheet-experience-consistency.md`    | 消費経験点の算出整合性を確認する。                                                                                                                                                                                                                      |
| G17  | done    | G4, G7                                                                                                                                          | `docs/issue/done/ex-02-web-character-sheet/ex-02-17-sheet-weapons-armor.md`             | 武器と防具を扱う。                                                                                                                                                                                                                                      |
| G18  | done    | G4                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-18-sheet-omamori.md`                   | お守りの個別行の選択・追加・削除・並べ替え・候補dialogを実装する。生き様連動とカテゴリ操作は扱わない。                                                                                                                                                  |
| G19  | done    | G4                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-19-sheet-cybernetics.md`               | サイバネの個別行の選択・行操作・候補dialogを実装する。生き様連動とカテゴリ操作は扱わない。                                                                                                                                                              |
| G20  | done    | G4                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-20-sheet-nanomachines.md`              | ナノマシンの固定個別行の選択・候補dialogを実装する。生き様連動とカテゴリ操作は扱わない。                                                                                                                                                                |
| G21  | done    | G4                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-21-sheet-drugs.md`                     | ドラッグの個別行の選択・追加・削除・並べ替え・候補dialogを実装する。生き様連動とカテゴリ操作は扱わない。                                                                                                                                                |
| G22  | done    | G4, G7, G17, G18, G19, G20, G21                                                                                                                 | `docs/issue/done/ex-02-web-character-sheet/ex-02-22-sheet-special-items-integration.md` | 消費信用を一元算出し、生き様別の既定カテゴリ表示、未選択時のカテゴリ非表示、カテゴリ単位の追加・削除、生き様変更時の入れ替え、通常選択不可の保持アイテム警告、および選択中ナノマシンの発動精神力最大値を最大体力へ反映する生き様との接続を実装する。    |
| G23  | done    | G2, G3, G5                                                                                                                                      | `docs/issue/done/ex-02-web-character-sheet/ex-02-23-sheet-action-pane.md`               | 操作ペインとモックのコントロールボタンを作成する。                                                                                                                                                                                                      |
| G24  | done    | G4, G6, G7, G8, G9, G10, G11, G12, G13, G14, G15, G17, G18, G19, G20, G21, G22                                                                  | `docs/issue/done/ex-02-web-character-sheet/ex-02-24-sheet-persistence.md`               | 自動保存と保存済み項目の自動復元を扱う。                                                                                                                                                                                                                |
| G25  | planned | G4, G6, G7, G8, G9, G10, G11, G12, G13, G14, G15, G17, G18, G19, G20, G21, G22, G23                                                             | `docs/issue/ex-02-25-sheet-error-summary.md`                                            | エラーの集約表示を扱う。現在の生き様では通常使用不可の専用アイテムカテゴリのwarningは既存の局所フィードバックに留める。                                                                                                                                 |
| G26  | planned | G4, G6, G7, G8, G9, G10, G11, G12, G13, G14, G15, G17, G18, G19, G20, G21, G22, G23                                                             | `docs/issue/ex-02-26-sheet-json-export.md`                                              | JSON出力を扱う。                                                                                                                                                                                                                                        |
| G27  | planned | G5, G24, G25, G26                                                                                                                               | `docs/issue/ex-02-27-sheet-json-import.md`                                              | JSON入力を扱う。                                                                                                                                                                                                                                        |
| G28  | planned | G5, G22, G23, G25, G26                                                                                                                          | `docs/issue/ex-02-28-sheet-ccfolia.md`                                                  | CCFOLIA出力を扱う。                                                                                                                                                                                                                                     |
| G29  | planned | G5, G22, G23, G24, G25                                                                                                                          | `docs/issue/ex-02-29-sheet-reset.md`                                                    | 全クリアを扱う。                                                                                                                                                                                                                                        |
| G30  | planned | G5, G23, G24, G25, G26, G27, G28, G29                                                                                                           | `docs/issue/ex-02-30-sheet-help.md`                                                     | ヘルプを扱う。                                                                                                                                                                                                                                          |
| G31  | planned | G0, G1, G2, G3, G4, G5, G6, G7, G8, G9, G10, G11, G12, G13, G14, G15, G16, G17, G18, G19, G20, G21, G22, G23, G24, G25, G26, G27, G28, G29, G30 | `docs/issue/ex-02-31-sheet-integration.md`                                              | 統合とエラーチェック、およびcanonical VRT baselineを管理しないVisual Reviewを行う。G25のerror summary adapterは、section presenter stateの再生成を考慮した実効的なmemo化と、無関係なUI state更新でsummary identityを保つhook testをこのGateで確認する。 |

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

- `CharacterSheetSectionFrame`は`bonds`、`checks`、`weapons-and-armor`、`skills`、`special-items`だけへ適用する。`profile`、`build`、`secondary`は後続Gateで扱う。親frameの子sectionでは、判定の攻撃・リアクション、縁の覚悟の効果、武器・防具の武器・防具に同じframeを適用する。非戦闘技能は共通基礎CSSを再利用する専用Componentとする。
- frameは初期展開・独立開閉とし、内容を`hidden`にするだけでchildrenをunmountしない。非戦闘技能は専用Componentが初期折りたたみ、見出しtooltip、折りたたみ中の得意技能だけの表示を担う。開閉stateは保存・JSON入出力へ含めない。
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

- `checks` slotに攻撃とリアクションを実装した。2026-07-29のGate外レビュー修正後は、desktop / tablet / mobileのすべてで左列の`縁`の後に置く。攻撃は1〜5行で、技能候補と対応能力候補は指定順、最後の1行は削除不可、5行目は追加不可とする。リアクションは4固定行で、対応能力だけを変更できる。
- 判定数は`対応能力 + 手動修正`で常時・一時をそれぞれ導出する。判定数に影響するスキル・アイテム効果は各行の修正へ手入力し、効果文・能力値変化の自動解析はしない。
- G10のレビュー指摘2として、通常の縁行のclearと上限外行のdeleteを、それぞれ囲みのない消しゴムiconとゴミ箱iconへ統一した。icon-only化で生じた余白は`関係`列へ再配分する。
- canonical VRT baselineは更新していない。G10と縁クリアbuttonの局所Visual Reviewは、test-owned locator screenshotを出力できないため未実施のままユーザー指示でGateをcloseした。G31で必要なら再確認する。

### G11

- `checks` slotに、固定15技能の非戦闘技能を追加した。専用Componentは初期状態で折りたたみ、展開時は対応能力別の小見出しと15行、折りたたみ時は得意技能だけを表示する。desktop / tabletは2列、mobileは1列で、得意技能、修正、常時／一時判定数を一行のcard gridに置く。
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
- 2026-07-28に`.tmp/chatgpt-review.md`のローカル照合で再openした未達は、通常Doc Review / Tech Reviewとレビュー指摘3・4で回収した。負数Lvの非相殺、全field arrayの非空・一意row ID、reactionの固定identity、same-value reset同期、実sectionを対象とするVRT locatorを修正・確認済みである。G24 / G27は、このrow identityとreset同期の契約を保存・復元・JSON adapterへ適用する。

### G17

- 武器は初期1行・最低1行のRHF field arrayとして追加、並べ替え、削除、重複選択を行う。防具は単一行で、候補選択と確認dialogを開かないクリアだけを持つ。候補dialogの開閉、選択対象、focus復帰は既存Containerで保持し、root orchestration hookは追加しない。
- 性能はmaster dataのID参照とpure logicで導出し、数値、`特殊`、`null`、明示的な`0`をNode testで固定する。防具の性能修正inputはcontrolledとし、クリア・外部更新・小数正規化でdesktop / mobileのDOM表示をRHF値へ同期する。
- 同一武器を複数選択した各行は、現在の表示順に基づく行番号をlegend、picker、修正input、詳細、移動、削除のaccessible nameへ含める。後続の可変アイテムGateも、同一名称が重複し得る操作ではこの識別契約を踏襲する。
- Node 27件、Component / hook 93件、代表E2E 2件、7 state × 3 viewportのactual locator capture、既存`@character-sheet` full-page baseline比較を完了した。G17 locator-only stateはcanonical full-page baselineを持たない。

### G18

- お守りは初期0行のRHF field arrayで、追加、削除、上下移動、同一IDの重複選択を行う。選択IDと安定したrow IDだけをform値として保持し、master dataは読み取り専用で解決する。
- desktop / tabletでは名称、信用、常時表示する効果、削除buttonをtable相当の行へ置き、mobileでは効果を行下へ展開する。候補dialogは全viewportで名称・信用を1行目、効果を2行目へ常時表示する。カテゴリ削除buttonを持たない非折りたたみframeだけをG18で導入し、カテゴリ連動・集計・削除はG22に残す。
- お守りのmaster-data、RHF hook、section、候補dialogとfocus復帰のContainer結線、schema row ID境界を直接テストし、代表E2Eとtarget限定VRTを確認した。`bond-resolved`のdesktop / tablet / mobile canonical baselineは、ユーザー承認により更新した。

### G19

- サイバネは頭・胴体・腕・足の固定4行と、初期1・最小1・最大4行のその他field arrayで保持する。固定部位とその他1行目はclear、それ以降はdeleteとし、同一IDの重複選択を許可する。可変行の操作accessible nameには現在の行番号を含める。
- 埋め込み点数合計は選択値の合計と修正、上限は常時精神と修正のpair expressionで示す。最終合計だけを上限errorにし、5以下・6〜10・11以上の段階境界をまたぐ時だけ非戦闘技能の標準修正を0・-2・-4へ再設定する。手動修正を上書きする旨とサイバネルールへの別tab linkをsection末尾に置く。
- 候補dialogは部位ごとの小見出し・table header・効果2行目を持つ。Containerが開閉、対象行、Escape・閉じる・選択後のfocus復帰を保持する。G20は、上限errorをカテゴリ全体ではなく集計の最終値だけへ付与する規則と、共通clear / delete button CSSを踏襲する。
- canonical VRT baselineは親issue完了までローカル専用とし、G19ではGit管理・更新を行わない。G31で統合Visual Reviewとともに扱う。

### G20

- ナノマシンは頭・胴体・腕・足の固定4行だけを持つ。追加・削除・並べ替えは行わず、各行は選択と確認なしのclearを提供する。同一IDの重複選択を許可する。
- 埋め込み点数合計は選択値の合計と修正、上限は常時肉体と修正のpair expressionで示す。上限超過は最終値`output`だけをerror状態にし、カテゴリ全体や修正inputへ理由表示を追加しない。
- 候補dialogは名称、信用、埋め込み点数、発動精神力のheaderと候補ごとの効果2行目を持つ。Containerが開閉、対象固定行、Escape・閉じる・選択後のfocus復帰を保持する。
- ナノマシンの発動精神力を最大体力へ反映する生き様との接続、カテゴリの表示連動・追加削除・信用集計・警告はG22で扱う。
- canonical baselineはlocal専用で133枚とする。個別tooltip screenshotは作成せず、tooltipの局所操作・配置はComponent / browser behavior testで確認する。ナノマシンのsection 4状態と候補dialogはdesktop / tablet / mobileのtarget限定VRTで確認済みである。

### G21

- ドラッグは初期3行・最低0行のRHF field arrayとし、各行の`drugId`、`quantity`、stable row IDを保持する。再追加行は未選択・所持数`0`とする。所持数は非負整数で、空欄を`0`へ正規化し、選択IDを変えても保持する。
- 同じドラッグIDは選択できず、重複時は各該当行だけをerror状態にする。ドラッグカテゴリ全体はerror状態にしない。候補dialogでは編集中の行を除き、他行で選択済みの候補をdisabledにする。
- desktop / tabletの要約行と候補dialogは名称、信用、使用タイミング、1セット数量、BT強度を表示し、mobileでは名称・信用・BT強度を要約、使用タイミング・1セット数量・効果を詳細へ置く。行番号を含むaccessible name、Escape・可視の閉じる操作・選択後のfocus復帰を維持する。
- G21のtarget限定VRTはlocal canonical snapshotを更新したが、G31までGit管理へ追加・変更しない。G22はドラッグの所持数を消費信用、生き様連動、カテゴリ操作へ接続する。

### G22

- 専用アイテムのカテゴリ表示・追加順はRHFのserializableな値として保持する。G24の保存・復元、G27のJSON入力は、専用・追加カテゴリの順序と各カテゴリ内の入力を保つ。
- `spentCredit`は武器・防具と全専用アイテムの選択値から導出し、ドラッグは所持セット数を掛ける。`spentCredit > totalCredit`のerrorは小銭修正から独立し、G25は基本情報の消費信用と信用領域を集約対象として扱う。
- スミだけは選択済みナノマシンの`activationMentalCost`最大値を最大体力の自動算出値へ加算し、FormulaTooltip末尾へ補足を加える。ほかの生き様では既存表示を維持する。
- non-exclusiveカテゴリはwarning frameと削除iconで削除可能を示す。未選択時の手動追加カテゴリには通常使用不可の文言を表示しない。カテゴリ削除後は、確認の有無にかかわらず同カテゴリの追加buttonへfocusを戻す。
- G22のtarget限定local canonical snapshotは、8 state × 3 viewportの24件を更新した。G31までGit管理へ追加・変更しない。

### G23

- `CharacterSheetButton`は通常のReact button propsとrefを透過し、`color`（`default` / `muted` / `danger` / `warning`）、`variant`（`outline` / `solid`）、`size`（`small` / `medium`）、`className`を受ける。未指定時は`default` / `outline` / `small`へfallbackする。後続Gateは通常の文言付きbuttonだけに再利用し、picker、開閉、並べ替え、ClearButton、DeleteButton、icon buttonを機械的に統合しない。
- `CharacterSheetActionPane`はform外のroot-level表示Componentであり、`h1`、desktopの操作列・固定幅エラーstatus、tablet / mobileのfloating help・menu controlsを表示する。Containerはmenu stateとcallbackだけを渡し、ActionPaneはRHF、保存、browser APIへ直接アクセスしない。
- action menuとnative dialogが重なる場合、Escapeは最前面dialogを先に閉じる。menuはdialogが閉じた後のEscapeで閉じ、triggerへfocusを戻す。G25〜G30は新しいdialogや操作を接続するとき、この優先順位を維持する。
- 操作buttonはモックのままであり、エラー集約、ヘルプ、JSON入出力、CCFOLIAコピー、初期化の実処理はG25〜G30で扱う。G23の追加5状態を含む`@character-sheet` local canonical snapshotは180件で、G31までGit管理へ追加・変更しない。

### G24

- 画像を含まないフォーム値はlocalStorageへ最新1件だけを保存する。復元は専用schemaとread-onlyな`master-data/` lookupを通し、正常値だけをRHFの`reset`で一括反映する。G27は同じrestore adapterをJSON入力に再利用する。
- 未知IDは単一選択を空欄化し、可変行を除外する。除外後のfield array最小行は必要な空欄行だけで補い、固定row identity、関連`ryugiRowId`、special item categoryの一意性を保てない保存値は反映も保存値の書換えもしない。
- 最大Lv超過、重複、固定サイバネ部位不一致など現在のマスタに存在するゲーム上の不整合値は保持し、既存の局所error表示へ渡す。固定サイバネ部位不一致は該当行をerror状態にする。
- 保存はRHF `subscribe`、debounce、unmount / `pagehide`時のflushで行う。localStorage API例外は`console.error`だけで握りつぶす。構造不正な保存値はtitle / headerなしの既存dialogで通知し、確認またはEscape後はPC名inputへfocusを戻す。
- `@persistence-restore-error`と`@cybernetics-part-error`のdesktop / tablet / mobile canonical baselineを更新した。G27はJSON import時のinput状態・確認導線だけを追加し、この復元・局所error・row identity契約を変更しない。

状態は `planned`、`in progress`、`active`、`done` を使う。`active`は、完了済みとしていたGateをreview指摘で再openし、修正または再reviewが終わるまでの状態を表す。
