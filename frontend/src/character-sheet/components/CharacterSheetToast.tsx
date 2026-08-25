import { useEffect } from "react";
import styles from "./CharacterSheetToast.module.css";

export type CharacterSheetToastMessage = {
  id: number;
  kind: "error" | "success";
  message: string;
};

function CharacterSheetToastItem({
  message,
  onExpire,
}: {
  message: CharacterSheetToastMessage;
  onExpire: (id: number) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onExpire(message.id), 5000);
    return () => window.clearTimeout(timer);
  }, [message.id, onExpire]);

  return (
    <p
      className={message.kind === "error" ? styles.error : styles.success}
      role="status"
    >
      {message.message}
    </p>
  );
}

export default function CharacterSheetToast({
  messages,
  onExpire,
}: {
  messages: CharacterSheetToastMessage[];
  onExpire: (id: number) => void;
}) {
  return (
    <div aria-live="polite" className={styles.stack}>
      {messages.map((toast) => (
        <CharacterSheetToastItem
          key={toast.id}
          message={toast}
          onExpire={onExpire}
        />
      ))}
    </div>
  );
}
