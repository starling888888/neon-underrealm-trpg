import type { RefObject } from "react";

import styles from "./DialogDemoTrigger.module.css";

export type DialogDemoTriggerProps = {
  onOpen: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

/** Temporary visible trigger for verifying the shared dialog foundation. */
export default function DialogDemoTrigger({
  onOpen,
  triggerRef,
}: DialogDemoTriggerProps) {
  return (
    <div className={styles.triggerArea}>
      <button
        className={styles.trigger}
        onClick={onOpen}
        ref={triggerRef}
        type="button"
      >
        確認ダイアログを開く
      </button>
    </div>
  );
}
