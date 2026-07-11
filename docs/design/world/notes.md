# world

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
- `npc-card`の横長1列、左側`4:5`人物アイコン領域、shadowなし、二つ名のruby / 文字色を維持する。
- H1直後に`ImageBlock`を置き、heroには意味のあるaltを持たせる。
- build後のPageToc生成を前提に、正本のcaptureは`npm run preview`で確認する。
- hero内の公式ゲームロゴは、world heroで明示承認された合成ブランディングである。in-world signageと混同せず、他のoverlay typographyを追加しない。

## Out of scope

- NPC個別画像、Excel、JSON、schema、取得層、一覧・詳細ページ
- GM専用情報、エネミーデータ、シナリオ本文、キャンペーン本文
- Header、Footer、SiteMenu、PageToc、MobilePageTocの再設計
- 検索、パンくず、前後ナビゲーション、ダイスローラー、キャラクターシート、CMS、DB、認証、SSR、API、PWA

## Comparison points for implementation

- H1直後のhero、本文見出し、強大な敵4種、勢力別NPCカードが順に読める。
- hero右下に、公式ゲームロゴ`光都暗域〈ネオン・アンダーレルム〉TRPG`だけが合成されている。
- desktopのPageTocとmobileのMobilePageTocが、build後に生成された見出しを含む。
- `〈仕事人〉`の強調記法が文字として露出せず、太字として表示される。
- NPCカードがdesktop / mobileとも横長1列を保ち、横overflowしない。

## Generation source

- source branch / commit when applicable: `21-2-world-page` / `ea6591f`を基点とする未commit実装
- route: `/world/`
- capture: `tests/visual/world.spec.ts`を`npm run build`後の`npm run preview -- --host 127.0.0.1`に対して実行した。
- source artifacts:
  - `test-results/visual/world-desktop.png`
  - `test-results/visual/world-mobile.png`
- user approval: `PR出す前に正本化もやっていいからねどうせ最後は俺がレビューするし。`（2026-07-12）
- logo approval: `ロゴありが正しいです。グローバルにそれが正しくなるように記述修正してください。`（2026-07-12）

## Canonicalization rationale

- 事前のworld専用draftを作らず、既存`site-layout`と`npc-card`正本を組み合わせる方針だった。
- build後のpreviewでPageTocを含めて確認済みのactualを採用し、後続のworld実装が比較できるpage-level正本を作る。
- Visual Reviewの不備を隠すためではなく、ユーザーが明示承認した現行実装の状態を比較基準にするための正本化である。

## Open questions

- なし。
