import { ArrowDown, Menu, X } from "lucide-react";
import {
  type CSSProperties,
  memo,
  type RefObject,
  useEffect,
  useState,
} from "react";
import type { Authentication } from "../auth/types";
import type { CharacterSheetSectionId } from "../constants/section-navigation";
import { characterSheetDictionary } from "../dictionary";
import type { CharacterSheetErrorSummary } from "../logic/error-summary";
import CharacterSheetButton from "./_common/CharacterSheetButton";
import styles from "./CharacterSheetActionPane.module.css";
import CharacterSheetAuthentication from "./CharacterSheetAuthentication";

type CharacterSheetActionPaneProps = {
  authentication?: Authentication;
  errorReviewButtonRef: RefObject<HTMLButtonElement | null>;
  errorSummary: CharacterSheetErrorSummary;
  isCcfoliaCopyDisabled: boolean;
  isCopySaveDisabled?: boolean;
  isDeleteDisabled?: boolean;
  isImportDisabled: boolean;
  isResetDisabled: boolean;
  isSaveDisabled?: boolean;
  isMenuOpen: boolean;
  menuTriggerRef: RefObject<HTMLButtonElement | null>;
  onHelp: (trigger: HTMLButtonElement) => void;
  onCcfoliaCopy: (trigger: HTMLButtonElement) => void;
  onCharacterList?: () => void;
  onCopySave?: () => void;
  onDelete?: () => void;
  onSave?: () => void;
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
const desktopMediaQuery = "(width >= 84rem)";
const errorListStyle = {
  "--character-sheet-error-list-max-block-size": "12rem",
  overflowY: "auto",
} as CSSProperties;

function CharacterSheetActionPane({
  authentication,
  errorReviewButtonRef,
  errorSummary,
  isCcfoliaCopyDisabled,
  isCopySaveDisabled = false,
  isDeleteDisabled = false,
  isImportDisabled,
  isResetDisabled,
  isSaveDisabled = false,
  isMenuOpen,
  menuTriggerRef,
  onHelp,
  onCcfoliaCopy,
  onCharacterList = () => {},
  onCopySave = () => {},
  onDelete = () => {},
  onSave = () => {},
  onImport,
  onMenuToggle,
  onReset,
  onReviewErrors,
  onSectionJump,
  sectionNavigation,
}: CharacterSheetActionPaneProps) {
  const { actions } = characterSheetDictionary.characterSheet;
  const isDesktop = useIsDesktop();
  const authenticationControl = isDesktop !== undefined && authentication && (
    <CharacterSheetAuthentication authentication={authentication} />
  );
  const errorStatusText = errorSummary.hasErrors
    ? `エラーが${errorSummary.errors.length}件あります。`
    : actions.noErrors;
  return (
    <aside aria-label={actions.regionLabel} className={styles.root}>
      {isDesktop ? (
        <div className={styles.desktopRail}>
          {authenticationControl}
          <div className={styles.characterList}>
            <CharacterSheetButton onClick={onCharacterList} size="medium">
              {actions.characterList}
            </CharacterSheetButton>
          </div>
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
              isCopySaveDisabled={isCopySaveDisabled}
              isDeleteDisabled={isDeleteDisabled}
              isImportDisabled={isImportDisabled}
              isResetDisabled={isResetDisabled}
              isSaveDisabled={isSaveDisabled}
              onCcfoliaCopy={onCcfoliaCopy}
              onCopySave={onCopySave}
              onDelete={onDelete}
              onImport={onImport}
              onSave={onSave}
              onReset={onReset}
            />
          </div>
          <DesktopErrorStatus
            errorReviewButtonRef={errorReviewButtonRef}
            errorSummary={errorSummary}
            onReviewErrors={onReviewErrors}
          />
        </div>
      ) : (
        <section
          aria-hidden={!isMenuOpen}
          aria-label={actions.menuLabel}
          className={
            isMenuOpen ? `${styles.menu} ${styles.menuOpen}` : styles.menu
          }
          id={menuId}
        >
          {authenticationControl}
          <div className={styles.characterList}>
            <CharacterSheetButton onClick={onCharacterList} size="medium">
              {actions.characterList}
            </CharacterSheetButton>
          </div>
          <SectionNavigation
            {...sectionNavigation}
            onSectionJump={onSectionJump}
          />
          <ActionButtons
            isCcfoliaCopyDisabled={isCcfoliaCopyDisabled}
            isCopySaveDisabled={isCopySaveDisabled}
            isDeleteDisabled={isDeleteDisabled}
            isImportDisabled={isImportDisabled}
            isResetDisabled={isResetDisabled}
            isSaveDisabled={isSaveDisabled}
            onCcfoliaCopy={onCcfoliaCopy}
            onCopySave={onCopySave}
            onDelete={onDelete}
            onImport={onImport}
            onSave={onSave}
            onReset={onReset}
          />
          <ErrorSummary errorSummary={errorSummary} className={styles.errors} />
        </section>
      )}

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
    </aside>
  );
}

export default memo(CharacterSheetActionPane);

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean>();

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      setIsDesktop(false);
      return;
    }

    const mediaQuery = window.matchMedia(desktopMediaQuery);
    const update = () => setIsDesktop(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

function SectionNavigation({
  items,
  onSectionJump,
}: CharacterSheetActionPaneProps["sectionNavigation"] & {
  onSectionJump: CharacterSheetActionPaneProps["onSectionJump"];
}) {
  const { sectionJump } = characterSheetDictionary.characterSheet.actions;

  return (
    <nav aria-label={sectionJump} className={styles.sectionNavigation}>
      <p>{sectionJump}</p>
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
  isCopySaveDisabled,
  isDeleteDisabled,
  isImportDisabled,
  isResetDisabled,
  isSaveDisabled,
  onCcfoliaCopy,
  onCopySave,
  onDelete,
  onImport,
  onSave,
  onReset,
}: Pick<
  CharacterSheetActionPaneProps,
  | "isCcfoliaCopyDisabled"
  | "isCopySaveDisabled"
  | "isDeleteDisabled"
  | "isImportDisabled"
  | "isResetDisabled"
  | "isSaveDisabled"
  | "onCcfoliaCopy"
  | "onCopySave"
  | "onDelete"
  | "onImport"
  | "onSave"
  | "onReset"
>) {
  const { actions } = characterSheetDictionary.characterSheet;
  return (
    <div className={styles.actionButtons}>
      <CharacterSheetButton
        className={styles.save}
        disabled={isSaveDisabled}
        onClick={onSave}
        size="medium"
      >
        {actions.dbSave}
      </CharacterSheetButton>
      <CharacterSheetButton
        className={styles.copySave}
        disabled={isCopySaveDisabled}
        onClick={onCopySave}
        size="medium"
        color="warning"
      >
        {actions.copySave}
      </CharacterSheetButton>
      <CharacterSheetButton
        className={styles.delete}
        color="danger"
        disabled={isDeleteDisabled}
        onClick={onDelete}
        size="medium"
      >
        {actions.dbDelete}
      </CharacterSheetButton>
      <CharacterSheetButton
        className={styles.reset}
        color="danger"
        disabled={isResetDisabled}
        onClick={(event) => onReset(event.currentTarget)}
        size="medium"
      >
        {actions.reset}
      </CharacterSheetButton>
      <CharacterSheetButton
        className={styles.import}
        disabled={isImportDisabled}
        onClick={(event) => onImport(event.currentTarget)}
        size="medium"
      >
        <span>{actions.import}</span>
        <small>{actions.importRemovalNotice}</small>
      </CharacterSheetButton>
      <CharacterSheetButton
        className={styles.ccfoliaCopy}
        disabled={isCcfoliaCopyDisabled}
        onClick={(event) => onCcfoliaCopy(event.currentTarget)}
        size="medium"
      >
        {actions.ccfoliaCopy}
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
            {getErrorCountMessage(errorSummary.errors.length)}
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
          ? getErrorCountMessage(errorSummary.errors.length)
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

function getErrorCountMessage(count: number): string {
  return characterSheetDictionary.characterSheet.actions.errorCount.replace(
    "{count}",
    String(count),
  );
}
