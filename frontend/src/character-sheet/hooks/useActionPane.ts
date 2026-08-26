import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type CharacterSheetSectionId,
  characterSheetSectionNavigationItems,
} from "../constants/section-navigation";
import type { CharacterSheetErrorSummary } from "../logic/error-summary";

type UseActionPaneArgs = {
  errorSummary: CharacterSheetErrorSummary;
  isCcfoliaCopyDisabled: boolean;
  isCopySaveDisabled?: boolean;
  isDeleteDisabled?: boolean;
  isResetErrorOpen: boolean;
  isRootOperationInProgress: boolean;
  isResetDisabled: boolean;
  isSaveDisabled?: boolean;
  onCcfoliaCopyConfirmed: () => Promise<boolean>;
  onCcfoliaCopyResult?: (copied: boolean) => void;
  onCharacterList?: () => void;
  onCopySave?: () => void;
  onDelete?: () => void;
  onSave?: () => void;
  onResetConfirmed: () => Promise<void>;
};

export type ActionPaneDialogsState = {
  actions: {
    ccfoliaCopyTriggerRef: RefObject<HTMLButtonElement | null>;
    closeCcfoliaCopyConfirm: () => void;
    closeHelp: () => void;
    closeResetConfirm: () => void;
    confirmCcfoliaCopy: () => Promise<void>;
    confirmReset: () => void;
    helpTriggerRef: RefObject<HTMLButtonElement | null>;
    isCcfoliaCopyConfirmOpen: boolean;
    isHelpOpen: boolean;
    isResetConfirmOpen: boolean;
    resetTriggerRef: RefObject<HTMLButtonElement | null>;
  };
  errors: {
    closeErrorSummary: () => void;
    errorSummaryCloseButtonRef: RefObject<HTMLButtonElement | null>;
    errorSummaryTriggerRef: RefObject<HTMLButtonElement | null>;
    isErrorSummaryOpen: boolean;
  };
};

const sectionNavigation = { items: characterSheetSectionNavigationItems };

export default function useActionPane({
  errorSummary,
  isCcfoliaCopyDisabled,
  isCopySaveDisabled = false,
  isDeleteDisabled = false,
  isResetErrorOpen,
  isRootOperationInProgress,
  isResetDisabled,
  isSaveDisabled = false,
  onCcfoliaCopyConfirmed,
  onCcfoliaCopyResult = () => {},
  onCharacterList = () => {},
  onCopySave = () => {},
  onDelete = () => {},
  onSave = () => {},
  onResetConfirmed,
}: UseActionPaneArgs) {
  const sectionJump = useSectionJump();
  const actions = useActionPaneActions({
    isResetErrorOpen,
    isRootOperationInProgress,
    onCcfoliaCopyConfirmed,
    onCcfoliaCopyResult,
    onResetConfirmed,
  });
  const errors = useActionPaneErrors();
  const actionPaneProps = useMemo(
    () => ({
      errorReviewButtonRef: errors.errorSummaryTriggerRef,
      errorSummary,
      isCcfoliaCopyDisabled,
      isCopySaveDisabled,
      isDeleteDisabled,
      isMenuOpen: actions.isMenuOpen,
      isResetDisabled,
      isSaveDisabled,
      menuTriggerRef: actions.actionMenuTriggerRef,
      onCcfoliaCopy: actions.openCcfoliaCopyConfirm,
      onCharacterList,
      onCopySave,
      onDelete,
      onSave,
      onHelp: actions.openHelp,
      onMenuToggle: actions.toggleMenu,
      onReset: actions.openResetConfirm,
      onReviewErrors: errors.openErrorSummary,
      onSectionJump: sectionJump.onSectionJump,
      sectionNavigation,
    }),
    [
      actions.actionMenuTriggerRef,
      actions.isMenuOpen,
      actions.openCcfoliaCopyConfirm,
      actions.openHelp,
      actions.openResetConfirm,
      actions.toggleMenu,
      errorSummary,
      errors.errorSummaryTriggerRef,
      errors.openErrorSummary,
      isCcfoliaCopyDisabled,
      isCopySaveDisabled,
      isDeleteDisabled,
      isResetDisabled,
      isSaveDisabled,
      onCharacterList,
      onCopySave,
      onDelete,
      onSave,
      sectionJump.onSectionJump,
    ],
  );
  const dialogs = useMemo(() => ({ actions, errors }), [actions, errors]);

  return {
    actionPaneProps,
    dialogs,
  };
}

function useSectionJump() {
  const onSectionJump = useCallback((id: CharacterSheetSectionId) => {
    const target = document.getElementById(id);
    if (target === null) return;
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const headerHeight = header?.getBoundingClientRect().height ?? 0;
    window.scrollTo({
      behavior: "smooth",
      top: Math.max(
        0,
        window.scrollY + target.getBoundingClientRect().top - headerHeight,
      ),
    });
  }, []);

  return useMemo(() => ({ onSectionJump }), [onSectionJump]);
}

