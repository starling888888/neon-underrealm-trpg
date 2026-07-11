# 21-2-world-page

## 目的

`/world` に、オオサカ副都の世界観、強大な敵、勢力、NPC紹介を掲載するワールドガイドページを作成する。H1直後にはhero画像を表示し、NPC紹介は二つ名、名前、説明、共通の人物アイコンを含む静的 `NpcCard` として配置する。二つ名がある場合はルビ付きの控えめな青緑寄りの文字色で名前の直前に続け、ない場合は名前から表示する。

## 背景

`docs/plan.md` の `21-2-world-page` は、初期公開範囲のワールドガイドを作成するタスクである。ローカル作業入力 `.raw/contents/world.md` は作成済みであり、現行のユーザー指示を反映して、常体の世界観本文、強大な敵4種、NPC紹介、hero画像生成プロンプトを含む。

NPCの個別画像とExcel / JSONによる正規化は、このタスクでは扱わない。Phase 3末尾の `42-0-npc-data-normalization` に後送りする。

参照する正本・資料:

- `docs/requirements/pages.md`
- `docs/requirements/components.md`
- `docs/requirements/data-display.md`
- `docs/requirements/assets-seo.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `.raw/contents/world.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/image-generation/base-prompt.md`
- `.agents/skills/design-image-generation/SKILL.md`

## 対象範囲

- `/world` 用の事前design画像は作成しない。既存のsite layout、`ImageBlock`、`NpcCard` designを使って実装し、build後のpreviewでVisual Reviewを行う。ユーザー承認済みのactualを `docs/design/world/` の正本へ反映する。
- `docs/design/npc-card/` に、`NpcCard` 専用の横長カード1列のinitial draftとして `design-desktop.png`、`design-mobile.png`、`notes.md` を作成する。design画像はページ全体ではなく標準viewport内のComponent配置を示す。
- hero画像をユーザー提供または `.raw/contents/world.md` のH1直後にあるhero生成プロンプトから用意し、静的アセットとして配置する。
- `src/pages/world.mdx` を作成し、`.raw/contents/world.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに実装する。
- H1直後に `ImageBlock` でhero画像を表示する。
- 世界観本文を常体で表示し、**〈仕事人〉**の表記、歴史、科学技術、信仰、強大な敵を配置する。
- 強大な敵として、外道、機龍、ホムンクルス、悪魔を配置する。
- `src/components/_common/NpcCard.astro` をこのタスク内で作成し、共通のシンプルな人物アイコン、二つ名、名前、説明を表示する。二つ名がある場合はルビ付きの控えめな青緑寄りの文字色で名前の直前に続け、ない場合は名前から表示する。
- `/world.mdx` 内の静的propsでNPCカードを配置する。個別画像、Excel、JSON、データ一覧は扱わない。
- `src/pages/-local/npc-cards.astro` に、`NpcCard` のローカル確認用カタログを作成する。
- `tests/visual/npc-card.spec.ts` に、ローカルカタログのdesktop / mobile capture testを追加する。
- `tests/visual/world.spec.ts` に、`/world` のdesktop / mobile capture testを追加する。
- 実装後にVisual Reviewを行い、build後のpreviewで取得したactualを、ユーザー承認済みの `design-image-generation` design fix modeで `docs/design/world/` の正本へ反映する。

## 初期スコープ外

- NPCの個別画像を `public/assets/images/npc/` に配置しない。
- NPCのExcel、変換仕様、生成JSON、schema、取得層、一覧ページ、詳細ページ、カード一覧Componentを作成しない。これらは `42-0-npc-data-normalization` で扱う。
- GM専用情報、エネミーデータ、シナリオ本文、キャンペーン本文を掲載しない。
- hero画像が未確定のままplaceholderや代替画像を公開しない。
- Header、Footer、SiteMenu、PageToc、MobilePageTocを再設計しない。
- 検索、パンくず、前後ナビゲーション、ダイスローラー、キャラクターシート、CMS、DB、認証、SSR、API、PWAを追加しない。

## 完了条件

