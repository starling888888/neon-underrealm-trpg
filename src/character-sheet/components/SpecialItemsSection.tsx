import type { ReactNode } from "react";

import { characterSheetDictionary } from "../dictionary";
import {
  type SpecialItemCategoryId,
  specialItemCategoryIds,
} from "../form-values";
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
export default function SpecialItemsSection({
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
              isUnavailable={!isExclusive && exclusiveCategory !== null}
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
            <button
              className={styles.addButton}
              key={category}
              onClick={() => onAddCategory(category)}
              type="button"
            >
              {categoryNames[category]}を追加
            </button>
          ))}
      </div>
    </div>
  );
}
