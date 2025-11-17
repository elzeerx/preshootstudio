export interface ImagePrompt {
  id: string;
  label: string;
  model: "midjourney" | "gemini" | "generic";
  aspectRatio: string;
  style: string;
  prompt: string;
}

export interface VideoPrompt {
  id: string;
  label: string;
  durationSec: number;
  style: string;
  prompt: string;
}

export interface ThumbnailPrompt {
  id: string;
  label: string;
  prompt: string;
}

export interface PromptsData {
  imagePrompts: ImagePrompt[];
  videoPrompts: VideoPrompt[];
  thumbnailPrompts: ThumbnailPrompt[];
  notes: string[];
}