- [x] `/world` 実装のVisual Reviewをbuild後のpreviewで行い、ユーザー承認済みの `design-image-generation` design fix modeで `docs/design/world/` を正本化している。
- [x] `design-image-generation` のinitial draft modeで `docs/design/npc-card/notes.md`、`design-desktop.png`、`design-mobile.png` を作成し、人間レビューで承認されている。
- [x] hero画像の提供または生成を完了し、静的アセットの配置先、意味のある `alt`、キャプションの有無、`loading`、公式ゲームロゴを含む合成ブランディング方針を確認している。
- [x] `/world.mdx` に `MDXLayout`、`title`、`description`、`showPageToc: true` を設定している。
- [x] hero画像をH1直後に `ImageBlock` で表示している。
- [x] `.raw/contents/world.md` の常体の世界観本文、`〈仕事人〉`の強調表記、強大な敵4種を表示している。
- [x] `NpcCard` が共通の人物アイコン、二つ名、名前、説明を表示している。二つ名がある場合はルビ付きの控えめな青緑寄りの文字色で名前の直前に続け、ない場合は名前から表示している。
- [x] NPCカードをMDX内の静的propsで配置し、個別画像、Excel、JSONを導入していない。
- [x] GM専用情報、エネミーデータ、シナリオ本文、キャンペーン本文を掲載していない。
- [x] desktop / mobileでhero画像、NPCカード、本文、PageToc / MobilePageTocに破綻がないことをVisual Reviewで確認している。
- [x] build後のpreviewで完成画面のスクリーンショットを取得し、ユーザー承認済みのdesign正本化を行っている。
- [x] `npm run check` が通る。
- [x] `npm run build` が通る。

## チェックポイント

