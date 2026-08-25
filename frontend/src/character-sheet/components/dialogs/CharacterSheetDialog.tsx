import { type ReactNode, type RefObject, useEffect, useRef } from "react";

import { characterSheetDictionary } from "../../dictionary";
import styles from "./CharacterSheetDialog.module.css";

type DialogAccessibleName =
  | {
      ariaLabel: string;
      ariaLabelledBy?: never;
    }
  | {
      ariaLabel?: never;
      ariaLabelledBy: string;
    };

type CharacterSheetDialogBaseProps = {
  ariaDescribedBy?: string;
  children: ReactNode;
  className?: string;
  initialFocusRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onRequestClose: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

export type CharacterSheetDialogProps = CharacterSheetDialogBaseProps &
  DialogAccessibleName;

/**
 * Controlled modal shell for character-sheet dialogs.
 *
 * The Container owns open state and action effects. This component only
 * presents a dialog and reports close/action requests.
 */
export default function CharacterSheetDialog({
  ariaDescribedBy,
  ariaLabel,
  ariaLabelledBy,
  children,
  className,
  initialFocusRef,
  isOpen,
  onRequestClose,
  returnFocusRef,
}: CharacterSheetDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog === null) {
      return;
    }

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }

      wasOpenRef.current = true;
      initialFocusRef.current?.focus();
      return;
    }

    if (dialog.open) {
      dialog.close();
    }

    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      returnFocusRef?.current?.focus();
    }
  }, [initialFocusRef, isOpen, returnFocusRef]);

  return (
    <dialog
      ref={dialogRef}
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-modal="true"
      className={className ? `${styles.dialog} ${className}` : styles.dialog}
      onCancel={(event) => {
        event.preventDefault();
        onRequestClose();
      }}
    >
      <div className={styles.surface}>{children}</div>
    </dialog>
  );
}

export type CharacterSheetDialogHeaderProps = {
  closeButtonRef?: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
  headingId: string;
  onRequestClose?: () => void;
};

export function CharacterSheetDialogHeader({
  closeButtonRef,
  children,
  headingId,
  onRequestClose,
}: CharacterSheetDialogHeaderProps) {
  return (
    <header className={styles.header}>
      <h2 id={headingId}>{children}</h2>
      {onRequestClose ? (
        <button
          className={styles.closeButton}
          onClick={onRequestClose}
          ref={closeButtonRef}
          type="button"
        >
          <span aria-hidden="true">×</span>
          <span className={styles.visuallyHidden}>
            {characterSheetDictionary.general.close}
          </span>
        </button>
      ) : null}
    </header>
  );
}

export type CharacterSheetDialogContentProps = {
  className?: string;
  children: ReactNode;
};

export function CharacterSheetDialogContent({
  className,
  children,
}: CharacterSheetDialogContentProps) {
  return (
    <div
      className={className ? `${styles.content} ${className}` : styles.content}
    >
      {children}
    </div>
  );
}

export type CharacterSheetDialogActionsProps = {
  children: ReactNode;
};

export function CharacterSheetDialogActions({
  children,
}: CharacterSheetDialogActionsProps) {
  return <footer className={styles.actions}>{children}</footer>;
}
