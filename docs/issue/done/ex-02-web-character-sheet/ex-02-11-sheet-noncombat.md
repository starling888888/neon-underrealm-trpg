# ex-02-11-sheet-noncombat

## 最優先のデザイン入力

- `/character-sheet/` の既存 `判定` section とその desktop / tablet / mobile の配置を維持し、`非戦闘技能`をリアクションの下に追加する。`CharacterSheetFormPresenter` の既存 `checks` slot と `ChecksSection` を拡張対象とする。
- `.tmp/design/character-sheet/desktop.png`、`tablet.png`、`mobile.png`にある非戦闘技能の情報密度と、既存 `判定` section の枠・表現を参照する。ユーザーの次の指定を画像と `docs/design/character-sheet/notes.md` より優先する。
  - 見出しは `非戦闘技能` のみとする。
  - 非戦闘技能の列ヘッダーは置かない。各技能行に対応能力を表示せず、対応能力値ごとに `対応能力：筋力` のような小見出しを置く。
  - `常時能力値／一時能力値 + 修正 = 常時判定数／一時判定数` のような計算式型の行表示は設けない。
  - `非戦闘技能` の見出しは既存 `FormulaTooltip` を使い、次の本文を表示する。

    ```txt
    チェックを入れると得意技能となります。得意技能は能力値を2倍にして判定数を算出します。修正は2倍になりません。
    修正はサイバネなど能力値ではなく、判定数に影響を与えるスキル、アイテムの効果の数値を入力します。
    判定数は「常時能力値を用いた判定数／一時能力値を用いた判定数」です。
    折りたたみ中は得意技能だけ表示されます。
    ```

  - 得意技能をチェックした行全体はアクセントカラーの背景で示す。
  - 非戦闘技能は初期状態で折りたたむ。折りたたみ時は対応能力の小見出しを表示せず、得意技能チェック済みのcardだけを一つのgridへまとめて表示する。
  - 非戦闘技能の各技能項目は、desktop / tabletでは2列、mobileでは1列のcard gridで表示する。cardはcheckbox、技能名、修正input、常時／一時の判定数を1行に置き、`修正`ラベルは置かない。技能名を折り返さず、常時／一時の判定数と2桁以上の修正値をclip・overflowさせない。
  - 非戦闘技能は`判定` frame内の入れ子のコンパクトな開閉領域であり、通常のtop-level section frameを再利用しない。design画像にある小さなchevronと見出し線を基準にし、既存の`判定`見出しと同じ枠・余白・button表現を重複させない。
- 上記以外の配置・導線・状態表現は、実装都合で補完しない。画像、要件、ユーザー指定が競合または不足する場合は、source codeを変更せず停止して判断を求める。

## 目的

`/character-sheet/`の`判定` sectionに、15種類の非戦闘技能を固定対応能力値、得意技能、手動修正、常時／一時の判定数で扱える、初期折りたたみの入力領域を追加する。