function useActionPaneActions({
  isResetErrorOpen,
  isRootOperationInProgress,
  onCcfoliaCopyConfirmed,
  onCcfoliaCopyResult,
  onResetConfirmed,
}: Pick<
  UseActionPaneArgs,
  | "isResetErrorOpen"
  | "isRootOperationInProgress"
  | "onCcfoliaCopyConfirmed"
  | "onCcfoliaCopyResult"
  | "onResetConfirmed"
>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCcfoliaCopyConfirmOpen, setIsCcfoliaCopyConfirmOpen] =
    useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [shouldRestoreResetFocus, setShouldRestoreResetFocus] = useState(false);
  const actionMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const helpTriggerRef = useRef<HTMLButtonElement>(null);
  const resetTriggerRef = useRef<HTMLButtonElement>(null);
  const ccfoliaCopyTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (
      !shouldRestoreResetFocus ||
      isResetErrorOpen ||
      isRootOperationInProgress
    )
      return;
    setShouldRestoreResetFocus(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resetTriggerRef.current?.focus());
    });
  }, [isResetErrorOpen, isRootOperationInProgress, shouldRestoreResetFocus]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || document.querySelector("dialog[open]")) {
        return;
      }
      event.preventDefault();
      setIsMenuOpen(false);
      requestAnimationFrame(() => actionMenuTriggerRef.current?.focus());
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  const openHelp = useCallback((trigger: HTMLButtonElement) => {
    helpTriggerRef.current = trigger;
    setIsHelpOpen(true);
  }, []);
  const openCcfoliaCopyConfirm = useCallback(
    (trigger: HTMLButtonElement) => {
      ccfoliaCopyTriggerRef.current = isMenuOpen
        ? actionMenuTriggerRef.current
        : trigger;
      setIsMenuOpen(false);
      setIsCcfoliaCopyConfirmOpen(true);
    },
    [isMenuOpen],
  );
  const openResetConfirm = useCallback(
    (trigger: HTMLButtonElement) => {
      resetTriggerRef.current = isMenuOpen
        ? actionMenuTriggerRef.current
        : trigger;
      setIsMenuOpen(false);
      setIsResetConfirmOpen(true);
    },
    [isMenuOpen],
  );
  const closeResetConfirm = useCallback(() => {
    setIsResetConfirmOpen(false);
    setShouldRestoreResetFocus(true);
  }, []);
  const confirmReset = useCallback(() => {
    closeResetConfirm();
    void onResetConfirmed();
  }, [closeResetConfirm, onResetConfirmed]);
  const closeCcfoliaCopyConfirm = useCallback(() => {
    setIsCcfoliaCopyConfirmOpen(false);
  }, []);
  const confirmCcfoliaCopy = useCallback(async () => {
    closeCcfoliaCopyConfirm();
    const copied = await onCcfoliaCopyConfirmed();
    onCcfoliaCopyResult?.(copied);
  }, [closeCcfoliaCopyConfirm, onCcfoliaCopyConfirmed, onCcfoliaCopyResult]);
  const closeHelp = useCallback(() => {
    setIsHelpOpen(false);
  }, []);
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((isOpen) => !isOpen);
  }, []);

  return useMemo(
    () => ({
      actionMenuTriggerRef,
      ccfoliaCopyTriggerRef,
      closeCcfoliaCopyConfirm,
      closeHelp,
      closeResetConfirm,
      confirmCcfoliaCopy,
      confirmReset,
      helpTriggerRef,
      isCcfoliaCopyConfirmOpen,
      isHelpOpen,
      isMenuOpen,
      isResetConfirmOpen,
      openCcfoliaCopyConfirm,
      openHelp,
      openResetConfirm,
      resetTriggerRef,
      toggleMenu,
    }),
    [
      closeCcfoliaCopyConfirm,
      closeHelp,
      closeResetConfirm,
      confirmCcfoliaCopy,
      confirmReset,
      isCcfoliaCopyConfirmOpen,
      isHelpOpen,
      isMenuOpen,
      isResetConfirmOpen,
      openCcfoliaCopyConfirm,
      openHelp,
      openResetConfirm,
      toggleMenu,
    ],
  );
}

function useActionPaneErrors() {
  const [isErrorSummaryOpen, setIsErrorSummaryOpen] = useState(false);
  const errorSummaryCloseButtonRef = useRef<HTMLButtonElement>(null);
  const errorSummaryTriggerRef = useRef<HTMLButtonElement>(null);
  const closeErrorSummary = useCallback(() => {
    setIsErrorSummaryOpen(false);
  }, []);
  const openErrorSummary = useCallback(() => {
    setIsErrorSummaryOpen(true);
  }, []);

  return useMemo(
    () => ({
      closeErrorSummary,
      errorSummaryCloseButtonRef,
      errorSummaryTriggerRef,
      isErrorSummaryOpen,
      openErrorSummary,
    }),
    [closeErrorSummary, isErrorSummaryOpen, openErrorSummary],
  );
}
