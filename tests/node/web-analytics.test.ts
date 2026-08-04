import { describe, expect, it } from "vitest";
import {
  cloudflareWebAnalyticsScriptSource,
  getCloudflareWebAnalyticsBeacon,
} from "../../src/lib/site/web-analytics";

describe("Cloudflare Web Analytics beacon", () => {
  it("does not render without a token or outside a production build", () => {
    expect(
      getCloudflareWebAnalyticsBeacon({
        isProduction: true,
        token: undefined,
      }),
    ).toBe(undefined);
    expect(
      getCloudflareWebAnalyticsBeacon({
        isProduction: true,
        token: "   ",
      }),
    ).toBe(undefined);
    expect(
      getCloudflareWebAnalyticsBeacon({
        isProduction: false,
        token: "test-token",
      }),
    ).toBe(undefined);
  });

  it("serializes the production beacon configuration as JSON", () => {
    const token = 'test-token-with-"quotes"';
    const beacon = getCloudflareWebAnalyticsBeacon({
      isProduction: true,
      token,
    });

    expect(cloudflareWebAnalyticsScriptSource).toBe(
      "https://static.cloudflareinsights.com/beacon.min.js",
    );
    expect(JSON.parse(beacon?.dataCfBeacon ?? "")).toEqual({
      token,
      spa: false,
    });
  });
});