## 背景

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md` の `G11`
- 要件: `docs/requirements/character-sheet.md` の「副能力値、縁、判定」「攻撃、リアクション、非戦闘判定の行」
- アーキテクチャ: `docs/architectures/character-sheet.md` の Container / Presenter / form / logic / Component test の責務分離、固定表示文言の `dictionary.ts` 所有、読み取り専用ゲームデータの `master-data/` 境界
- ゲーム仕様: `src/pages/character-making.mdx` の「非戦闘技能」表。15技能と対応能力値はこの表を正本として固定する。
- design target: `docs/design/character-sheet/notes.md` の「編集画面の情報architecture」「副能力値、縁、判定」「mobileの情報密度」、および `.tmp/design/character-sheet/desktop.png`、`tablet.png`、`mobile.png`。ただし表示契約は「最優先のデザイン入力」の最新ユーザー指定を優先する。
- 関連TODO: `docs/TODO.md` に G11 で直接扱う項目はない。G24より前の `useFieldArray` 契約整理はこのGateへ先取りしない。

## Gate関係

- 親issue: `docs/issue/ex-02-web-character-sheet.md`
- Gate plan: `docs/issue/ex-02-web-character-sheet/plan.md`
- Gate: `G11: 非戦闘技能を扱う。`

このissueは G11 だけを実装するための自己完結した契約である。G12以降のスキル、G17以降のアイテム、G19のサイバネ、G24以降の保存・復元、JSON入出力、全体エラー集約は扱わない。

## 対象範囲

- 非戦闘技能を、以下の固定順・固定対応能力値の15行として、読み取り専用の小さな `master-data/` の定義から表示する。ユーザーは技能名と対応能力値を変更できない。
  - `脅迫`、`力比べ`、`根性`: 筋力
  - `偵察`、`軽業`、`手業`: 敏捷
  - `イカサマ`、`危険察知`、`分析`: 感覚
  - `運転`、`生存`、`仁義`: 肉体
  - `賭博`、`交渉`、`ハッキング`: 精神
- form値とschemaへ、15行それぞれの得意技能 boolean と、負数を許可する整数の手動修正を追加する。技能ID、名称、対応能力値、常時・一時の能力値および判定数は保存値に複製せず、固定マスタと pure logic から導出する。空欄の修正は `0` に正規化する。
- 常時判定数は `対応能力の常時能力値 + 修正`、一時判定数は `対応能力の一時能力値 + 修正` とする。得意技能では常時・一時とも対応能力値だけを2倍にし、修正を2倍にしない。能力値が未確定で判定数を算出できない場合は、既存の表示規約どおり unavailable value を示す。
- `ChecksSection` 内に、リアクションの後、見出し `非戦闘技能` と独立した開閉操作を置く。初期状態は折りたたみとし、展開時は対応能力値ごとの小見出しと15行すべて、折りたたみ時は小見出しなしで得意技能チェック済みの行だけを一つのgridへまとめて表示する。判定 section 全体の既存開閉とは別に操作でき、childrenを unmount しない既存 section-frame の方針と矛盾させない。
- 列ヘッダー、各行の対応能力値、`得意技能`・`修正`ヘッダーのtooltip triggerは置かない。`非戦闘技能`見出しのtooltipへ、得意技能、修正、常時／一時の判定数の説明を集約する。既存の攻撃・リアクションの `判定数` tooltip 文言は変更しない。
- 展開時は対応能力値ごとに `対応能力：${能力}` の小見出しを置き、その下へ該当する3技能を表示する。折りたたみ時は小見出しを置かず、得意技能cardだけを一つのgridへまとめる。各技能cardは得意技能 checkbox、読み取り専用の技能名、ラベルなしの手動修正 input、常時／一時の判定数を1行に持つ。計算記号、能力値の常時／一時表示、計算式型の入力・output群は置かない。得意技能 checkbox が選択されたcard全体は既存のアクセント系 design tokenによる背景色で区別する。
- 非戦闘技能の技能cardはdesktop / tabletで2列、mobileで1列とする。技能名は折り返さず、常時／一時の判定数と符号付き2桁以上の修正値をclip・overflowさせない。tabletをdesktopと異なる1列表示へ縮退させない。
- `ChecksSection` とそのCSS Module、form adapter、pure logic、固定文言 dictionary、必要な schema / master-data / test を、既存の責務境界に沿って追加・更新する。表示Componentは Presenter から表示値と callback だけを受け、RHF、マスタ検索、永続化、browser APIを直接扱わない。
- Node / hook / Component / browser behavior testを責務に応じて追加・更新する。`tests/visual/character-sheet.spec.ts`は、領域表示と2〜3個の代表的な操作だけを確認する最終smokeに保ち、開閉の`aria-*`属性、hidden状態、tooltip、固定15件、計算値はComponent / Node testへ置く。Visual Reviewは変更 target の `@vrt @character-sheet` に限定し、canonical VRT baselineは更新しない。G11では`tests/visual/helpers/vrt.ts`とcapture configを拡張し、scenarioが宣言したowner locatorのoriginal-pixel-resolution screenshotを`visual:capture`時だけに出力する。通常の`visual:test`は既存のfull-page canonical VRT比較だけを続ける。

## 初期スコープ外

- G10の攻撃・リアクションの表示、対応能力の選択、判定数 tooltip、追加・削除の契約を再設計しない。ただし、ユーザーが明示した `レビュー指摘 5` の範囲で、G9 / G10に残った受入確認、縁の削除制約、編集行のHTML意味構造、mobileのクリア操作overflowを限定して扱う。
- サイバネの埋め込み点数に応じた非戦闘技能修正の再設定、アイテム・スキル・共通スキルボーナスの文字列解析または自動加算を実装しない。ユーザーが必要な効果値を各行の修正へ手入力する。
- 非戦闘技能の追加・削除、技能名・対応能力値の編集、任意技能の登録、ダイスローラー、戦闘シミュレーションを実装しない。
- G12以降のスキル、G17以降の武器・防具・専用アイテム、localStorage、IndexedDB、JSON、CCFOLIA、サーバー、DB、追加ライブラリ、キャラクター作成ウィザード、Header、Footer、サイトメニューを追加・変更しない。
- canonical VRT baselineを作成・更新しない。`docs/plan.md` のチェックボックスを変更しない。

## 完了条件

- [x] 非戦闘技能が指定の15行・固定順・固定対応能力値で存在し、技能名と対応能力値は編集できない。
- [x] 見出しが `非戦闘技能` のみであり、列ヘッダーと各行の対応能力値を表示せず、対応能力値ごとの `対応能力：${能力}` 小見出しを表示する。
- [x] `非戦闘技能` 見出しのtooltipが、指定の得意技能・修正・常時／一時の判定数の本文を表示する。
- [x] 各行で得意技能と修正を変更でき、常時／一時の判定数が、得意技能時には能力値のみを2倍にして更新される。計算式型の行表示を含まない。
- [x] 得意技能チェック済み行がアクセントカラー背景になり、未選択行と区別できる。
- [x] 非戦闘技能が初期状態で折りたたまれ、展開時は15行、折りたたみ時は得意技能チェック済みの行だけを表示する。判定 section 全体の既存開閉とは独立して操作できる。
- [x] 非戦闘技能がdesktop / tabletで2列、mobileで1列のcard gridとして、技能名を折り返さず、常時／一時と2桁以上の修正値をclip・overflowさせない。
- [x] 判定数の pure logic、form / schema入力境界、Componentのtooltip・開閉・アクセント表示、代表的browser操作を適切なテスト層で確認している。
- [x] `/character-sheet/` の default、得意技能選択、修正変更、非戦闘技能展開、各ヘッダー tooltip open を desktop / tablet / mobileでVisual Review対象として列挙した。canonical VRT baselineを管理せず、正式な比較はG31のコンテンツレビューへ延期する。
- [x] `visual:capture`がscenarioで指定したowner locatorのoriginal-pixel-resolution screenshotを一時artifactとして出力し、`visual:test`のcanonical VRT比較とbaselineを変更しない。
- [x] 関連TODOを扱わない理由が記録されている。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## ビジュアルレビュー 2

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts`、`@vrt @character-sheet`、`@noncombat-expanded`、`@noncombat-favorite-selected`、`@noncombat-modifier-changed`、`@noncombat-tooltip-open`
- route / states / viewports: `/character-sheet/`の非戦闘技能展開、得意技能選択、修正値`-12`、見出しtooltip open。それぞれdesktop、tablet、mobile。

