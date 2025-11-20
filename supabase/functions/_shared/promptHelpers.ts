/**
 * Prompt Helpers
 * 
 * Standardized anti-hallucination instructions and prompt wrapping utilities
 */

/**
 * Anti-hallucination instructions in Arabic
 */
export const ANTI_HALLUCINATION_INSTRUCTIONS = `
⚠️ تعليمات صارمة لمنع الاختلاق:
- استخدم فقط المعلومات المتوفرة في البحث الأساسي والبحث المركّز
- إذا لم تكن متأكداً من معلومة معينة، اذكر ذلك بوضوح
- لا تخترع أرقام أو إحصائيات غير موجودة في المصادر
- لا تذكر أسماء أشخاص أو شركات إلا إذا وردت في البحث
- إذا كانت المعلومة ناقصة، قل "غير متوفر في المصادر الحالية"
- عند الشك، الصدق والوضوح أفضل من الاختلاق
- جميع الحقائق والأرقام يجب أن تكون مدعومة بمصادر من البحث
`;

/**
 * Wrap prompts with anti-hallucination safeguards
 */
export function wrapPromptWithSafeguards(
  systemPrompt: string,
  userPrompt: string,
  baseResearch: string,
  focusedResearch?: string
): { system: string; user: string } {
  // Add anti-hallucination instructions to system prompt
  const enhancedSystem = `${systemPrompt}\n\n${ANTI_HALLUCINATION_INSTRUCTIONS}`;
  
  // Build comprehensive user prompt with all research context
  let enhancedUser = baseResearch;
  
  if (focusedResearch) {
    enhancedUser += `\n\n${focusedResearch}`;
  }
  
  enhancedUser += `\n\n=== المهمة المطلوبة ===\n${userPrompt}`;
  
  return {
    system: enhancedSystem,
    user: enhancedUser,
  };
}

/**
 * Build a focused search query based on topic and specific focus area
 */
export function buildFocusedSearchQuery(
  topic: string,
  focusArea: string,
  additionalContext?: string
): string {
  let query = `${topic} ${focusArea}`;
  
  if (additionalContext) {
    query += ` ${additionalContext}`;
  }
  
  return query;
}
