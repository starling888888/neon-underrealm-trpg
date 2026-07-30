# Webキャラクターシートのアーキテクチャ

## 目的と範囲

`/character-sheet/`を、既存のAstro静的サイトへ限定的なReact Islandとして追加する。キャラクター入力、派生値算出、検証、端末内の最新1件保存・復元、画像、JSON入出力、CCFOLIAコピーを、サーバー処理なしで扱う。

本書はコンポーネント境界、状態境界、データ参照、ブラウザ永続化、テスト境界、依存ライブラリを正本化する。実装ゲート、作業順、Gateごとの完了条件、JSON入出力形式、CCFOLIA出力文字列形式、実行時schemaの具体形は扱わない。

## 参照正本と制約

- 機能要件: `docs/requirements/character-sheet.md`
- 画面design: `docs/design/character-sheet/notes.md`
- 実装の契約とゲート管理: `docs/issue/ex-02-web-character-sheet.md`
- ゲーム仕様と選択肢: `src/pages/`配下のゲーム仕様と`data/generated/`配下の生成JSON
- 初期対象viewportはdesktop、tablet、mobileである。
- 画面はフルスクラッチのReact Componentで実装する。UIライブラリ、デザインシステム、Component固定型のフォームライブラリは導入しない。React ComponentのスタイルはCSS Modulesを使い、追加依存は導入しない。

### 実装時のアーキテクチャ遵守

本書の境界、状態所有者、データ参照、表示契約、テスト層は、キャラクターシート実装で必ず守る制約である。実装の都合、既存コードの類似、画面確認、テストの容易さを理由に例外を作らない。要件、design、子issueが本書と矛盾する場合は、実装を始めずに矛盾を解消する。

- 各Gate子issueは、実装前にこのGateで適用する本書の節を列挙し、各節について「許可する変更」「禁止する変更」「確認するテスト層」を実装契約として明記する。Gate固有の入力・受入条件・完了チェックは子issueが所有し、本書へ複製しない。
- 実装中の各変更は、列挙済みの節と子issueの許可範囲の両方に対応しなければならない。対応付けられない共有Component、Container / Presenter境界、状態所有者、データ境界、テスト層への変更は行わない。
- 既存の境界を変更する必要がある場合は、先に本書の該当節、requirements、design、Gate planのどれが正本かを確定する。正本の変更またはユーザーの明示承認なしに、個別Gateの実装で境界を拡張・例外化しない。
- Gate完了前に、最終diffを子issueの適用節と照合する。各変更を説明できない場合は、その変更を取り消すか、正本を更新してユーザー承認を得るまでGateを完了扱いにしない。

## 推奨構成

### AstroとReact Island

`src/pages/character-sheet.astro`は、専用Header、静的な周辺コンテンツ、ページ固有layout、React Islandの配置を直接担う。再利用しないContainer、Layout、または単なるimport用Componentには分割しない。キャラクターシート本体は`client:load`のReact Islandとし、サイト全体をSPA化しない。

キャラクターシート固有のresponsive表示、Header drawer、menu初期化はページ側へ閉じ込める。共通`AppContainer`、共通Header、共通layoutへキャラクターシート用の条件分岐を追加しない。

React Islandの責務は、入力、画面内の開閉、確認・通知dialog、ブラウザAPI、端末内保存に限定する。サイト共通のHeader、Footer、ナビゲーションはAstro側の既存実装を維持する。

### Feature境界

キャラクターシート固有の実装は、`src/character-sheet/`配下へ閉じ込める。

```text
src/
├── components/
│   └── character-sheet/
│       └── CharacterSheetHeader.astro
├── pages/
│   └── character-sheet.astro
└── character-sheet/
    ├── CharacterSheetContainer.tsx
    ├── dictionary.ts
    ├── components/
    │   ├── CharacterSheetFormPresenter.tsx
    │   ├── dialogs/
    │   └── skills/
    ├── form/
    ├── logic/
    ├── master-data/
    ├── schemas/
    ├── persistence/
    ├── browser/
    └── utils/
```