### 実画面確認

- userが起動したdev server上のtemporary locator captureを開いた。desktop / tabletでは対応能力ごとのcardが3列、mobileでは2列で表示され、技能名、`-12`の修正値、`常時／一時`の出力にwrap・clip・horizontal overflowがないことを確認した。
- tooltip open stateの3 viewportでtooltip本体のlocator screenshotを開いた。指定された3文は改行を含めて全文表示され、clipしていないことを確認した。
- dev server由来のtemporary artifactにはAstro toolbarが含まれるため、正式なVisual Reviewおよびcanonical VRTとの差分判定には使わない。

### レビュー結果

| 対象                   | 判定       | 対応                                                                |
| ---------------------- | ---------- | ------------------------------------------------------------------- |
| card responsive layout | 要人間判断 | preview serverで同じstate・viewportのactualを再取得して正式確認する |
| 見出しtooltip          | 要人間判断 | preview serverでtriggerとの相対位置を含むactualを再確認する         |
| canonical VRT          | 要人間判断 | 非戦闘技能stateのcanonical snapshotがないためbaseline更新は行わない |

### 人間判断が必要な差分

- dev serverを停止し、4321のpreview serverへ切り替えてformal Visual Reviewを実行してよいか。
- previewで確認したactualを非戦闘技能stateのcanonical baselineとして採用するか。

## レビュー指摘 3

### 1. tooltipの改行と説明文が最新指定に一致しない

- 指摘: tooltipの文字列に含めた改行が通常の空白として描画され、本文の`一時能力`表記も最新指定の`一時能力値`に一致しない。
- 対応: `FormulaTooltip`に必要なtooltipだけ改行を保持する表示契約を加え、非戦闘技能tooltipを4文へ更新する。第4文は`折りたたみ中は得意技能だけ表示されます。`とする。

### 2. 折りたたみ時に対応能力別groupを残している

- 指摘: 得意技能だけを残しても対応能力ごとの小見出しが表示されるため、ユーザーが求めた一覧表示になっていない。またcardの2行目にある`修正`ラベルが横幅を消費する。
- 対応: 展開時だけ対応能力別groupを表示する。折りたたみ時は得意技能cardだけを同一の3列／2列gridへまとめ、checkbox、技能名、ラベルなし修正input、判定数を小さい文字で1行に配置する。

## ビジュアルレビュー 3

- dev server上のtemporary locator screenshotを実際に開いた。展開時はdesktop / tabletで3列、mobileで2列の対応能力別card gridを確認した。
- 得意技能選択後に折りたたんだstateをdesktop / tablet / mobileで確認した。対応能力の小見出しは表示されず、得意技能cardだけが同じ3列／2列gridへ表示された。
- 修正値`-12`のstateをdesktop / tablet / mobileで確認した。checkbox、技能名、修正input、判定数はすべて1行に収まり、clip・horizontal overflowは見当たらなかった。
- tooltip open stateをdesktop / tablet / mobileで確認した。4文は改行を保って表示され、`一時能力値`と折りたたみ時の説明を含む全文にclipは見当たらなかった。
- temporary captureはdev server由来であり、formal Visual Reviewまたはcanonical VRT比較の根拠には使わない。

