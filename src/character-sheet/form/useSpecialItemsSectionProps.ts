import { type RefObject, useCallback, useMemo } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";

import type { SpecialItemsSectionProps } from "../components/SpecialItemsSection";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
  type SpecialItemCategoryId,
} from "../form-values";
import {
  calculateSpecialItemCredit,
  getMaximumNanomachineMentalCost,
  getVisibleSpecialItemCategories,
  updateCategoriesForIkizamaChange,
} from "../logic/special-items";
import { getCyberneticById } from "../master-data/cybernetics";
import { getDrugById } from "../master-data/drugs";
import { getNanomachineById } from "../master-data/nanomachines";
import { getOmamoriById } from "../master-data/omamori";
import {
  getIkizamaExclusiveItemCategory,
  getIkizamaName,
} from "../master-data/special-items";
import { getArmorById, getWeaponById } from "../master-data/weapons-and-armor";

type Options = {
  onCategoryRemoved?: (category: SpecialItemCategoryId) => void;
  onRemoveRequested?: (
    category: SpecialItemCategoryId,
    trigger: HTMLButtonElement,
    applyRemoval: () => void,
  ) => void;
  shouldSynchronizeCyberneticsRef?: RefObject<boolean>;
};

const fixedPartKeys = ["head", "torso", "arm", "leg"] as const;

function hasCategoryContent(
  category: SpecialItemCategoryId,
  values: CharacterSheetFormValues,
): boolean {
  switch (category) {
    case "omamori":
      return values.omamori.rows.some((row) => row.omamoriId !== null);
    case "cybernetics":
      return (
        values.cybernetics.headId !== null ||
        values.cybernetics.torsoId !== null ||
        values.cybernetics.armId !== null ||
        values.cybernetics.legId !== null ||
        values.cybernetics.implantLimitModifier !== 0 ||
        values.cybernetics.implantTotalModifier !== 0 ||
        values.cybernetics.otherRows.some((row) => row.cyberneticId !== null)
      );
    case "nanomachines":
      return (
        values.nanomachines.headId !== null ||
        values.nanomachines.torsoId !== null ||
        values.nanomachines.armId !== null ||
        values.nanomachines.legId !== null ||
        values.nanomachines.implantLimitModifier !== 0 ||
        values.nanomachines.implantTotalModifier !== 0
      );
    case "drugs":
      return values.drugs.rows.some((row) => row.drugId !== null);
  }
}

