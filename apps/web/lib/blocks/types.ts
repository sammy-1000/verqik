export type BlockTone = "normal" | "muted" | "primary" | "secondary";

export type BlockWidth = "content" | "wide" | "full";

/** screen = full viewport height on lg+ (default for landing) */
export type BlockSize = "screen" | "compact" | "auto";

export interface BlockBase {
  id: string;
  type: string;
  tone?: BlockTone;
  width?: BlockWidth;
  size?: BlockSize;
  className?: string;
}

export interface LinkItem {
  label: string;
  href: string;
}

export interface HeroBlockData {
  eyebrow?: string;
  title: string;
  description: string;
  primaryCta: LinkItem;
  secondaryCta?: LinkItem;
  image: PlaceholderImageConfig;
  badges?: string[];
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesBlockData {
  eyebrow?: string;
  title: string;
  description?: string;
  items: FeatureItem[];
}

export interface StatItem {
  value: string;
  label: string;
  detail?: string;
}

export interface StatsBlockData {
  title?: string;
  items: StatItem[];
}

export interface StepItem {
  step: number;
  title: string;
  description: string;
  image: PlaceholderImageConfig;
}

export interface HowItWorksBlockData {
  eyebrow?: string;
  title: string;
  description?: string;
  steps: StepItem[];
}

export interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  avatar: PlaceholderImageConfig;
}

export interface TestimonialsBlockData {
  eyebrow?: string;
  title: string;
  items: TestimonialItem[];
}

export interface RouteCardItem {
  from: string;
  to: string;
  date: string;
  price: string;
  weight: string;
  image: PlaceholderImageConfig;
}

export interface RoutesBlockData {
  eyebrow?: string;
  title: string;
  description?: string;
  items: RouteCardItem[];
}

export interface CtaBlockData {
  title: string;
  description: string;
  primaryCta: LinkItem;
  secondaryCta?: LinkItem;
}

export interface LogoCloudBlockData {
  title?: string;
  logos: { name: string }[];
}

export interface CitiesPreviewBlockData {
  eyebrow?: string;
  title: string;
  description?: string;
  limit?: number;
  browseMore: LinkItem;
}

export interface JourneysPreviewBlockData {
  eyebrow?: string;
  title: string;
  description?: string;
  limit?: number;
  browseMore: LinkItem;
}

export interface PlaceholderImageConfig {
  width: number;
  height: number;
  label?: string;
  aspectRatio?: string;
  /** When set, renders a real image instead of the SVG placeholder */
  src?: string;
  alt?: string;
}

export type HeroBlock = BlockBase & { type: "hero"; data: HeroBlockData };
export type FeaturesBlock = BlockBase & {
  type: "features";
  data: FeaturesBlockData;
};
export type StatsBlock = BlockBase & { type: "stats"; data: StatsBlockData };
export type HowItWorksBlock = BlockBase & {
  type: "how-it-works";
  data: HowItWorksBlockData;
};
export type TestimonialsBlock = BlockBase & {
  type: "testimonials";
  data: TestimonialsBlockData;
};
export type RoutesBlock = BlockBase & { type: "routes"; data: RoutesBlockData };
export type CtaBlock = BlockBase & { type: "cta"; data: CtaBlockData };
export type LogoCloudBlock = BlockBase & {
  type: "logo-cloud";
  data: LogoCloudBlockData;
};
export type CitiesPreviewBlock = BlockBase & {
  type: "cities-preview";
  data: CitiesPreviewBlockData;
};
export type JourneysPreviewBlock = BlockBase & {
  type: "journeys-preview";
  data: JourneysPreviewBlockData;
};

export type LandingBlock =
  | HeroBlock
  | FeaturesBlock
  | StatsBlock
  | HowItWorksBlock
  | TestimonialsBlock
  | RoutesBlock
  | CtaBlock
  | LogoCloudBlock
  | CitiesPreviewBlock
  | JourneysPreviewBlock;

export interface LandingPageContent {
  meta: {
    title: string;
    description: string;
  };
  header: {
    brand: string;
    tagline?: string;
    nav: LinkItem[];
    cta: LinkItem;
  };
  footer: {
    brand: string;
    description: string;
    columns: { title: string; links: LinkItem[] }[];
    legal: LinkItem[];
  };
  blocks: LandingBlock[];
}
