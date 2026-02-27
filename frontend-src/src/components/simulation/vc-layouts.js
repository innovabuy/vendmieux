/**
 * vc-layouts.js — Position layouts for participants in the Visite Client stage
 * LAYOUTS[n] = array of {x, y} positions (percentages) for n participants
 * BUBBLE_POS[n] = array of bubble position strings ('top', 'left', 'right') for n participants
 */

export const LAYOUTS = {
  1: [{ x: 50, y: 28 }],
  2: [{ x: 34, y: 30 }, { x: 66, y: 30 }],
  3: [{ x: 50, y: 22 }, { x: 24, y: 38 }, { x: 76, y: 38 }],
  4: [{ x: 50, y: 18 }, { x: 20, y: 32 }, { x: 80, y: 32 }, { x: 36, y: 44 }]
};

export const BUBBLE_POS = {
  1: ['top'],
  2: ['left', 'right'],
  3: ['top', 'right', 'left'],
  4: ['top', 'right', 'left', 'top']
};