- `CharacterSheetContainer.tsx`: `client:load`でhydrateするIslandのRootであり、このfeature唯一のContainerとする。RHFの`useForm`、RHF adapter hookの接続、処理順序、保存済み下書きの復元、マスタデータ・純粋logic・ブラウザ副作用の統合を担う。form、dialog、focus ref、loadingなどRoot横断の状態はroot-state custom hookへ置く。formのDOM配置は持たない。直下には`CharacterSheetFormPresenter`、Rootで扱うほうが適切なdialog Component、およびform外の`h1`・全体操作・responsive controlを担うroot-level表示Componentを置ける。root-level表示ComponentはRHF・保存・browser APIへ直接アクセスせず、Containerから受け取る表示propsとcallbackだけを使う。
- `dictionary.ts`: キャラクターシートで固定表示する画面文言の唯一の参照先とする。section見出し、label、button、補足、定型の式などは`characterSheetDictionary`から参照し、Componentへ同じ文言を重複してベタ書きしない。ゲーム用語は`gameDomain.terms`、入力・操作・補足・式などキャラクターシート固有UIの文言は`characterSheet`へ置く。これはi18n catalogではない。ゲームデータ由来の名称・効果文は`master-data/`の読み取り結果を使い、実行時に組み立てる値・文言はこのdictionaryへ無理に入れない。
- `CharacterSheetFormPresenter.tsx`: formのDOM配置、sectionの並び、表示用propsの受け渡しを担う。RHF formの生成・参照、マスタ検索、派生値算出、検証、永続化、ブラウザAPI、dialogの開閉状態を持たない。各section・行ComponentはこのPresenter配下の表示Componentとして組み立て、RHFを参照せず必要な表示値と操作callbackをPresenter hook経由のPropsで受け取る。Component内のstateは、自身に閉じた開閉状態などに限定する。
- `components/`: Presenterとその配下のJSX・表示Component、Root直下へ配置するdialog Component、form外のroot-level表示Componentを置く。表示ComponentはContainerから受け取る値とevent handlerで描画し、マスタ検索、派生値算出、検証、永続化、ブラウザAPIへの直接アクセスは置かない。`CharacterSheetSectionFrame`は`expandable?: boolean`（default: `false`）で静的・折りたたみを共通化し、同じframe・mutedなタイトル領域・分割線を使う。title要素は`span`または`h1`〜`h6`を指定できる。`FormulaTooltip`は派生値の子要素を操作対象にして、hoverまたはtapで開く局所的な状態だけを持ち、タップ端末ではコンポーネント外タップとEscで閉じる。focus表示は現在の対象外とする。
- `form/`: 編集値の型、初期値、RHFの可変配列操作、`zodResolver`を接続するform Hook、保存・復元の接続を置く。RHF以外の編集state storeは置かない。
- `logic/`: React、RHF、DOM、Storage、IndexedDBに依存しない派生値算出、選択可能性判定、構造化検証、ViewModel組み立てを置く。
- `master-data/`: 読み取り専用のゲームデータから、IDによる選択肢と表示用情報を引く境界とする。既存`src/lib/data/`のaccessorを再利用するか、専用adapterを設けるかは実装Gateで決める。
- `schemas/`: 現在のform入力を検証・正規化するschemaと、IndexedDB record・JSON入力を検証するschemaを置く。ブラウザから渡る生の入力値の正規化とドメイン上の入力制約はここへ置き、ComponentやHTML constraintだけへ委ねない。schema失敗時は、現在の編集stateへの部分反映を行わない。具体的な形、JSON形式、CCFOLIA出力形式は各実装Gateで定める。
- `persistence/`: serializableな下書きのlocalStorage adapterと、画像recordのIndexedDB adapterを置く。G6の画像adapterは`neon-underrealm-character-sheet` database、`character-images` store、`current-character-image` keyへWebPのMIME typeとbase64エンコード文字列を保存・読取り・個別削除する。React stateやJSXを持たない。G29の全クリア時は、このadapterを使って画像recordも削除する。
- `browser/`: Clipboard、ファイルdownload、画像decode・WebP変換などのブラウザAPIを置く。呼出し側から差し替え可能な小さなadapterとし、ゲームルールとRHFへ依存しない。
- `utils/`: ID生成、数値変換など、ゲームルール・React・ブラウザAPIを含まない補助処理だけを置く。feature固有の判断は`logic/`、ブラウザAPIは`browser/`へ置き、将来の再利用だけを理由に作らない。

入力欄単位の機械的なComponent分割、汎用パス文字列による状態更新、全機能分の先行抽象化は行わない。

### スキル区分の共通表示

プライマリ流儀、生き様、共通、その他流儀のスキル区分は、同じ行表示、展開詳細、追加・削除・上下移動、候補のtable表示、選択済み候補のdisabled表現を、`components/skills/`配下のshared Componentで再利用する。shared Componentは、流儀種別を示すdiscriminantやRHFのfield pathを受け取らない。

shared表示Componentは、次の表示契約だけをPropsで受け取る。