## レビュー指摘 4

### 1. 1行化のために文字を小さくしすぎている

- 指摘: cardを1行に収めるため、技能名・修正input・判定数を通常のcharacter sheet compact表示より小さい文字にした。
- 対応: 文字サイズは既存の`--text-xs`へ戻し、既存のnumber inputのspinnerを維持する。修正inputと判定数は既存のpaddingを変えず、符号付き2桁の修正と二桁／二桁の判定数を収める固定grid columnとする。判定数のtextは余計な空白を置かず`常時／一時`の形式で表示する。

### 2. checkboxの基本styleがsectionごとに分散している

- 指摘: 非戦闘技能のcheckboxが縁sectionの覚悟checkboxと異なる色・寸法になった。個別componentがcheckboxの基本styleを持つため、同じcharacter sheet内で見た目が一致しない。
- 対応: `CharacterSheetFormPresenter`のform scopeへcheckboxの基本寸法、`accent-color`、marginを移す。縁sectionはgrid配置だけを保持し、非戦闘技能を含むcharacter sheetのcheckboxが共通styleを使う。

### 3. mobile 2列・1行と標準サイズの入力／outputは両立しない

- 観測: 既存のnumber spinnerと判定数outputのpaddingを維持し、符号付き2桁修正のinput幅と二桁／二桁の判定数枠を確保すると、mobile 2列では`危険察知`など4文字の技能名に使える幅が足りずclipする。desktop / tabletでは`-12`がspinner込みで表示される。
- 未決定: 技能名を全文表示したまま、mobileの2列とcard 1行を維持することは、この最小幅では不可能である。mobileを1列にする、mobileだけcardを2行に戻す、または表示要件のいずれかを変更する判断をユーザーに求める。判断まで入力／outputの標準styleを独自に変えない。

### 4. 技能名だけはmobile 2列に収まる最小文字サイズを使う

- 指示: 「技能名だけハッキングの5文字がclipしないぎりぎりまでフォントサイズに小さくする。」
- 対応: 修正input、判定数、checkboxの既存styleと固定幅は維持し、技能名だけを`0.4375rem`へ縮小する。desktop / tabletも同じcard内の技能名に適用するが、行外へclipしないことを3 viewportで確認する。

### 5. card全体を縮めて、技能名だけの過剰な縮小を避ける

- 指示: 「入力サイズ、判定数も含めてぜんたいに小さくしてclipしないようにして。全体に小さくするなら縮小量を減らせるはず、入り切るギリギリの大きさを調節して。」
- 対応: checkboxの共通色・基本styleは維持する。修正inputを`2.375rem`、判定数枠を`3.125rem`へ固定し、それぞれの高さ・padding・文字サイズもcompactにする。判定数はform共通styleより高いspecificityで同じcompact値を適用する。技能名は5文字を表示できる`0.5625rem`まで戻し、desktop / tablet / mobileでclipしない最大値かを確認する。

### 6. paddingの変更は実画面のclip確認後にだけ行う

- 指摘: 判定数の左右paddingを推測だけで変更したため、ユーザーが実画面で判定数のclipを発見した。
- 対応: 既存paddingの`4rem`枠でclipする実画面結果を確認した後、判定数枠を`3.25rem`、左右paddingを`0.1875rem`へ変更した。変更後のmobile captureで、spinner込みの`-12`、最長5文字の技能名、判定数枠を確認する。以後このcardの寸法は、captureを開いてから次の変更を行う。

### 7. 列数を減らして通常の文字・control寸法へ戻す

- 指示: 「文字が小さくてダサいな。デスクトップタブレットは2列。モバイルは1列にレイアウト変えるか。んでフォントサイズは戻そう。」
- 対応: desktop / tabletを2列、mobileを1列へ変更する。技能名、修正input、判定数は既存character sheet compactの文字・高さ・paddingへ戻し、個別のcompact output overrideは撤去する。

### 8. 判定数列を既存paddingのまま二桁／二桁へ広げる

- 指示: 「今の判定数の横幅だと二桁二桁で折り返し発生してるよ。技能の右側に余白めっちゃあるしもうちょい広げていいんじゃない？ってかチェックボックスから判定数まではグリッドデザインのほうが良くないか？」
- 対応: card内はcheckbox、技能名、修正input、判定数の4列gridを維持する。判定数列だけを`4rem`から`4.25rem`へ広げ、既存の左右padding・文字サイズは変更しない。技能名列は残りの可変幅を使うため、判定数の必要幅を先に確保する。

### 9. 技能名をGameDomainへ集約する

