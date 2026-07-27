# ex-02-9-sheet-bonds

## 最優先のデザイン入力

- 実装時は、`/character-sheet/`の既存実装にある同種の入力UI（`ProfileSection`と`SecondaryAttributesSection`の数値入力、read-only値、section内の余白と色）を、対象`.tmp/design/character-sheet/`配下のdraft画像より優先して維持・再利用する。
- 既存実装と競合しない範囲では、`.tmp/design/character-sheet/desktop.png`、`tablet.png`、`mobile.png`を、`縁`を副能力値の下に置くこと、縁の固定入力行、覚悟効果を縁入力の下に置くことのデザイン入力とする。
- ユーザーの最新指示により、各縁のクリア操作は文字列buttonでなく、透過背景の円形`×` icon buttonにする。accessible nameは、この操作が行削除ではなく対象・関係・覚悟を初期状態へ戻すクリアであることを伝える。
- ユーザーの最新指示により、縁入力の下に`覚悟の効果`見出しを置き、その横に灰色で`通常の縁／今生の縁`と説明を置く。各効果は個別labelを置かず、`通常の縁使用時 / 今生の縁使用時 + 修正値 = 最終的な値`をスラッシュ区切りで表示する。
- ユーザーの最新指示により、覚悟効果の表示順は`気絶からの回復`、`気合獲得`、`能動判定`、`受動判定`とする。mobileではこの順を維持した2行2列にする。ここで`受動判定`は既存要件のリアクション判定数増加を指す。
- design notes、実装結果のscreenshot、reviewer出力で、既存類似UIまたはユーザー指示にない配置・導線・状態表現を補完しない。不明点・競合がある場合はsource codeを変更せず停止して判断を求める。

## 目的

`/character-sheet/`の`bonds` slotへ、縁最大数に応じた固定入力行と覚悟効果を追加する。縁の編集、覚悟による編集lock、行を削除しないクリア操作、通常の縁と今生の縁の覚悟効果・手動修正の関係を、desktop、tablet、mobileで読み取れるようにする。

## 背景

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`の`G9`
- 要件: `docs/requirements/character-sheet.md`の「副能力値、縁、判定」と「縁と覚悟」
- アーキテクチャ: `docs/architectures/character-sheet.md`のContainer / Presenter / form / logic / Component testの責務分離
- design target: `docs/design/character-sheet/notes.md`の「編集画面の情報architecture」「副能力値、縁、判定」と、最優先のデザイン入力に示したdraft画像
- 関連TODO: `docs/TODO.md`の「覚悟から縁へ戻す効果の表現を整理する」は、ルール本文・スキル本文の表現整理であり、G9では扱わない。G9の覚悟checkboxは解除後に再編集できる既存要件を維持する。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G9: 縁と覚悟を扱う。`

このissueはG9だけを実装するための自己完結した契約である。G10以降の判定、スキル、アイテム、保存・復元、JSON入出力、全体エラー集約は扱わない。

## 対象範囲