- section: 一意なID、見出し、利用可否と未選択時message、section全体のerror状態、全スキル中最大名称幅、行配列、追加callback。
- row: `rowId`、選択済み`Skill | null`、取得Lv、`automatic`または`normal`の行種別、Lv編集・選択・削除・上下移動の可否、行全体とLv入力それぞれのerror状態。
- candidate dialog: dialog見出し、任意の小見出しを持つ候補group配列、選択済みskill ID、選択・閉じるcallback、focus復帰先。`basic` / `advanced` / 全候補の区別はgroupを組み立てるadapterの責務とする。

各スキル区分の`form/` hookと`logic/`、`master-data/` adapterは、RHF値、対象マスタ、レベル条件、bonusのLv編集可否、重複・上限などの個別validationを、shared Propsへ正規化する。shared Componentはマスタ検索、RHF参照、候補条件の判断、validation計算を行わない。候補dialogの開閉、選択対象row、focus復帰は複数sectionにまたがるため`CharacterSheetContainer`が保持する。shared ComponentのCSS Moduleは、行とdialogの内部構造だけを所有し、各区分固有のlayoutや業務条件を持たない。

### 可変行のデザイン指針

武器、防具、生き様専用アイテム、各スキル区分など、異なるform値や業務条件を持つ可変行は、単一の表示Componentへ抽象化しない。ただし、利用者が同じ編集画面として理解できるよう、次の表示指針を共通で適用する。

- 行一覧はtable相当の列見出しを先頭に1回だけ表示し、名称、数値、属性、操作などの見出しと各行の値を揃える。見出しは本文より小さいfont sizeにし、名称見出しは左寄せ、数値・操作は値の配置に合わせる。
- 名称は一覧内で最も強い情報として、補助情報やコストよりわずかに大きくする。値、列見出し、展開内の補助情報は一段小さくし、列の幅、改行、clipに依存して情報の優先度を表現しない。
- 各行の第一行には、名称、編集に必要な最小の数値・属性、展開、削除、並べ替えなどの操作だけを置く。desktopとtabletで行全体またはsection外へ横overflowさせない。入り切らない読み取り専用情報は、ユーザー指定の順序を保って展開領域へ移す。
- 展開は初期状態で閉じ、行の概要を変えずに詳細を確認する操作とする。展開領域の一行目は関連する短いメタ情報を横並びにし、二行目以降に制限、効果、説明などの長い本文を置く。関連するメタ情報と本文の間には不要な罫線を挟まず、一覧の第一行と展開内容の境界だけを明確にする。ただし、お守りは明示された情報優先度に従い、desktop / tabletでは効果を常時表示し、mobileだけ初期非表示の行内展開とする。
- 選択dialogも一覧と同じ列見出しと密度を用いる。候補の第一行は選択判断に必要な名称と主要属性、二行目以降は技能、制限、効果などの補足とする。第一行と補足の境界は区切るが、同じ補足群の途中で分断しない。候補のdisabled状態は名称だけでなく行全体をmuted表示し、選択不可であることを示す。
- 削除buttonは専用の小さい操作領域に置き、その枠の縦横中央へ配置する。並べ替えは削除と分離した操作領域にまとめ、移動できない方向の操作は表示しない。削除不可や並べ替え不可の行には、操作用の余白だけを残して大きな空白を作らない。
- 追加buttonは行一覧の下に十分な間隔を置いて左寄せにし、一覧と同じsection frame内に収める。validation errorのborderやmessageが表示されても、列位置や追加buttonの位置がずれない構造にする。

この指針は各行種別に必要な列・展開情報・mobileの個別最適化を決める前提であり、共通Component化を義務付けない。mobileでは、第一行に残す列と展開内へ移す情報をその行種別ごとに定め、desktop / tabletのtable配置を縮小して横scrollさせるだけの実装にしない。

### Container / Presenterの責務

`CharacterSheetContainer`はFat Coordinatorになってよいが、Fat Domain Logicにはしない。処理の入口と実行順はContainerから追跡できるようにし、算出式、JSONの具体的な組み立て、schema検証、Storage / IndexedDB / Clipboard / download / 画像APIの直接操作は対応する境界へ分離する。

Containerは、表示に必要な値と操作をsection単位のViewModel / ActionsとしてPresenterまたはroot-level表示Componentへ渡す。大量のフラットprops、Presenterからのマスタ検索、Presenterによる値の補正・業務ルール判断を置かない。型の具体形は、最初にそのsectionを実装するGateで定める。

Presenterとその配下の表示Componentは、渡されたpropsの表示、配列の描画、Containerが決定済みの表示フラグ、渡されたevent handlerの呼出しだけを担う。leaf ComponentはHookを使わない。sectionの開閉など、保存せずContainerへ通知不要な局所的表示状態だけは対応するsection Presenterに置いてよい。dialogの開閉と選択対象のようにRoot横断で扱う状態はContainerへ戻す。

