# world

+## VRT baseline

- test: `tests/visual/vrt.spec.ts` の `VRT world default <viewport>`
- route: `/world/`
- state: default
- snapshots:
  - desktop `1440x1200`: `world-default-desktop.png`
  - tablet `820x1180`: `world-default-tablet.png`
  - mobile `390x900`: `world-default-mobile.png`
- baseline update: 通常実行では比較のみ行う。差分を確認したうえでユーザーが明示指示した場合だけ `npm run visual:update` を実行する。

## Mode

- design fix
- ユーザー承認済みの`/world`実装actualをdesign正本として採用した。

## Target

- page / component: オオサカ副都の世界観、強大な敵、勢力、NPC紹介を載せるワールドガイド
- route: `/world/`
- viewport:
  - desktop: `1440x1200`、fullPage
  - mobile: `390x900`、fullPage
- states:
  - desktop: SiteMenu、PageToc、本文、hero、NpcCard
  - mobile: Header、MobilePageToc trigger、本文、hero、NpcCard
- design images:
  - `design-desktop.png`
  - `design-mobile.png`

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- `docs/issue/done/phase-3/21-2-world-page.md`（historical source）
- `docs/requirements/pages.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/npc-card/notes.md`

## Design direction

- visual direction: 白寄りの本文面、暗めのHeader / Footer、控えめな青緑accentを維持する。heroはH1の直後に置き、本文の入口として使う。hero右下には公式ゲームロゴを合成ブランディングとして配置する。
- layout direction: desktopでは既存SiteMenu、本文、PageTocの3列layoutを保つ。mobileではMobilePageToc triggerをH1横に残し、NPC紹介は横長1列のまま縦に並べる。
- typography direction: 見出しで世界観の情報構造を示す。本文中の`〈仕事人〉`は太字で強調し、NPC二つ名はルビ付きの青緑寄り文字色で名前の直前に続ける。
- color / accent usage: accentは二つ名、リンク、既存navigation状態に限定する。shadow、強いglow、gradientは使わない。

## Existing design constraints

- `site-layout`のHeader、Footer、SiteMenu、PageToc、MobilePageTocを再設計しない。
- `npc-card`の横長1列、`4:5`個別画像領域、shadowなし、二つ名のruby / 文字色、セリフの薄い斜体を維持する。
- H1直後に`ImageBlock`を置き、heroには意味のあるaltを持たせる。
- build後のPageToc生成を前提に、正本のcaptureは`npm run preview`で確認する。
- hero内の公式ゲームロゴは、world heroで明示承認された合成ブランディングである。in-world signageと混同せず、他のoverlay typographyを追加しない。

## Out of scope

- NPC一覧・詳細ページ
- GM専用情報、エネミーデータ、シナリオ本文、キャンペーン本文
- Header、Footer、SiteMenu、PageToc、MobilePageTocの再設計
- 検索、パンくず、前後ナビゲーション、ダイスローラー、キャラクターシート、CMS、DB、認証、SSR、API、PWA

## Comparison points for implementation

- H1直後のhero、本文見出し、強大な敵4種、勢力別NPCカードが順に読める。
- hero右下に、公式ゲームロゴ`光都暗域〈ネオン・アンダーレルム〉TRPG`だけが合成されている。
- desktopのPageTocとmobileのMobilePageTocが、build後に生成された見出しを含む。
- `〈仕事人〉`の強調記法が文字として露出せず、太字として表示される。
- NPCカードがdesktop / mobileとも横長1列を保ち、11件のNPC画像、セリフ、グループ内の左右交互を表示し、同IDの個別`.webp`がない場合は`public/images/npc/no_image.webp`を表示して横overflowしない。

## Generation source

- route: `/world/`
- capture: `tests/visual/world.spec.ts`をbuild後の`npm run preview`に対して実行する。
- source artifacts:
  - `test-results/visual/world-desktop.png`
  - `test-results/visual/world-mobile.png`
- user approval: `デザイン正本化。ワールドガイドとローカル用のNPCカード用ページ。`（2026-07-22）。

## Canonicalization rationale

- build後のpreviewでPageTocを含めて確認済みのactualを採用し、個別NPC画像、セリフ、左右交互を含むpage-level正本を作る。
- Visual Reviewの不備を隠すためではなく、ユーザーが明示承認した現行実装の状態を比較基準にするための正本化である。

## Open questions

- mobileでも左右交互を維持する。実ユーザーから読みにくさの指摘が出た場合は、画像位置の統一を別taskで検討する。
