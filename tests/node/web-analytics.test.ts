import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  cloudflareWebAnalyticsScriptSource,
  getCloudflareWebAnalyticsBeacon,
} from "../../src/lib/site/web-analytics";

describe("Cloudflare Web Analytics beacon", () => {
  it("does not render without a token or outside a production build", () => {
    assert.equal(
      getCloudflareWebAnalyticsBeacon({
        isProduction: true,
        token: undefined,
      }),
      undefined,
    );
    assert.equal(
      getCloudflareWebAnalyticsBeacon({
        isProduction: true,
        token: "   ",
      }),
      undefined,
    );
    assert.equal(
      getCloudflareWebAnalyticsBeacon({
        isProduction: false,
        token: "test-token",
      }),
      undefined,
    );
  });

  it("serializes the production beacon configuration as JSON", () => {
    const token = 'test-token-with-"quotes"';
    const beacon = getCloudflareWebAnalyticsBeacon({
      isProduction: true,
      token,
    });

    assert.equal(
      cloudflareWebAnalyticsScriptSource,
      "https://static.cloudflareinsights.com/beacon.min.js",
    );
    assert.deepEqual(JSON.parse(beacon?.dataCfBeacon ?? ""), {
      token,
      spa: false,
    });
  });
});