表示Componentは、名前を付けられる独立責務、単独レビュー、変更理由、JSXの複雑さ、またはテスト対象の局所化のいずれかがある場合に分割する。入力欄1個ごとの機械的な細分化はしない。

### 状態と派生値の境界

RHFを、このIsland内でユーザーが直接編集する値の唯一の保持先とする。可変行は`useFieldArray`で扱い、流儀の変更、スキル行の追加、能力値修正、縁のクリア、アイテム選択の変更をRHFの操作として行う。RHFの値を別のstate storeへ複製しない。

native number inputがfocus中に保持する`-`など、数値として未確定なブラウザ固有の途中入力はRHF valueではない。Componentはその途中値をローカルstateへ複製せずDOMに一時保持させ、確定可能な値だけをRHF adapterへ通知する。blur時はschemaで正規化済みのnumberをinputへ戻す。スキルLvの下限・最大Lv超過はschemaが構造・整数値として受理し、logicが局所errorとして判定する。reset・復元・JSON入力は、受理済み値をRHFの`reset`または`useFieldArray`操作で反映し、uncontrolled inputを同期する。外部更新で値をclamp・削除しない。

| 種別                                          | 置き場所                            | 永続化先     |
| --------------------------------------------- | ----------------------------------- | ------------ |
| ユーザーが直接編集するキャラクター値          | RHF                                 | localStorage |
| 可変行の順序、選択マスタID、明示的な空欄・`0` | RHF                                 | localStorage |
| 選択済み画像の表示用record                    | root-state custom hook              | IndexedDB    |
| WebP画像のMIME typeとbase64エンコード文字列   | IndexedDBの画像用record             | IndexedDB    |
| マスタデータ                                  | `master-data/`                      | 保存しない   |
| 派生値、ViewModel、エラー・警告結果           | `logic/`と`CharacterSheetContainer` | 保存しない   |
| 候補選択・確認・通知dialogの開閉と選択対象    | `CharacterSheetContainer`           | 保存しない   |
| section・行の効果表示など局所的な表示状態     | 対応するPresenter Component         | 保存しない   |

画像のbase64文字列と画像recordの参照は、RHF、localStorage、URL query、ログ、Git管理ファイルへ混ぜない。Root横断の操作ロックはroot-state custom hookに置き、操作ごとの表示文言とcallbackをPresenter hook経由で明示的に渡す。汎用loading overlayは表示文言をPropsで受け、画像、保存、入出力などのRoot操作で再利用する。Contextは先行導入しない。`logic/`はroot stateやContextへ依存しない。G6では変換・書込み成功後にだけ表示用recordを切り替え、個別クリアはIndexedDB削除成功後にだけ未選択へ切り替える。変換、IndexedDB書込み、個別削除の失敗時は既存画像を保持する。JSON入出力での画像表現はG26/G27で定め、全クリア時の画像record削除はG29で扱う。

### 自動保存と復元

フォームのserializableな最新1件だけをlocalStorageへ保存する。RHFの`subscribe`で値を監視し、短時間の連続入力をまとめて保存する。保存用にフォーム全体を`useWatch`して入力ごとに再描画させない。同期処理のためだけの追加ライブラリは導入しない。

AstroのSSRとhydrationにおける表示差分を避けるため、初回復元はマウント後に行う。localStorageから読み出した値は、現在の入力値を対象にした構造・型検証とread-onlyな`master-data/` lookupを通った場合だけRHFの`reset`で一括反映する。現在のマスタIDに対応しない単一選択値は空欄化し、可変行は復元対象から除外する。除外後にfield arrayの最小行数を下回る場合は、必要な空欄行だけを追加する。固定rowのidentityまたは関連行参照を保てない場合は、復元せずエラーを表示する。固定サイバネslotの部位不一致など、現在のマスタに存在するが局所errorとして編集可能な値は保持する。復元完了まで自動保存を開始せず、初期値で既存下書きを上書きしない。ページ離脱時には、保留中の保存があれば直近値を保存する。画像recordはフォーム値とは独立して読む。正常なrecordだけを表示へ復元し、recordがない場合は未選択状態にする。画像recordの読取り・復元失敗はlocalStorageのフォーム値復元を停止・失敗させない。

復元状態は少なくとも未開始、復元中、利用可能、復元失敗を区別する。保存データが読み込めない場合、現在の編集stateへ部分反映しない。ユーザー指示により、localStorageの利用不可、容量超過、書込み失敗は`console.error`だけで握りつぶし、編集を止めずユーザー向け通知を表示しない。画像recordの読み込み、画像変換、IndexedDB書込み、個別削除の失敗では、既存の画像を上書き・削除せず、失敗をダイアログで通知する。

