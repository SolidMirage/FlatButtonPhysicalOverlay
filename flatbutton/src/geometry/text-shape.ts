import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js';

/**
 * Turns a text string into a centered,
 * extruded 3D geometry using an already asynchronously-loaded font.
 */
export const createLetterGeometry = (
  text: string,
  font: Font,
  { size, depth }: { size: number; depth: number },
): TextGeometry => {
  const geometry = new TextGeometry(text, {
    font,
    size,
    depth,
  });

  geometry.center();

  return geometry;
};
