/*
  lib/mock-data.ts

  Mock data removed — the app should now source real content from the database.
  To avoid breaking imports while you populate real data, this module exports
  empty arrays for the commonly used collections. Replace these with DB
  queries or server-side loaders when you're ready to wire the app to Prisma.
*/

export const solutionActions: any[] = [];
export const recommendedProducts: any[] = [];
export const timelineEvents: any[] = [];

export type ArticleSection = { heading: string; body: string };
export type Article = {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  icon?: any;
  heroImage: string;
  heroAlt: string;
  updatedAt: string;
  quickTakeaways: string[];
  sections: ArticleSection[];
  vetWarning: string;
};

export const articles: Article[] = [];
export const chatSeeds: any[] = [];
export const catBreedGuides: any[] = [];
