# 機能固有Agent Failureアーカイブ

このファイルは、ユーザー指示によりactive failure logから退避した、特定機能の挙動・表示・データに関するuser / review由来のfailureを保持する。

ここへの移動は恒久対応済みを示さず、`done`でも`no-action`でもない。将来の同種観測が少ないためactive auditから分けるだけであり、原文と一次対応を残す。

workflow、承認、review運用、検証手順、権限、Git操作に関するfailureは、このアーカイブへ移さずactive failure logで扱う。

## 機能固有アーカイブ

### Bond target and relation inputs remounted on every character

#### 2026-07-30

- source: user
- failure category: user-observed input lock
- 発生箇所: `ex-02-26-sheet-json-export` のpreview中に確認された縁セクション
- 観測した失敗: ユーザーが縁の「対象」と「関係」へ入力できないと報告した。`useBondsSectionProps`は各inputの`onChange`で`useFieldArray.update()`を呼ぶため、React Hook Formが行をunmount / remountし、キー入力ごとにfocusを失う。`isResolved`、画面上の「覚悟」が選択済みなら意図的にdisabledになる別契約もあるが、今回の原因ではなかった。G26のJSON出力差分は入力更新を持たず、この挙動を変更していない。
- 一次対応: previewを停止し、先の覚悟による入力ロックという誤った切り分けを訂正した。ユーザーの明示指示後、`update()`ではなく対象fieldへの`setValue()`を使う実装修正と、連続キー入力後の値・focusを確認するComponent testを追加し、`fcefd86 fix: preserve bond input focus`としてcommitした。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Omitted bond-limit errors and styled the wrong mobile control

#### 2026-07-30

- source: user
- 発生箇所: `ex-02-25-sheet-error-summary` のerror集約とtablet / mobile操作pane
- 観測した失敗: 縁の入力済み件数が結べる縁の上限を超える既存errorを集約ViewModelへ渡さず、error時の`danger` classを右下menu buttonではなくヘルプbuttonへ付与した。ユーザーのdev server確認で発見された。
- 一次対応: 縁上限超過をerror集約と既存の局所error表示へ統一し、`danger` classをmenu buttonへ移す。Node / Component testへ両条件を追加し、E2E・VRT実装前のユーザー確認をやり直す。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Implemented a Container layout exception without reconciling the architecture SSoT

#### 2026-07-30

- source: review
- failure category: scope and SSoT precedence
- 発生箇所: `ex-02-23-sheet-action-pane`の`CharacterSheetActionPane`配置
- 観測した失敗: 子issueがarchitecture正本を適用対象として列挙していたにもかかわらず、`CharacterSheetContainer`直下をForm Presenterとroot dialogに限定する契約と矛盾するActionPane直下配置を実装・完了扱いにした。
- 一次対応: PR #69 Review 6の有効指摘としてG23 issueへ記録した。ユーザー判断により、ActionPaneをForm Presenterへ移さず、form外のroot-level表示Componentとしてarchitecture正本へ明記して境界を整合させた。関連するbrowser E2Eとtarget VRTを確認した。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のreview指摘として保管
- moved: 2026-08-05

### Reintroduced the known armor clear-button border cascade defect

#### 2026-07-29

- source: review
- 発生箇所: `ex-02-19-sheet-cybernetics` の共通クリアbutton CSS適用後の防具clear button
- 観測した失敗: 右側罫線の欠落について既存failure logが求めるcomputed styleとwinning selectorの確認をせず、共通classへの置換後に表示完了としたため、防具clear buttonで同じ欠落を再発させた。
- 一次対応: G19のレビュー指摘3へ、desktopのcomputed `border-right`とcascade確認を修正の先行条件として記録した。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のreview指摘として保管
- moved: 2026-08-05

### Used one document listener per open FormulaTooltip for outside-tap dismissal

#### 2026-07-25

- source: user
- 発生箇所: `FormulaTooltip`のmobile閉鎖処理
- 観測した失敗: mobileの外側タップを検出するため、開いている各Tooltipが`document.addEventListener`を登録する設計にした。Tooltipが複数あれば同じdocumentへlistenerが増え、局所UI状態に対して広すぎるイベント境界だった。
- 一次対応: document listenerを削除し、touch環境でだけ表示する透明なdismiss layerをTooltip自身の外側に置いた。数値に近いabsolute配置を維持し、layerのタップで閉じる。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Misinterpreted an icon-alignment correction as container-spacing work

#### 2026-07-25

