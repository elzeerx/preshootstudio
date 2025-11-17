/**
 * Article Types for PreShoot AI
 * 
 * This file contains TypeScript types for the Article feature.
 * These types match the JSON structure stored in the database.
 */

/**
 * SEO Metadata for the article
 */
export interface ArticleSeoMeta {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}

/**
 * Article Section
 */
export interface ArticleSection {
  heading: string;
  body: string;
}

/**
 * Article Format Type
 */
export type ArticleFormat = 'blog' | 'news' | 'opinion';

/**
 * Complete Article Data
 * This represents the full article data stored in the database
 */
export interface ArticleData {
  title: string;
  subtitle: string;
  intro: string;
  sections: ArticleSection[];
  conclusion: string;
  readingTimeMinutes: number;
  seoMeta: ArticleSeoMeta;
  format: ArticleFormat;
}

/**
 * Article Status Type
 */
export type ArticleStatus = 'idle' | 'loading' | 'ready' | 'error';
