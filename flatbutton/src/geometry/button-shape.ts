/**
 * Utility functions that generate a flat button's 3D shape: a rectangle
 * with a hole, optionally with a caption area, extruded into a printable
 * solid.
 *
 * Functions aim to be pure, w/o side effects.
 */

import { ExtrudeGeometry, Path, Shape } from 'three';

import type {
  ButtonParams,
  CaptionPosition,
} from '../interfaces/button-params.js';

const minBorderWidth = 2;
export const captionWidth = 8;

const getCaptionOffset = (captionPosition: CaptionPosition): number => {
  return captionPosition === 'left' ? captionWidth : 0;
};

export const createRectShape = (width: number, height: number): Shape => {
  const shape = new Shape();
  shape.moveTo(0, 0);
  shape.lineTo(width, 0);
  shape.lineTo(width, height);
  shape.lineTo(0, height);
  shape.lineTo(0, 0);

  return shape;
};

export const createHolePath = (
  innerWidth: number,
  innerHeight: number,
  holeWidth: number,
  holeHeight: number,
  offsetX = 0,
): Path => {
  const x = offsetX + (innerWidth - holeWidth) / 2;
  const y = (innerHeight - holeHeight) / 2;

  const path = new Path();
  path.moveTo(x, y);
  path.lineTo(x + holeWidth, y);
  path.lineTo(x + holeWidth, y + holeHeight);
  path.lineTo(x, y + holeHeight);
  path.lineTo(x, y);

  return path;
};

const clampHoleSize = (holeSize: number, innerSize: number): number => {
  return Math.min(holeSize, innerSize - minBorderWidth * 2);
};

/**
 * ┌────────────────┐
 * │  ┌──────────┐  │
 * │  │          │  │
 * │  │          │  │
 * │  │          │  │
 * │  └──────────┘  │
 * └────────────────┘
 */
export const createButtonGeometry = ({
  innerWidth,
  innerHeight,
  holeWidth,
  holeHeight,
  thickness,
  captionPosition,
}: ButtonParams): ExtrudeGeometry => {
  const clampedHoleWidth = clampHoleSize(holeWidth, innerWidth);
  const clampedHoleHeight = clampHoleSize(holeHeight, innerHeight);
  const captionOffset = getCaptionOffset(captionPosition);

  const rect = createRectShape(captionOffset + innerWidth, innerHeight);

  rect.holes.push(
    createHolePath(
      innerWidth,
      innerHeight,
      clampedHoleWidth,
      clampedHoleHeight,
      captionOffset,
    ),
  );

  return new ExtrudeGeometry(rect, {
    depth: thickness,
    bevelEnabled: false,
  });
};

export const getCenteredPosition = ({
  innerWidth,
  innerHeight,
  thickness,
  captionPosition,
}: ButtonParams) => {
  const captionOffset = getCaptionOffset(captionPosition);

  return {
    x: -(captionOffset + innerWidth / 2),
    y: -innerHeight / 2,
    z: -thickness / 2,
  };
};
