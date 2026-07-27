/**
 * Display copy for the character sheet.
 *
 * This is intentionally not an i18n catalogue. Keep the categories aligned
 * with the ownership of a term so later Gates can add copy without creating
 * competing spellings.
 */
export const characterSheetDictionary = {
  general: {
    close: "閉じる",
    closeFormulaTooltip: "計算式の説明を閉じる",
  },
  characterSheet: {
    build: {
      acquiredExperience: "取得経験点",
      addOtherRyugi: "＋ その他流儀を追加",
      attribute: "能力",
      attributeNames: {
        agility: "敏捷",
        body: "肉体",
        mind: "精神",
        perception: "感覚",
        strength: "筋力",
      },
      attributes: "能力値",
      base: "基礎",
      experience: "経験点",
      growth: "成長",
      growthPoints: "成長点",
      ikizama: "生き様",
      ikizamaAttributePoints: "生き様：能力値ポイント",
      level: "Lv",
      otherRyugi: "その他流儀",
      permanent: "常時",
      permanentModifier: "常時修正",
      points: "能力値ポイント",
      primaryRyugi: "プライマリ流儀",
      rank: "格",
      remainingExperience: "残経験点",
      remove: "を削除",
      ryugiAndIkizama: "流儀・生き様",
      spentExperience: "消費経験点",
      temporary: "一時",
      temporaryModifier: "一時修正",
      unselected: "未選択",
    },
    image: {
      chooseFile: "画像を選択",
      chooseFileOrDrop: "画像を選択またはドロップ",
      clearFile: "画像をクリア",
      clearing: "画像をクリアしています",
      description: "画像をここへドラッグ＆ドロップ",
      errorTitle: "画像を処理できませんでした",
      errors: {
        decode:
          "画像を読み込めませんでした。別の画像ファイルを選択してください。",
        fileTooLarge: "画像ファイルは最大5MBまでです。",
        invalidType: "画像ファイルを選択してください。",
        restore: "保存済みの画像を復元できませんでした。",
        storage: "画像を保存できませんでした。もう一度お試しください。",
      },
      limit: "最大5MBまで",
      loading: "画像を処理しています",
      preview: "選択したキャラクター画像",
      replaceFile: "画像を差し替え",
      replaceFileOrDrop: "画像を差し替えまたはドロップ",
    },
    profile: {
      age: "年齢",
      gender: "性別",
      nickname: "二つ名",
      setting: "設定",
    },
    sections: {
      basicInformation: "基本情報",
      build: "流儀・生き様 / 能力値",
      weaponsAndArmor: "武器・防具",
    },
  },
  gameDomain: {
    terms: {
      bonds: "縁",
      checks: "判定",
      credit: {
        acquired: "取得信用",
        change: "小銭",
        changeAdjustment: "小銭修正",
        consumed: "消費信用",
        formulas: {
          change: "合計信用 - 消費信用 + 小銭修正",
          consumed:
            "選択した全アイテムの信用の合計（ドラッグは信用 × 所持セット数）",
          total: "取得信用 + 融通された信用 - 融通した信用",
        },
        name: "信用",
        provided: "融通した",
        received: "融通された",
        total: "合計信用",
      },
      pcName: "PC名",
      playerName: "PL名",
      skills: "スキル",
      ikizamaSpecialItems: "生き様専用アイテム",
    },
  },
} as const;
