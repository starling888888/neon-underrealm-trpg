import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getFirebaseAuth } from "./firebase-client";
import type { Authentication, AuthenticationStatus } from "./types";

const reloadPage = () => window.location.reload();

export default function useFirebaseAuthentication(
  reload: () => void = reloadPage,
): Authentication {
  const [status, setStatus] = useState<AuthenticationStatus>("initializing");
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const hasSettledInitialState = useRef(false);
  const previousSessionKey = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    void getFirebaseAuth()
      .then((auth) => {
        if (!active) return;
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!active) return;
          const nextSessionKey = user?.uid ?? null;
          if (
            hasSettledInitialState.current &&
            previousSessionKey.current !== nextSessionKey
          ) {
            reload();
            return;
          }

          hasSettledInitialState.current = true;
          previousSessionKey.current = nextSessionKey;
          setSessionKey(nextSessionKey);
          setStatus(user === null ? "signed-out" : "signed-in");
        });
      })
      .catch(() => {
        if (!active) return;
        setSessionKey(null);
        setStatus("error");
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [reload]);

  const onLogin = useCallback(async () => {
    setStatus("signing-in");
    try {
      const auth = await getFirebaseAuth();
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch {
      setStatus("error");
    }
  }, []);

  const onLogout = useCallback(async () => {
    try {
      const auth = await getFirebaseAuth();
      await signOut(auth);
    } catch {
      setStatus("error");
    }
  }, []);

  const getIdToken = useCallback(async (forceRefresh = false) => {
    const auth = await getFirebaseAuth();
    return auth.currentUser?.getIdToken(forceRefresh) ?? null;
  }, []);

  return useMemo(
    () => ({ getIdToken, onLogin, onLogout, sessionKey, status }),
    [getIdToken, onLogin, onLogout, sessionKey, status],
  );
}
