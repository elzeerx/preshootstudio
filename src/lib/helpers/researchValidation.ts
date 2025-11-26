/**
 * Research Validation Helper
 * 
 * Validates that base research exists before allowing content generation
 * Supports both factual research (research_data) and creative research (creative_data)
 */

export interface ResearchData {
  summary: string;
  keyPoints: string[];
  [key: string]: any;
}

export interface CreativeResearchData {
  contentAngles: string[];
  hooks: string[];
  storyBeats: string[];
  emotionalTriggers: string[];
  trendingFormats: string[];
  audienceQuestions: string[];
  inspirationReferences: string[];
  uniqueValueProp: string;
}

/**
 * Check if factual research data is valid and sufficient
 */
export function hasValidFactualResearch(researchData: any): boolean {
  if (!researchData) return false;
  
  // Check for required fields
  if (!researchData.summary || typeof researchData.summary !== 'string') return false;
  if (!Array.isArray(researchData.keyPoints) || researchData.keyPoints.length === 0) return false;
  
  // Summary should have meaningful content
  if (researchData.summary.trim().length < 50) return false;
  
  return true;
}

/**
 * Check if creative research data is valid and sufficient
 */
export function hasValidCreativeResearch(creativeData: any): boolean {
  if (!creativeData) return false;
  
  // Check for key creative fields
  if (!Array.isArray(creativeData.contentAngles) || creativeData.contentAngles.length === 0) return false;
  if (!Array.isArray(creativeData.hooks) || creativeData.hooks.length === 0) return false;
  if (!creativeData.uniqueValueProp || typeof creativeData.uniqueValueProp !== 'string') return false;
  
  return true;
}

/**
 * Check if research data is valid for the given content type
 */
export function hasValidResearchForContentType(
  researchData: any,
  creativeData: any,
  contentType: string = 'factual'
): boolean {
  const isCreativeType = ['creative', 'personal', 'opinion'].includes(contentType);
  
  if (isCreativeType) {
    return hasValidCreativeResearch(creativeData);
  }
  return hasValidFactualResearch(researchData);
}

/**
 * Legacy function for backward compatibility
 * Checks factual research data only
 */
export function hasValidResearch(researchData: any): boolean {
  return hasValidFactualResearch(researchData);
}

/**
 * Get user-friendly message for missing research based on content type
 */
export function getMissingResearchMessage(contentType: string = 'factual'): string {
  const isCreativeType = ['creative', 'personal', 'opinion'].includes(contentType);
  
  if (isCreativeType) {
    return 'يرجى تشغيل البحث الإبداعي في تبويب البحث أولاً. جميع المحتويات تعتمد على نتائج البحث الإبداعي.';
  }
  return 'يرجى تشغيل البحث في تبويب البحث أولاً. جميع المحتويات تعتمد على نتائج البحث الأساسي.';
}