/** Owns serializable special-item category visibility and its derived values. */
export default function useSpecialItemsSectionProps(
  { control, getValues, setValue }: UseFormReturn<CharacterSheetFormValues>,
  {
    onCategoryRemoved,
    onRemoveRequested,
    shouldSynchronizeCyberneticsRef,
  }: Options = {},
): {
  maximumHealthBonus: number;
  sectionProps: SpecialItemsSectionProps;
  spentCredit: number;
  updateForIkizamaChange: (nextIkizamaId: string | null) => void;
} {
  const build = useWatch({ control, name: "build" });
  const specialItems = useWatch({ control, name: "specialItems" });
  const armor = useWatch({ control, name: "armor" });
  const weapons = useWatch({ control, name: "weapons" });
  const omamori = useWatch({ control, name: "omamori" });
  const cybernetics = useWatch({ control, name: "cybernetics" });
  const nanomachines = useWatch({ control, name: "nanomachines" });
  const drugs = useWatch({ control, name: "drugs" });
  const exclusiveCategory = useMemo(
    () => getIkizamaExclusiveItemCategory(build.ikizamaId),
    [build.ikizamaId],
  );
  const ikizamaName = useMemo(
    () => getIkizamaName(build.ikizamaId),
    [build.ikizamaId],
  );
  const visibleCategories = useMemo(
    () =>
      getVisibleSpecialItemCategories(
        exclusiveCategory,
        specialItems.categories,
      ),
    [exclusiveCategory, specialItems.categories],
  );
  const maximumHealthBonus = useMemo(() => {
    if (build.ikizamaId !== "sumi") return 0;
    return getMaximumNanomachineMentalCost(
      fixedPartKeys.map(
        (part) =>
          getNanomachineById(nanomachines[`${part}Id`])?.activationMentalCost ??
          null,
      ),
    );
  }, [build.ikizamaId, nanomachines]);
  const spentCredit = useMemo(
    () =>
      calculateSpecialItemCredit({
        armorCredit: getArmorById(armor.armorId)?.credit ?? null,
        cybernetics: [
          ...fixedPartKeys.map(
            (part) =>
              getCyberneticById(cybernetics[`${part}Id`])?.credit ?? null,
          ),
          ...cybernetics.otherRows.map(
            (row) => getCyberneticById(row.cyberneticId)?.credit ?? null,
          ),
        ],
        drugs: drugs.rows.map((row) => ({
          credit: getDrugById(row.drugId)?.credit ?? null,
          quantity: row.quantity,
        })),
        nanomachines: fixedPartKeys.map(
          (part) =>
            getNanomachineById(nanomachines[`${part}Id`])?.credit ?? null,
        ),
        omamori: omamori.rows.map(
          (row) => getOmamoriById(row.omamoriId)?.credit ?? null,
        ),
        weapons: weapons.rows.map(
          (row) => getWeaponById(row.weaponId)?.credit ?? null,
        ),
      }),
    [armor, cybernetics, drugs, nanomachines, omamori, weapons],
  );

  const removeCategory = useCallback(
    function removeCategory(category: SpecialItemCategoryId): void {
      const values = getValues();
      setValue(
        "specialItems.categories",
        values.specialItems.categories.filter((item) => item !== category),
        { shouldDirty: true, shouldValidate: true },
      );
      switch (category) {
        case "omamori":
          setValue(
            "omamori",
            { rows: [] },
            { shouldDirty: true, shouldValidate: true },
          );
          break;
        case "cybernetics":
          if (
            shouldSynchronizeCyberneticsRef !== undefined &&
            hasCategoryContent(category, values)
          ) {
            shouldSynchronizeCyberneticsRef.current = true;
          }
          setValue(
            "cybernetics",
            {
              ...characterSheetDefaultValues.cybernetics,
              otherRows: characterSheetDefaultValues.cybernetics.otherRows.map(
                (row) => ({ ...row }),
              ),
            },
            { shouldDirty: true, shouldValidate: true },
          );
          break;
        case "nanomachines":
          setValue(
            "nanomachines",
            { ...characterSheetDefaultValues.nanomachines },
            { shouldDirty: true, shouldValidate: true },
          );
          break;
        case "drugs":
          setValue(
            "drugs",
            {
              rows: characterSheetDefaultValues.drugs.rows.map((row) => ({
                ...row,
              })),
            },
            { shouldDirty: true, shouldValidate: true },
          );
          break;
      }
    },
    [getValues, setValue, shouldSynchronizeCyberneticsRef],
  );
  const onAddCategory = useCallback(
    (category: SpecialItemCategoryId) => {
      const categories = getValues("specialItems.categories");
      if (!categories.includes(category)) {
        setValue("specialItems.categories", [...categories, category], {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    },
    [getValues, setValue],
  );
  const onRemoveCategory = useCallback(
    (category: SpecialItemCategoryId, trigger: HTMLButtonElement) => {
      const applyRemoval = () => {
        removeCategory(category);
        onCategoryRemoved?.(category);
      };
      if (hasCategoryContent(category, getValues())) {
        onRemoveRequested?.(category, trigger, applyRemoval);
        return;
      }
      applyRemoval();
    },
    [getValues, onCategoryRemoved, onRemoveRequested, removeCategory],
  );
  const updateForIkizamaChange = useCallback(
    (nextIkizamaId: string | null) => {
      const nextExclusiveCategory =
        getIkizamaExclusiveItemCategory(nextIkizamaId);
      const categories = getValues("specialItems.categories");
      setValue(
        "specialItems.categories",
        updateCategoriesForIkizamaChange(
          categories,
          getIkizamaExclusiveItemCategory(getValues("build.ikizamaId")),
          nextExclusiveCategory,
        ),
        { shouldDirty: true, shouldValidate: true },
      );
    },
    [getValues, setValue],
  );
  const sectionProps = useMemo(
    () => ({
      exclusiveCategory,
      ikizamaName,
      onAddCategory,
      onRemoveCategory,
      visibleCategories,
    }),
    [
      exclusiveCategory,
      ikizamaName,
      onAddCategory,
      onRemoveCategory,
      visibleCategories,
    ],
  );
  const presenterState = useMemo(
    () => ({
      maximumHealthBonus,
      sectionProps,
      spentCredit,
      updateForIkizamaChange,
    }),
    [maximumHealthBonus, sectionProps, spentCredit, updateForIkizamaChange],
  );

  return presenterState;
}