- form値とschemaへ、各行を安定して識別するID、対象、関係、覚悟booleanを持つ縁の配列と、4効果それぞれの整数の手動修正を追加する。初期値は空の固定4行、全修正`0`とする。対象・関係は空文字列を許可し、修正は負数を許可し、空欄は`0`へ正規化する。
- `secondaryAttributes.bondLimit`の最終値に応じて固定入力枠を表示する。初期4行を含む既存の固定入力枠は、上限が`4`未満または負数になっても削除・非表示にしない。上限増加時は不足行を末尾へ追加し、上限減少時も既存の入力値を自動削除しない。対象または関係が空でない、または覚悟チェック済みの行を入力済みと数え、入力済み行数が`max(0, 縁最大数)`を超える場合は、G25の全体エラー集約を先取りせず縁section内で警告を表示する。
- `bonds` slotへ専用Componentを置く。ComponentはPresenterから表示値とcallbackだけを受け、RHF、マスタ検索、永続化、browser APIを直接扱わない。対象と関係の列ヘッダーを置き、各行へ行ごとの可視labelを置かない。
- 各行は短い対象input、長い関係input、覚悟checkbox、クリアicon buttonを持つ。覚悟済みでは対象と関係を編集不可にし、checkboxを解除すると再編集できる。クリアは行を削除せず、対象、関係、覚悟を初期値へ戻す。透過背景の円形`×` icon buttonは、削除buttonと誤認しないaccessible nameと説明を持つ。
- 覚悟checkboxのlabelへ既存`FormulaTooltip`を付ける。tooltip文言は「シナリオ中、覚悟にした縁にチェックを入れます。チェックが入っている限り、変更もクリアもできません」とする。tooltip triggerは既存の`?`indicatorを含め、覚悟checkboxの操作targetとは分ける。
- 縁入力の下に`覚悟の効果`見出しと灰色の`通常の縁／今生の縁`説明を横並びで置く。各効果は、通常の縁使用時の元値と今生の縁使用時の元値をスラッシュで併記し、同じ修正値inputの後に`=`と、両方へ修正値を反映した最終値をスラッシュで併記する。つまり表示順は`通常の縁使用時の元値 / 今生の縁使用時の元値 + 修正値 = 通常の縁使用時の最終値 / 今生の縁使用時の最終値`とする。効果別の通常値・今生値・最終値へ可視labelを追加しない。
- 覚悟効果は、`気絶からの回復`（`10d6 ／ 15d6`）、`気合獲得`（`1 ／ 1d6`）、`能動判定`（`2d ／ 3d`）、`受動判定`（`4d ／ 6d`）の順に表示する。修正値は整数として保持する。気絶からの回復、能動判定、受動判定は固定のダイス式のダイス数へ修正値を加え、気合獲得は通常の縁の数値へ修正値を加え、今生の縁の`1d6`へは符号付きの修正値を付記する。たとえば修正値`2`では、気絶からの回復を`12d6 ／ 17d6`、気合獲得を`3 ／ 1d6+2`と示す。自由文や任意のダイス式を解析しない。
- desktopとtabletでは4効果を横4列にし、mobileでは同じ順序のまま2行2列にする。各効果内の修正inputは1桁より少し広い短い幅とし、ページ全体の横overflowを生じさせない。
- 固定文言、初期元値、表示用の式は`src/character-sheet/dictionary.ts`へ置く。G9に必要な純粋logic、form adapter、Component、CSS Moduleと、適切なNode / hook / Component / browser / Visual testだけを追加・更新する。

## 初期スコープ外

- 縁行の追加・削除操作、ポジティブ／ネガティブ種別、縁の詳細な関係ルールを実装しない。
- 覚悟を縁へ戻すスキル効果のルール本文・生成JSONの表現を変更しない。関連TODOは未対応のまま維持する。
- 攻撃、リアクション、非戦闘技能、スキル、武器・防具、専用アイテム、保存・復元、JSON、CCFOLIA、全体エラー集約を実装しない。
- 固定4効果以外の任意ダイス式・自由文を解析せず、共通スキルボーナスを自動加算しない。
- localStorage、IndexedDB、サーバー、DB、追加ライブラリ、キャラクター作成ウィザード、Header、Footer、サイトメニュー、section frame、canonical VRT baselineを追加・再設計・更新しない。

## 完了条件

