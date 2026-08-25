import { useCallback, useMemo, useRef, useState } from "react";
import type { CharacterSheetToastMessage } from "../components/CharacterSheetToast";

/** Owns transient result notifications independently from feature operations. */
export default function useCharacterSheetToast() {
  const [messages, setMessages] = useState<CharacterSheetToastMessage[]>([]);
  const nextIdRef = useRef(0);
  const notify = useCallback(
    (kind: CharacterSheetToastMessage["kind"], message: string) => {
      const id = nextIdRef.current++;
      setMessages((current) => [{ id, kind, message }, ...current]);
    },
    [],
  );
  const expire = useCallback((id: number) => {
    setMessages((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return useMemo(
    () => ({ expire, messages, notify }),
    [expire, messages, notify],
  );
}
