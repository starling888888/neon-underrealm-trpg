# skill-card

## Mode

- design fix

## Target

- page / component: `SkillCard` と、後続の `SkillList` が配置する一覧gridの見え方。desktopは既存のHeader、左SiteMenu、右PageTocを含む。
- route: `/-local/skill-cards/`
- viewport:
  - desktop: `1440x1200`
  - mobile: `390x900`
- states:
  - desktop 3 columns
  - mobile 2 columns

## Referenced SSoT

- `AGENTS.md`
- `.agents/skills/design-image-generation/SKILL.md`
- 完了issue履歴: `docs/issue/done/phase-3/27-1-skill-card-component.md`
- `docs/requirements/data-display.md`
- `docs/game-design/skills.md`
- `docs/out-of-scope.md`
- `docs/plan.md`
- `docs/TODO.md`
- `docs/design/global-styles/notes.md`
- `docs/design/site-layout/notes.md`
- `docs/design/npc-card/notes.md`

## Design direction

- visual direction: 白い面と低彩度borderで区切る、縦長・高密度なルール参照カード。shadow、gradient、強いneon glowは使わない。
- layout direction: カードは最低高さを持ちつつ本文量で縦に伸びる。同じgrid行では最も長いスキルに合わせてカードの高さを揃える。デスクトップでは既存のHeader、左SiteMenu、右PageTocを含む残り幅で3列、モバイルでは2列とする。実際の一覧gridは後続の `SkillList` が担当する。
- typography direction: 名称と `最大LV: N` は最初に視認できる大きさにし、最大LVは名称行の下に独立して置く。タイミング、コスト、技能は短い値としてまとめる。2×2の情報枠は上段を取得制限・使用制限、下段を対象・射程とし、取得制限の内容だけを太字にする。効果欄は罫線で分けず上に詰め、効果本文だけを太く表示する。summaryはデータとして保持するが、全スキル分の内容が完成するまで表示しない。長文は通常本文より小さくする。
- color / accent usage: 青緑accentは名称下の細い罫線と `LV` の控えめな強調に限定する。カードの種類、所属、区分を色分けしない。

## Existing design constraints

- `global-styles` の白寄り背景、暗い本文色、低彩度border、青緑accent、system fontを維持する。
- `site-layout` のHeader、Footer、SiteMenu、PageTocを再設計しない。このprototypeはComponentだけを確認する独立フレームである。
- `NpcCard` と同様にborderと余白で区切り、影や派手な装飾で別サイトのUIにしない。
- 所属、区分、IDはカードに可視表示しない。個別アンカーIDは見た目に影響しない。

## Out of scope

- `SkillList`、共通スキル一覧ページ、流儀・生き様ページの実装
- Excel変換、JSON、schema、データ取得、スキルIDやアンカーIDの生成規則
- 検索、フィルタ、ソート、ページネーション、カードの詳細遷移
- 専用凡例Component、新しいUIライブラリ、クライアント側状態管理
- Header、Footer、SiteMenu、PageTocの再設計

## Comparison points for implementation

- 所属・区分・IDがカードに可視表示されず、名称、名称行の下にある`最大LV: N`、タイミング、コスト、技能、取得制限、対象、射程、使用制限、効果だけで読める。summaryは全スキル分の内容が完成するまで表示しない。
- タイミング、コスト、技能はラベルを付けず、上段に取得制限・使用制限、下段に対象・射程を置く。取得制限の内容だけを太字にする。
- 効果欄には罫線を置かず、上に詰める。summaryは表示せず、効果本文をラベルなしで読み取れるようにする。
- カードは最低高さを保つが、長い本文や制限で自然に縦へ伸びる。本文を切り詰めない。
- 同じgrid行のカードは、最も長い本文のカードと同じ高さになる。
- mobileでは2列で横overflowせず、desktopでは左右のレールを含む幅でも3列の情報密度が保たれる。
- reviewが必要な差分:
  - ラベルをなくしたことでタイミング、コスト、技能、対象、射程、制限を読み分けられない。
  - mobile 2列で名称、値、本文が潰れる、または横overflowする。
  - カードが固定高になり長文を切る、または本文が通常本文と同程度に大きい。
  - `最大LV: N` が最大レベルではなく、現在レベルに見える。

## Generation source

- initial draft: `.tmp/design/skill-card/prototype.html` と `.tmp/design/skill-card/capture.mjs`
- canonicalization: 実装済みの`/-local/skill-cards/`を、desktop 3列・mobile 2列でcaptureする。

<!-- visual-canonicalization:start -->

- command: `npm run visual:canonicalize -- skill-card --route /-local/skill-cards/`
- source branch: `30-2-ryugi-detail-page`
- source commit: `8327e058a44b8e780240afda778d832d6ad75867`
- route: `/-local/skill-cards/`
- state: `default`
- viewport: desktop 1440x1200, mobile 390x900
- capture manifest: `test-results/visual/capture-manifest.json`

<!-- visual-canonicalization:end -->

- implementation state: `8327e05`後の未コミット変更。summaryを非表示にする共有`SkillCard`の表示方針を含む。

## Open questions

- なし。desktop 3列、mobile 2列をinitial draftの基準とする。
