/**
 * Research Quality Scoring Helper
 * 
 * Calculates quality scores for research data based on:
 * - Number of sources
 * - Source diversity (official vs blogs vs news)
 * - Information recency
 */

import { ResearchData } from "@/lib/types/research";

export interface QualityMetrics {
  sourceCount: number;
  sourceDiversity: number;
  recencyScore: number;
  overallScore: number;
}

/**
 * Calculate quality score for research data
 */
export function calculateResearchQuality(researchData: ResearchData): QualityMetrics {
  // 1. Source Count Score (0-40 points)
  const sourceCount = researchData.sources?.length || 0;
  const sourceCountScore = Math.min(40, sourceCount * 5); // 5 points per source, max 40

  // 2. Source Diversity Score (0-30 points)
  const sourceTypes = new Set(
    researchData.sources?.map(s => s.type || "other") || []
  );
  const diversityScore = Math.min(30, sourceTypes.size * 6); // 6 points per unique type, max 30

  // 3. Recency Score (0-30 points)
  // Since we don't have timestamp data in sources, we'll base this on presence of trends
  const recencyScore = (researchData.trends?.length || 0) > 0 ? 30 : 15;

  // Calculate overall score
  const overallScore = Math.round(sourceCountScore + diversityScore + recencyScore);

  return {
    sourceCount: sourceCountScore,
    sourceDiversity: diversityScore,
    recencyScore,
    overallScore,
  };
}

/**
 * Get quality label in Arabic
 */
export function getQualityLabel(score: number): string {
  if (score >= 80) return "ممتاز";
  if (score >= 60) return "جيد";
  if (score >= 40) return "متوسط";
  return "ضعيف";
}

/**
 * Get quality color variant
 */
export function getQualityVariant(score: number): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 80) return "outline";
  if (score >= 60) return "default";
  if (score >= 40) return "secondary";
  return "destructive";
}
