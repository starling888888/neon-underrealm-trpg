import { useCallback, useMemo, useRef, useState } from "react";
import styles from "./CharacterSheetContainer.module.css";
import ActionPaneDialogs from "./components/ActionPaneDialogs";
import CharacterSheetActionPane from "./components/CharacterSheetActionPane";
import CharacterSheetFormPresenter, {
  type CharacterSheetFormPresenterProps,
} from "./components/CharacterSheetFormPresenter";
import CharacterSheetLoadingOverlay from "./components/CharacterSheetLoadingOverlay";
import CharacterImageErrorDialog from "./components/dialogs/CharacterImageErrorDialog";
import CharacterSheetRestoreErrorDialog from "./components/dialogs/CharacterSheetRestoreErrorDialog";
import SkillSelectionChangeConfirmDialog from "./components/dialogs/SkillSelectionChangeConfirmDialog";
import SpecialItemCategoryRemoveConfirmDialog from "./components/dialogs/SpecialItemCategoryRemoveConfirmDialog";
import PickerDialogs from "./components/PickerDialogs";
import { characterSheetDictionary } from "./dictionary";
import useCharacterSheetFormPresenterProps from "./form/useCharacterSheetFormPresenterProps";
import type { SpecialItemCategoryId } from "./form-values";
import { serializeCcfoliaCharacterClipboardData } from "./logic/ccfolia";
import useActionPane from "./useActionPane";
import useCharacterSheetRootState from "./useCharacterSheetRootState";
import usePickerStates from "./usePickerStates";
import usePickers from "./usePickers";

/**
 * React Island root and orchestration boundary for the character sheet.
 *
 * It owns form state and cross-cutting UI state. Form layout belongs to the
 * presenter; dialogs that need root-level coordination are added as direct
 * siblings of that presenter in later Gates.
 */
