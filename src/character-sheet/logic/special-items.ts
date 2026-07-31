import type { SpecialItemCategoryId } from "../form-values";

export function getVisibleSpecialItemCategories(
  exclusiveCategory: SpecialItemCategoryId | null,
  addedCategories: readonly SpecialItemCategoryId[],
): readonly SpecialItemCategoryId[] {
  const additional = addedCategories.filter(
    (category) => category !== exclusiveCategory,
  );
  return exclusiveCategory === null
    ? additional
    : [exclusiveCategory, ...additional];
}

export function updateCategoriesForIkizamaChange(
  categories: readonly SpecialItemCategoryId[],
  previousExclusiveCategory: SpecialItemCategoryId | null,
  nextExclusiveCategory: SpecialItemCategoryId | null,
): SpecialItemCategoryId[] {
  const withoutNext = categories.filter(
    (category) => category !== nextExclusiveCategory,
  );
  if (
    previousExclusiveCategory !== null &&
    previousExclusiveCategory !== nextExclusiveCategory
  ) {
    return [
      previousExclusiveCategory,
      ...withoutNext.filter(
        (category) => category !== previousExclusiveCategory,
      ),
    ];
  }
  return withoutNext;
}

export function calculateSpecialItemCredit({
  armorCredit,
  cybernetics,
  drugs,
  nanomachines,
  omamori,
  weapons,
}: {
  armorCredit: number | null;
  cybernetics: readonly (number | null)[];
  drugs: readonly { credit: number | null; quantity: number }[];
  nanomachines: readonly (number | null)[];
  omamori: readonly (number | null)[];
  weapons: readonly (number | null)[];
}): number {
  const sum = (values: readonly (number | null)[]) =>
    values.reduce<number>((total, value) => total + (value ?? 0), 0);
  return (
    (armorCredit ?? 0) +
    sum(weapons) +
    sum(omamori) +
    sum(cybernetics) +
    sum(nanomachines) +
    drugs.reduce((total, drug) => total + (drug.credit ?? 0) * drug.quantity, 0)
  );
}

export function getMaximumNanomachineMentalCost(
  values: readonly (number | null)[],
): number {
  return Math.max(0, ...values.map((value) => value ?? 0));
}
