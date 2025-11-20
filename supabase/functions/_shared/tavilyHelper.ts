/**
 * Tavily Web Search Helper
 * 
 * Centralized Tavily search logic for all edge functions
 */

export interface TavilySearchOptions {
  query: string;
  maxResults?: number;
  searchDepth?: 'basic' | 'advanced';
  includeDomains?: string[];
  excludeDomains?: string[];
}

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

export interface TavilySearchResponse {
  answer?: string;
  results: TavilySearchResult[];
  query: string;
}

/**
 * Perform web search using Tavily API
 */
export async function searchWithTavily(
  options: TavilySearchOptions
): Promise<TavilySearchResponse> {
  const tavilyApiKey = Deno.env.get('TAVILY_API_KEY');
  
  if (!tavilyApiKey) {
    throw new Error('TAVILY_API_KEY is not configured');
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: tavilyApiKey,
      query: options.query,
      max_results: options.maxResults || 5,
      search_depth: options.searchDepth || 'basic',
      include_domains: options.includeDomains || [],
      exclude_domains: options.excludeDomains || [],
      include_answer: true,
      include_raw_content: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tavily API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  return {
    answer: data.answer,
    results: data.results || [],
    query: options.query,
  };
}