- [ ] 既存ルートが壊れていない。
- [x] GitHub Pagesのサブパス公開でhero画像と内部リンクが壊れない。
- [x] `ImageBlock` の `alt` を設定し、装飾画像の場合だけ空 `alt` を使用している。
- [x] `NpcCard` の人物アイコンは、名前と説明が別に読める装飾として扱い、アクセシブルな名前を重複させていない。
- [x] 二つ名がある場合は `<ruby>` / `<rt>` と名前と異なる控えめな青緑寄りの文字色で表し、括弧文字を重複表示していない。二つ名がないNPCでは、空の二つ名欄、推測した二つ名、ダミーのルビを表示せず名前から始めている。
- [x] `/world` のtitle、description、共通OGPがGitHub Pagesのサブパス公開で正しく出力される。
- [x] 不要な依存関係を追加していない。
- [x] `42-0-npc-data-normalization` の範囲を先取りしていない。
- [x] 関連する `docs/TODO.md` 項目と矛盾していない。
- [x] `docs/design/global-styles/`、`docs/design/site-layout/`、承認済み `docs/design/npc-card/` と矛盾していない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/issue/21-2-world-page.md`
- `docs/design/world/notes.md`
- `docs/design/world/design-desktop.png`
- `docs/design/world/design-mobile.png`
- `docs/design/npc-card/notes.md`
- `docs/design/npc-card/design-desktop.png`
- `docs/design/npc-card/design-mobile.png`
- `src/pages/world.mdx`
- `src/components/_common/NpcCard.astro`
- `src/pages/-local/npc-cards.astro`
- `tests/visual/npc-card.spec.ts`
- `tests/visual/world.spec.ts`
- hero画像の静的アセット
- 必要に応じてVisual Review用のtest設定

## レビュー観点

- `/world`実装が既存の白寄り本文面、暗めのHeader、控えめな青緑accent、実務的な情報密度と整合しているか。
- hero画像がH1直後にあり、本文の可読性を損なわず、プロンプトに指定された公式ゲームロゴ、景観、人物制約を満たしているか。
- `NpcCard` が単なる装飾カードの連続にならず、世界観紹介として本文の情報構造に収まっているか。
- `docs/design/npc-card/` の横長カードで、説明、人物画像領域、余白が無理なく読めるか。
- 二つ名のルビと文字色、人物アイコン、名前、説明が読みやすく、アクセシビリティ上の重複がないか。
- 二つ名がないNPCを、空欄を作らず名前から表示しているか。
- Visual Review screenshotをdesign正本として直接コピーせず、design正本化が必要な場合はユーザー承認後に別途design fix modeへ切り出しているか。
- `42-0-npc-data-normalization` の個別画像、Excel、JSONをこのタスクへ混入させていないか。
- ユーザー指示によりcurrent issue外で行われた変更も、scope外であることを理由にレビューを省略せず、関連SSoTとの整合性と影響範囲を確認しているか。

## 備考

- 関連TODOは「各NPCの個別画像をpublic assetsへ配置する」「NPCをExcelとJSONで管理する」であり、どちらも `42-0-npc-data-normalization` へ紐付いている。このissueでは回収しない。
- `/world`は既存layoutと共通Componentを組み合わせる本文ページとして実装する。事前design画像は作成せず、build後のpreviewで取得したactualを、ユーザー承認済みのdesign fix modeで `docs/design/world/` の正本へ反映する。
- hero画像は、ユーザー提供または `.raw/contents/world.md` に転記済みの生成プロンプトで用意する。実装前に画像の実体とメタデータを確定する。
- オオグス・アルマとアシカガ・シンゾは資料上二つ名を持たないため、二つ名欄を作らず名前から表示する。新しい二つ名を作らない。
- `.raw/contents/world.md` はローカル作業入力であり、Google Driveへの書込みは `raw-to-drive-sync` の明示指示があるまで行わない。
- PRレビューでは、ユーザー指示によるscope外変更を許容する。ただし、scope外を理由にレビューを省略せず、変更内容、関連SSoTとの整合性、影響範囲を確認する。

## ビジュアルレビュー 1

### デザイン参照

- design target: `docs/design/npc-card/`
- reference desktop: `docs/design/npc-card/design-desktop.png`
- reference mobile: `docs/design/npc-card/design-mobile.png`
- notes: Component単体のinitial draftと、`-local/npc-cards/` の実際のsite layoutを比較した。Header、SiteMenu、Footer、カタログ見出しはComponent designの対象外である。

### 成果物

- actual desktop: `test-results/visual/npc-card-desktop.png`
- actual mobile: `test-results/visual/npc-card-mobile.png`
- report: `tests/visual/npc-card.spec.ts`

### レビュー結果

| 領域                  | 判定 | 差分                                                                      | 対応 |
| --------------------- | ---- | ------------------------------------------------------------------------- | ---- |
| レイアウト            | OK   | 横長1列と左側`4:5`人物領域が一致する。                                    | 不要 |
| 余白                  | OK   | カタログのsite layout由来の外側余白はComponent draftの対象外。            | 不要 |
| タイポグラフィ        | OK   | 二つ名はルビ付きで名前の直前にあり、斜体ではない。                        | 不要 |
| 色                    | OK   | 二つ名は名前と異なる控えめな青緑寄りの文字色である。                      | 不要 |
| 配置・整列            | OK   | 人物アイコン、名前、説明の配置に破綻がない。                              | 不要 |
| レスポンシブ          | OK   | desktop / mobileとも横長1列を維持する。                                   | 不要 |
| overflow / scroll     | OK   | capture testでdocument横overflowがないことを確認した。                    | 不要 |
| 既存デザインとの整合  | OK   | 白寄り本文面、低彩度border、shadowなしの方向と整合する。                  | 不要 |
| 既存Componentとの整合 | OK   | `AppContainer` と既存tokensだけを利用する。                               | 不要 |
| accessibility basics  | OK   | 人物アイコンは`aria-hidden`で、二つ名・名前・説明は通常テキストで読める。 | 不要 |

### 自己修正した項目

- [x] AstroページではバッククォートがMarkdownとして解釈されず可視化されていたため、カタログの説明から除去して再captureした。

### 人間判断が必要な差分

- なし。

### design-image-generation への引き継ぎ候補

- [x] ユーザー承認により、`test-results/visual/npc-card-desktop.png` と `npc-card-mobile.png` を`docs/design/npc-card/`のdesign正本へ反映した

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] design正本の更新が必要な場合は、人間判断項目として記録した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## ビジュアルレビュー 2

### デザイン参照

- design target: `docs/design/site-layout/`、`docs/design/npc-card/`、`docs/design/world/`
- reference desktop: `docs/design/site-layout/design-desktop.png`、`docs/design/npc-card/design-desktop.png`、`docs/design/world/design-desktop.png`
- reference mobile: `docs/design/site-layout/design-mobile.png`、`docs/design/npc-card/design-mobile.png`、`docs/design/world/design-mobile.png`
- notes: 事前のworld専用draftは作らず、既存layoutと正本化済みNpcCard、`.raw/contents/world.md`の構造を比較した。build後のpreviewで再取得したactualは、ユーザー承認済みのdesign fix modeで`docs/design/world/`へ正本化した。

### 成果物

- actual desktop: `test-results/visual/world-desktop.png`
- actual mobile: `test-results/visual/world-mobile.png`
- report: `tests/visual/world.spec.ts`（`npm run build`後の`npm run preview -- --host 127.0.0.1`で実行）

### レビュー結果

| 領域                  | 判定 | 差分                                                         | 対応 |
| --------------------- | ---- | ------------------------------------------------------------ | ---- |
| レイアウト            | OK   | 既存site layout内で本文とPageTocが成立する。                 | 不要 |
| 余白                  | OK   | hero、本文、NPCカードの間隔に破綻がない。                    | 不要 |
| タイポグラフィ        | OK   | 常体本文、太字で表示される`〈仕事人〉`、見出し階層が読める。 | 不要 |
| 色                    | OK   | hero以外は既存の白寄り本文面と控えめな青緑accentを維持する。 | 不要 |
| 配置・整列            | OK   | H1直後のhero、強大な敵、勢力別NPCカードが順に配置される。    | 不要 |
| レスポンシブ          | OK   | mobileでは横長NpcCardとMobilePageToc triggerが成立する。     | 不要 |
| overflow / scroll     | OK   | capture testでdocument横overflowがないことを確認した。       | 不要 |
| 既存デザインとの整合  | OK   | site-layoutとNpcCard正本に整合し、world正本へ反映済み。      | 不要 |
| 既存Componentとの整合 | OK   | `ImageBlock`と`NpcCard`を既存仕様どおり使う。                | 不要 |
| accessibility basics  | OK   | heroの意味あるalt、装飾人物アイコン、見出し構造を確認した。  | 不要 |

### 自己修正した項目

- [x] MDXで文字として露出した`**〈仕事人〉**`を`<strong>〈仕事人〉</strong>`へ置き換え、preview出力で太字として確認した。
- [x] PageTocをbuild後に生成するページであるため、dev server captureを破棄し、previewに対するcapture testへ取り直した。
- [x] world visual testに`expectGeneratedPageToc`を追加し、desktop / mobileの生成済みToCに`強大な敵`が含まれることを確認した。

### 人間判断が必要な差分

- なし。ユーザー承認により正本化済み。

### design-image-generation への引き継ぎ候補

- [x] ユーザー承認により、`test-results/visual/world-desktop.png`と`world-mobile.png`を`docs/design/world/`のdesign正本へ反映した

### 対応完了チェックリスト

- [x] desktop screenshot を取得した
- [x] mobile screenshot を取得した
- [x] reference と actual を比較した
- [x] 明らかな visual mismatch を修正した、または修正不要と判断した
- [x] ユーザー承認済みのdesign正本化を`design-image-generation`のdesign fix modeで反映した
- [x] `npm run check` が通る
- [x] `npm run build` が通る

## レビュー指摘 1

### 指摘事項

- hero画像`public/images/world/hero.webp`の右下に、タイトル・TRPGロゴの合成文字がある。
- 初回review時点の`.raw/contents/world.md`は非ブランディング制約を明示しており、現行heroと矛盾していた。

### 判定

- source: local-pr-review
- classification: valid、ユーザー指示により対応方針を確定
- local validation: `src/pages/world.mdx`が参照する`/images/world/hero.webp`と、desktop / mobileのactual、`.raw/contents/world.md`のH1直後のhero生成プロンプトを照合した。ロゴ・文字は画像内に存在する。ユーザーはロゴ入りを正として明示し、共通`docs/image-generation/base-prompt.md`とworld固有promptを公式ゲームロゴの合成ブランディング方針へ更新するよう指示した。

### 対応方針

- 現在のheroをユーザー提供画像として意図的に採用する。
- 共通`docs/image-generation/base-prompt.md`、world固有prompt、current issue、`docs/design/world/notes.md`を、公式ゲームロゴだけを許可する合成ブランディング方針へ揃える。
- build後のpreviewで再captureしたactualを、ユーザー承認済みの`docs/design/world/`正本として維持する。

### 対応完了チェックリスト

- [x] heroのロゴ入り方針をユーザー確認した
- [x] 共通base prompt、world固有prompt、issue、design制約へ反映した
- [x] build後のpreviewでworld visual testを再実行した
- [x] `docs/design/world/`の正本を承認済みactualへ更新した
- [x] `npm run check` が通る
- [x] `npm run build` が通る