- 指示: 「攻撃技能、リアクション技能、非戦闘技能全て対応すること。」
- 指摘: 攻撃技能名とリアクション名は`characterSheet.checks`、非戦闘技能名は`master-data/noncombat-skills.ts`にあり、表示名のownerが混在している。
- 対応: 表示名はすべて`gameDomain.terms`の技能名mappingへ集約する。攻撃・リアクション・非戦闘のID、非戦闘技能の順序・対応能力値、form値・schema・logicは従来どおりdomain dataとして維持する。G10の攻撃・リアクション表示へも適用するが、ユーザーの明示指示による表示名ownerの統一だけを扱う。

## チェックポイント

- [x] 既存ルートが壊れていない。
- [x] GitHub Pagesのサブパス公開に影響しない。
- [x] 不要な依存関係を追加していない。
- [x] 初期スコープ外の機能を実装していない。
- [x] 関連する `docs/TODO.md` 項目と矛盾していない。
- [x] `docs/design/character-sheet/notes.md` と画像designを、最新ユーザー指定で上書きされる範囲以外では維持している。
- [x] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `src/character-sheet/components/ChecksSection.tsx`
- `src/character-sheet/components/ChecksSection.module.css`
- `src/character-sheet/form-values.ts`
- `src/character-sheet/form/useChecksSectionProps.ts`
- `src/character-sheet/logic/checks.ts`
- `src/character-sheet/schemas/character-sheet-form.ts`
- `src/character-sheet/master-data/` 配下の非戦闘技能固定定義
- `src/character-sheet/dictionary.ts`
- `tests/node/character-sheet/`、`tests/hooks/character-sheet/`、`tests/components/character-sheet/`、`tests/visual/character-sheet.spec.ts`、`tests/visual/vrt/character-sheet.spec.ts`、`tests/visual/helpers/vrt.ts`、`playwright.capture.config.ts`、`tests/visual/README.md` の必要な対象

## レビュー観点

- 非戦闘技能の見出しtooltip、対応能力値ごとの小見出し、計算式型にしないcard表示が、最新ユーザー指定どおりか。
- desktop / tabletの3列、mobileの2列が、技能名、常時／一時、2桁以上の修正値を折り返し・clip・overflowさせずに表示するか。
- 15技能の名称・順序・固定対応能力値が `src/pages/character-making.mdx` の正本と一致し、利用者が対応能力値を変更できないか。
- 得意技能が能力値だけを2倍にして修正値を2倍にせず、選択行全体のアクセント背景と指定tooltipでその挙動を理解できるか。
- 初期折りたたみ、選択済み行だけを残す折りたたみ表示、展開時の全15行、および既存判定 section 開閉との独立性が明確か。
- 非戦闘技能の開閉が、top-level section frameとは別の入れ子のコンパクトな表示として、design画像のchevron・見出し線・余白に沿っているか。
- desktop / tablet / mobileで、2つの tooltip open stateを含めて横overflowを起こさず、canonical VRT baseline更新を混入させないか。

## 備考

- branchは、ユーザー指示により新規作成せず、既存の `ex-02-web-character-sheet` を使用する。
- VRT targetは `tests/visual/vrt/character-sheet.spec.ts` の `@vrt @character-sheet`、routeは `/character-sheet/` とする。対象stateは default、得意技能選択、修正変更、非戦闘技能展開、得意技能tooltip open、修正tooltip open、viewportは desktop、tablet、mobile とする。G11では変更targetだけを比較し、baseline更新はユーザーの明示承認がある場合だけ行う。
- `docs/requirements/character-sheet.md` がサイバネの埋め込み点数による修正再設定にも触れるが、その入力と埋め込み点数の合計はG19以降の範囲である。本Gateでは初期値 `0` の手動修正を提供するだけとし、後続Gateが既存の各行修正を再設定できるform境界を維持する。

## レビュー指摘 1

### 1. design画像のresponsive gridを遵守していない

- 指摘: 現在の実装は5列のtable型gridをdesktop / tablet / mobileで共通に用いている。`.tmp/design/character-sheet/desktop.png`と`tablet.png`の3列、および`mobile.png`の2列の非戦闘技能表示を再現していない。
- 対応: このissueの最優先デザイン入力、対象範囲、完了条件、レビュー観点へdesktop / tablet 3列、mobile 2列の表示契約を追加した。修正時は現在の5列共通gridを残さない。

### 2. character-sheet最終smoke E2Eが責務境界を越えている

- 指摘: `tests/visual/character-sheet.spec.ts`のG11 testは、開閉の`aria-expanded`属性とhidden状態まで検証している。`docs/architectures/character-sheet.md`が定める「領域表示と2〜3個の代表操作だけ」の最終smokeから外れ、局所開閉stateとDOM属性をE2Eへ重複させている。
- 対応: E2Eは非戦闘技能を開いて代表的な得意技能または修正を一つ変更する程度へ縮小する。初期折りたたみ、開閉後の全件・選択済み行だけの表示、`aria-*`属性、tooltipはComponent test、計算はNode testで確認する。

