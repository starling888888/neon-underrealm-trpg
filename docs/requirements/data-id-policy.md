# データID管理方針

スキル、タイミング、アイテムのID生成方針を扱う。

## 10. データID管理方針

### 10.1 基本方針

スキル、アイテムなどの構造化データには、永続的なIDを持たせる。

IDは原則としてExcel上のID列で管理する。

ID列が空欄の場合、変換スクリプトがIDを自動生成できること。

ただし、一度生成・公開されたIDは、既存リンク維持のため、原則として変更しない。

初回生成後は、生成されたIDをExcel側へ転記し、Excel上のIDを正本として扱うことを推奨する。

### 10.2 スキルID生成ルール案

スキルIDは以下の形式を基本候補とする。

```text
skill-r-{owner}-{category}-{timing}-{index}
```

* `skill`: スキルデータであることを示す
* `r`: 流儀スキルであることを示す
* `{owner}`: 所属流儀ID
* `{category}`: bonus / basic / advanced などの分類
* `{timing}`: タイミングをID用に正規化した値
* `{index}`: 同一グループ内の連番

攻撃タイミング `A-A` は、ID上では `a` とする。

Excelでは、スキルを所属・カテゴリ・タイミングごとに整理して管理する。

新規スキルを追加する場合は、原則として該当グループの末尾に追加する。

この運用により、既存IDの変更を避ける。

ただし、既存行の途中挿入、所属変更、カテゴリ変更、タイミング変更を行う場合はIDが変わりうるため、公開済みIDの維持が必要な場合はExcel上のID列を正本として管理する。

### 10.3 タイミング正規化案

| ルール上のタイミング | ID用        |
| ---------- | ---------- |
| `Pv`       | `pv`       |
| `SU`       | `su`       |
| `INI`      | `ini`      |
| `CU`       | `cu`       |
| `M`        | `m`        |
| `A-A`      | `a`        |
| `R`        | `r`        |
| `Aa`       | `aa`       |
| `Ra`       | `ra`       |
| `D`        | `d`        |
| `SP`       | `sp`       |
| `×-A`      | `first-a`  |
| `A-×`      | `a-last`   |
| `☆-A`      | `start-a`  |
| `A-☆`      | `a-finish` |
| `○-○`      | `any`      |

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
