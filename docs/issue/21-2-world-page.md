# 21-2-world-page

## 目的

`/world` に、オオサカ副都の世界観、強大な敵、勢力、NPC紹介を掲載するワールドガイドページを作成する。H1直後にはhero画像を表示し、NPC紹介は二つ名、名前、説明、共通の人物アイコンを含む静的 `NpcCard` として配置する。二つ名がある場合はルビ付きの斜体で名前の直前に続け、ない場合は名前から表示する。

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

- `docs/design/world/` に `/world` のdesktop / mobile初期designと `notes.md` を作成する。
- hero画像をユーザー提供または `.raw/contents/world.md` のH1直後にあるhero生成プロンプトから用意し、静的アセットとして配置する。
- `src/pages/world.mdx` を作成し、`.raw/contents/world.md` のfrontmatter、Markdown本文、HTMLコメント指示をもとに実装する。
- H1直後に `ImageBlock` でhero画像を表示する。
- 世界観本文を常体で表示し、**〈仕事人〉**の表記、歴史、科学技術、信仰、強大な敵を配置する。
- 強大な敵として、外道、機龍、ホムンクルス、悪魔を配置する。
- `src/components/_common/NpcCard.astro` をこのタスク内で作成し、共通のシンプルな人物アイコン、二つ名、名前、説明を表示する。二つ名がある場合はルビ付きの斜体で名前の直前に続け、ない場合は名前から表示する。
- `/world.mdx` 内の静的propsでNPCカードを配置する。個別画像、Excel、JSON、データ一覧は扱わない。
- 実装後にVisual Reviewを行い、結果とdesign正本化の要否をユーザーへ提示する。design正本を更新する場合は、ユーザーの明示承認後に別途 `design-image-generation` のdesign fix modeで行う。

## 初期スコープ外

- NPCの個別画像を `public/assets/images/npc/` に配置しない。
- NPCのExcel、変換仕様、生成JSON、schema、取得層、一覧ページ、詳細ページ、カード一覧Componentを作成しない。これらは `42-0-npc-data-normalization` で扱う。
- GM専用情報、エネミーデータ、シナリオ本文、キャンペーン本文を掲載しない。
- hero画像が未確定のままplaceholderや代替画像を公開しない。
- Header、Footer、SiteMenu、PageToc、MobilePageTocを再設計しない。
- 検索、パンくず、前後ナビゲーション、ダイスローラー、キャラクターシート、CMS、DB、認証、SSR、API、PWAを追加しない。

## 完了条件

- [ ] `design-image-generation` のinitial draft modeで `docs/design/world/notes.md`、`design-desktop.png`、`design-mobile.png` を作成し、人間レビューで承認されている。
- [ ] hero画像の提供または生成を完了し、静的アセットの配置先、意味のある `alt`、キャプションの有無、`loading` を確認している。
- [ ] `/world.mdx` に `MDXLayout`、`title`、`description`、`showPageToc: true` を設定している。
- [ ] hero画像をH1直後に `ImageBlock` で表示している。
- [ ] `.raw/contents/world.md` の常体の世界観本文、**〈仕事人〉**表記、強大な敵4種を表示している。
- [ ] `NpcCard` が共通の人物アイコン、二つ名、名前、説明を表示している。二つ名がある場合はルビ付きの斜体で名前の直前に続け、ない場合は名前から表示している。
- [ ] NPCカードをMDX内の静的propsで配置し、個別画像、Excel、JSONを導入していない。
- [ ] GM専用情報、エネミーデータ、シナリオ本文、キャンペーン本文を掲載していない。
- [ ] desktop / mobileでhero画像、NPCカード、本文、PageToc / MobilePageTocに破綻がないことをVisual Reviewで確認している。
- [ ] 完成画面のスクリーンショットを取得し、Visual Review結果とdesign正本化の要否をユーザーへ提示している。
- [ ] `npm run check` が通る。
- [ ] `npm run build` が通る。

## チェックポイント

- [ ] 既存ルートが壊れていない。
- [ ] GitHub Pagesのサブパス公開でhero画像と内部リンクが壊れない。
- [ ] `ImageBlock` の `alt` を設定し、装飾画像の場合だけ空 `alt` を使用している。
- [ ] `NpcCard` の人物アイコンは、名前と説明が別に読める装飾として扱い、アクセシブルな名前を重複させていない。
- [ ] 二つ名がある場合は `<ruby>` / `<rt>` と斜体で表し、括弧文字を重複表示していない。二つ名がないNPCでは、空の二つ名欄、推測した二つ名、ダミーのルビを表示せず名前から始めている。
- [ ] `/world` のtitle、description、共通OGPがGitHub Pagesのサブパス公開で正しく出力される。
- [ ] 不要な依存関係を追加していない。
- [ ] `42-0-npc-data-normalization` の範囲を先取りしていない。
- [ ] 関連する `docs/TODO.md` 項目と矛盾していない。
- [ ] `docs/design/global-styles/`、`docs/design/site-layout/`、承認済み `docs/design/world/` と矛盾していない。
- [ ] ユーザーの未コミット変更を破壊していない。

## 想定変更ファイル

- `docs/issue/21-2-world-page.md`
- `docs/design/world/notes.md`
- `docs/design/world/design-desktop.png`
- `docs/design/world/design-mobile.png`
- `src/pages/world.mdx`
- `src/components/_common/NpcCard.astro`
- hero画像の静的アセット
- 必要に応じてVisual Review用のtest設定

## レビュー観点

- world designが既存の白寄り本文面、暗めのHeader、控えめな青緑accent、実務的な情報密度と整合しているか。
- hero画像がH1直後にあり、本文の可読性を損なわず、プロンプトに指定された文字列・景観・人物制約を満たしているか。
- `NpcCard` が単なる装飾カードの連続にならず、世界観紹介として本文の情報構造に収まっているか。
- 二つ名のルビと斜体、人物アイコン、名前、説明が読みやすく、アクセシビリティ上の重複がないか。
- 二つ名がないNPCを、空欄を作らず名前から表示しているか。
- Visual Review screenshotをdesign正本として直接コピーせず、design正本化が必要な場合はユーザー承認後に別途design fix modeへ切り出しているか。
- `42-0-npc-data-normalization` の個別画像、Excel、JSONをこのタスクへ混入させていないか。
- ユーザー指示によりcurrent issue外で行われた変更も、scope外であることを理由にレビューを省略せず、関連SSoTとの整合性と影響範囲を確認しているか。

## 備考

- 関連TODOは「各NPCの個別画像をpublic assetsへ配置する」「NPCをExcelとJSONで管理する」であり、どちらも `42-0-npc-data-normalization` へ紐付いている。このissueでは回収しない。
- `docs/design/world/` は未作成である。実装前に `design-image-generation` のinitial draft modeを実行し、人間レビューを受ける。
- hero画像は、ユーザー提供または `.raw/contents/world.md` に転記済みの生成プロンプトで用意する。実装前に画像の実体とメタデータを確定する。
- オオグス・アルマとアシカガ・シンゾは資料上二つ名を持たないため、二つ名欄を作らず名前から表示する。新しい二つ名を作らない。
- `.raw/contents/world.md` はローカル作業入力であり、Google Driveへの書込みは `raw-to-drive-sync` の明示指示があるまで行わない。
- PRレビューでは、ユーザー指示によるscope外変更を許容する。ただし、scope外を理由にレビューを省略せず、変更内容、関連SSoTとの整合性、影響範囲を確認する。