### 3. Character Sheet Visual Review用の要素指定captureがない

- 指摘: 現行のVRT helperはpage全体のsnapshotだけであり、`判定` sectionや`非戦闘技能`をoriginal resolutionのtest-owned locator screenshotとして確認できない。このままでは各viewport・tooltip open stateのVisual Reviewを完了できない。
- 対応: ユーザー指示により専用Gateへ分割せず、G11で共有capture基盤を拡張する。scenarioが一つ以上のowner locatorを宣言できるようにし、`visual:capture`時だけ`test-results/visual/`へlocator screenshotを出力する。固定配置のtooltip open stateは、非戦闘技能sectionとtooltip本体を別のlocatorとして取得する。`visual:test`は既存のfull-page canonical VRT比較を変更せず、one-off scriptやproduction test-only attributeは追加しない。

## レビュー指摘 2

### 1. 3列／2列化だけでは各技能行の幅不足を解消できていない

- 指摘: 技能文字列が折り返し、常時／一時の判定数がoverflowし、2桁の修正値が入り切らない。既存の5項目を各cardの横一列へ詰める設計では解消不能である。
- 対応: 列ヘッダーと各行の対応能力値を削除する。対応能力値ごとに`対応能力：${能力}`小見出しを置き、card内は技能名を含む得意技能操作と、修正・常時／一時を別の行へ分ける。desktop / tablet 3列、mobile 2列は維持する。

### 2. 非戦闘技能の説明tooltipを見出しへ集約する

- 指摘: `得意技能`と`修正`のヘッダーを削除するため、説明を個別headerへ置けない。
- 対応: `非戦闘技能`見出しをtooltip triggerとし、指定された得意技能・修正・常時／一時の判定数の説明を一つのtooltipへ表示する。開閉操作は見出しtooltipと独立したchevron buttonにする。

