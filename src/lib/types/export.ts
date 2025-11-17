/**
 * Export Pack Types for PreShoot AI
 * 
 * This file contains TypeScript types for the Export Pack feature.
 */

import { ResearchData } from './research';
import { ScriptsData } from './scripts';
import { BRollData } from './broll';
import { PromptsData } from './prompts';
import { ArticleData } from './article';

/**
 * Status type for each section
 */
export type SectionStatus = 'idle' | 'ready' | 'missing' | 'error';

/**
 * PreShoot Export Pack
 * Contains all project outputs ready for export
 */
export interface PreShootExportPack {
  projectId: string;
  topic: string;
  createdAt: string;

  // Summary of each section's status
  statuses: {
    research: SectionStatus;
    scripts: SectionStatus;
    broll: SectionStatus;
    prompts: SectionStatus;
    article: SectionStatus;
  };

  // Raw data from DB (if available)
  research?: ResearchData;
  scripts?: ScriptsData;
  broll?: BRollData;
  prompts?: PromptsData;
  article?: ArticleData;

  // Complete Markdown version
  markdown: string;
}
