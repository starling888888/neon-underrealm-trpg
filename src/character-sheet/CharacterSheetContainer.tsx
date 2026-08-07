import { useCallback, useMemo } from "react";
import styles from "./CharacterSheetContainer.module.css";
import CharacterSheetActionPane from "./components/CharacterSheetActionPane";
import CharacterSheetFormPresenter, {
  type CharacterSheetFormPresenterProps,
} from "./components/CharacterSheetFormPresenter";
import CharacterSheetLoadingOverlay from "./components/CharacterSheetLoadingOverlay";
import ActionPaneDialogs from "./components/dialogs/action-pane";
import CharacterImageErrorDialog from "./components/dialogs/CharacterImageErrorDialog";
import CharacterSheetRestoreErrorDialog from "./components/dialogs/CharacterSheetRestoreErrorDialog";
import CharacterChangeWarningDialogs from "./components/dialogs/character-change-warning";
import PickerDialogs from "./components/dialogs/pickers";
import { characterSheetDictionary } from "./dictionary";
import useCharacterSheetFormPresenterProps from "./form/useCharacterSheetFormPresenterProps";
import useActionPane from "./hooks/useActionPane";
import useCharacterChangeWarning from "./hooks/useCharacterChangeWarning";
import useCharacterSheetRootState from "./hooks/useCharacterSheetRootState";
import usePickerStates from "./hooks/usePickerStates";
import usePickers from "./hooks/usePickers";
import { serializeCcfoliaCharacterClipboardData } from "./logic/ccfolia";

/**
 * React Island root and orchestration boundary for the character sheet.
 *
 * It owns form state and cross-cutting UI state. Form layout belongs to the
 * presenter; dialogs that need root-level coordination are added as direct
 * siblings of that presenter in later Gates.
 */
export default function CharacterSheetContainer() {
  const rootState = useCharacterSheetRootState();
  const form = rootState.form;
  const formResetKey = rootState.formResetVersion;
  const pickerStates = usePickerStates();
  const characterChangeWarning = useCharacterChangeWarning({ form });
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
  const presenterProps = useCharacterSheetFormPresenterProps(form, imageState, {
    formRestoreReturnFocusRef: rootState.formRestoreReturnFocusRef,
    ...pickerStates.requests,
    ...characterChangeWarning.presenterOptions,
  });
  characterChangeWarning.bindPresenterOperations({
    clearIkizamaSkills: presenterProps.ikizamaSkillPicker.clearSelection,
    clearOtherRyugiSkills: presenterProps.otherRyugiSkills.clearSelection,
    clearPrimaryRyugiSkills: presenterProps.primarySkillPicker.clearSelection,
    removeOtherRyugiSkills: presenterProps.otherRyugiSkills.removeRows,
  });
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
    isRootOperationInProgress: rootState.isRootOperationInProgress,
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
        <CharacterChangeWarningDialogs
          {...characterChangeWarning.dialogsProps}
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
