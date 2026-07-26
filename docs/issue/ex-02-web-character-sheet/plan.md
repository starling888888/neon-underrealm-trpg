# ex-02-web-character-sheet Gate plan

## 親issue

- `docs/issue/ex-02-web-character-sheet.md`

## 共通の境界

- このplanはGateの列挙と着手候補の範囲を管理する。表の1行だけでは実装を開始しない。
- 各Gateは、着手時に現行の要件・アーキテクチャ・designなどの参照正本を読み、表に記載した子issueを作成してから実装する。子issueで完了境界、確認方法、実装判断、追加の参照正本を定義し、以後の実装中のSSoTとする。
- UIを含む各Gate子issueは、titleの直後に`## 最優先のデザイン入力`節を置く。この節で、対象`.tmp/design/<design-target>/`配下の承認済みdesign画像を実装時に遵守し、ユーザーの最新指示は画像デザインを上書きすることを明記する。画像デザインを遵守した実装を基準に、ユーザー指示を受けて微調整を行う。design notes、既存source code、実装結果のscreenshot、reviewer出力を画像デザインの代わりに使わず、不明点・競合は実装で補完せずに停止してユーザー判断を求める。
- UIを含むGateの子issue作成時は、design draftと実装指針を確認してからUI実装の詳細を決定する。不明点は実装都合で補完せず、子issueへユーザレビューまたは決定事項として保留し、明示的な決定を得るまで実装しない。
- Gate完了時は、子issueの確定事項をdesign notes、architecture、requirementsへそれぞれの正本として差し戻し、後続Gateに必要な前提だけをこのplanへ記録する。完了条件、チェックポイント、レビュー記録は子issueに保持し、親planやほかの正本へ差し戻さない。その後、子issueを`docs/issue/done/`へ移す。
- 共通スキルボーナスは表示用データを参照するだけとし、構造化、文字列解析、自動算出を追加しない。
- 全Gateの参照正本は親issueと同じ`docs/requirements/character-sheet.md`、`docs/architectures/character-sheet.md`、`docs/design/character-sheet/notes.md`とする。必要なゲームデータは、子issueで追加して指定する。

## Gate一覧

