import { Menu, X } from "lucide-react";
import type { RefObject } from "react";

import { characterSheetDictionary } from "../dictionary";
import type { CharacterSheetErrorSummary } from "../logic/error-summary";
import styles from "./CharacterSheetActionPane.module.css";
import CharacterSheetButton from "./CharacterSheetButton";

type CharacterSheetActionPaneProps = {
  errorReviewButtonRef: RefObject<HTMLButtonElement | null>;
  errorSummary: CharacterSheetErrorSummary;
  isMenuOpen: boolean;
  menuTriggerRef: RefObject<HTMLButtonElement | null>;
  onMenuToggle: () => void;
  onReviewErrors: () => void;
};

const menuId = "character-sheet-actions-menu";

/**
 * Presents root-level character-sheet actions and the current error summary
 * without coupling them to future export, import, clipboard, reset, or help
 * behaviour.
 */
export default function CharacterSheetActionPane({
  errorReviewButtonRef,
  errorSummary,
  isMenuOpen,
  menuTriggerRef,
  onMenuToggle,
  onReviewErrors,
}: CharacterSheetActionPaneProps) {
  const { actions } = characterSheetDictionary.characterSheet;

  return (
    <section aria-label={actions.regionLabel} className={styles.root}>
      <div className={styles.desktopHeader}>
        <h1 className={styles.heading}>{actions.title}</h1>
        <div className={styles.desktopActions}>
          <CharacterSheetButton size="medium">
            {actions.help}
          </CharacterSheetButton>
          <CharacterSheetButton size="medium">
            {actions.export}
          </CharacterSheetButton>
          <CharacterSheetButton size="medium">
            {actions.import}
          </CharacterSheetButton>
          <CharacterSheetButton size="medium">
            {actions.ccfoliaCopy}
          </CharacterSheetButton>
          <CharacterSheetButton color="danger" size="medium">
            {actions.reset}
          </CharacterSheetButton>
          <DesktopErrorStatus
            errorReviewButtonRef={errorReviewButtonRef}
            errorSummary={errorSummary}
            onReviewErrors={onReviewErrors}
          />
        </div>
      </div>

      <div
        className={styles.floatingActions}
        data-character-sheet-action-controls
      >
        <button
          aria-label={actions.help}
          className={styles.iconButton}
          type="button"
        >
          <span aria-hidden="true" className={styles.helpMark}>
            ?
          </span>
        </button>
        <button
          aria-controls={menuId}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? actions.closeMenu : actions.openMenu}
          className={
            errorSummary.hasErrors
              ? `${styles.iconButton} ${styles.iconButtonDanger}`
              : styles.iconButton
          }
          onClick={onMenuToggle}
          ref={menuTriggerRef}
          type="button"
        >
          {isMenuOpen ? (
            <X aria-hidden="true" size={18} strokeWidth={2.25} />
          ) : (
            <Menu aria-hidden="true" size={18} strokeWidth={2.25} />
          )}
        </button>
      </div>

      {isMenuOpen ? (
        <section
          aria-label={actions.menuLabel}
          className={styles.menu}
          id={menuId}
        >
          <div className={styles.menuActions}>
            <CharacterSheetButton
              className={styles.menuActionButton}
              size="medium"
            >
              {actions.export}
            </CharacterSheetButton>
            <CharacterSheetButton
              className={styles.menuActionButton}
              size="medium"
            >
              {actions.import}
            </CharacterSheetButton>
            <CharacterSheetButton
              className={styles.menuActionButton}
              size="medium"
            >
              {actions.ccfoliaCopy}
            </CharacterSheetButton>
            <CharacterSheetButton
              className={styles.menuActionButton}
              color="danger"
              size="medium"
            >
              {actions.reset}
            </CharacterSheetButton>
          </div>
          <ErrorSummary errorSummary={errorSummary} className={styles.errors} />
        </section>
      ) : null}
    </section>
  );
}

function ErrorSummary({
  className,
  errorSummary,
}: {
  className: string;
  errorSummary: CharacterSheetErrorSummary;
}) {
  const { actions } = characterSheetDictionary.characterSheet;

  return (
    <section aria-live="polite" className={className}>
      {errorSummary.hasErrors ? (
        <>
          <p className={styles.errorCount}>
            エラーが{errorSummary.errors.length}件あります。
          </p>
          <ul className={styles.errorList}>
            {errorSummary.errors.map((error) => (
              <li key={error.code}>{error.message}</li>
            ))}
          </ul>
        </>
      ) : (
        <p>{actions.noErrors}</p>
      )}
    </section>
  );
}

function DesktopErrorStatus({
  errorReviewButtonRef,
  errorSummary,
  onReviewErrors,
}: {
  errorReviewButtonRef: RefObject<HTMLButtonElement | null>;
  errorSummary: CharacterSheetErrorSummary;
  onReviewErrors: () => void;
}) {
  const { actions } = characterSheetDictionary.characterSheet;

  return (
    <div
      aria-label={actions.errorStatusLabel}
      aria-live="polite"
      className={
        errorSummary.hasErrors
          ? `${styles.desktopErrorStatus} ${styles.desktopErrorStatusDanger}`
          : styles.desktopErrorStatus
      }
      role="status"
    >
      <p>
        {errorSummary.hasErrors
          ? `エラーが${errorSummary.errors.length}件あります。`
          : actions.noErrors}
      </p>
      <CharacterSheetButton
        color={errorSummary.hasErrors ? "danger" : "default"}
        onClick={onReviewErrors}
        ref={errorReviewButtonRef}
        size="small"
      >
        {actions.reviewErrors}
      </CharacterSheetButton>
    </div>
  );
}
