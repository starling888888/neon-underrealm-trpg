import { type ReactNode, useId, useState } from "react";

import styles from "./FormulaTooltip.module.css";

type FormulaTooltipProps = {
  children: ReactNode;
  formula: string;
};

/**
 * Explains a derived value without adding its formula to the normal layout.
 *
 * The child is the trigger. On touch devices, a local dismiss layer closes the
 * tooltip when the user taps outside it.
 */
export default function FormulaTooltip({
  children,
  formula,
}: FormulaTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span className={styles.root}>
      {isOpen ? (
        <button
          aria-label="計算式の説明を閉じる"
          className={styles.dismissLayer}
          onClick={() => setIsOpen(false)}
          tabIndex={-1}
          type="button"
        />
      ) : null}
      <button
        aria-controls={tooltipId}
        aria-describedby={isOpen ? tooltipId : undefined}
        aria-expanded={isOpen}
        className={styles.trigger}
        onBlur={() => setIsOpen(false)}
        onClick={() => setIsOpen((open) => !open)}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") {
            setIsOpen(true);
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") {
            setIsOpen(false);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
        type="button"
      >
        {children}
        {isOpen ? (
          <span className={styles.content} id={tooltipId} role="tooltip">
            {formula}
          </span>
        ) : null}
      </button>
    </span>
  );
}
