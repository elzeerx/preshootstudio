/**
 * Research Data Types
 * 
 * These types define the structure of research data returned by AI
 */

export interface ResearchFact {
  label: string;
  value: string;
  source?: string;
  url?: string;
}

export interface ResearchSource {
  title: string;
  url?: string;
  type?: "official" | "article" | "blog" | "video" | "news" | "other";
}

export interface MythVsReality {
  myth: string;
  reality: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ResearchData {
  summary: string;
  keyPoints: string[];
  facts: ResearchFact[];
  sources: ResearchSource[];
  mythsVsReality: MythVsReality[];
  trends: string[];
  faqs: FAQ[];
}
