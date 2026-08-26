import { useCallback, useEffect, useState } from "react";

const characterParameter = "character";

function readRemoteCharacterId(location: Location): string | null {
  return new URL(location.href).searchParams.get(characterParameter);
}

/** Keeps the current character identity in the sheet URL without routing the site. */
export default function useCharacterSheetRoute() {
  const [remoteCharacterId, setRemoteCharacterId] = useState<string | null>(
    () =>
      typeof window === "undefined"
        ? null
        : readRemoteCharacterId(window.location),
  );

  useEffect(() => {
    const onPopState = () =>
      setRemoteCharacterId(readRemoteCharacterId(window.location));

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((id: string | null) => {
    if (readRemoteCharacterId(window.location) === id) return;

    const nextUrl = new URL(window.location.href);
    if (id === null) {
      nextUrl.searchParams.delete(characterParameter);
    } else {
      nextUrl.searchParams.set(characterParameter, id);
    }
    window.history.pushState(null, "", nextUrl);
    setRemoteCharacterId(id);
  }, []);

  return { navigate, remoteCharacterId };
}
