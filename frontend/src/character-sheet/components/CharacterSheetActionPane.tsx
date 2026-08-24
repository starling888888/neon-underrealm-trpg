import { ArrowDown, Menu, X } from "lucide-react";
import { type CSSProperties, memo, type RefObject } from "react";
import type { GoogleAuthentication } from "../auth/types";
import type { CharacterSheetSectionId } from "../constants/section-navigation";
import { characterSheetDictionary } from "../dictionary";
import type { CharacterSheetErrorSummary } from "../logic/error-summary";
import CharacterSheetButton from "./_common/CharacterSheetButton";
import styles from "./CharacterSheetActionPane.module.css";
import CharacterSheetGoogleAuthentication from "./CharacterSheetGoogleAuthentication";

type CharacterSheetActionPaneProps = {
  authentication?: GoogleAuthentication;
  errorReviewButtonRef: RefObject<HTMLButtonElement | null>;
  errorSummary: CharacterSheetErrorSummary;
  isCcfoliaCopyDisabled: boolean;
  isExportDisabled: boolean;
  isImportDisabled: boolean;
  isResetDisabled: boolean;
  isMenuOpen: boolean;
  menuTriggerRef: RefObject<HTMLButtonElement | null>;
  onExport: () => void;
  onHelp: (trigger: HTMLButtonElement) => void;
  onCcfoliaCopy: (trigger: HTMLButtonElement) => void;
  onImport: (trigger: HTMLButtonElement) => void;
  onMenuToggle: () => void;
  onReset: (trigger: HTMLButtonElement) => void;
  onReviewErrors: () => void;
  onSectionJump: (id: CharacterSheetSectionId) => void;
  sectionNavigation: {
    items: readonly { id: CharacterSheetSectionId; label: string }[];
  };
};

const menuId = "character-sheet-actions-menu";
const errorListStyle = {
  "--character-sheet-error-list-max-block-size": "12rem",
  overflowY: "auto",
} as CSSProperties;

function CharacterSheetActionPane({
  authentication,
  errorReviewButtonRef,
  errorSummary,
  isCcfoliaCopyDisabled,
  isExportDisabled,
  isImportDisabled,
  isResetDisabled,
  isMenuOpen,
  menuTriggerRef,
  onExport,
  onHelp,
  onCcfoliaCopy,
  onImport,
  onMenuToggle,
  onReset,
  onReviewErrors,
  onSectionJump,
  sectionNavigation,
}: CharacterSheetActionPaneProps) {
  const { actions } = characterSheetDictionary.characterSheet;
  const errorStatusText = errorSummary.hasErrors
    ? `エラーが${errorSummary.errors.length}件あります。`
    : actions.noErrors;
  return (
    <aside aria-label={actions.regionLabel} className={styles.root}>
      <div className={styles.desktopRail}>
        {authentication === undefined ? null : (
          <CharacterSheetGoogleAuthentication authentication={authentication} />
        )}
        <SectionNavigation
          {...sectionNavigation}
          onSectionJump={onSectionJump}
        />
        <div className={styles.operations}>
          <CharacterSheetButton
            onClick={(event) => onHelp(event.currentTarget)}
            size="medium"
          >
            {actions.help}
          </CharacterSheetButton>
          <ActionButtons
            isCcfoliaCopyDisabled={isCcfoliaCopyDisabled}
            isExportDisabled={isExportDisabled}
            isImportDisabled={isImportDisabled}
            isResetDisabled={isResetDisabled}
            onCcfoliaCopy={onCcfoliaCopy}
            onExport={onExport}
            onImport={onImport}
            onReset={onReset}
          />
        </div>
        <DesktopErrorStatus
          errorReviewButtonRef={errorReviewButtonRef}
          errorSummary={errorSummary}
          onReviewErrors={onReviewErrors}
        />
      </div>

      <div
        className={styles.floatingActions}
        data-character-sheet-action-controls
      >
        <button
          aria-label={actions.help}
          className={styles.iconButton}
          onClick={(event) => onHelp(event.currentTarget)}
          type="button"
        >
          <span aria-hidden="true" className={styles.helpMark}>
            ?
          </span>
        </button>
        <button
          aria-controls={menuId}
          aria-expanded={isMenuOpen}
          aria-label={`${isMenuOpen ? actions.closeMenu : actions.openMenu}、${errorStatusText}`}
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
          {authentication === undefined ? null : (
            <CharacterSheetGoogleAuthentication
              authentication={authentication}
            />
          )}
          <SectionNavigation
            {...sectionNavigation}
            onSectionJump={onSectionJump}
          />
          <ActionButtons
            isCcfoliaCopyDisabled={isCcfoliaCopyDisabled}
            isExportDisabled={isExportDisabled}
            isImportDisabled={isImportDisabled}
            isResetDisabled={isResetDisabled}
            onCcfoliaCopy={onCcfoliaCopy}
            onExport={onExport}
            onImport={onImport}
            onReset={onReset}
          />
          <ErrorSummary errorSummary={errorSummary} className={styles.errors} />
        </section>
      ) : null}
    </aside>
  );
}

export default memo(CharacterSheetActionPane);

function SectionNavigation({
  items,
  onSectionJump,
}: CharacterSheetActionPaneProps["sectionNavigation"] & {
  onSectionJump: CharacterSheetActionPaneProps["onSectionJump"];
}) {
  return (
    <nav aria-label="セクションにジャンプ" className={styles.sectionNavigation}>
      <p>セクションにジャンプ</p>
      <ul>
        {items.map(({ id, label }) => (
          <li key={id}>
            <button onClick={() => onSectionJump(id)} type="button">
              <ArrowDown
                aria-hidden="true"
                className={styles.sectionJumpIcon}
                size={14}
                strokeWidth={2}
              />
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ActionButtons({
  isCcfoliaCopyDisabled,
  isExportDisabled,
  isImportDisabled,
  isResetDisabled,
  onCcfoliaCopy,
  onExport,
  onImport,
  onReset,
}: Pick<
  CharacterSheetActionPaneProps,
  | "isCcfoliaCopyDisabled"
  | "isExportDisabled"
  | "isImportDisabled"
  | "isResetDisabled"
  | "onCcfoliaCopy"
  | "onExport"
  | "onImport"
  | "onReset"
>) {
  const { actions } = characterSheetDictionary.characterSheet;
  return (
    <div className={styles.actionButtons}>
      <CharacterSheetButton
        disabled={isExportDisabled}
        onClick={onExport}
        size="medium"
      >
        {actions.export}
      </CharacterSheetButton>
      <CharacterSheetButton
        disabled={isImportDisabled}
        onClick={(event) => onImport(event.currentTarget)}
        size="medium"
      >
        {actions.import}
      </CharacterSheetButton>
      <CharacterSheetButton
        disabled={isCcfoliaCopyDisabled}
        onClick={(event) => onCcfoliaCopy(event.currentTarget)}
        size="medium"
      >
        {actions.ccfoliaCopy}
      </CharacterSheetButton>
      <CharacterSheetButton
        color="danger"
        disabled={isResetDisabled}
        onClick={(event) => onReset(event.currentTarget)}
        size="medium"
      >
        {actions.reset}
      </CharacterSheetButton>
    </div>
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
          <ul className={styles.errorList} style={errorListStyle}>
            {errorSummary.errors.map((error, index) => (
              <li key={`${error.code}-${error.rowId ?? index}`}>
                {error.message}
              </li>
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
}: Pick<
  CharacterSheetActionPaneProps,
  "errorReviewButtonRef" | "errorSummary" | "onReviewErrors"
>) {
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