## ビジュアルレビュー 1

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts`、`@vrt @character-sheet`、`@noncombat-expanded`、`@noncombat-favorite-selected`、`@noncombat-modifier-changed`、`@noncombat-tooltip-open`
- route / states / viewports: `/character-sheet/`の非戦闘技能展開、得意技能選択、修正変更、非戦闘技能tooltip open。それぞれdesktop、tablet、mobile。

### レビュー結果

| 対象                 | 判定       | 差分                                                    | 対応                                                                         |
| -------------------- | ---------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 非戦闘技能responsive | 要人間判断 | userが起動したdev serverでのtemporary captureだけを確認 | preview serverで同じlocator captureを再取得してから正式なVisual Reviewを行う |
| tooltip open         | 要人間判断 | tooltip本体のlocator screenshotは取得できた             | preview serverでtriggerとの相対位置を含むactualを再確認する                  |
| canonical VRT        | 要人間判断 | 非戦闘技能stateのcanonical snapshotは存在しない         | baseline更新は行わず、必要な差分判断をユーザーへ提示する                     |

### 実画面確認

- `/character-sheet/` / 非戦闘技能展開、得意技能選択、修正変更 / desktop・tablet・mobile:
  - full-page overview (page-level確認のみ): temporary captureを取得したが、dev server由来のため正式な確認根拠に使わない。
  - locator screenshot（`section[aria-labelledby="noncombat-checks-heading"]` / original pixel resolution）: 9枚を開いた。desktop・tabletは3列、mobileは2列で、得意技能選択のアクセント背景と修正変更を含む。
  - checked acceptance criteria: grid列数、headerの存在、行の表示、入力・outputのclipping。
  - result: previewでの再確認前につき要人間判断。
- `/character-sheet/` / 得意技能tooltip open、修正tooltip open / desktop・tablet・mobile:
  - full-page overview (page-level確認のみ): temporary captureを取得したが、dev server由来のため正式な確認根拠に使わない。
  - locator screenshot（非戦闘技能sectionおよび`[role="tooltip"]` / original pixel resolution）: 各state・viewportのsection 6枚とtooltip本体6枚を開いた。tooltip本文は全文を表示した。
  - checked acceptance criteria: tooltip本文、tooltip本体のwrap・clipping、header triggerの存在。
  - result: previewでのtriggerとの相対位置の再確認前につき要人間判断。

### 自己修正した項目

- [x] `visual:capture`に複数locatorのtemporary screenshot出力を追加し、fixed tooltipをsectionとtooltip本体へ分けて取得した。
- [x] tooltip open stateをclickで準備し、touch viewportでもhover依存を持ち込まないようにした。

### 人間判断が必要な差分

- userが起動中のdev serverを停止し、4321のpreview serverへ切り替えてformal Visual Reviewを実行してよいか。
- noncombat state用canonical snapshotが存在しない。今回のactualをbaselineとして採用するかは、previewでの確認後にユーザーが判断する。

### 対応完了チェックリスト

- [x] canonical VRT baselineを管理しない方針を確定し、正式な比較をG31へ延期した。
- [x] 変更targetだけの一時snapshotを取得した。
- [x] current issueの受入条件と最終diffから対象stateを列挙した。
- [x] 宣言したすべてのroute / state / viewportで、局所表示契約ごとの原寸locator screenshotを開いて確認した。
- [x] full-page screenshotを局所表示契約の確認根拠に使っていない。
- [x] canonical VRT baselineの差分判定は管理対象にせず、G31のコンテンツレビューへ延期した。
- [x] baseline更新が必要な差分を人間判断として記録した。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 5

### 指摘事項

- `.tmp/chatgpt-review.md`は、G9を未検証の受入条件を残したまま完了扱いにしたこと、縁の削除callbackが上限外行だけに制限されていないこと、編集行のHTML意味構造がarchitectureの`fieldset` / `legend`契約と一致しないことを指摘した。
- G9 / G10のarchived issueには、現在利用可能な要素単位のVisual Review基盤で確認できる受入条件が未完了のまま残る。
- ユーザーはmobileの縁の`クリア`buttonが横overflowすると指摘した。

### 判定

- source: browser-draft（`.tmp/chatgpt-review.md`）/ human
- classification: valid
- local validation: G9 archived issueの初期完了条件には古い`desktop / tablet 4列、mobile 2行2列`契約が残るが、後続の`docs/requirements/character-sheet.md`と`docs/design/character-sheet/notes.md`の正本は`desktop / tablet 2行2列、mobile 4行1列`である。現行の`BondsSection.module.css`はこの後続契約に一致するため、古い列数へ戻さず後続契約を受入基準にする。G9 / G10のVisual Reviewチェックは未完了であり、現在の`visual:capture`はscenario owner locatorをdesktop / tablet / mobileで取得できる。mobileの`.row`はクリア列を`1.5rem`に縮める一方、`.clearButton`は`min-width: 3rem`であるため、ユーザー観測どおりoverflowする。`onRowDelete`は覚悟済みだけを拒否し、現在の上限外状態を再確認しない。`BondsSection`と`ChecksSection`の編集行は`div`であり、architectureの`fieldset` / `legend`契約と一致しない。
- review内のPresenter adapter肥大化はsection別hook分割後のためstaleである。`useFieldArray`への移行とfield/value型対応はG24の既存TODOに従うfollow-upであり、この指摘では先取りしない。

### 対応方針

- archived issueと親Gate planの過去記録は書き換えず、G11のこのレビュー節でG9 / G10の再受入を管理する。G9の覚悟効果は後続正本どおりdesktop / tablet 2行2列、mobile 4行1列として確認する。
- mobileの縁行は`クリア`text buttonと既存のcheckbox・input表現を維持したまま、buttonの最小幅とgrid列を整合させて横overflowをなくす。上限外の未覚悟行だけを削除できる業務制約はcallbackにも置き、直接呼出しのhook testを追加する。
- 縁、攻撃、リアクションの編集行を`fieldset` / `legend`で意味付け、現在の列ヘッダー、accessible name、layoutを保つ。
- G9はdefault、覚悟済み、上限超過 / 削除可能、G10はdefault、攻撃追加、対応能力変更、判定数tooltip openを、section / tooltip owner locatorでdesktop / tablet / mobileにてcapture・actual確認する。`visual:test`は変更targetだけを比較し、canonical baselineは更新しない。

### 対応完了チェックリスト

- [x] G9の覚悟効果が後続正本どおりdesktop / tablet 2行2列、mobile 4行1列で、式を折り返さず表示される。
- [x] mobileの縁の`クリア`buttonと各行が横overflowせず、覚悟済みのdisabled状態と上限外行の削除buttonを既存契約どおり表示する。
- [x] `onRowDelete`が上限外かつ未覚悟の行だけを削除し、直接callbackを呼んでも通常行・覚悟済み行を削除しない。
- [x] 縁、攻撃、リアクションの編集行がarchitectureの`fieldset` / `legend`契約を満たし、既存のaccessible nameと表示契約を維持する。
- [x] G9 / G10の受入stateをscenario owner locatorでdesktop / tablet / mobileに列挙し、`visual:capture`のoriginal-pixel-resolution actualを開いて確認する。
- [x] canonical VRT baselineを管理しない方針を確定し、変更targetの正式なVisual ReviewをG31のコンテンツレビューへ延期する。
- [x] 関連するNode / hook / Component / browser behavior testが通る。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## レビュー指摘 6

### 指摘事項

- ユーザーは、`FormulaTooltip`の`?` indicatorが対象文言によって上下中央からずれると指摘した。能力値ポイントと覚悟で顕著である一方、格、常時修正、一時修正では中央に揃って見える。

### 判定

- source: human
- classification: valid
- local validation: 共通`FormulaTooltip`はindicatorを`triggerContent`に対するabsolute positioningで`top: 50%`に置き、rootとtriggerはinline-blockの`vertical-align: middle`を使う。能力値ポイントはinline-flexのmeta表示、覚悟はgrid header、格はblockのmetric label、常時／一時修正はgrid header内のstacked labelで使われ、親の表示形式が異なる。sectionごとのactual screenshotとcomputed layoutを照合し、共通Componentまたは全ラベルに適用できる規約以外で修正しない。

### 対応方針

- 能力値ポイント、格、常時修正、一時修正、覚悟を含むsection owner locator screenshotをdesktop / tablet / mobileで比較する。必要に応じてtooltip triggerの原寸locatorも追加する。
- indicatorの上下中央揃えは`FormulaTooltip`側のbox / line-height / alignment契約として統一し、個別sectionのlabel styleを上書きして位置を合わせない。既存のtooltip操作、indicatorの右端配置、open stateの表示契約を維持する。

### 対応完了チェックリスト

- [x] 指定されたtooltip triggerをsection単位でdesktop / tablet / mobileにcaptureし、ずれの条件をactual screenshotで確認する。
- [x] 共通`FormulaTooltip`に適用する統一styleでindicatorの配置規約を揃える。
- [x] ユーザーのpreview確認で残った微小な上下ずれを、G31のコンテンツレビューで違和感が指摘された場合に共通`FormulaTooltip`で再調整するTODOへ記録した。
- [x] tooltipのtrigger・open state・既存labelのwrap / clipをComponent testとVisual Reviewで確認する。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## ビジュアルレビュー 4

### VRT対象

- design target: `character-sheet`
- VRT test / tags: `tests/visual/vrt/character-sheet.spec.ts`の`@character-sheet`。G11は`@noncombat-expanded`、`@noncombat-favorite-selected`、`@noncombat-modifier-changed`、`@noncombat-tooltip-open`、レビュー指摘 5は`@checks-bonds-default`、`@bond-resolved`、`@bond-over-limit`、`@attack-row-added`、`@attack-attribute-changed`、`@checks-tooltip-open`、レビュー指摘 6は`@tooltip-alignment-default`。
- route / states / viewports: `/character-sheet/`の各対象stateをdesktop、tablet、mobileで確認した。`@checks-bonds-default`はultrawideも取得した。

### 実画面確認

- G11: 非戦闘技能を展開し、desktop / tabletで2列、mobileで1列となること、`-12`修正値、得意技能選択時のアクセント背景、折りたたみ時に得意技能だけを表示することを、各viewportのnoncombat section locator screenshotで確認した。見出しtooltipも3 viewportで開き、指定4文の改行を含む全文にclipがないことをtooltip locator screenshotで確認した。
- レビュー指摘 5: 縁のdefault、覚悟済み、上限超過、攻撃のdefault・行追加・対応能力変更、判定数tooltip openを各viewportのsection / tooltip locator screenshotで確認した。縁の効果式はdesktop / tabletで2行2列、mobileで4行1列で表示され、mobileの`クリア`buttonは行内に収まる。上限超過時だけ削除buttonが表示される。
- レビュー指摘 6: 能力値ポイント、格、常時修正、一時修正、覚悟を含むprofile / build / bonds section locator screenshotをdesktop / tablet / mobileで確認した。`FormulaTooltip`のindicatorをabsolute配置からtrigger content内のflex itemへ統一し、既存labelのwrap・clipはない。ユーザーのpreview確認ではなお微小な上下ずれが見えるため、G31のコンテンツレビューで違和感が指摘された場合だけ、共通Component側で再調整する。

### canonical VRT比較

- `npm run visual:test -- --grep '@character-sheet'`を実行した。既存のcanonical `default-*`を更新していない。
- canonical VRT baselineは管理対象にしない。新規stateの正式なVisual Reviewは、G31のコンテンツレビューでoriginal-pixel-resolution locator screenshotをrequirements・design・ユーザー指示へ照合して行う。実画面の確認根拠は上記のlocator screenshotである。

## Gate Tech Review

- review range: `dd6f0e0..74ef1ec`
- result: 15技能、得意技能の計算、schema / form / dictionary / master-data境界、縁削除制約、`fieldset` / `legend`、mobileの縁クリア、共通tooltip配置、既存testの結果にactionable findingはなかった。
- review finding: canonical snapshotがGit管理されず、新規stateはfresh checkoutで`visual:test`比較できないため、G11をそのまま完了扱いにできない。
- user decision: canonical VRT baselineは管理対象にしない。比較はG31のコンテンツレビューへ正式に延期し、必要なactual screenshotを正本と照合する。対応TODOは`docs/TODO.md`で管理する。
