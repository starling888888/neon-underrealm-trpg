import {
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { characterSheetDictionary } from "../dictionary";
import styles from "./FormulaTooltip.module.css";

type FormulaTooltipProps = {
  ariaLabel?: string;
  className?: string;
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
  ariaLabel,
  className,
  children,
  formula,
}: FormulaTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBelowTrigger, setIsBelowTrigger] = useState(false);
  const [isLeftAligned, setIsLeftAligned] = useState(false);
  const tooltipId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!isOpen) {
      setIsBelowTrigger(false);
      setIsLeftAligned(false);
      return;
    }

    function alignTooltip(): void {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;

      if (tooltip !== null && trigger !== null) {
        const tooltipRect = tooltip.getBoundingClientRect();
        const triggerRect = trigger.getBoundingClientRect();

        setIsBelowTrigger(triggerRect.top - tooltipRect.height < 16);
        setIsLeftAligned(triggerRect.right - tooltipRect.width < 16);
      }
    }

    alignTooltip();
    window.addEventListener("resize", alignTooltip);

    return () => window.removeEventListener("resize", alignTooltip);
  }, [isOpen]);

  return (
    <span className={`${styles.root} ${className ?? ""}`}>
      {isOpen ? (
        <button
          aria-label={characterSheetDictionary.general.closeFormulaTooltip}
          className={styles.dismissLayer}
          onClick={() => setIsOpen(false)}
          tabIndex={-1}
          type="button"
        />
      ) : null}
      <button
        aria-label={ariaLabel}
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
        ref={triggerRef}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
        type="button"
      >
        {children}
        {isOpen ? (
          <span
            className={`${styles.content} ${
              isBelowTrigger ? styles.belowTrigger : ""
            } ${isLeftAligned ? styles.leftAligned : ""}`}
            id={tooltipId}
            ref={tooltipRef}
            role="tooltip"
          >
            {formula}
          </span>
        ) : null}
      </button>
    </span>
  );
}
