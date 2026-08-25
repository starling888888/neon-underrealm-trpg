import { useEffect } from "react";
import styles from "./CharacterSheetToast.module.css";

export type CharacterSheetToastMessage = {
  id: number;
  kind: "error" | "success";
  message: string;
};

export default function CharacterSheetToast({
  messages,
  onExpire,
}: {
  messages: CharacterSheetToastMessage[];
  onExpire: (id: number) => void;
}) {
  useEffect(() => {
    const timers = messages.map(({ id }) =>
      window.setTimeout(() => onExpire(id), 5000),
    );
    return () => {
      timers.forEach((timer) => {
        window.clearTimeout(timer);
      });
    };
  }, [messages, onExpire]);
  return (
    <div aria-live="polite" className={styles.stack}>
      {messages.map((toast) => (
        <p
          className={toast.kind === "error" ? styles.error : styles.success}
          key={toast.id}
          role="status"
        >
          {toast.message}
        </p>
      ))}
    </div>
  );
}