## データ境界

マスタデータは読み取り専用であり、storeへ複製・永続化しない。キャラクター入力は名称ではなくマスタIDを保持し、表示、候補絞り込み、派生値、検証は、入力stateと読み取り専用マスタデータを明示的に渡して解決する。

派生値算出と検証は純粋関数に分離する。副作用を持つ処理は、Containerから`persistence/`または`browser/`を経由して実行する。これにより、JSON形式、CCFOLIA出力、schemaの詳細が後続Gateで増えても、画面Componentや算出logicへ混入させない。

`logic/`は同じ入力へ同じ結果を返し、UI配置や文言の最終表現を決めない。エラー条件・識別子と表示文言は必要に応じて分離する。`master-data/`の検索結果を入力として受け、未知のマスタIDを黙って補正・保存しない。

### スタイル境界

React Componentのスタイルは、Component外へ漏れないCSS Modules（`*.module.css`）を使う。既存Astro scoped CSSと共存させ、React TSXからclass nameを参照する。CSS Modulesのための追加依存は導入しない。

### HTML / CSSの構造と責務

HTMLは見た目のgridより先に、画面上の意味単位を表す。sectionは既存の
`CharacterSheetSectionFrame`を使い、section内で完結する編集行は`fieldset`と
`legend`、label、input、outputを対応付ける。可視labelを省略する数値欄でも、
行名を含む一意のaccessible nameを持たせる。見た目だけの`div`とARIA roleで
form群の意味を代用しない。

ComponentのCSS Moduleは、そのComponentが所有するclassだけを対象にする。親の
section CSSから`:global(button)`、要素名、または孫要素へ広く一致するselectorで、
子Componentの内部構造を変更しない。たとえばTooltipのdismiss layer、trigger、
contentのstackingとpointer eventは`FormulaTooltip`自身の責務とし、利用側はroot
classを渡すだけにする。共有Componentの内部buttonを親CSSが意図せず選択する設計は、
将来のoverlay操作を壊すため禁止する。

数値inputとread-only outputは`data-character-sheet-layout`配下の共有classで揃え、
sectionごとにborder、background、padding、右揃え、幅を再定義しない。section固有の
grid列、余白、見出しだけを各CSS Moduleへ置く。同じ視覚パターンが複数sectionに
現れた場合は、最初にこの共有styleへ寄せられるかを判断する。将来の汎用Component化を
理由に、入力欄単位へ機械的にComponentを分割しない。

スキル、武器・防具、生き様専用アイテムの行一覧と候補選択dialogは、
`components/CharacterSheetFormList.module.css`の共通classを`composes`で再利用する。
各section / dialogのCSS Moduleには、固有のgrid列、固有のresponsive情報移動、
ゲームデータ固有の表示差分だけを置く。行の枠、header、行picker、並べ替え、展開、
追加button、候補dialog / candidateの共通見た目を複製せず、異なる業務条件を理由に
単一の汎用行Componentや共通grid列へ統合しない。

responsive contractはlayout regionを所有する`CharacterSheetFormPresenter`とそのCSSを
正本にする。2列から1列への切替、sheetの最小inline size、menu railの表示条件のように
CSSとページscriptの両方が参照するbreakpointは、同じ契約として明示し、境界値をbrowser
testで固定する。部分sectionは親regionのmin-widthやoverflowを上書きして全体layoutを
変えない。必要な最小幅は親regionで持ち、mobileだけがその契約を解除する。

viewportをまたぐoverlayはsectionのoverflowに依存せず、表示時にtriggerとviewportを
測定してgutter内へ配置する。Tooltip本文はtrigger buttonの子にせず、accessible nameと
`aria-describedby`の説明が重複しないDOM構造にする。open stateを導入・変更した場合は、
Component testで操作と端部配置を確認し、Visual Reviewではdefaultに加えて代表的なopen
stateをdesktop、tablet、mobileでactual screenshotとして確認する。

## テストアーキテクチャ

テストは、内部実装の露出ではなく、責務境界とユーザーが観測できる振る舞いを検証する。hydrate確認だけを目的とするDOM、state、data属性、E2E testを製品コードへ追加しない。

### テスト層と配置

```text
tests/
├── node/
│   └── character-sheet/
│       ├── logic/
│       ├── schemas/
│       ├── master-data/
│       ├── persistence/
│       └── browser/
├── components/
│   └── character-sheet/
├── hooks/
│   └── character-sheet/
└── visual/
    ├── character-sheet.spec.ts
    └── vrt/
        ├── character-sheet.spec.ts
        └── character-sheet-scenarios.ts
```

