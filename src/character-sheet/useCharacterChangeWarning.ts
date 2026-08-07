import { type RefObject, useCallback, useMemo, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { CharacterChangeWarningDialogsProps } from "./components/CharacterChangeWarningDialogs";
import { characterSheetDictionary } from "./dictionary";
import type {
  CharacterSheetFormValues,
  SpecialItemCategoryId,
} from "./form-values";

type CharacterChangeWarningOperations = {
  clearIkizamaSkills: () => void;
  clearOtherRyugiSkills: (rowId: string) => void;
  clearPrimaryRyugiSkills: () => void;
  removeOtherRyugiSkills: (rowId: string) => void;
};

type UseCharacterChangeWarningArgs = {
  form: UseFormReturn<CharacterSheetFormValues>;
};

const initialOperations: CharacterChangeWarningOperations = {
  clearIkizamaSkills: () => {},
  clearOtherRyugiSkills: () => {},
  clearPrimaryRyugiSkills: () => {},
  removeOtherRyugiSkills: () => {},
};

/** Coordinates confirmations before a character change removes dependent data. */
export default function useCharacterChangeWarning({
  form,
}: UseCharacterChangeWarningArgs) {
  const operationsRef =
    useRef<CharacterChangeWarningOperations>(initialOperations);
  const primaryRyugi = usePrimaryRyugiChangeWarning({ form, operationsRef });
  const ikizama = useIkizamaChangeWarning({ form, operationsRef });
  const otherRyugiChange = useOtherRyugiChangeWarning({ form, operationsRef });
  const otherRyugiRemove = useOtherRyugiRemoveWarning({ form, operationsRef });
  const specialItemCategory = useSpecialItemCategoryRemoveWarning();
  const bindPresenterOperations = useCallback(
    (operations: CharacterChangeWarningOperations) => {
      operationsRef.current = operations;
    },
    [],
  );
  const presenterOptions = useMemo(
    () => ({
      onIkizamaChangeRequested: ikizama.request,
      onOtherRyugiChangeRequested: otherRyugiChange.request,
      onOtherRyugiRemoveRequested: otherRyugiRemove.request,
      onPrimaryRyugiChangeRequested: primaryRyugi.request,
      onSpecialItemCategoryRemoved: specialItemCategory.onRemoved,
      onSpecialItemCategoryRemoveRequested: specialItemCategory.request,
      otherRyugiAddButtonRef: otherRyugiRemove.otherRyugiAddButtonRef,
    }),
    [
      ikizama.request,
      otherRyugiChange.request,
      otherRyugiRemove.otherRyugiAddButtonRef,
      otherRyugiRemove.request,
      primaryRyugi.request,
      specialItemCategory.onRemoved,
      specialItemCategory.request,
    ],
  );
  const dialogsProps = useMemo<CharacterChangeWarningDialogsProps>(
    () => ({
      ikizama: {
        confirmation:
          characterSheetDictionary.characterSheet.skills
            .skillSelectionChangeConfirmation,
        dialogLabel:
          characterSheetDictionary.characterSheet.skills
            .ikizamaChangeConfirmationLabel,
        isOpen: ikizama.isOpen,
        onConfirm: ikizama.confirm,
        onRequestClose: ikizama.close,
        returnFocusRef: ikizama.triggerRef,
      },
      otherRyugiChange: {
        confirmation:
          characterSheetDictionary.characterSheet.skills
            .skillSelectionChangeConfirmation,
        dialogLabel:
          characterSheetDictionary.characterSheet.skills
            .otherRyugiChangeConfirmationLabel,
        isOpen: otherRyugiChange.isOpen,
        onConfirm: otherRyugiChange.confirm,
        onRequestClose: otherRyugiChange.close,
        returnFocusRef: otherRyugiChange.triggerRef,
      },
      otherRyugiRemove: {
        confirmLabel: characterSheetDictionary.general.delete,
        confirmation:
          characterSheetDictionary.characterSheet.skills
            .otherRyugiRemoveConfirmation,
        dialogLabel:
          characterSheetDictionary.characterSheet.skills
            .otherRyugiRemoveConfirmationLabel,
        isOpen: otherRyugiRemove.isOpen,
        onConfirm: otherRyugiRemove.confirm,
        onRequestClose: otherRyugiRemove.close,
        returnFocusRef: otherRyugiRemove.triggerRef,
      },
      primaryRyugi: {
        confirmation:
          characterSheetDictionary.characterSheet.skills
            .skillSelectionChangeConfirmation,
        dialogLabel:
          characterSheetDictionary.characterSheet.skills
            .primaryRyugiChangeConfirmationLabel,
        isOpen: primaryRyugi.isOpen,
        onConfirm: primaryRyugi.confirm,
        onRequestClose: primaryRyugi.close,
        returnFocusRef: primaryRyugi.triggerRef,
      },
      specialItemCategory: {
        category: specialItemCategory.category,
        isOpen: specialItemCategory.category !== null,
        onConfirm: specialItemCategory.confirm,
        onRequestClose: specialItemCategory.close,
        returnFocusRef: specialItemCategory.triggerRef,
      },
    }),
    [
      ikizama.close,
      ikizama.confirm,
      ikizama.isOpen,
      ikizama.triggerRef,
      otherRyugiChange.close,
      otherRyugiChange.confirm,
      otherRyugiChange.isOpen,
      otherRyugiChange.triggerRef,
      otherRyugiRemove.close,
      otherRyugiRemove.confirm,
      otherRyugiRemove.isOpen,
      otherRyugiRemove.triggerRef,
      primaryRyugi.close,
      primaryRyugi.confirm,
      primaryRyugi.isOpen,
      primaryRyugi.triggerRef,
      specialItemCategory.category,
      specialItemCategory.close,
      specialItemCategory.confirm,
      specialItemCategory.triggerRef,
    ],
  );

  return useMemo(
    () => ({ bindPresenterOperations, dialogsProps, presenterOptions }),
    [bindPresenterOperations, dialogsProps, presenterOptions],
  );
}

function usePrimaryRyugiChangeWarning({
  form,
  operationsRef,
}: {
  form: UseFormReturn<CharacterSheetFormValues>;
  operationsRef: RefObject<CharacterChangeWarningOperations>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pendingApplyRef = useRef<(() => void) | null>(null);
  const triggerRef = useRef<HTMLSelectElement>(null);
  const close = useCallback(() => {
    pendingApplyRef.current = null;
    setIsOpen(false);
  }, []);
  const confirm = useCallback(() => {
    operationsRef.current.clearPrimaryRyugiSkills();
    pendingApplyRef.current?.();
    pendingApplyRef.current = null;
    setIsOpen(false);
  }, [operationsRef]);
  const request = useCallback(
    (
      primaryRyugiId: string | null,
      trigger: HTMLSelectElement,
      applyChange: () => void,
    ) => {
      const currentPrimaryRyugiId = form.getValues("build.primaryRyugiId");
      const hasSelectedSkill = form
        .getValues("primarySkills.rows")
        .some((row) => row.skillId !== null);
      if (primaryRyugiId === currentPrimaryRyugiId || !hasSelectedSkill) {
        applyChange();
        return;
      }
      triggerRef.current = trigger;
      pendingApplyRef.current = applyChange;
      setIsOpen(true);
    },
    [form],
  );

  return useMemo(
    () => ({ close, confirm, isOpen, request, triggerRef }),
    [close, confirm, isOpen, request],
  );
}

function useIkizamaChangeWarning({
  form,
  operationsRef,
}: {
  form: UseFormReturn<CharacterSheetFormValues>;
  operationsRef: RefObject<CharacterChangeWarningOperations>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pendingApplyRef = useRef<(() => void) | null>(null);
  const triggerRef = useRef<HTMLSelectElement>(null);
  const close = useCallback(() => {
    pendingApplyRef.current = null;
    setIsOpen(false);
  }, []);
  const confirm = useCallback(() => {
    operationsRef.current.clearIkizamaSkills();
    pendingApplyRef.current?.();
    pendingApplyRef.current = null;
    setIsOpen(false);
  }, [operationsRef]);
  const request = useCallback(
    (
      ikizamaId: string | null,
      trigger: HTMLSelectElement,
      applyChange: () => void,
    ) => {
      const currentIkizamaId = form.getValues("build.ikizamaId");
      const hasSelectedSkill = form
        .getValues("ikizamaSkills.rows")
        .some((row) => row.skillId !== null);
      if (ikizamaId === currentIkizamaId || !hasSelectedSkill) {
        applyChange();
        return;
      }
      triggerRef.current = trigger;
      pendingApplyRef.current = applyChange;
      setIsOpen(true);
    },
    [form],
  );

  return useMemo(
    () => ({ close, confirm, isOpen, request, triggerRef }),
    [close, confirm, isOpen, request],
  );
}

function useOtherRyugiChangeWarning({
  form,
  operationsRef,
}: {
  form: UseFormReturn<CharacterSheetFormValues>;
  operationsRef: RefObject<CharacterChangeWarningOperations>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pendingApplyRef = useRef<(() => void) | null>(null);
  const triggerRef = useRef<HTMLSelectElement>(null);
  const close = useCallback(() => {
    pendingApplyRef.current = null;
    setIsOpen(false);
  }, []);
  const confirm = useCallback(() => {
    pendingApplyRef.current?.();
    pendingApplyRef.current = null;
    setIsOpen(false);
  }, []);
  const request = useCallback(
    (
      rowId: string,
      ryugiId: string | null,
      trigger: HTMLSelectElement,
      applyChange: () => void,
    ) => {
      const currentRyugiId = form
        .getValues("build.otherRyugi")
        .find((row) => row.rowId === rowId)?.ryugiId;
      if (ryugiId === currentRyugiId) {
        applyChange();
        return;
      }
      const applyClearAndChange = () => {
        operationsRef.current.clearOtherRyugiSkills(rowId);
        applyChange();
      };
      const hasSelectedSkill = form
        .getValues("otherRyugiSkills.rows")
        .some((row) => row.ryugiRowId === rowId && row.skillId !== null);
      if (!hasSelectedSkill) {
        applyClearAndChange();
        return;
      }
      triggerRef.current = trigger;
      pendingApplyRef.current = applyClearAndChange;
      setIsOpen(true);
    },
    [form, operationsRef],
  );

  return useMemo(
    () => ({ close, confirm, isOpen, request, triggerRef }),
    [close, confirm, isOpen, request],
  );
}

function useOtherRyugiRemoveWarning({
  form,
  operationsRef,
}: {
  form: UseFormReturn<CharacterSheetFormValues>;
  operationsRef: RefObject<CharacterChangeWarningOperations>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pendingApplyRef = useRef<(() => void) | null>(null);
  const pendingRowIdRef = useRef<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const otherRyugiAddButtonRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    pendingApplyRef.current = null;
    pendingRowIdRef.current = null;
    setIsOpen(false);
  }, []);
  const confirm = useCallback(() => {
    const rowId = pendingRowIdRef.current;
    if (rowId !== null) operationsRef.current.removeOtherRyugiSkills(rowId);
    pendingApplyRef.current?.();
    pendingApplyRef.current = null;
    pendingRowIdRef.current = null;
    triggerRef.current = otherRyugiAddButtonRef.current;
    setIsOpen(false);
  }, [operationsRef]);
  const request = useCallback(
    (rowId: string, trigger: HTMLButtonElement, applyChange: () => void) => {
      const applyRemoveAndChange = () => {
        operationsRef.current.removeOtherRyugiSkills(rowId);
        applyChange();
      };
      const hasSelectedSkill = form
        .getValues("otherRyugiSkills.rows")
        .some((row) => row.ryugiRowId === rowId && row.skillId !== null);
      if (!hasSelectedSkill) {
        applyRemoveAndChange();
        return;
      }
      triggerRef.current = trigger;
      pendingApplyRef.current = applyChange;
      pendingRowIdRef.current = rowId;
      setIsOpen(true);
    },
    [form, operationsRef],
  );

  return useMemo(
    () => ({
      close,
      confirm,
      isOpen,
      otherRyugiAddButtonRef,
      request,
      triggerRef,
    }),
    [close, confirm, isOpen, request],
  );
}

function useSpecialItemCategoryRemoveWarning() {
  const [category, setCategory] = useState<SpecialItemCategoryId | null>(null);
  const pendingApplyRef = useRef<(() => void) | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    pendingApplyRef.current = null;
    setCategory(null);
  }, []);
  const confirm = useCallback(() => {
    pendingApplyRef.current?.();
    pendingApplyRef.current = null;
    setCategory(null);
  }, []);
  const request = useCallback(
    (
      nextCategory: SpecialItemCategoryId,
      trigger: HTMLButtonElement,
      applyRemoval: () => void,
    ) => {
      triggerRef.current = trigger;
      pendingApplyRef.current = applyRemoval;
      setCategory(nextCategory);
    },
    [],
  );
  const onRemoved = useCallback((removedCategory: SpecialItemCategoryId) => {
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLButtonElement>(
          `[data-special-item-category-add="${removedCategory}"]`,
        )
        ?.focus();
    });
  }, []);

  return useMemo(
    () => ({ category, close, confirm, onRemoved, request, triggerRef }),
    [category, close, confirm, onRemoved, request],
  );
}
