/**
 * B-Roll Types for PreShoot AI
 * 
 * This file defines TypeScript types for B-Roll shot planning data.
 * These types match the JSON structure stored in the database and returned by the AI model.
 */

/**
 * Represents a single B-Roll shot
 */
export interface BRollShot {
  id: string;
  title: string;
  description: string;
  shotType: 'close-up' | 'medium' | 'wide' | 'macro' | 'screen-record' | 'product' | 'b-roll';
  cameraMovement: 'static' | 'pan' | 'tilt' | 'slide' | 'handheld' | 'zoom-in' | 'zoom-out' | 'orbit';
  durationSec: number;
  locationOrContext: string;
  notes: string;
  aiImagePrompt: string;
}

/**
 * Complete B-Roll data structure
 */
export interface BRollData {
  shots: BRollShot[];
  generalTips: string[];
}