export default function CharacterSheetContainer() {
  const rootState = useCharacterSheetRootState();
  const [isPrimaryRyugiChangeConfirmOpen, setIsPrimaryRyugiChangeConfirmOpen] =
    useState(false);
  const [isIkizamaChangeConfirmOpen, setIsIkizamaChangeConfirmOpen] =
    useState(false);
  const [isOtherRyugiChangeConfirmOpen, setIsOtherRyugiChangeConfirmOpen] =
    useState(false);
  const [isOtherRyugiRemoveConfirmOpen, setIsOtherRyugiRemoveConfirmOpen] =
    useState(false);
  const [specialItemCategoryToRemove, setSpecialItemCategoryToRemove] =
    useState<SpecialItemCategoryId | null>(null);
  const primaryRyugiChangeTriggerRef = useRef<HTMLSelectElement>(null);
  const ikizamaChangeTriggerRef = useRef<HTMLSelectElement>(null);
  const otherRyugiChangeTriggerRef = useRef<HTMLSelectElement>(null);
  const otherRyugiRemoveTriggerRef = useRef<HTMLButtonElement>(null);
  const otherRyugiAddButtonRef = useRef<HTMLButtonElement>(null);
  const specialItemCategoryRemoveTriggerRef = useRef<HTMLButtonElement>(null);
  const pendingPrimaryRyugiChangeRef = useRef<(() => void) | null>(null);
  const pendingIkizamaChangeRef = useRef<(() => void) | null>(null);
  const pendingOtherRyugiChangeRef = useRef<(() => void) | null>(null);
  const pendingOtherRyugiRemoveRef = useRef<(() => void) | null>(null);
  const pendingSpecialItemCategoryRemoveRef = useRef<(() => void) | null>(null);
  const clearOtherRyugiSkillsRef = useRef<(rowId: string) => void>(() => {});
  const removeOtherRyugiSkillsRef = useRef<(rowId: string) => void>(() => {});
  const form = rootState.form;
  const formResetKey = rootState.formResetVersion;
  const pickerStates = usePickerStates();
  const imageState = useMemo(
    () => ({
      characterImage: rootState.characterImage,
      isRootOperationInProgress: rootState.isRootOperationInProgress,
      onCharacterImageCleared: rootState.onCharacterImageCleared,
      onCharacterImageOperationStarted:
        rootState.onCharacterImageOperationStarted,
      onCharacterImageSelected: rootState.onCharacterImageSelected,
    }),
    [
      rootState.characterImage,
      rootState.isRootOperationInProgress,
      rootState.onCharacterImageCleared,
      rootState.onCharacterImageOperationStarted,
      rootState.onCharacterImageSelected,
    ],
  );
  const onIkizamaChangeRequested = useCallback(
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
      ikizamaChangeTriggerRef.current = trigger;
      pendingIkizamaChangeRef.current = applyChange;
      setIsIkizamaChangeConfirmOpen(true);
    },
    [form],
  );
  const onPrimaryRyugiChangeRequested = useCallback(
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
      primaryRyugiChangeTriggerRef.current = trigger;
      pendingPrimaryRyugiChangeRef.current = applyChange;
      setIsPrimaryRyugiChangeConfirmOpen(true);
    },
    [form],
  );
  const onOtherRyugiChangeRequested = useCallback(
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
      const hasSelectedSkill = form
        .getValues("otherRyugiSkills.rows")
        .some((row) => row.ryugiRowId === rowId && row.skillId !== null);
      const clearAndApply = () => {
        clearOtherRyugiSkillsRef.current(rowId);
        applyChange();
      };
      if (!hasSelectedSkill) {
        clearAndApply();
        return;
      }
      otherRyugiChangeTriggerRef.current = trigger;
      pendingOtherRyugiChangeRef.current = clearAndApply;
      setIsOtherRyugiChangeConfirmOpen(true);
    },
    [form],
  );
  const onOtherRyugiRemoveRequested = useCallback(
    (rowId: string, trigger: HTMLButtonElement, applyChange: () => void) => {
      const hasSelectedSkill = form
        .getValues("otherRyugiSkills.rows")
        .some((row) => row.ryugiRowId === rowId && row.skillId !== null);
      const removeAndApply = () => {
        removeOtherRyugiSkillsRef.current(rowId);
        applyChange();
      };
      if (!hasSelectedSkill) {
        removeAndApply();
        return;
      }
      otherRyugiRemoveTriggerRef.current = trigger;
      pendingOtherRyugiRemoveRef.current = removeAndApply;
      setIsOtherRyugiRemoveConfirmOpen(true);
    },
    [form],
  );
  const onSpecialItemCategoryRemoveRequested = useCallback(
    (
      category: SpecialItemCategoryId,
      trigger: HTMLButtonElement,
      applyRemoval: () => void,
    ) => {
      specialItemCategoryRemoveTriggerRef.current = trigger;
      pendingSpecialItemCategoryRemoveRef.current = applyRemoval;
      setSpecialItemCategoryToRemove(category);
    },
    [],
  );
  const onSpecialItemCategoryRemoved = useCallback(
    (category: SpecialItemCategoryId) => {
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLButtonElement>(
            `[data-special-item-category-add="${category}"]`,
          )
          ?.focus();
      });
    },
    [],
  );
  const presenterProps = useCharacterSheetFormPresenterProps(form, imageState, {
    formRestoreReturnFocusRef: rootState.formRestoreReturnFocusRef,
    onIkizamaChangeRequested,
    onPrimaryRyugiChangeRequested,
    onOtherRyugiChangeRequested,
    otherRyugiAddButtonRef,
    onOtherRyugiRemoveRequested,
    onSpecialItemCategoryRemoveRequested,
    onSpecialItemCategoryRemoved,
    ...pickerStates.requests,
  });
  clearOtherRyugiSkillsRef.current =
    presenterProps.otherRyugiSkills.clearSelection;
  removeOtherRyugiSkillsRef.current =
    presenterProps.otherRyugiSkills.removeRows;
  const pickers = usePickers({ form, pickerStates, presenterProps });
  const formPresenterProps = useMemo<CharacterSheetFormPresenterProps>(
    () => ({
      bondsSection: presenterProps.bondsSection,
      buildSection: presenterProps.buildSection,
      checksSection: presenterProps.checksSection,
      commonSkillsSection: presenterProps.commonSkillsSection,
      cyberneticsSection: presenterProps.cyberneticsSection,
      drugsSection: presenterProps.drugsSection,
      ikizamaSkillsSection: presenterProps.ikizamaSkillsSection,
      nanomachinesSection: presenterProps.nanomachinesSection,
      omamoriSection: presenterProps.omamoriSection,
      otherRyugiSkillsSection: presenterProps.otherRyugiSkillsSection,
      primarySkillsSection: presenterProps.primarySkillsSection,
      profileSection: presenterProps.profileSection,
      secondaryAttributesSection: presenterProps.secondaryAttributesSection,
      specialItemsSection: presenterProps.specialItemsSection,
      weaponsAndArmorSection: presenterProps.weaponsAndArmorSection,
    }),
    [
      presenterProps.bondsSection,
      presenterProps.buildSection,
      presenterProps.checksSection,
      presenterProps.commonSkillsSection,
      presenterProps.cyberneticsSection,
      presenterProps.drugsSection,
      presenterProps.ikizamaSkillsSection,
      presenterProps.nanomachinesSection,
      presenterProps.omamoriSection,
      presenterProps.otherRyugiSkillsSection,
      presenterProps.primarySkillsSection,
      presenterProps.profileSection,
      presenterProps.secondaryAttributesSection,
      presenterProps.specialItemsSection,
      presenterProps.weaponsAndArmorSection,
    ],
  );
  const onCcfoliaCopyConfirmed = useCallback(async () => {
    const values = form.getValues();
    const { derived } = presenterProps.secondaryAttributesSection;
    return rootState.onCcfoliaCopy(
      serializeCcfoliaCharacterClipboardData({
        actionValue: derived.actionValue,
        bondLimit: derived.bondLimit,
        bonds: values.bonds.rows,
        health: derived.health,
        mental: derived.mental,
        pcName: values.profile.pcName,
      }),
    );
  }, [
    form,
    presenterProps.secondaryAttributesSection,
    rootState.onCcfoliaCopy,
  ]);
  const actionPane = useActionPane({
    errorSummary: presenterProps.errorSummary,
    isCcfoliaCopyDisabled: rootState.isRootOperationInProgress,
    isExportDisabled: rootState.isCharacterImageRestoring,
    isImportDisabled:
      rootState.isCharacterImageRestoring ||
      rootState.isRootOperationInProgress,
    isResetDisabled:
      rootState.isCharacterImageRestoring ||
      rootState.isRootOperationInProgress,
    onCcfoliaCopyConfirmed,
    onExport: rootState.onJsonExport,
    onImport: rootState.onJsonImportRequested,
    onResetConfirmed: rootState.onResetConfirmed,
  });
  const onJsonImportConfirmed = useCallback(() => {
    void rootState.onJsonImportConfirmed();
  }, [rootState.onJsonImportConfirmed]);
  const onJsonImportErrorClose = useCallback(() => {
    rootState.setIsJsonImportErrorOpen(false);
  }, [rootState.setIsJsonImportErrorOpen]);
  const onJsonImportImageErrorClose = useCallback(() => {
    rootState.setIsJsonImportImageErrorOpen(false);
  }, [rootState.setIsJsonImportImageErrorOpen]);
  const onJsonImportPendingClose = useCallback(() => {
    rootState.setPendingJsonImport(null);
  }, [rootState.setPendingJsonImport]);

  function confirmPrimaryRyugiChange(): void {
    presenterProps.primarySkillPicker.clearSelection();
    pendingPrimaryRyugiChangeRef.current?.();
    pendingPrimaryRyugiChangeRef.current = null;
    setIsPrimaryRyugiChangeConfirmOpen(false);
  }

  function closePrimaryRyugiChangeConfirm(): void {
    pendingPrimaryRyugiChangeRef.current = null;
    setIsPrimaryRyugiChangeConfirmOpen(false);
  }

  function confirmIkizamaChange(): void {
    presenterProps.ikizamaSkillPicker.clearSelection();
    pendingIkizamaChangeRef.current?.();
    pendingIkizamaChangeRef.current = null;
    setIsIkizamaChangeConfirmOpen(false);
  }

  function closeIkizamaChangeConfirm(): void {
    pendingIkizamaChangeRef.current = null;
    setIsIkizamaChangeConfirmOpen(false);
  }

  function confirmOtherRyugiChange(): void {
    pendingOtherRyugiChangeRef.current?.();
    pendingOtherRyugiChangeRef.current = null;
    setIsOtherRyugiChangeConfirmOpen(false);
  }

  function closeOtherRyugiChangeConfirm(): void {
    pendingOtherRyugiChangeRef.current = null;
    setIsOtherRyugiChangeConfirmOpen(false);
  }

  function confirmOtherRyugiRemove(): void {
    pendingOtherRyugiRemoveRef.current?.();
    pendingOtherRyugiRemoveRef.current = null;
    otherRyugiRemoveTriggerRef.current = otherRyugiAddButtonRef.current;
    setIsOtherRyugiRemoveConfirmOpen(false);
  }

  function closeOtherRyugiRemoveConfirm(): void {
    pendingOtherRyugiRemoveRef.current = null;
    setIsOtherRyugiRemoveConfirmOpen(false);
  }

  function confirmSpecialItemCategoryRemove(): void {
    pendingSpecialItemCategoryRemoveRef.current?.();
    pendingSpecialItemCategoryRemoveRef.current = null;
    setSpecialItemCategoryToRemove(null);
  }

  function closeSpecialItemCategoryRemoveConfirm(): void {
    pendingSpecialItemCategoryRemoveRef.current = null;
    setSpecialItemCategoryToRemove(null);
  }
  return (
    <>
      <div
        aria-busy={rootState.isRootOperationInProgress}
        inert={rootState.isRootOperationInProgress || undefined}
      >
        <div className={styles.layout}>
          <CharacterSheetFormPresenter
            {...formPresenterProps}
            key={formResetKey}
          />
          <CharacterSheetActionPane {...actionPane.actionPaneProps} />
        </div>
        <input
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (file !== undefined) {
              void rootState.onJsonImportFileSelected(file);
            }
          }}
          ref={rootState.jsonImportInputRef}
          type="file"
        />
        <CharacterImageErrorDialog
          closeButtonRef={rootState.imageErrorCloseButtonRef}
          errorCode={rootState.imageError?.code ?? null}
          onRequestClose={() => rootState.setImageError(null)}
          returnFocusRef={
            rootState.isImageErrorFromJsonImport
              ? rootState.jsonImportReturnFocusRef
              : rootState.isImageErrorFromReset
                ? actionPane.dialogs.actions.resetTriggerRef
                : rootState.imageReturnFocusRef
          }
        />
        <CharacterSheetRestoreErrorDialog
          confirmButtonRef={rootState.formRestoreConfirmButtonRef}
          isOpen={rootState.isFormRestoreErrorOpen}
          onRequestClose={() => rootState.setIsFormRestoreErrorOpen(false)}
          returnFocusRef={rootState.formRestoreReturnFocusRef}
        />
        <ActionPaneDialogs
          errorSummary={presenterProps.errorSummary}
          isJsonImportErrorOpen={rootState.isJsonImportErrorOpen}
          isJsonImportImageErrorOpen={rootState.isJsonImportImageErrorOpen}
          isJsonImportPending={rootState.pendingJsonImport !== null}
          jsonImportErrorConfirmButtonRef={
            rootState.jsonImportErrorConfirmButtonRef
          }
          jsonImportReturnFocusRef={rootState.jsonImportReturnFocusRef}
          onJsonImportConfirmed={onJsonImportConfirmed}
          onJsonImportErrorClose={onJsonImportErrorClose}
          onJsonImportImageErrorClose={onJsonImportImageErrorClose}
          onJsonImportPendingClose={onJsonImportPendingClose}
          state={actionPane.dialogs}
        />
        <PickerDialogs {...pickers.dialogsProps} />
        <SkillSelectionChangeConfirmDialog
          confirmation={
            characterSheetDictionary.characterSheet.skills
              .skillSelectionChangeConfirmation
          }
          dialogLabel={
            characterSheetDictionary.characterSheet.skills
              .primaryRyugiChangeConfirmationLabel
          }
          isOpen={isPrimaryRyugiChangeConfirmOpen}
          onConfirm={confirmPrimaryRyugiChange}
          onRequestClose={closePrimaryRyugiChangeConfirm}
          returnFocusRef={primaryRyugiChangeTriggerRef}
        />
        <SkillSelectionChangeConfirmDialog
          confirmation={
            characterSheetDictionary.characterSheet.skills
              .skillSelectionChangeConfirmation
          }
          dialogLabel={
            characterSheetDictionary.characterSheet.skills
              .ikizamaChangeConfirmationLabel
          }
          isOpen={isIkizamaChangeConfirmOpen}
          onConfirm={confirmIkizamaChange}
          onRequestClose={closeIkizamaChangeConfirm}
          returnFocusRef={ikizamaChangeTriggerRef}
        />
        <SkillSelectionChangeConfirmDialog
          confirmation={
            characterSheetDictionary.characterSheet.skills
              .skillSelectionChangeConfirmation
          }
          dialogLabel={
            characterSheetDictionary.characterSheet.skills
              .otherRyugiChangeConfirmationLabel
          }
          isOpen={isOtherRyugiChangeConfirmOpen}
          onConfirm={confirmOtherRyugiChange}
          onRequestClose={closeOtherRyugiChangeConfirm}
          returnFocusRef={otherRyugiChangeTriggerRef}
        />
        <SkillSelectionChangeConfirmDialog
          confirmLabel={characterSheetDictionary.general.delete}
          confirmation={
            characterSheetDictionary.characterSheet.skills
              .otherRyugiRemoveConfirmation
          }
          dialogLabel={
            characterSheetDictionary.characterSheet.skills
              .otherRyugiRemoveConfirmationLabel
          }
          isOpen={isOtherRyugiRemoveConfirmOpen}
          onConfirm={confirmOtherRyugiRemove}
          onRequestClose={closeOtherRyugiRemoveConfirm}
          returnFocusRef={otherRyugiRemoveTriggerRef}
        />
        <SpecialItemCategoryRemoveConfirmDialog
          category={specialItemCategoryToRemove}
          isOpen={specialItemCategoryToRemove !== null}
          onConfirm={confirmSpecialItemCategoryRemove}
          onRequestClose={closeSpecialItemCategoryRemoveConfirm}
          returnFocusRef={specialItemCategoryRemoveTriggerRef}
        />
      </div>
      <CharacterSheetLoadingOverlay
        isOpen={
          rootState.isRootOperationInProgress || rootState.isFormRestoring
        }
        label={
          rootState.rootOperation?.label ??
          characterSheetDictionary.characterSheet.persistence.restoring
        }
      />
    </>
  );
}
