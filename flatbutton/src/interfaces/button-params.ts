/**
 * A caption annotates a flat button, describing in short form what it does.
 * This could mean a single Latin letter or a Braille pattern.
 * Neither is implemented yet.
 *
 * @todo Only 'none' and 'left' exist so far; more positions are planned.
 */
export type CaptionPosition = 'none' | 'left';

/**
 * Flat buttons are tactile overlays that guide a finger to the right spot
 * on an otherwise flat touch surface. They have a couple of properties,
 * and roughly look like this:
 * ┌────────────────┐
 * │  ┌──────────┐  │
 * │  │          │  │
 * │  │          │  │
 * │  └──────────┘  │
 * └────────────────┘
 */
export interface ButtonParams {
  innerWidth: number;
  innerHeight: number;
  holeWidth: number;
  holeHeight: number;
  color: string;
  thickness: number;
  captionPosition: CaptionPosition;
}

/**
 * Shared default values for the 3D model and its form controls.
 */
export const defaultButtonParams: ButtonParams = {
  innerWidth: 20,
  innerHeight: 14,
  holeWidth: 10,
  holeHeight: 8,
  color: '#00ffff',
  thickness: 0.5,
  captionPosition: 'none',
};