- `tests/node/character-sheet/`: 既存のNode `node:test`と`tsx`で、`logic/`、`schemas/`、`master-data/`、serializableな`persistence/`、test doubleへ差し替えた`browser/` adapterの契約を表形式中心で確認する。正常値、上限前後、負値、`null`、空欄、明示的な`0`、重複、未知のマスタIDを必要範囲で含める。
- `tests/components/character-sheet/`: Vitest、jsdom、React Testing Library、user-eventで、Presenter / 表示Componentのprops表示、局所UI state、callback通知、Tooltipなどを確認する。RHF、ドメイン計算、browser viewportは持ち込まない。
- `tests/hooks/character-sheet/`: VitestとReact Testing Libraryの`renderHook`で、RHF adapter hookのschema接続、RHF valueからViewModel / Actionsへの変換、入力境界を確認する。Presenter DOMやPlaywrightを持ち込まない。
- `tests/visual/character-sheet.spec.ts`: Playwrightで各Gateの最終smokeだけを確認する。領域表示と2〜3個の代表的なbrowser操作に限定し、routeまたはresponsiveなページ固有UIを必要最小限で確認する。入力制約・派生式・Tooltip・read-only表現・DOM属性・固定データ全件の網羅はここへ置かない。
- `tests/visual/vrt/character-sheet.spec.ts`: `docs/design/character-sheet/notes.md`で確定したroute、viewport、fixture、表示状態だけをsnapshot比較する。VRTは文言・データ件数・計算式の正しさを担わない。

React Component / Hook単体testは、Vitest、jsdom、React Testing Library、user-eventを使う。`@vitejs/plugin-react`はVitestのReact TSX変換だけを担い、production bundleへ機能を追加しない。ComponentまたはHookをbrowser E2Eより小さい単位で検証する必要が生じたGateでは、必要性、代替案、既存のNode / Playwrightとの役割分担を子issueへ記録し、ユーザー承認のもとで採用する。test-onlyのproduction Componentや状態をその代替にしない。

### Character-sheet E2E / VRTの境界

静的ページ用の`tests/visual/helpers/vrt.ts`は、full-pageまたはviewport screenshotと、サイト共通のmenu、page TOC、検索状態だけを扱う。character-sheet固有の入力、dialog、section locator、state準備をこのhelperへ追加しない。静的ページのscenario specはcharacter-sheetの変更に合わせて変更しない。

character-sheetのVRTは`tests/visual/vrt/character-sheet-scenarios.ts`の専用helperで登録する。通常比較でもsection / dialog locatorをcanonical baselineとして扱い、`visual:capture`だけに局所状態の比較を委ねない。

- full-pageはdefaultと`合計信用`のtooltip代表だけをdesktop / tablet / mobileで比較する。個別tooltip screenshotは作成せず、tooltipの文言・操作・配置はComponent testまたは最小browser behavior testで扱う。
- dialog stateは背景や呼出し元sectionを含めず、dialog本体だけをdesktop / tablet / mobileで比較する。候補選択、確認、errorなどの開閉・focus復帰はbrowser behavior testの責務とする。
- sectionの入力・選択・error variationは、そのowner sectionだけを比較する。section frameの表示契約を持つ`縁`、`combat`、`武器・防具`は見出しを含むframeをownerにする。`スキル`と`生き様専用アイテム`はdefault全体frameを3 viewportで1枚ずつ持ち、variationは子sectionへ分ける。`お守り`と`サイバネ`のvariationは各カテゴリ見出しを含むカテゴリsectionをownerにする。
- noncombatのような独立した子sectionは局所ownerだけを比較し、親`combat`のdefault / 入力stateとは重複させない。

VRTは領域、responsive layout、overlayの見た目を確認する。計算、validationの網羅、データ値、tooltipの個別挙動、dialogの副作用はNode / Component / Hook / browser behavior testへ置く。VRT実行前は`npm run visual:build`でPagefind indexを含むbuildを作成し、targetをgrepで限定する。canonical baselineの削除・更新はユーザーの明示承認時だけに行い、Visual Reviewで肯定報告する前に、変更したstate・viewportのactual screenshotを開く。

### 責務ごとの検証