- [x] `bonds` slotに、初期4行と縁最大数に対応する固定縁入力行を表示できる。
- [x] 各行に対象、関係、覚悟checkbox、行削除と誤認しない透過背景の円形`×`クリアicon buttonがあり、クリアで対象・関係・覚悟だけを初期値へ戻せる。
- [x] 覚悟済みの対象・関係は編集不可で、覚悟解除後に再編集できる。
- [x] 覚悟checkboxのlabelから、指定文言のtooltipを確認できる。覚悟checkboxの操作とtooltip triggerはそれぞれ独立して操作できる。
- [x] 上限増減で既存入力を失わず、上限超過時には縁section内で警告を表示できる。
- [x] 縁入力の下に`覚悟の効果`見出しと灰色の`通常の縁／今生の縁`説明を横並びで表示できる。
- [x] 各覚悟効果が、個別labelなしに`通常の縁使用時の元値 / 今生の縁使用時の元値 + 修正値 = 通常の縁使用時の最終値 / 今生の縁使用時の最終値`をスラッシュ区切りで示す。
- [ ] 覚悟効果が`気絶からの回復`、`気合獲得`、`能動判定`、`受動判定`の順で、desktop / tabletは4列、mobileは同じ順序の2行2列で表示され、横overflowしない。
- [ ] 覚悟効果の元値、正負の修正、縁のclear・覚悟lock・上限超過、desktop / tablet / mobileの表示を、純粋logic、schema / hook、Component、browser behavior testの適切な層で確認している。
- [ ] `@character-sheet` targetのdefaultと、少なくとも覚悟済み行・上限超過警告を表示するstateをVisual Reviewし、canonical VRT baselineを更新していない。
- [x] 関連TODOを扱わず、未対応理由が記録されている。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [x] 既存ルートが壊れていない。
- [x] GitHub Pagesのサブパス公開に影響しない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] 関連する`docs/TODO.md`項目と矛盾していない。
- [x] `docs/design/character-sheet/notes.md`と、ユーザー指示で更新した縁・覚悟の表示契約に矛盾していない。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/components/CharacterSheetFormPresenter.tsx`
- `src/character-sheet/components/BondsSection.tsx`と対応するCSS Module
- `src/character-sheet/form-values.ts`
- `src/character-sheet/form/useCharacterSheetFormPresenterProps.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/logic/`配下の縁・覚悟用純粋logic
- `src/character-sheet/dictionary.ts`
- `tests/components/character-sheet/`、`tests/hooks/character-sheet/`、`tests/node/character-sheet/`、`tests/visual/character-sheet.spec.ts`、`tests/visual/vrt/character-sheet.spec.ts`

## レビュー観点

- クリアiconが行削除と誤認されず、対象・関係・覚悟だけを初期化する操作として支援技術を含めて理解できるか。
- 覚悟checkboxのtooltipが指定文言を表示し、checkboxの操作を妨げずに説明を確認できるか。
- `覚悟の効果`見出し、灰色の説明、個別labelを置かない式表示、効果順がユーザー指定どおりになっているか。
- mobileで、気絶からの回復、気合獲得、能動判定、受動判定の順が2行2列でも維持され、短い修正inputと式が横overflowしないか。
- 覚悟lock、解除後の再編集、上限低下後の入力保持と警告が、行追加・削除やG25の全体エラー集約を先取りせず自己完結しているか。
- canonical VRT baseline更新、TODOのルール文言整理、共通スキルボーナスの自動加算を、このGateへ混入させていないか。

## 備考

- VRT targetは`tests/visual/vrt/character-sheet.spec.ts`の`@vrt @character-sheet`、routeは`/character-sheet/`とする。stateはdefault、覚悟済み行、上限超過警告、viewportはdesktop、tablet、mobileとする。G9では変更targetだけを比較し、baselineの更新はユーザーの明示承認がある場合だけ行う。
- ユーザーの最新指示に合わせて、`docs/requirements/character-sheet.md`と`docs/design/character-sheet/notes.md`の覚悟効果の名称、順序、mobile配置、クリアicon、式表示を更新済みである。
- ユーザーUIレビューを先に行う指示により、Visual Reviewは未実施のまま保留する。Gate Tech Reviewは2026-07-27に実施し、固定ダイス式の修正値適用はユーザーの明示仕様に合わせて正本を訂正した。親Gate planのMarkdown formatter違反を整形で解消し、`npm run check`を通過した。

## レビュー指摘 1

### 指摘事項

- 縁のクリアbuttonは、その他流儀の削除buttonと同じsize・appearanceへ揃える。character-sheetで頻出する削除操作の共有styleを用意し、その他流儀と縁で再利用する。
- 覚悟checkboxはbrowser既定の青を使わず、既存site designに合うaccent colorへ揃える。
- 結べる縁の減少で上限超過した時は、section内warningに加えて、上限外の縁行をerror colorで示す。
- 上限を下げた時は、入力済み・覚悟済みの行を保持し、空行だけを自動的に減らす。
- 上限外の未覚悟行の操作はクリアbuttonでなく、その他流儀と同じdelete buttonに切り替える。確認dialogは出さない。覚悟済み行はdelete不可のままにする。
- 覚悟効果はdesktop / tabletで2行2列、mobileで4行1列とする。元値と修正後の値は、既存計算値と同じread-only backgroundで示す。

### 判定

- source: human
- classification: valid
- local validation: 現行の`BondsSection`は1.75remの透明circle clear buttonで、`BuildSection`の1.5remのsolid delete buttonとsize・appearanceが異なる。現行の上限超過はsection内warningだけで、上限外の行の視覚feedbackとdelete操作を持たない。上限低下時にも固定4行を保持する。checkboxはbrowser既定appearance、覚悟効果はdesktop / tabletの4列・mobileの2列であり、いずれも今回の指摘と不一致である。
- local validation: `docs/requirements/character-sheet.md`とこのissueの固定4行・削除なし・効果gridの旧契約は、ユーザーの最新指示により置換対象である。G9の縁・覚悟UI、form行の保持規則、error feedbackだけを扱うため、全項目はcurrent issue内で対応できる。確認dialog、G25の全体error集約、canonical VRT baseline更新は導入しない。

### 対応方針

- character-sheetの共有styleとして、その他流儀で使う1.5remのsolid circle `×` delete buttonを定義し、既存のその他流儀と、上限外かつ未覚悟の縁行で共用する。通常の縁行は現在のclear操作を維持する。
- 行の表示数は、入力済み・覚悟済み行を元の順序で残したうえで、現在の縁最大数を満たす最小の空行だけを補う。上限低下時は空行を除き、入力済み行が上限を超える時だけ、順序上限外の未覚悟行をdelete可能にする。
- pure logicで行ごとのoverflow stateを算出し、Componentはerror color、clear / delete操作、disabled状態を表示する。覚悟済み行はoverflowでもdelete不可とする。
- 覚悟checkboxのaccent、read-only値、効果gridは既存character-sheetのtoken・共有classを再利用する。効果順は維持する。

### 対応完了チェックリスト

- [x] 削除buttonをcharacter-sheet共有styleへ集約し、その他流儀と上限外の未覚悟縁行が同じsize・appearanceになる。
- [x] 覚悟checkboxがsite designのaccent colorで表示される。
- [x] 上限低下時に空行だけを減らし、入力済み・覚悟済み行を保持する。
- [x] 上限外の縁行をerror colorで示し、未覚悟行だけ確認なしで削除できる。
- [x] 通常の縁行は行を消さないclear操作を維持し、覚悟済み行はclear・deleteの両方をできない。
- [ ] 覚悟効果がdesktop / tabletで2行2列、mobileで4行1列となり、元値・最終値はread-only backgroundで表示される。
- [x] Node / hook / Component / browser behavior testを責務に応じて更新する。
- [ ] `@character-sheet` targetのdefault・上限超過・削除可能状態をVisual Reviewし、canonical VRT baselineを更新していない。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

実画面確認で、desktop / tablet / mobileの各効果において、`=`と最終値が元値・修正値の行から次行へ折り返していることを確認した。非折返しの表示契約は未達であり、修正後に3 viewportを再確認する。

## Gate Tech Review 1

- reviewed range: `0ef8fb8..2aed1e5`
- reviewer: `gate_technical_reviewer`
- result: important 2件

### 対応済み指摘

- [x] 固定の気絶からの回復、能動判定、受動判定ではダイス数へ修正値を加え、気合獲得では通常の縁の数値への加算と今生の縁の`1d6`への符号付き付記を行う仕様へ、current issue・requirements・designを訂正した。自由文・任意ダイス式の解析は対象外のままとする。
- [x] 親Gate planのMarkdown formatter違反を内容変更なしで整形し、`npm run check`を通過した。

### 未実施の確認

- [ ] Visual Reviewは本reviewの対象外であり、default・覚悟済み行・上限超過warningの全viewport / stateをactual screenshotで確認していない。
