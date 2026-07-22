# データID管理方針

スキル、タイミング、アイテムのID生成方針を扱う。

## 10. データID管理方針

### 10.1 基本方針

スキル、アイテムなどの構造化データにはIDを持たせる。

初期スコープの静的ルールサイトでは、スキルとアイテムのIDは変換済み名称のhashから自動生成する。Excel上のID列は使わない。

行の途中挿入と並び替えだけでは、スキルID、アイテムID、個別アンカーを変更しない。カテゴリ、タイミング、所属、種別など、IDの接頭辞または分類キーに使う入力値を変更した場合はID変更を許可する。

将来、キャラクターシート機能がスキルIDと取得レベルをDBなどの永続ストレージへ保存する場合は、同一スキルのID変更を検出してエラーにする仕組みを別タスクで設計・実装する。それまでは、IDの永続性をExcel入力で保証しない。

### 10.2 名称hashの生成規則

`nameHash`は、trimおよびLF正規化後の名称をUTF-8でSHA-256化したhex文字列の先頭12文字とする。入力順や`sourceOrder`を含めない。

`nameHash`を使うIDではsuffixを付けて衝突を解決しない。重複の検証単位は、各データ種別のID生成規則に従う。

### 10.3 スキルID生成ルール

スキルIDは所属種別を含む次の形式とする。

```text
skill-common-{category}-{timing}-{nameHash}
skill-ryugi-{ryugiId}-{category}-{timing}-{nameHash}
skill-ikizama-{ikizamaId}-{category}-{timing}-{nameHash}
```

- `skill`: スキルデータであることを示す
- `common`、`ryugi`、`ikizama`: 所属種別を示す
- `{ryugiId}`、`{ikizamaId}`: 流儀・生き様スキルの所属ID
- `{category}`: bonus / basic / advanced などの分類
- `{timing}`: タイミングをID用に正規化した値
- `{nameHash}`: [名称hashの生成規則](#102-名称hashの生成規則)に従う名称hash

攻撃タイミングの実表記9通りは、いずれもID上では `a` とする。

複数タイミングを `/` で連結したスキルは許可する。ID用のタイミングは、構成要素を
タイミング正規化表の順に並べて正規化し、`_`で連結する。たとえば `Aa/Ra` と `Ra/Aa` は、
どちらも `aa_ra` とする。

同じID接頭辞内では、名称および`nameHash`の重複を変換エラーにする。Excel入力順はIDではなく`sourceOrder`として保持する。

### 10.4 タイミング正規化規則

| ルール上のタイミング | ID用  |
| -------------------- | ----- |
| `Pv`                 | `pv`  |
| `SU`                 | `su`  |
| `INI`                | `ini` |
| `CU`                 | `cu`  |
| `M`                  | `m`   |
| `○-○`                | `a`   |
| `○-×`                | `a`   |
| `○-☆`                | `a`   |
| `×-○`                | `a`   |
| `×-×`                | `a`   |
| `×-☆`                | `a`   |
| `☆-○`                | `a`   |
| `☆-×`                | `a`   |
| `☆-☆`                | `a`   |
| `R`                  | `r`   |
| `Aa`                 | `aa`  |
| `Ra`                 | `ra`  |
| `D`                  | `d`   |
| `SP`                 | `sp`  |

### 10.5 アイテムID生成ルール

アイテムIDは、アイテム種別ごとに定義する。

アイテムIDは、名称hashを含む次の形式とする。

```text
item-weapon-{group}-{checkKey}-{nameHash}
item-armor-{nameHash}
item-omamori-{nameHash}
item-cybernetics-{part}-{nameHash}
item-nanomachine-{nameHash}
item-drug-{timing}-{nameHash}
```

`{nameHash}`は[名称hashの生成規則](#102-名称hashの生成規則)に従う。`{checkKey}`、`{part}`、`{timing}`の正規化規則は、該当する `docs/conversion/*.md` に記載する。

同一の正規化済み名称は、ID名前空間ごとにだけ重複を拒否する。武器の名前空間は`group`と`checkKey`の組、ほかの種別の名前空間は種別ごととする。したがって、異なる種別、または異なる武器名前空間にある同名Itemは許可する。

異なる正規化済み名称が同じ`nameHash`になる衝突は全Itemで拒否する。完成したItem IDも全Itemで一意でなければならない。

---