- `logic/`: 派生値、取得条件、重複、上限、警告・エラー識別子、CCFOLIA用の構造化出力を純粋関数として検証する。
- `schemas/`: 現在のform入力の正規化、正常な保存・importデータの受理、破損JSON・必須構造欠落・不正型の拒否、失敗時に現在の編集stateを変更しないことを検証する。将来のschema versionは、互換要件が確定したGateだけでfixtureを追加する。
- `master-data/`: IDからの候補・表示情報の取得と、存在しないIDの扱いを検証する。生成JSONの内容や並び順の正しさは既存のデータ変換テストへ置き、キャラクターシートのVRTへ複製しない。
- `persistence/`と`browser/`: Storage、IndexedDB、画像、Clipboard、downloadを直接テスト環境へ要求しない。小さなadapterまたはtest doubleへ差し替え、復元前保存の抑止、書込み失敗、既存画像の保持、browser API失敗を検証する。
- Containerの結線: 初期stateからのViewModel、主要な操作からRHF更新・派生値・dialog・副作用adapterへの接続を、hook testまたは必要最小限の統合testで確認する。全機能の組合せを網羅しない。
- Presenter / 表示Component: propsに応じた表示、read-only / disabled、エラー・警告、可変行、渡されたcallbackの通知を確認する。計算式とマスタ検索は検証しない。

### Fixtureと検証の規律

- fixtureは各テストが必要とする最小の入力値とマスタ値だけを持ち、実データ全件へ依存しない。ID、時刻、乱数、Storage keyはテストで固定または注入可能にする。
- browser testはrole、label、ユーザー操作、表示結果を優先して取得する。CSS classや内部属性は、レスポンシブlayoutまたは静的ページ契約の検証に必要な範囲だけで使う。
- dialogは開く操作、候補の選択またはキャンセル、適用後の表示、Escapeとfocus復帰など、ユーザーに見える契約を確認する。Containerのstate名や内部イベント列を検証しない。
- 各Gateは変更した責務に対応する最小のテストを追加・更新する。UI / CSS / layout変更時だけ、PRレビュー直前に必要なtargetへ限定してVRTを実行する。VRT baselineの更新はユーザーの明示承認時だけとする。

### テスト用依存の選定境界

| 用途                       | 現在の方式                                                          | 採否     |
| -------------------------- | ------------------------------------------------------------------- | -------- |
| 純粋logic・schema・adapter | Node `node:test`と`tsx`                                             | 既存採用 |
| browser behavior・VRT      | `@playwright/test`                                                  | 既存採用 |
| React Component / Hook単体 | Vitest、jsdom、React Testing Library、user-event、React Vite plugin | 採用     |

純粋logic・schema・adapterの既存Node testは直ちに置き換えない。Vitestへ統一するかは、`docs/TODO.md`の後続taskで決める。

## 依存ライブラリ

### 選定基準

候補は次の順に評価する。

1. 長期利用実績があり、互換性と保守継続性を確認できること
2. npmのダウンロード数と採用実績が十分であること
3. 初期bundleと依存関係が軽量であること

既知の脆弱性、現在のAstro・React・TypeScriptとの非互換、静的ホスティングを壊す前提を持つ候補は、上記比較の前に除外する。ダウンロード数は選定時点のnpm表示値を参考情報として記録し、固定の品質指標にはしない。

### 採用する依存

| 用途                            | 推奨                                             | 理由                                                                  | 採否 |
| ------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------- | ---- |
| AstroでReact Islandを動かす     | `@astrojs/react`、`react`、`react-dom`           | Islandを限定し、Astroサイト全体をSPA化しない                          | 採用 |
| 編集フォーム                    | `react-hook-form`                                | 可変行を含む巨大formの編集値を一箇所に保持し、素のReact inputを扱える | 採用 |
| 画像recordのIndexedDB保存       | `idb-keyval`                                     | WebP画像record 1件のkey-value保存に必要な範囲へ絞れる                 | 採用 |
| 実行時検証                      | 既存の`zod`                                      | 既に依存に含まれる。具体的なschemaは各Gateで追加する                  | 採用 |
| ZodとRHFの接続                  | `@hookform/resolvers`                            | `zodResolver`でRHF errorとschema validationを標準contractで接続する   | 採用 |
| 純粋logic・schema・adapter test | 既存のNode `node:test`と`tsx`                    | 追加test runnerなしで実行できる                                       | 採用 |
| browser behavior・VRT test      | 既存の`@playwright/test`                         | ユーザー観測可能な操作とvisual regressionを分けて扱える               | 採用 |
| React Component / Hook単体test  | Vitest、jsdom、React Testing Library、user-event | Props、局所UI state、RHF adapter hookをE2Eへ置かず検証する            | 採用 |
| React TSX変換                   | `@vitejs/plugin-react`                           | Astroとは別にVitestへReact JSX transformを接続する                    | 採用 |

