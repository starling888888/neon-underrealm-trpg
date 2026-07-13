# データID管理方針

スキル、タイミング、アイテムのID生成方針を扱う。

## 10. データID管理方針

### 10.1 基本方針

スキル、アイテムなどの構造化データにはIDを持たせる。

初期スコープの静的ルールサイトでは、スキルIDは変換スクリプトがExcelの入力順から常に自動採番する。Excel上のID列は使わない。

行の途中挿入、カテゴリ変更、タイミング変更、並び替えによりスキルIDと個別アンカーが変わることは、キャラクターシート機能がない初期スコープでは許可する。

将来、キャラクターシート機能がスキルIDと取得レベルをDBなどの永続ストレージへ保存する場合は、同一スキルのID変更を検出してエラーにする仕組みを別タスクで設計・実装する。それまでは、IDの永続性をExcel入力で保証しない。

### 10.2 スキルID生成ルール

スキルIDは所属種別を含む次の形式とする。

```text
skill-common-{category}-{timing}-{index}
skill-ryugi-{ryugiId}-{category}-{timing}-{index}
skill-ikizama-{ikizamaId}-{category}-{timing}-{index}
```

- `skill`: スキルデータであることを示す
- `common`、`ryugi`、`ikizama`: 所属種別を示す
- `{ryugiId}`、`{ikizamaId}`: 流儀・生き様スキルの所属ID
- `{category}`: bonus / basic / advanced などの分類
- `{timing}`: タイミングをID用に正規化した値
- `{index}`: 同一の所属・カテゴリ・タイミングのグループ内で、Excelの入力順に付ける連番

攻撃タイミング `A-A` は、ID上では `a` とする。

初期スコープでは、同一グループへの新規スキル追加、途中挿入、並び替えにより既存スキルの連番が変わりうる。この挙動と個別アンカーの変更は許可する。

### 10.3 タイミング正規化案

| ルール上のタイミング | ID用       |
| -------------------- | ---------- |
| `Pv`                 | `pv`       |
| `SU`                 | `su`       |
| `INI`                | `ini`      |
| `CU`                 | `cu`       |
| `M`                  | `m`        |
| `A-A`                | `a`        |
| `R`                  | `r`        |
| `Aa`                 | `aa`       |
| `Ra`                 | `ra`       |
| `D`                  | `d`        |
| `SP`                 | `sp`       |
| `×-A`                | `first-a`  |
| `A-×`                | `a-last`   |
| `☆-A`                | `start-a`  |
| `A-☆`                | `a-finish` |
| `○-○`                | `any`      |

### 10.4 アイテムID生成ルール案

アイテムIDは、アイテム種別ごとに定義する。

初期候補は以下。

```text
item-weapon-{group}-{index}
item-armor-{index}
item-omamori-{index}
item-cybernetics-{part}-{index}
item-nanomachines-{part}-{index}
item-drug-{timing}-{index}
```

最終的なID生成ルールは、Excel本体の構造を確認した後、該当する `docs/conversion/*.md` に記載する。

---
