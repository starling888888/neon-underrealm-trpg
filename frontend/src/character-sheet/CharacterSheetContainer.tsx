import { GoogleOAuthProvider } from "@react-oauth/google";
import { useCallback, useEffect, useMemo } from "react";
import styles from "./CharacterSheetContainer.module.css";
import useGoogleAuthentication from "./auth/useGoogleAuthentication";
import CharacterSheetActionPane from "./components/CharacterSheetActionPane";
import CharacterSheetFormPresenter, {
  type CharacterSheetFormPresenterProps,
} from "./components/CharacterSheetFormPresenter";
import CharacterSheetLoadingOverlay from "./components/CharacterSheetLoadingOverlay";
import CharacterSheetToast from "./components/CharacterSheetToast";
import ActionPaneDialogs from "./components/dialogs/action-pane";
import CharacterSheetRemotePersistenceDialogs from "./components/dialogs/CharacterSheetRemotePersistenceDialogs";
import CharacterChangeWarningDialogs from "./components/dialogs/character-change-warning";
import PickerDialogs from "./components/dialogs/pickers";
import { characterSheetDictionary } from "./dictionary";
import useCharacterSheetFormPresenterProps from "./form/useCharacterSheetFormPresenterProps";
import useActionPane from "./hooks/useActionPane";
import useCharacterChangeWarning from "./hooks/useCharacterChangeWarning";
import useCharacterSheetRootState from "./hooks/useCharacterSheetRootState";
import useCharacterSheetToast from "./hooks/useCharacterSheetToast";
import usePickerStates from "./hooks/usePickerStates";
import usePickers from "./hooks/usePickers";
import useRemoteCharacterPersistence from "./hooks/useRemoteCharacterPersistence";
import { serializeCcfoliaCharacterClipboardData } from "./logic/ccfolia";

const { ccfolia, image, jsonImport, persistence } =
  characterSheetDictionary.characterSheet;
const imageErrorMessages = {
  decode: image.errors.decode,
  "file-too-large": image.errors.fileTooLarge,
  "invalid-type": image.errors.invalidType,
  restore: image.errors.restore,
  storage: image.errors.storage,
} as const;

/** React Island root and orchestration boundary for the character sheet. */
type CharacterSheetContainerProps = {
  googleClientId: string;
};

export default function CharacterSheetContainer({
  googleClientId,
}: CharacterSheetContainerProps) {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <CharacterSheetContent />
    </GoogleOAuthProvider>
  );
}

function CharacterSheetContent() {
  const authentication = useGoogleAuthentication();
  const rootState = useCharacterSheetRootState();
  const toast = useCharacterSheetToast();
  const form = rootState.form;
  const formResetKey = rootState.formResetVersion;
  const remotePersistence = useRemoteCharacterPersistence({
    authentication,
    bindRemoteSummary: rootState.bindRemoteSummary,
    characterImage: rootState.characterImage,
    clearCharacterImageForCopy: rootState.clearCharacterImageForCopy,
    clearRemoteCharacter: rootState.clearRemoteCharacter,
    form,
    isRootOperationInProgress: rootState.isRootOperationInProgress,
    notify: toast.notify,
    remoteCharacter: rootState.remoteCharacter,
    restoreRemoteCharacter: rootState.restoreRemoteCharacter,
    updateRemoteCharacterMetadata: rootState.updateRemoteCharacterMetadata,
  });

  useEffect(() => {
    if (!rootState.isJsonImportErrorOpen) return;
    rootState.setIsJsonImportErrorOpen(false);
    toast.notify("error", jsonImport.error);
  }, [rootState, toast]);

  useEffect(() => {
    if (!rootState.isJsonImportImageErrorOpen) return;
    rootState.setIsJsonImportImageErrorOpen(false);
    toast.notify("error", jsonImport.imageOmitted);
  }, [rootState, toast]);

  useEffect(() => {
    if (rootState.imageError === null) return;
    rootState.setImageError(null);
    toast.notify("error", imageErrorMessages[rootState.imageError.code]);
  }, [rootState, toast]);

  useEffect(() => {
    if (!rootState.isFormRestoreErrorOpen) return;
    rootState.setIsFormRestoreErrorOpen(false);
    toast.notify("error", persistence.restoreError);
  }, [rootState, toast]);

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
  const onCcfoliaCopyResult = useCallback(
    (copied: boolean) => {
      toast.notify(
        copied ? "success" : "error",
        copied ? ccfolia.copySuccess : ccfolia.copyError,
      );
    },
    [toast],
  );
  const actionPane = useActionPane({
    errorSummary: presenterProps.errorSummary,
    isCcfoliaCopyDisabled: rootState.isRootOperationInProgress,
    isCopySaveDisabled: remotePersistence.isCopySaveDisabled,
    isDeleteDisabled: remotePersistence.isDeleteDisabled,
    isImportDisabled:
      rootState.isCharacterImageRestoring ||
      rootState.isRootOperationInProgress,
    isResetErrorOpen: rootState.isImageErrorFromReset,
    isRootOperationInProgress: rootState.isRootOperationInProgress,
    isResetDisabled:
      rootState.isCharacterImageRestoring ||
      rootState.isRootOperationInProgress,
    isSaveDisabled: remotePersistence.isSaveDisabled,
    onCcfoliaCopyConfirmed,
    onCcfoliaCopyResult,
    onCharacterList: remotePersistence.openCharacterList,
    onCopySave: remotePersistence.openCopySave,
    onDelete: remotePersistence.openDelete,
    onImport: rootState.onJsonImportRequested,
    onResetConfirmed: rootState.onResetConfirmed,
    onSave: remotePersistence.openSave,
  });
  const actionPaneProps = useMemo(
    () => ({ ...actionPane.actionPaneProps, authentication }),
    [actionPane.actionPaneProps, authentication],
  );
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
          <fieldset
            className={styles.formFields}
            disabled={!remotePersistence.isEditable}
          >
            <CharacterSheetFormPresenter
              {...formPresenterProps}
              key={formResetKey}
            />
          </fieldset>
          <CharacterSheetActionPane {...actionPaneProps} />
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
        <CharacterSheetRemotePersistenceDialogs
          {...remotePersistence.dialogProps}
        />
      </div>
      <CharacterSheetToast messages={toast.messages} onExpire={toast.expire} />
      <CharacterSheetLoadingOverlay
        isOpen={
          rootState.isRootOperationInProgress || rootState.isFormRestoring
        }
        label={rootState.rootOperation?.label ?? persistence.restoring}
      />
    </>
  );
}