- source: user
- 発生箇所: `ex-02-4-sheet-profile`の設定トグル
- 観測した失敗: ユーザーが指摘したのは`設定`文字列に対するトグルアイコンの縦ずれだったが、agentはトグル全体のmarginとpaddingを詰める修正を行った。対象要素を画面上で分離して確認せず、アイコンの光学位置とコンテナ余白を混同した。
- 一次対応: トグルのmargin・paddingを元へ戻し、矢印アイコン自体へ相対位置の上方向補正を加えた。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Left the setting toggle vertically detached from its profile fields

#### 2026-07-25

- source: user
- 発生箇所: `ex-02-4-sheet-profile`の基本情報レイアウト
- 観測した失敗: profile gridの直後に配置する設定トグルへ不要な上marginと大きい縦paddingを残し、直前の入力行から下へずれた表示にした。
- 一次対応: 設定コンテナの上marginを除き、トグルの縦paddingを`--space-1`へ縮めて入力群直後の操作として揃えた。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Applied derived-value background to its label despite the requested boundary

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-4-sheet-profile`の信用表示スタイル調整
- 観測した失敗: ユーザーが自動算出「数値」の見た目だけを入力欄から区別するよう求めたのに、agentはラベルを含む算出セル全体へ白背景を適用した。表示上の対象範囲を要素単位で確認せず、ラベルまで入力欄のように見せた。
- 一次対応: 背景・角丸・余白を`.metricValue`だけへ移し、ラベルは入力欄と同じ信用カード背景へ戻した。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Character-sheet Headerのbreakpoint表示条件を誤った

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-0-sheet-page-header`の`CharacterSheetHeader.astro`
- 観測した失敗: desktop・mobileのサイトメニューボタンを追加する際、mobile専用検索操作もdesktop・tabletで表示するCSSにしてHeader gridの暗黙行を発生させ、内部要素が上へずれるデグレを作った。あわせて、Headerの大きなgrid gapでメニューボタンとタイトルロゴの間隔を広げすぎた。
- 一次対応: mobile検索操作をmobile breakpointだけに限定し、Header gridの暗黙行を解消した。desktop・tabletのタイトルロゴを2.5remへ縮め、メニューボタンとの間隔を`--space-3`へ縮めた。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Character-sheetのサイトメニュー表示範囲を誤って拡大した

#### 2026-07-24

- source: user
- 発生箇所: `ex-02-0-sheet-page-header`のcharacter-sheet専用layout
- 観測した失敗: tabletのみで表示する指定だったサイトメニューを、desktopにも表示する実装・検証として扱った。
- 一次対応: 専用layoutのmenu railをtabletのmedia query内だけで表示するようにし、desktop・tablet・mobileの表示条件をbrowser testとcaptureで確認した。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Inherited no-wrap style clipped a formula tooltip

#### 2026-07-27

