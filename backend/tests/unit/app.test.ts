import { expect, test } from "vitest";
import { createApp } from "../../src/app.js";
import { TestTokenVerifier } from "../../src/auth/token-verifier.js";
import type { CharacterSheetService } from "../../src/service/index.js";

test("rejects an oversized chunked request with an injected test body limit", async () => {
  const app = createApp({
    characterSheetService: {} as CharacterSheetService,
    corsAllowOrigins: [],
    maximumRequestBodyBytes: 16 * 1024,
    tokenVerifier: new TestTokenVerifier(),
  });
  const body = JSON.stringify({
    metadata: { isPublic: true, pcName: "too large", rank: 1 },
    snapshot: { imageBase64String: null, padding: "A".repeat(16 * 1024) },
  });
  const request = new Request("https://api.example.test/character-sheets", {
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(body));
        controller.close();
      },
    }),
    duplex: "half",
    headers: {
      Authorization: "Bearer test-token-owner",
      "Content-Type": "application/json",
    },
    method: "POST",
  } as RequestInit);

  const response = await app.request(request);

  expect(response.status).toBe(413);
  await expect(response.json()).resolves.toEqual({
    error: { code: "payload_too_large" },
  });
});
