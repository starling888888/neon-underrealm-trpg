import {
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { characterSheetDictionary } from "../dictionary";
import styles from "./FormulaTooltip.module.css";

const tooltipGap = 4;
const viewportGutter = 16;

type FormulaTooltipProps = {
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
  formula: string;
};

type TooltipPosition = {
  left: number;
  top: number;
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
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const tooltipId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }

    function alignTooltip(): void {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;

      if (tooltip !== null && trigger !== null) {
        const tooltipRect = tooltip.getBoundingClientRect();
        const triggerRect = trigger.getBoundingClientRect();
        const maxLeft = Math.max(
          viewportGutter,
          window.innerWidth - tooltipRect.width - viewportGutter,
        );
        const maxTop = Math.max(
          viewportGutter,
          window.innerHeight - tooltipRect.height - viewportGutter,
        );
        const preferredLeft = triggerRect.right - tooltipRect.width;
        const preferredTop = triggerRect.top - tooltipRect.height - tooltipGap;
        const preferredBottom = triggerRect.bottom + tooltipGap;

        setPosition({
          left: Math.min(Math.max(preferredLeft, viewportGutter), maxLeft),
          top:
            preferredTop >= viewportGutter
              ? Math.min(preferredTop, maxTop)
              : Math.min(Math.max(preferredBottom, viewportGutter), maxTop),
        });
      }
    }

    alignTooltip();
    window.addEventListener("resize", alignTooltip);
    window.addEventListener("scroll", dismissTooltip, true);

    function dismissTooltip(): void {
      setIsOpen(false);
    }

    return () => {
      window.removeEventListener("resize", alignTooltip);
      window.removeEventListener("scroll", dismissTooltip, true);
    };
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
        <span className={styles.triggerContent}>
          {children}
          <span aria-hidden="true" className={styles.indicator}>
            ?
          </span>
        </span>
      </button>
      {isOpen ? (
        <span
          className={styles.content}
          id={tooltipId}
          ref={tooltipRef}
          role="tooltip"
          style={
            position === null
              ? { visibility: "hidden" }
              : { left: position.left, top: position.top }
          }
        >
          {formula}
        </span>
      ) : null}
    </span>
  );
}
