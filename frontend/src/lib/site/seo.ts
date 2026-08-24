import { gameTitle } from "./siteMeta";

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
  siteName: gameTitle,
  title: gameTitle,
  description:
    "近未来の都市オオサカ副都を舞台に、裏社会の仕事人となって抗争を生き抜く重量級TRPGの公式ルールサイトです。",
  image: "/neon-underrealm-ogp.png",
  ogType: "website",
  twitterCard: "summary_large_image",
};
