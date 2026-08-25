import { expect, test, vi } from "vitest";
import { createCharacterSheetApiClient } from "../../../../src/character-sheet/api/character-sheets";

const basePath = "https://api.example.test";

test("sends a bearer token only for authenticated requests", async () => {
  const fetchImplementation = vi.fn<typeof fetch>();
  fetchImplementation
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ sample: [], user: [] }), { status: 200 }),
    )
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "11111111-1111-4111-8111-111111111111",
          metadata: {},
          snapshot: { imageBase64String: null },
        }),
        { status: 200 },
      ),
    );
  const client = createCharacterSheetApiClient(basePath, fetchImplementation);

  await client.list(null);
  await client.get("11111111-1111-4111-8111-111111111111", "token");

  expect(fetchImplementation).toHaveBeenNthCalledWith(
    1,
    `${basePath}/character-sheets`,
    expect.objectContaining({ headers: expect.any(Headers) }),
  );
  expect(
    (fetchImplementation.mock.calls[0]?.[1] as RequestInit).headers,
  ).toBeInstanceOf(Headers);
  expect(
    (
      (fetchImplementation.mock.calls[0]?.[1] as RequestInit).headers as Headers
    ).get("Authorization"),
  ).toBeNull();
  expect(
    (
      (fetchImplementation.mock.calls[1]?.[1] as RequestInit).headers as Headers
    ).get("Authorization"),
  ).toBe("Bearer token");
});

test("exposes expired-token failures without accepting a failed response", async () => {
  const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
    new Response(JSON.stringify({ error: { code: "expired_token" } }), {
      status: 419,
    }),
  );
  const client = createCharacterSheetApiClient(basePath, fetchImplementation);

  await expect(client.list("expired-token")).rejects.toMatchObject({
    isExpiredToken: true,
    status: 419,
  });
});