- source: user
- 発生箇所: `ex-02-8-sheet-secondary` の能力値ポイント・成長点tooltip
- 観測した失敗: labelと算出値を一まとまりとして折り返さないために`attributeMetaItem`へ`white-space: nowrap`を追加したが、tooltip本文がその子孫であることを確認しなかった。その結果、長いformula本文もnowrapとなり、tooltip背景の幅を超えて全文を読めなくなった。
- 一次対応: `FormulaTooltip`のtooltip本文へ`white-space: normal`を明示し、trigger周辺のnowrapを継承しないようにした。tooltip本文は既存の`overflow-wrap: anywhere`で幅内に折り返す。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Ignored the approved noncombat responsive layout

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の`ChecksSection`実装
- 観測した失敗: `.tmp/design/character-sheet/desktop.png`、`tablet.png`、`mobile.png`を実装入力として確認していたにもかかわらず、非戦闘技能を全viewport共通の5列gridとして実装した。design画像が指定するdesktop / tabletの3列とmobileの2列の情報密度を守らず、Visual Review前に未達を検出できなかった。
- 一次対応: current issueへ3列／2列の表示契約と未達を記録した。修正ではdesign画像を直接比較し、各viewportの非戦闘技能を要素単位のactual screenshotで確認するまで完了報告しない。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Used a fixed-width noncombat row after the layout no longer had room

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の非戦闘技能3列／2列responsive表示
- 観測した失敗: desktop / tabletを3列、mobileを2列へ変更した後も、得意技能、技能、対応能力、修正、常時／一時を一つの横行へ保持した。その結果、技能名の大きな折り返し、常時／一時のoverflow、2桁の修正値のclipを残した。各cardの利用可能幅と内容の最小幅を設計段階で見積もらず、列数だけを正本へ合わせた。
- 一次対応: 列ヘッダーと行内の対応能力値を削除し、対応能力別の小見出しと二段cardへ組み替える。各viewportの実画面で技能名、判定数、符号付き2桁修正を確認するまで完了報告しない。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Let card-local checkbox styling diverge from the character sheet standard

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の得意技能checkbox
- 観測した失敗: 非戦闘技能card用にcheckboxの寸法を個別指定した一方、縁sectionは別の`accent-color`指定を持つ状態を見落とした。そのため同じcharacter sheet内のcheckboxが異なる色・寸法で描画された。
- 一次対応: checkboxの基本寸法、accent color、marginを`CharacterSheetFormPresenter`のform scopeへ移し、section CSSには個別のgrid配置だけを残した。checkboxを新設するUIでは、component CSSへ基本styleを複製せずform scopeの共通styleを使う。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Claimed to compact the check-count output without accounting for the shared style selector

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` の非戦闘技能判定数output
- 観測した失敗: 非戦闘技能CSSへ判定数の高さ・padding・文字サイズを記述したが、`CharacterSheetFormPresenter`のform共通`character-sheet-number-value` selectorのspecificityに負けていた。mobile captureで判定数だけ標準サイズのまま残ったにもかかわらず、card全体を縮小したかのように作業を進めた。
- 一次対応: `noncombatRows`／`noncombatCollapsedRows`を含むselectorで判定数outputへcompactな幅、高さ、padding、文字サイズを明示し、共通styleより優先させる。共有styleを局所overrideする場合は、capture前にcomputed styleまたはactual screenshotで各値が適用済みか確認する。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Changed check-count padding based on inference instead of an actual clip result

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-11-sheet-noncombat` のmobile判定数output
- 観測した失敗: 左右paddingと枠幅のトレードオフを実画面で確認しないまま変更し、判定数がclipする状態をユーザーが先に発見した。数値の最小幅を推定しただけで、実際のfont metrics、padding、spinnerとの組み合わせを確認していなかった。
- 一次対応: 既存paddingのclipを実画面で確認した後にだけ、左右paddingを縮める変更を行った。寸法を変更する反復では、各変更後のactual screenshotを開き、次の変更はその結果が得られてから行う。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Omitted G12 validation feedback and nested skill folding

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-12-sheet-primary-skills` のプライマリ流儀スキル
- 観測した失敗: 要件にある最大レベル超過と流儀レベル対スキル合計の赤枠フィードバック、およびプライマリ流儀スキル区分の独立した折りたたみを実装せず、ユーザーの表示確認で欠落が判明した。
- 一次対応: 最大レベルを入力とhookの両方で上限化し、既存超過値の行、流儀枠、スキル区分に`aria-invalid`と赤枠を追加した。スキル区分も初期展開の独立開閉にし、局所Component / hook / logic testへ追加した。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Misread the mobile expanded-detail row order

#### 2026-07-28

- source: user
- 発生箇所: `ex-02-12-sheet-primary-skills` のmobile展開詳細
- 観測した失敗: ユーザーが指定した「コスト・使用制限」「技能・取得制限」「効果」の3行構成を、後続指摘の一部だけを取り違えて「コスト」「技能・使用制限」「取得制限」「効果」へ変更した。
- 一次対応: requirementsとcurrent issueを正しい3行構成へ訂正した。実装の訂正はユーザーの明示指示を待つ。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Repaired the formula layout without preserving paired-value semantics

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の武器・防具の性能値表示
- 観測した失敗: 指摘4の「計算式で表現する」を、性能列内で攻撃力・ガード値または防御力・ダメージ軽減を縦に並べた2本の式として解釈した。ユーザー指定の`元値／元値 + 修正値／修正値 = 最終値／最終値`というペアの1本の式、元値のread-only枠、未算出時の`-`表示を満たしていなかった。
- 一次対応: G17のレビュー指摘5へ単一式・枠・`-`フォールバック・mobile改行の契約を記録した。式の構造を変更する時は、演算子の前後だけでなく、`／`で結ぶ値ペアと表示状態をComponent構造へ直接対応させる。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Applied requested table dividers to header rows and unrelated columns

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` とshared skill UIのheader・候補dialog
- 観測した失敗: ユーザー指定の列罫線を、data行のスキル名称／Lv入力、武器・防具名称／信用という限定された境界ではなく、header行、候補dialog header、他の全列境界へ広げた。また、G17 headerの指定列の左寄せと、防具clear buttonの折り返し時の固定高・中央配置を満たしていなかった。
- 一次対応: G17のレビュー指摘6へ罫線の対象範囲、header左寄せ、clear buttonの寸法・配置を記録した。table罫線の指示では、対象state（header / data行 / 候補行）と対象列境界をCSS selectorへ一対一で対応させる。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Removed existing data-row dividers while correcting header dividers

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` とshared skill UIのdata行
- 観測した失敗: header行から罫線を外す訂正で、data行の既存の全列境界も削除し、名称／Lv入力と名称／信用だけを残す実装へ狭めた。ユーザー指定はheaderのみ罫線なし、data行は全列境界を維持することであった。
- 一次対応: G17のレビュー指摘7へheaderとdata行の罫線を分離する契約を記録した。table CSSの変更では、headerとdata行のselectorが重ならないこと、既存の境界を削除していないことを差分で確認する。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Fixed only one of the two requested derived-value boxes

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の性能式の元値・最終値
- 観測した失敗: ユーザーが「算出値」を固定幅にするよう求めた際、最終値だけを対象にし、同じread-only算出値である元値を可変幅のまま残した。
- 一次対応: G17のレビュー指摘9へ元値・最終値の両方を同一固定幅にする契約を記録した。複数の同種表示を含む指示では、対象要素を列挙してからCSS selectorとgrid列へ対応させる。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Fixed individual widths without correcting the formula alignment

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の性能式
- 観測した失敗: 算出値枠を固定幅へそろえる修正で、性能列全体へ伸びる計算式のlayoutを残した。ユーザーは枠内の値ではなく、計算式全体を左寄せにするよう求めていた。
- 一次対応: G17のレビュー指摘10へ、内容幅の式全体を性能列の左端へ置く契約を記録した。個別要素の幅と親layoutのalignmentを別々に確認する。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Kept a button's minimum width wider than its mobile grid column

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の防具clear button
- 観測した失敗: mobileのclear button列を`2.75rem`にしたまま、button自身の`min-width: 3rem`を残したため、明確な横overflowを起こした。button高も性能inputより大きかった。
- 一次対応: G17のレビュー指摘17へ、desktopとmobileのbutton寸法、mobile列幅、input高との整合を記録した。固定幅controlでは、min-widthと親grid列を同じviewportごとに照合する。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Reduced the button without accounting for its three-character label

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` のmobile防具clear button
- 観測した失敗: overflowを直すためbuttonを縮めた後、mobile共通ruleによって「クリア」の文字を`.6875rem`へ上書きし、buttonの幅も列に明示的に合わせなかった。そのため、右端が描画されていないように見える状態になった。
- 一次対応: G17のレビュー指摘18へ、列幅いっぱいのbutton、`min-width: 0`、既定の`.625rem`ラベルを記録した。controlを縮小する時は、実ラベルの文字数・font-size・borderを含めた内容幅と、親列への確実な収まりを確認する。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Treated a cross-viewport button defect as mobile-only

