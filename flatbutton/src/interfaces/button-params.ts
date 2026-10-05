/**
 * A caption annotates a flat button, describing in short form what it does.
 * This could mean a single Latin letter or a Braille pattern. 
 * Neither is implemented yet.
 *
 * @todo Only 'none' and 'left' exist so far; more positions are planned.
 */
export type CaptionPosition = 'none' | 'left';

export interface ButtonParams {
  innerWidth: number;
  innerHeight: number;
  holeWidth: number;
  holeHeight: number;
  color: string;
  thickness: number;
  captionPosition: CaptionPosition;
}

export const defaultButtonParams: ButtonParams = {
  innerWidth: 20,
  innerHeight: 14,
  holeWidth: 10,
  holeHeight: 8,
  color: '#00ffff',
  thickness: 0.5,
  captionPosition: 'none',
};
