export const cloudflareWebAnalyticsScriptSource =
  "https://static.cloudflareinsights.com/beacon.min.js";

export interface CloudflareWebAnalyticsBeacon {
  dataCfBeacon: string;
}

interface CloudflareWebAnalyticsOptions {
  isProduction: boolean;
  token: string | undefined;
}

export function getCloudflareWebAnalyticsBeacon({
  isProduction,
  token,
}: CloudflareWebAnalyticsOptions): CloudflareWebAnalyticsBeacon | undefined {
  const siteToken = token?.trim();

  if (!isProduction || siteToken === undefined || siteToken === "") {
    return undefined;
  }

  return {
    dataCfBeacon: JSON.stringify({ token: siteToken, spa: false }),
  };
}
