import type {
  ApiErrorResponse,
  CharacterSheet,
  CharacterSheetInput,
  CharacterSheetListResponse,
  CharacterSheetSummary,
} from "@neon-underrealm/shared";
import { characterSheetMaximumRequestBytes } from "@neon-underrealm/shared";

type Fetch = typeof fetch;

export class CharacterSheetApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Character sheet API request failed with ${status}.`);
    this.status = status;
  }

  get isExpiredToken(): boolean {
    return this.status === 419;
  }

  get isUnexpected(): boolean {
    return this.status >= 500;
  }
}

export class CharacterSheetPayloadTooLargeError extends CharacterSheetApiError {
  constructor() {
    super(413);
  }
}

export type CharacterSheetApiClient = {
  delete(id: string, idToken: string): Promise<void>;
  get(id: string, idToken: string | null): Promise<CharacterSheet>;
  list(idToken: string | null): Promise<CharacterSheetListResponse>;
  save(
    input: CharacterSheetInput,
    idToken: string,
  ): Promise<CharacterSheetSummary>;
};

export function createCharacterSheetApiClient(
  basePath: string = import.meta.env.PUBLIC_API_BASE_PATH,
  fetchImplementation: Fetch = fetch,
): CharacterSheetApiClient {
  const serializeSaveInput = (input: CharacterSheetInput): string => {
    const body = JSON.stringify(input);
    if (
      new TextEncoder().encode(body).byteLength >
      characterSheetMaximumRequestBytes
    ) {
      throw new CharacterSheetPayloadTooLargeError();
    }
    return body;
  };
  const request = async <T>(
    path: string,
    options: RequestInit,
    idToken: string | null,
  ): Promise<T> => {
    const headers = new Headers(options.headers);
    if (idToken !== null) headers.set("Authorization", `Bearer ${idToken}`);
    const response = await fetchImplementation(`${basePath}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      await response.json().catch((): ApiErrorResponse | null => null);
      throw new CharacterSheetApiError(response.status);
    }

    return response.json() as Promise<T>;
  };

  return {
    async delete(id, idToken) {
      const response = await fetchImplementation(
        `${basePath}/character-sheets/${id}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
          method: "DELETE",
        },
      );
      if (!response.ok) throw new CharacterSheetApiError(response.status);
    },
    get(id, idToken) {
      return request<CharacterSheet>(
        `/character-sheets/${id}`,
        { method: "GET" },
        idToken,
      );
    },
    list(idToken) {
      return request<CharacterSheetListResponse>(
        "/character-sheets",
        { method: "GET" },
        idToken,
      );
    },
    async save(input, idToken) {
      return request<CharacterSheetSummary>(
        "/character-sheets",
        {
          body: serializeSaveInput(input),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
        idToken,
      );
    },
  };
}