#### 2026-07-29

- source: user
- 発生箇所: `ex-02-17-sheet-weapons-armor` の防具clear button
- 観測した失敗: 右側が表示されない問題をmobileだけのものと決めつけ、`width: 100%`を追加した。desktopの同じbuttonの表示を直さず、mobileのbuttonも不要に列幅いっぱいになった。
- 一次対応: G17のレビュー指摘19へ、desktop／mobile両方の明示button幅、最大幅、中央配置を記録した。viewport限定の修正をする前に、同じComponentの全breakpointで共通の表示契約を確認する。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Broke the Help dialog body scroll while correcting outer scroll

#### 2026-07-30

- source: user
- failure category: visual implementation verification
- 発生箇所: `ex-02-30-sheet-help` の`CharacterSheetDialog` shared CSS
- 観測した失敗: ヘルプdialogの外側scrollを抑える調整で、surfaceの最大高を誤って内側の高さへ計算し直した。その結果、本文領域が内容高まで広がり、本文自体をscrollできなくなったとユーザーから指摘された。
- 一次対応: surfaceには既存の最大高継承を戻し、native dialog側を`overflow: clip`として外側scrollだけを禁止した。実行時にdialogの`scrollTop`が`0`のまま、本文領域の`scrollTop`が移動できることを確認してから、ユーザーレビューへ戻す。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05

### Applied the example treatment to the calculated-value explanation

#### 2026-07-30

- source: user
- failure category: implementation accuracy
- 発生箇所: `ex-02-30-sheet-help` の`CharacterSheetHelpDialog`
- 観測した失敗: 「例」のCallout対応色を追加する際、直前にある「算出値」の説明paragraphへ`example` classを付与し、実際の例文へ付与しなかった。
- 一次対応: classを例文のparagraphへ移した。class追加時は、可視ラベルと同じparagraphであることをDOM上で確認する。

- archive reason: ユーザー指示により、将来の観測頻度が低い機能固有のユーザー指摘として保管
- moved: 2026-08-05
