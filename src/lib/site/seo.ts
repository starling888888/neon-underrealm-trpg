export type OgType = "website" | "article";

export type TwitterCard = "summary" | "summary_large_image";

export type SeoDefaults = {
  siteName: string;
  title: string;
  description: string;
  image: string;
  ogType: OgType;
  twitterCard: TwitterCard;
};

export type SeoProps = {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: OgType;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: TwitterCard;
  noindex?: boolean;
};

export const defaultSeo: SeoDefaults = {
  siteName: "ネオン・アンダーレルムTRPG",
  title: "ネオン・アンダーレルムTRPG",
  description:
    "ネオン・アンダーレルムTRPGのルール、データ、更新情報を公開するサイトです。",
  image: "/neon-underrealm-ogp.png",
  ogType: "website",
  twitterCard: "summary_large_image",
};
