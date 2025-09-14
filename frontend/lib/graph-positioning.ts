// Graph positioning utilities for Visual Thesaurus-like layout
import { WordNode } from './graph-types';

export interface TextPosition {
  x: number;
  y: number;
  angle: number;
}

export interface TextBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculate text bounds for collision detection
 */
export function getTextBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  padding: number = 6
): TextBounds {
  return {
    x: x - width / 2 - padding,
    y: y - height / 2 - padding,
    width: width + padding * 2,
    height: height + padding * 2,
  };
}

/**
 * Check if two rectangles overlap
 */
export function rectanglesOverlap(rect1: TextBounds, rect2: TextBounds): boolean {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  );
}

/**
 * Generate optimal text positions around a node
 * Returns positions in order of preference (bottom preferred for reading)
 */
export function generateTextPositions(
  nodeX: number,
  nodeY: number,
  nodeRadius: number,
  fontSize: number,
  textOffset: number = 25
): TextPosition[] {
  const baseOffset = nodeRadius + fontSize / 2 + textOffset;

  return [
    // Primary positions (cardinal directions)
    { x: nodeX, y: nodeY + baseOffset, angle: 180 }, // bottom (preferred)
    { x: nodeX + baseOffset, y: nodeY, angle: 90 }, // right
    { x: nodeX, y: nodeY - baseOffset, angle: 0 }, // top
    { x: nodeX - baseOffset, y: nodeY, angle: 270 }, // left

    // Secondary positions (diagonal)
    { x: nodeX + baseOffset * 0.7, y: nodeY + baseOffset * 0.7, angle: 135 }, // bottom-right
    { x: nodeX - baseOffset * 0.7, y: nodeY + baseOffset * 0.7, angle: 225 }, // bottom-left
    { x: nodeX + baseOffset * 0.7, y: nodeY - baseOffset * 0.7, angle: 45 }, // top-right
    { x: nodeX - baseOffset * 0.7, y: nodeY - baseOffset * 0.7, angle: 315 }, // top-left

    // Fallback positions (further out)
    { x: nodeX, y: nodeY + baseOffset * 1.5, angle: 180 }, // far bottom
    { x: nodeX + baseOffset * 1.5, y: nodeY, angle: 90 }, // far right
    { x: nodeX, y: nodeY - baseOffset * 1.5, angle: 0 }, // far top
    { x: nodeX - baseOffset * 1.5, y: nodeY, angle: 270 }, // far left
  ];
}

/**
 * Find optimal text position that avoids overlaps with other nodes and texts
 */
export function findOptimalTextPosition(
  node: WordNode,
  nodeRadius: number,
  fontSize: number,
  textWidth: number,
  textHeight: number,
  allNodes: WordNode[],
  usedTextPositions: Map<string, TextBounds> = new Map()
): TextPosition {
  const nodeX = node.x || 0;
  const nodeY = node.y || 0;

  const positions = generateTextPositions(nodeX, nodeY, nodeRadius, fontSize);
  const padding = Math.max(6, fontSize * 0.5);

  for (const position of positions) {
    const textBounds = getTextBounds(position.x, position.y, textWidth, textHeight, padding);

    // Check for overlaps with other nodes
    let overlapsWithNode = false;
    for (const otherNode of allNodes) {
      if (otherNode.id === node.id) continue;

      const otherX = otherNode.x || 0;
      const otherY = otherNode.y || 0;
      const distance = Math.sqrt(
        Math.pow(position.x - otherX, 2) + Math.pow(position.y - otherY, 2)
      );

      // Minimum distance from text to any node
      if (distance < 50) {
        overlapsWithNode = true;
        break;
      }
    }

    if (overlapsWithNode) continue;

    // Check for overlaps with existing text positions
    let overlapsWithText = false;
    for (const existingBounds of usedTextPositions.values()) {
      if (rectanglesOverlap(textBounds, existingBounds)) {
        overlapsWithText = true;
        break;
      }
    }

    if (!overlapsWithText) {
      // Found a good position, mark it as used
      usedTextPositions.set(node.id, textBounds);
      return position;
    }
  }

  // If no ideal position found, use bottom with additional offset
  const fallbackPosition = {
    x: nodeX,
    y: nodeY + nodeRadius + fontSize + 30 + Math.random() * 20, // Add some randomness to reduce clustering
    angle: 180
  };

  const fallbackBounds = getTextBounds(
    fallbackPosition.x,
    fallbackPosition.y,
    textWidth,
    textHeight,
    padding
  );

  usedTextPositions.set(node.id, fallbackBounds);
  return fallbackPosition;
}

/**
 * Calculate repulsion force to prevent node overlap
 */
export function calculateRepulsionForce(
  node1: WordNode,
  node2: WordNode,
  strength: number = 1000
): { fx: number; fy: number } {
  const x1 = node1.x || 0;
  const y1 = node1.y || 0;
  const x2 = node2.x || 0;
  const y2 = node2.y || 0;

  const dx = x1 - x2;
  const dy = y1 - y2;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    return { fx: Math.random() * 2 - 1, fy: Math.random() * 2 - 1 };
  }

  const force = strength / (distance * distance);
  const fx = (dx / distance) * force;
  const fy = (dy / distance) * force;

  return { fx, fy };
}

/**
 * Optimize node positions to minimize overlaps
 */
export function optimizeNodePositions(nodes: WordNode[]): WordNode[] {
  const optimizedNodes = [...nodes];
  const iterations = 50;
  const minDistance = 100;

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < optimizedNodes.length; i++) {
      const node = optimizedNodes[i];
      let totalFx = 0;
      let totalFy = 0;

      for (let j = 0; j < optimizedNodes.length; j++) {
        if (i === j) continue;

        const otherNode = optimizedNodes[j];
        const { fx, fy } = calculateRepulsionForce(node, otherNode, 5000);

        totalFx += fx;
        totalFy += fy;
      }

      // Apply force with damping
      const damping = 0.1;
      const newX = (node.x || 0) + totalFx * damping;
      const newY = (node.y || 0) + totalFy * damping;

      optimizedNodes[i] = {
        ...node,
        x: newX,
        y: newY
      };
    }
  }

  return optimizedNodes;
}