`localStorage`はブラウザ標準APIを使い、画像を除くserializableな最新1件の下書きを保存する。`idb-keyval`はstructured-clone可能な値を保存できるため、WebP画像recordの保存要件に適する。RHFの編集値同期は`subscribe`、`reset`、小さな自前hookで完結させる。

### 比較した候補

| 領域      | 候補                               | 長期実績・採用実績                          | 軽量性                           | この機能での評価                                                            |
| --------- | ---------------------------------- | ------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------- |
| form      | `react-hook-form`                  | npm週次ダウンロード約4,762万、依存0         | 小さい                           | 採用推奨。素のReact inputと可変配列を扱い、編集値の唯一の保持先にできる     |
| form      | ライブラリなし＋React `useReducer` | React標準                                   | 追加bundleなし                   | 不採用推奨。巨大form、可変配列、検証、保存同期を独自に結線する範囲が大きい  |
| form      | `@tanstack/react-form`             | npm週次ダウンロード約192万                  | 追加依存あり                     | 不採用推奨。RHFより採用実績が少なく、初期要件に必要な優位性がない           |
| 保存      | localStorage＋自前RHF同期hook      | ブラウザ標準                                | 追加bundleなし                   | 採用推奨。画像を除く最新1件の同期保存は`subscribe`と`reset`で完結する       |
| 保存      | 保存同期ライブラリ                 | 候補ごとに異なる                            | 追加依存                         | 不採用推奨。保存対象の除外、復元順、失敗通知をこの要件どおりに制御しにくい  |
| IndexedDB | `idb-keyval`                       | 小さなkey-value用途として長期利用されている | get/set中心ではbrotli約295 bytes | 採用推奨。画像record 1件には十分                                            |
| IndexedDB | `idb`                              | IndexedDB API全体を扱える                   | brotli約1.19 kB                  | 将来候補。複数画像、索引、複雑なtransactionが必要になった場合だけ再比較する |

ダウンロード数の参照日は2026-07-24とする。サイズは各プロジェクトの公式READMEまたはnpm表示の公表値であり、実装時には実際のproduction buildで確認する。

### 導入しないライブラリ

- UIキット、デザインシステム、Headless UI、CSS framework
- ルールエンジン、数式解析、自由文効果解析
- JSON入出力、CCFOLIA出力、画像変換、Clipboard、downloadのためだけのライブラリ
- RHFと並行して編集値を保持するstate managementライブラリ
- RHFからlocalStorageへの同期を抽象化する追加ライブラリ

UIは全てフルスクラッチとし、画像変換、Clipboard、downloadはbrowser標準APIを`browser/`のadapterへ閉じ込める。

## ユーザー判断が必要な項目

| 項目               | 決定                                                                    | 判断の内容                                                                                                     |
| ------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 基盤依存           | `@astrojs/react`、`react`、`react-dom`、`react-hook-form`、`idb-keyval` | React IslandとRHFを導入する。`localStorage`はブラウザ標準APIを使う。                                           |
| 編集値の保持先     | RHFを唯一の編集stateとする                                              | Zustandなどの別storeへ編集値を複製しない。UIの一時状態だけはComponent内のReact stateで扱う。                   |
| 下書きの端末内保存 | 画像以外はlocalStorageへ最新1件を自動保存する                           | RHFの`subscribe`、`reset`、デバウンスを使う自前hookで同期する。保存同期ライブラリは導入しない。                |
| 画像の端末内保存   | 編集stateとは別のIndexedDB画像recordへWebPのMIME typeとbase64を保存する | JSON化する下書きと画像recordを混在させず、変換・画像recordの失敗では既存画像を上書き・削除しない。             |
| 永続化の詳細       | G6の画像recordのkey名前空間を固定する                                   | databaseは`neon-underrealm-character-sheet`、storeは`character-images`、keyは`current-character-image`とする。 |
| 実行時schema       | `zod`は既存依存を使う                                                   | 現在の入力値用とIndexedDB record・JSON入力用の2系統を作る。具体的なschemaは各実装Gateで定める。                |
| WebP圧縮品質       | `0.8`                                                                   | 5 MiB入力・長辺約500px・非拡大・WebP変換を1回だけ行う。                                                        |
| scoped CSS         | CSS Modules（`*.module.css`）、追加依存なし                             | 既存Astro scoped CSSと共存させ、React ComponentのスタイルをComponent単位へ限定する。                           |
| 型定義依存         | devDependenciesへ先行して明記しない                                     | React関連以外を含む必要な型定義を、実装時の実際の依存と型検査から判断する。                                    |

JSON入出力形式、CCFOLIA出力テキスト形式、実行時schemaの詳細は、いずれもユーザー判断を含む各実装Gateで定める。本書では固定しない。
