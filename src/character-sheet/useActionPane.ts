import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { CharacterSheetErrorSummary } from "./logic/error-summary";
import {
  type CharacterSheetSectionId,
  characterSheetSectionNavigationItems,
} from "./section-navigation";

type UseActionPaneArgs = {
  errorSummary: CharacterSheetErrorSummary;
  isCcfoliaCopyDisabled: boolean;
  isExportDisabled: boolean;
  isImportDisabled: boolean;
  isResetDisabled: boolean;
  onCcfoliaCopyConfirmed: () => Promise<boolean>;
  onExport: () => void;
  onImport: (trigger: HTMLButtonElement) => void;
  onResetConfirmed: () => Promise<void>;
};

export type ActionPaneDialogsState = {
  actions: {
    ccfoliaCopyNotice: "success" | "failure" | null;
    ccfoliaCopyNoticeConfirmButtonRef: RefObject<HTMLButtonElement | null>;
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
    closeCcfoliaCopyNotice: () => void;
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
  isExportDisabled,
  isImportDisabled,
  isResetDisabled,
  onCcfoliaCopyConfirmed,
  onExport,
  onImport,
  onResetConfirmed,
}: UseActionPaneArgs) {
  const sectionJump = useSectionJump();
  const actions = useActionPaneActions({
    onCcfoliaCopyConfirmed,
    onResetConfirmed,
  });
  const errors = useActionPaneErrors();
  const actionPaneProps = useMemo(
    () => ({
      errorReviewButtonRef: errors.errorSummaryTriggerRef,
      errorSummary,
      isCcfoliaCopyDisabled,
      isExportDisabled,
      isImportDisabled,
      isMenuOpen: actions.isMenuOpen,
      isResetDisabled,
      menuTriggerRef: actions.actionMenuTriggerRef,
      onCcfoliaCopy: actions.openCcfoliaCopyConfirm,
      onExport,
      onHelp: actions.openHelp,
      onImport,
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
      isExportDisabled,
      isImportDisabled,
      isResetDisabled,
      onExport,
      onImport,
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
  onCcfoliaCopyConfirmed,
  onResetConfirmed,
}: Pick<UseActionPaneArgs, "onCcfoliaCopyConfirmed" | "onResetConfirmed">) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCcfoliaCopyConfirmOpen, setIsCcfoliaCopyConfirmOpen] =
    useState(false);
  const [ccfoliaCopyNotice, setCcfoliaCopyNotice] = useState<
    "success" | "failure" | null
  >(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [shouldRestoreResetFocus, setShouldRestoreResetFocus] = useState(false);
  const actionMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const helpTriggerRef = useRef<HTMLButtonElement>(null);
  const resetTriggerRef = useRef<HTMLButtonElement>(null);
  const ccfoliaCopyTriggerRef = useRef<HTMLButtonElement>(null);
  const ccfoliaCopyNoticeConfirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!shouldRestoreResetFocus) return;
    setShouldRestoreResetFocus(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resetTriggerRef.current?.focus());
    });
  }, [shouldRestoreResetFocus]);

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
    setCcfoliaCopyNotice(copied ? "success" : "failure");
  }, [closeCcfoliaCopyConfirm, onCcfoliaCopyConfirmed]);
  const closeCcfoliaCopyNotice = useCallback(() => {
    setCcfoliaCopyNotice(null);
  }, []);
  const closeHelp = useCallback(() => {
    setIsHelpOpen(false);
  }, []);
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((isOpen) => !isOpen);
  }, []);

  return useMemo(
    () => ({
      actionMenuTriggerRef,
      ccfoliaCopyNotice,
      ccfoliaCopyNoticeConfirmButtonRef,
      ccfoliaCopyTriggerRef,
      closeCcfoliaCopyConfirm,
      closeCcfoliaCopyNotice,
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
      ccfoliaCopyNotice,
      closeCcfoliaCopyConfirm,
      closeCcfoliaCopyNotice,
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
