import { memo, type ReactNode } from "react";

import { characterSheetDictionary } from "../../dictionary";
import {
  type SpecialItemCategoryId,
  specialItemCategoryIds,
} from "../../form/values";
import CharacterSheetButton from "../_common/CharacterSheetButton";
import SpecialItemCategorySection from "./SpecialItemCategorySection";
import styles from "./SpecialItemsSection.module.css";

export type SpecialItemsSectionProps = {
  exclusiveCategory: SpecialItemCategoryId | null;
  ikizamaName: string | null;
  onAddCategory: (category: SpecialItemCategoryId) => void;
  onRemoveCategory: (
    category: SpecialItemCategoryId,
    trigger: HTMLButtonElement,
  ) => void;
  visibleCategories: readonly SpecialItemCategoryId[];
};

type Props = SpecialItemsSectionProps & {
  categories: Record<SpecialItemCategoryId, ReactNode>;
};

const categoryNames: Record<SpecialItemCategoryId, string> = {
  cybernetics: "サイバネ",
  drugs: "ドラッグ",
  nanomachines: "ナノマシン",
  omamori: "お守り",
};

/** Presents category visibility and warnings around the existing item sections. */
function SpecialItemsSection({
  categories,
  exclusiveCategory,
  ikizamaName,
  onAddCategory,
  onRemoveCategory,
  visibleCategories,
}: Props) {
  const unavailableWarning =
    ikizamaName === null ? undefined : `${ikizamaName}では通常使用不可`;

  return (
    <div className={styles.section} data-special-items-section>
      {exclusiveCategory === null ? (
        <p className={styles.guidance}>
          {characterSheetDictionary.characterSheet.skills.selectIkizama}
        </p>
      ) : null}
      <div className={styles.categories}>
        {visibleCategories.map((category) => {
          const isExclusive = category === exclusiveCategory;
          return (
            <SpecialItemCategorySection
              id={category}
              isUnavailable={!isExclusive}
              key={category}
              onRemove={
                isExclusive
                  ? undefined
                  : (trigger) => onRemoveCategory(category, trigger)
              }
              title={categoryNames[category]}
              warning={
                !isExclusive && exclusiveCategory !== null
                  ? unavailableWarning
                  : undefined
              }
            >
              {categories[category]}
            </SpecialItemCategorySection>
          );
        })}
      </div>
      <div className={styles.addCategories}>
        {specialItemCategoryIds
          .filter((category) => !visibleCategories.includes(category))
          .map((category) => (
            <CharacterSheetButton
              color="warning"
              data-special-item-category-add={category}
              key={category}
              onClick={() => onAddCategory(category)}
              size="medium"
            >
              {categoryNames[category]}を追加
            </CharacterSheetButton>
          ))}
      </div>
    </div>
  );
}

export default memo(SpecialItemsSection);
