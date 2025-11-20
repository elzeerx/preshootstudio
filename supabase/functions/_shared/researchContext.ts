/**
 * Research Context Builder
 * 
 * Formats research_data into readable context for AI prompts
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
  type?: string;
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

/**
 * Build formatted research context from research_data
 */
export function buildResearchContext(research: ResearchData): string {
  let context = `=== معلومات البحث الأساسية ===\n\n`;
  
  // Summary
  context += `📝 الملخص:\n${research.summary}\n\n`;
  
  // Key Points
  if (research.keyPoints?.length > 0) {
    context += `🔑 النقاط الرئيسية:\n`;
    research.keyPoints.forEach((point, i) => {
      context += `${i + 1}. ${point}\n`;
    });
    context += '\n';
  }
  
  // Facts and Statistics
  if (research.facts?.length > 0) {
    context += `📊 حقائق وإحصائيات:\n`;
    research.facts.forEach(fact => {
      context += `• ${fact.label}: ${fact.value}`;
      if (fact.source) context += ` (المصدر: ${fact.source})`;
      context += '\n';
    });
    context += '\n';
  }
  
  // Myths vs Reality
  if (research.mythsVsReality?.length > 0) {
    context += `❌✅ خرافات vs. حقائق:\n`;
    research.mythsVsReality.forEach(item => {
      context += `• خرافة: ${item.myth}\n`;
      context += `  ✓ الحقيقة: ${item.reality}\n\n`;
    });
  }
  
  // Trends
  if (research.trends?.length > 0) {
    context += `📈 الاتجاهات الحالية:\n`;
    research.trends.forEach((trend, i) => {
      context += `${i + 1}. ${trend}\n`;
    });
    context += '\n';
  }
  
  // Sources
  if (research.sources?.length > 0) {
    context += `📚 المصادر المعتمدة:\n`;
    research.sources.forEach((source, i) => {
      context += `${i + 1}. ${source.title}`;
      if (source.url) context += ` - ${source.url}`;
      context += '\n';
    });
    context += '\n';
  }
  
  return context;
}

/**
 * Build formatted context from focused web search results
 */
export function buildFocusedSearchContext(
  searchResults: any,
  focusArea: string
): string {
  let context = `=== بحث إضافي مركّز: ${focusArea} ===\n\n`;
  
  // Quick summary from Tavily
  if (searchResults.answer) {
    context += `💡 ملخص سريع:\n${searchResults.answer}\n\n`;
  }
  
  // Search results
  if (searchResults.results?.length > 0) {
    context += `🔍 نتائج البحث المركّز:\n`;
    searchResults.results.forEach((result: any, i: number) => {
      context += `${i + 1}. ${result.title}\n`;
      if (result.content) {
        // Truncate content to avoid huge prompts
        const truncated = result.content.substring(0, 300);
        context += `   ${truncated}${result.content.length > 300 ? '...' : ''}\n`;
      }
      if (result.url) context += `   🔗 ${result.url}\n`;
      context += '\n';
    });
  }
  
  return context;
}

/**
 * Validate that research data exists and has required fields
 */
export function validateResearchData(research: any): research is ResearchData {
  if (!research) return false;
  if (!research.summary || typeof research.summary !== 'string') return false;
  if (!Array.isArray(research.keyPoints)) return false;
  return true;
}
