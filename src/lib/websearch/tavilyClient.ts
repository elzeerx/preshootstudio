/**
 * Tavily Web Search Client
 * 
 * Integration with Tavily API for real web search capabilities
 */

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

export interface TavilySearchOptions {
  maxResults?: number;
  searchDepth?: 'basic' | 'advanced';
  includeImages?: boolean;
  includeAnswer?: boolean;
}

export interface TavilySearchResponse {
  results: TavilyResult[];
  answer?: string;
  images?: string[];
  query: string;
}

/**
 * TavilyClient class for web search operations
 */
export class TavilyClient {
  private apiKey: string;
  private apiUrl = 'https://api.tavily.com/search';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.TAVILY_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('TAVILY_API_KEY is not configured. Please add it to your environment variables.');
    }
  }

  /**
   * Perform a web search using Tavily API
   * 
   * @param query - The search query
   * @param options - Search options
   * @returns Search results from Tavily
   */
  async search(
    query: string, 
    options?: TavilySearchOptions
  ): Promise<TavilyResult[]> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query: query,
          search_depth: options?.searchDepth || 'advanced',
          max_results: options?.maxResults || 8,
          include_answer: options?.includeAnswer || false,
          include_images: options?.includeImages || false,
          include_domains: [], // Open search - no domain restrictions
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tavily API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      return data.results || [];
    } catch (error) {
      console.error('Error in Tavily search:', error);
      throw new Error(
        error instanceof Error 
          ? `Tavily search failed: ${error.message}` 
          : 'Tavily search failed with unknown error'
      );
    }
  }

  /**
   * Get full search response including answer and images
   * 
   * @param query - The search query
   * @param options - Search options
   * @returns Full Tavily response
   */
  async searchFull(
    query: string,
    options?: TavilySearchOptions
  ): Promise<TavilySearchResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query: query,
          search_depth: options?.searchDepth || 'advanced',
          max_results: options?.maxResults || 8,
          include_answer: options?.includeAnswer !== false, // Default true
          include_images: options?.includeImages || false,
          include_domains: [],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tavily API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      return {
        results: data.results || [],
        answer: data.answer,
        images: data.images,
        query: query,
      };
    } catch (error) {
      console.error('Error in Tavily full search:', error);
      throw new Error(
        error instanceof Error 
          ? `Tavily search failed: ${error.message}` 
          : 'Tavily search failed with unknown error'
      );
    }
  }
}

/**
 * Create a singleton instance of TavilyClient
 */
let tavilyClientInstance: TavilyClient | null = null;

/**
 * Get the TavilyClient instance
 * 
 * @returns TavilyClient instance
 */
export const getTavilyClient = (): TavilyClient => {
  if (!tavilyClientInstance) {
    tavilyClientInstance = new TavilyClient();
  }
  return tavilyClientInstance;
};

/**
 * Export a default instance for convenient importing
 */
export default getTavilyClient();
