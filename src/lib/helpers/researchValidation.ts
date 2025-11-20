/**
 * Research Validation Helper
 * 
 * Validates that base research exists before allowing content generation
 */

export interface ResearchData {
  summary: string;
  keyPoints: string[];
  [key: string]: any;
}

/**
 * Check if research data is valid and sufficient for content generation
 */
export function hasValidResearch(researchData: any): boolean {
  if (!researchData) return false;
  
  // Check for required fields
  if (!researchData.summary || typeof researchData.summary !== 'string') return false;
  if (!Array.isArray(researchData.keyPoints) || researchData.keyPoints.length === 0) return false;
  
  // Summary should have meaningful content
  if (researchData.summary.trim().length < 50) return false;
  
  return true;
}

/**
 * Get user-friendly message for missing research
 */
export function getMissingResearchMessage(): string {
  return 'يرجى تشغيل البحث في تبويب البحث أولاً. جميع المحتويات تعتمد على نتائج البحث الأساسي.';
}
