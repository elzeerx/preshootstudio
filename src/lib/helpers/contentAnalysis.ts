/**
 * Content Analysis Utilities for Admin Moderation
 * 
 * Provides automated content checks for quality assessment and flag detection
 */

import type { ProjectDetail } from '@/hooks/useProjectDetail';

export interface ContentAnalysis {
  potentialFlags: string[];
  qualityScore: number;
  tokenCount: number;
  topicClassification: string[];
  languageQuality: number;
}

export const CONTENT_FLAG_LABELS: Record<string, { en: string; ar: string; description: string }> = {
  forbidden_topic: {
    en: 'Forbidden Topic',
    ar: 'موضوع محظور',
    description: 'Topics violating platform policies',
  },
  copyright_concern: {
    en: 'Copyright Concern',
    ar: 'مخاوف حقوق النشر',
    description: 'Potential copyright issues',
  },
  misinformation: {
    en: 'Misinformation',
    ar: 'معلومات مضللة',
    description: 'Factually incorrect content',
  },
  low_quality: {
    en: 'Low Quality',
    ar: 'جودة منخفضة',
    description: 'Poor AI output quality',
  },
  pii_exposure: {
    en: 'PII Exposure',
    ar: 'بيانات شخصية',
    description: 'Contains personal information',
  },
  promotional: {
    en: 'Promotional',
    ar: 'محتوى ترويجي',
    description: 'Excessive promotional content',
  },
  adult_content: {
    en: 'Adult Content',
    ar: 'محتوى للبالغين',
    description: 'Age-restricted content',
  },
};

/**
 * Analyzes project content for quality and potential issues
 */
export function analyzeProjectContent(project: ProjectDetail): ContentAnalysis {
  const potentialFlags: string[] = [];
  let tokenCount = 0;
  let qualityIndicators = 0;
  const topicClassification: string[] = [];

  // Analyze research data
  if (project.research_data) {
    const researchText = JSON.stringify(project.research_data);
    tokenCount += estimateTokens(researchText);
    
    // Check for quality indicators
    if (project.research_data.sources?.length > 5) qualityIndicators++;
    if (project.research_data.keyPoints?.length > 0) qualityIndicators++;
    if (project.research_data.faqs?.length > 0) qualityIndicators++;
    
    // Detect potential flags
    const flags = detectForbiddenPatterns(researchText);
    potentialFlags.push(...flags);
  }

  // Analyze scripts data
  if (project.scripts_data) {
    const scriptsText = JSON.stringify(project.scripts_data);
    tokenCount += estimateTokens(scriptsText);
    
    if (project.scripts_data.teleprompter?.lines?.length > 0) qualityIndicators++;
    if (project.scripts_data.reel?.bodyPoints?.length > 0) qualityIndicators++;
  }

  // Analyze prompts data
  if (project.prompts_data) {
    tokenCount += estimateTokens(JSON.stringify(project.prompts_data));
    if (project.prompts_data.imagePrompts?.length > 0) qualityIndicators++;
  }

  // Analyze article data
  if (project.article_data) {
    tokenCount += estimateTokens(JSON.stringify(project.article_data));
    if (project.article_data.sections?.length > 0) qualityIndicators++;
  }

  // Topic classification
  const topic = project.topic.toLowerCase();
  if (topic.includes('tech') || topic.includes('ai')) topicClassification.push('technology');
  if (topic.includes('science')) topicClassification.push('science');
  if (topic.includes('health') || topic.includes('medical')) topicClassification.push('health');
  if (topic.includes('business') || topic.includes('finance')) topicClassification.push('business');
  if (topic.includes('education') || topic.includes('tutorial')) topicClassification.push('education');

  const qualityScore = Math.min(5, Math.max(1, qualityIndicators));
  const languageQuality = calculateLanguageQuality(project);

  return {
    potentialFlags: [...new Set(potentialFlags)],
    qualityScore,
    tokenCount,
    topicClassification,
    languageQuality,
  };
}

/**
 * Detects forbidden patterns in content
 */
export function detectForbiddenPatterns(content: string): string[] {
  const flags: string[] = [];
  const lowerContent = content.toLowerCase();

  // Forbidden topics patterns
  const forbiddenPatterns = [
    'violence', 'weapon', 'illegal', 'drug', 'hack',
  ];
  
  if (forbiddenPatterns.some(pattern => lowerContent.includes(pattern))) {
    flags.push('forbidden_topic');
  }

  // Copyright patterns
  const copyrightPatterns = ['©', 'copyright', 'all rights reserved', 'trademark'];
  if (copyrightPatterns.some(pattern => lowerContent.includes(pattern))) {
    flags.push('copyright_concern');
  }

  // PII patterns (basic detection)
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
  
  if (emailPattern.test(content) || phonePattern.test(content)) {
    flags.push('pii_exposure');
  }

  // Low quality indicators
  if (content.length < 100) {
    flags.push('low_quality');
  }

  // Promotional content
  const promotionalPatterns = ['buy now', 'click here', 'limited offer', 'discount'];
  if (promotionalPatterns.some(pattern => lowerContent.includes(pattern))) {
    flags.push('promotional');
  }

  return flags;
}

/**
 * Estimates quality score based on project completeness
 */
export function estimateQuality(project: ProjectDetail): number {
  let score = 0;
  
  if (project.research_data) score += 1;
  if (project.scripts_data) score += 1;
  if (project.prompts_data) score += 1;
  if (project.article_data) score += 1;
  if (project.broll_data) score += 1;
  
  // Bonus for quality metrics
  if (project.research_quality_score && project.research_quality_score > 70) {
    score += 0.5;
  }

  return Math.min(5, Math.max(1, Math.round(score)));
}

/**
 * Estimates token count from text
 */
function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Calculates language quality score
 */
function calculateLanguageQuality(project: ProjectDetail): number {
  let score = 5;
  
  // Check if content exists
  if (!project.research_data && !project.scripts_data) {
    score -= 2;
  }
  
  // Check topic quality
  if (project.topic.length < 10) {
    score -= 1;
  }
  
  return Math.max(1, score);
}

/**
 * Gets display label for content flag
 */
export function getContentFlagLabel(flag: string, language: 'en' | 'ar' = 'ar'): string {
  return CONTENT_FLAG_LABELS[flag]?.[language] || flag;
}
