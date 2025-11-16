/**
 * AI Configuration for PreShoot AI
 * 
 * This file manages AI model configurations and API keys for the project.
 * 
 * IMPORTANT NOTES:
 * - API Keys are read from environment variables managed by Lovable
 * - Never hardcode API keys in this file
 * - Keys should be added through Lovable Project Settings → Environment Variables
 * 
 * REQUIRED ENVIRONMENT VARIABLES:
 * - OPENAI_API_KEY: Your OpenAI API key for GPT models
 * - ANTHROPIC_API_KEY: Your Anthropic API key for Claude models
 * 
 * MODELS USAGE:
 * - researchModel: Used for research, information gathering, and analysis
 * - scriptModel: Used for generating scripts and creative content
 * - summaryModel: Used for summarizing and simplifying content
 * - promptModel: Used for generating prompts for images and videos
 */

export type ModelType = 'research' | 'script' | 'summary' | 'prompt';

export interface AIModelConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

/**
 * Model configurations for different use cases
 * These can be modified later based on performance and requirements
 */
export const AI_MODELS: Record<ModelType, AIModelConfig> = {
  // Research model - focused on accuracy and comprehensive information gathering
  research: {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022', // Can be updated to newer models
    temperature: 0.3, // Lower temperature for more factual responses
    maxTokens: 4096,
    topP: 0.9,
  },
  
  // Script model - balanced between creativity and structure
  script: {
    provider: 'openai',
    model: 'gpt-4', // Using GPT-4 for script generation
    temperature: 0.7, // Moderate temperature for creative but coherent scripts
    maxTokens: 3000,
    topP: 0.95,
  },
  
  // Summary model - optimized for concise and clear summarization
  summary: {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.2, // Very low temperature for consistent summaries
    maxTokens: 2000,
    topP: 0.8,
  },
  
  // Prompt model - creative and detailed for image/video prompts
  prompt: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.8, // Higher temperature for creative prompts
    maxTokens: 1000,
    topP: 0.95,
  },
};

/**
 * Get API key from environment variables
 * This function safely retrieves API keys without exposing them in the code
 * 
 * @param provider - The AI provider (openai or anthropic)
 * @returns The API key for the specified provider
 * @throws Error if the API key is not found
 */
export const getApiKey = (provider: 'openai' | 'anthropic'): string => {
  const key = provider === 'openai' 
    ? import.meta.env.VITE_OPENAI_API_KEY 
    : import.meta.env.VITE_ANTHROPIC_API_KEY;
  
  if (!key) {
    throw new Error(
      `${provider.toUpperCase()} API key not found. ` +
      `Please add it to Lovable Environment Variables as ` +
      `VITE_${provider.toUpperCase()}_API_KEY`
    );
  }
  
  return key;
};

/**
 * Get model configuration for a specific use case
 * 
 * @param modelType - The type of model needed
 * @returns The configuration for the requested model
 */
export const getModelConfig = (modelType: ModelType): AIModelConfig => {
  return AI_MODELS[modelType];
};

/**
 * Check if all required API keys are configured
 * Useful for displaying setup status to users
 * 
 * @returns Object with status of each API key
 */
export const checkApiKeysStatus = () => {
  return {
    openai: !!import.meta.env.VITE_OPENAI_API_KEY,
    anthropic: !!import.meta.env.VITE_ANTHROPIC_API_KEY,
  };
};

/**
 * Web Search Configuration
 * 
 * Some AI models support web search capabilities.
 * This will be used when the feature is available from the provider.
 * 
 * Currently this is a placeholder for future implementation.
 * Web search will be enabled based on model capabilities.
 */
export interface WebSearchConfig {
  enabled: boolean;
  maxResults?: number;
  includeSnippets?: boolean;
}

export const WEB_SEARCH_CONFIG: WebSearchConfig = {
  enabled: false, // Will be enabled when implemented
  maxResults: 10,
  includeSnippets: true,
};