| Gate | 状態    | 依存Gate                                                                                                                                        | 子issue                                                                    | 範囲                                                                                                                                     |
| ---- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| G0   | done    | なし                                                                                                                                            | `docs/issue/done/ex-02-web-character-sheet/ex-02-0-sheet-page-header.md`   | Astro pageとページ固有のサイトメニュー表示を作成する。HeaderとFooterは再設計しない。                                                     |
| G1   | done    | G0                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-1-sheet-runtime.md`       | React Islandなどの実行基盤を整備する。                                                                                                   |
| G2   | done    | G0, G1                                                                                                                                          | `docs/issue/done/ex-02-web-character-sheet/ex-02-2-sheet-layout.md`        | desktopでは`80rem`以上で等分2列、tablet/mobileでは一列の基本レイアウトを提供する。                                                       |
| G3   | done    | G2                                                                                                                                              | `docs/issue/done/ex-02-web-character-sheet/ex-02-3-sheet-section-frame.md` | 編集セクションの共通枠と開閉操作を作成する。                                                                                             |
| G4   | done    | G1, G2, G3                                                                                                                                      | `docs/issue/done/ex-02-web-character-sheet/ex-02-4-sheet-profile.md`       | 基本情報、キャラクター設定、信用を扱う。                                                                                                 |
| G5   | done    | G1, G2, G3                                                                                                                                      | `docs/issue/done/ex-02-web-character-sheet/ex-02-5-sheet-dialogs.md`       | ダイアログの共通基盤を整備する。                                                                                                         |
| G6   | planned | G4, G5                                                                                                                                          | `docs/issue/ex-02-web-character-sheet/ex-02-6-sheet-image.md`              | 承認済みdraftのprofile / setting / image / credit配置を保ち、キャラクター画像を扱う。                                                    |
| G7   | planned | G1, G2, G3                                                                                                                                      | `docs/issue/ex-02-7-sheet-build.md`                                        | 流儀、生き様、能力値、経験点を扱う。                                                                                                     |
| G8   | planned | G7                                                                                                                                              | `docs/issue/ex-02-8-sheet-secondary.md`                                    | 副能力値を扱う。                                                                                                                         |
| G9   | planned | G7, G8                                                                                                                                          | `docs/issue/ex-02-9-sheet-bonds.md`                                        | 縁と覚悟を扱う。                                                                                                                         |
| G10  | planned | G7                                                                                                                                              | `docs/issue/ex-02-10-sheet-attack-reaction.md`                             | 攻撃とリアクションを扱う。                                                                                                               |
| G11  | planned | G7                                                                                                                                              | `docs/issue/ex-02-11-sheet-noncombat.md`                                   | 非戦闘技能を扱う。                                                                                                                       |
| G12  | planned | G7                                                                                                                                              | `docs/issue/ex-02-12-sheet-primary-skills.md`                              | プライマリ流儀のスキルを扱う。                                                                                                           |
| G13  | planned | G7                                                                                                                                              | `docs/issue/ex-02-13-sheet-ikizama-skills.md`                              | 生き様のスキルを扱う。                                                                                                                   |
| G14  | planned | G7                                                                                                                                              | `docs/issue/ex-02-14-sheet-common-skills.md`                               | 共通スキルを扱う。                                                                                                                       |
| G15  | planned | G7, G12                                                                                                                                         | `docs/issue/ex-02-15-sheet-other-ryugi-skills.md`                          | その他流儀のスキルを扱う。                                                                                                               |
| G16  | planned | G7, G12, G13, G14, G15                                                                                                                          | `docs/issue/ex-02-16-sheet-experience-consistency.md`                      | 消費経験点の算出整合性を確認する。                                                                                                       |
| G17  | planned | G4, G7                                                                                                                                          | `docs/issue/ex-02-17-sheet-weapons-armor.md`                               | 武器と防具を扱う。                                                                                                                       |
| G18  | planned | G4, G7                                                                                                                                          | `docs/issue/ex-02-18-sheet-omamori.md`                                     | お守りを扱う。                                                                                                                           |
| G19  | planned | G4, G7                                                                                                                                          | `docs/issue/ex-02-19-sheet-cybernetics.md`                                 | サイバネを扱う。                                                                                                                         |
| G20  | planned | G4, G7                                                                                                                                          | `docs/issue/ex-02-20-sheet-nanomachines.md`                                | ナノマシンを扱う。                                                                                                                       |
| G21  | planned | G4, G7                                                                                                                                          | `docs/issue/ex-02-21-sheet-drugs.md`                                       | ドラッグを扱う。                                                                                                                         |
| G22  | planned | G4, G17, G18, G19, G20, G21                                                                                                                     | `docs/issue/ex-02-22-sheet-credit-consistency.md`                          | 消費信用の算出整合性を確認する。                                                                                                         |
| G23  | planned | G2, G3, G5                                                                                                                                      | `docs/issue/ex-02-23-sheet-action-pane.md`                                 | 操作ペインとモックのコントロールボタンを作成する。                                                                                       |
| G24  | planned | G4, G6, G7, G8, G9, G10, G11, G12, G13, G14, G15, G17, G18, G19, G20, G21                                                                       | `docs/issue/ex-02-24-sheet-persistence.md`                                 | 自動保存と保存済み項目の自動復元を扱う。                                                                                                 |
| G25  | planned | G4, G6, G7, G8, G9, G10, G11, G12, G13, G14, G15, G17, G18, G19, G20, G21, G23                                                                  | `docs/issue/ex-02-25-sheet-error-summary.md`                               | エラーと警告の集約表示を扱う。                                                                                                           |
| G26  | planned | G4, G6, G7, G8, G9, G10, G11, G12, G13, G14, G15, G17, G18, G19, G20, G21, G23                                                                  | `docs/issue/ex-02-26-sheet-json-export.md`                                 | JSON出力を扱う。                                                                                                                         |
| G27  | planned | G5, G24, G25, G26                                                                                                                               | `docs/issue/ex-02-27-sheet-json-import.md`                                 | JSON入力を扱う。                                                                                                                         |
| G28  | planned | G5, G23, G25, G26                                                                                                                               | `docs/issue/ex-02-28-sheet-ccfolia.md`                                     | CCFOLIA出力を扱う。                                                                                                                      |
| G29  | planned | G5, G23, G24, G25                                                                                                                               | `docs/issue/ex-02-29-sheet-reset.md`                                       | 全クリアを扱う。                                                                                                                         |
| G30  | planned | G5, G23, G24, G25, G26, G27, G28, G29                                                                                                           | `docs/issue/ex-02-30-sheet-help.md`                                        | ヘルプを扱う。                                                                                                                           |
| G31  | planned | G0, G1, G2, G3, G4, G5, G6, G7, G8, G9, G10, G11, G12, G13, G14, G15, G16, G17, G18, G19, G20, G21, G22, G23, G24, G25, G26, G27, G28, G29, G30 | `docs/issue/ex-02-31-sheet-integration.md`                                 | 統合とエラーチェックを行い、`.gitignore`から`canonical-snapshots/visual/character-sheet/`を戻してcanonical snapshotをGit管理へ復帰する。 |

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

状態は `planned`、`in progress`、`done` を使う。
