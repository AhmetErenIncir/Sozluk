// GraphCanvas component using react-force-graph-2d with custom rendering
'use client';

import { useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { WordNode, WordLink } from '@/lib/graph-types';
import { truncateText } from '@/lib/text-utils';
import { findOptimalTextPosition, TextBounds, getTextBounds } from '@/lib/graph-positioning';
import { forceCollide, forceX, forceY } from 'd3-force-3d';

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-muted/10 rounded-lg">
      <div className="text-muted-foreground">Loading graph visualization...</div>
    </div>
  ),
});

interface GraphCanvasProps {
  nodes: WordNode[];
  links: WordLink[];
  centerId: string | null;
  physicsEnabled: boolean;
  onNodeClick: (node: WordNode) => void;
  width?: number;
  height?: number;
  linkDistance?: number;
}

export function GraphCanvas({
  nodes,
  links,
  centerId,
  physicsEnabled,
  onNodeClick,
  width,
  height,
  linkDistance = 80,
}: GraphCanvasProps) {
  const fgRef = useRef<any>(null);
  const usedTextPositionsRef = useRef<Map<string, TextBounds>>(new Map());

  // Helper: draw rounded rectangle with fallback for older Canvas typings
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    const anyCtx = ctx as any;
    if (typeof anyCtx.roundRect === 'function') {
      anyCtx.roundRect(x, y, width, height, radius);
      return;
    }
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.arcTo(x + width, y, x + width, y + r, r);
    ctx.lineTo(x + width, y + height - r);
    ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
    ctx.lineTo(x + r, y + height);
    ctx.arcTo(x, y + height, x, y + height - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
  };

  // Auto-zoom and center on center changes
  useEffect(() => {
    if (fgRef.current && centerId) {
      const centerNode = nodes.find(node => node.id === centerId);
      if (centerNode && centerNode.x !== undefined && centerNode.y !== undefined) {
        // Smooth transition to new center
        setTimeout(() => {
          fgRef.current?.centerAt(centerNode.x, centerNode.y, 1000);
          fgRef.current?.zoom(1.2, 1000);
        }, 100);
      }
    }
  }, [centerId, nodes]);

  // Physics control
  useEffect(() => {
    if (fgRef.current) {
      if (physicsEnabled) {
        fgRef.current.resumeAnimation();
      } else {
        fgRef.current.pauseAnimation();
      }
    }
  }, [physicsEnabled]);

  // Clear text positions when nodes/center change significantly
  useEffect(() => {
    usedTextPositionsRef.current.clear();
  }, [nodes.length, centerId]);

  // Custom node rendering function with smart text positioning
  const nodeCanvasObject = useCallback(
    (node: WordNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.label || node.id;
      const isCenter = node.id === centerId;
      const isVisited = node.isVisited || false;

      // Node styling based on state
      const baseRadius = 12; // Larger base radius
      const radius = isCenter ? baseRadius * 2 : baseRadius;
      // Scale font size with zoom level
      const fontSize = Math.max(10, Math.min(22, 14 * Math.sqrt(globalScale)));

      // Node colors (dark mode friendly)
      let nodeColor = '#64748b'; // slate-500 (default)
      let textColor = '#f8fafc'; // slate-50
      let strokeColor = '#475569'; // slate-600

      if (isCenter) {
        nodeColor = '#3b82f6'; // blue-500 (center)
        strokeColor = '#1d4ed8'; // blue-700
        textColor = '#ffffff';
      } else if (isVisited) {
        nodeColor = '#8b5cf6'; // violet-500 (visited)
        strokeColor = '#7c3aed'; // violet-600
      }

      // Draw glow effect for center node
      if (isCenter) {
        const glowRadius = radius + 8;
        const glowGradient = ctx.createRadialGradient(
          node.x || 0, node.y || 0, 0,
          node.x || 0, node.y || 0, glowRadius
        );
        glowGradient.addColorStop(0, 'rgba(59, 130, 246, 0.6)');
        glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(node.x || 0, node.y || 0, glowRadius, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Draw node circle with larger stroke
      ctx.fillStyle = nodeColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3; // Thicker border
      ctx.beginPath();
      ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Text rendering with smart positioning
      const maxChars = Math.max(6, Math.min(16, Math.floor(12 / Math.sqrt(globalScale))));
      const displayText = truncateText(label, maxChars);
      ctx.font = `${isCenter ? 'bold' : 'normal'} ${fontSize}px Inter, system-ui, sans-serif`;

      const textWidth = ctx.measureText(displayText).width;
      const textHeight = fontSize;

      // Compute optimal text position based on current node positions
      const computed = findOptimalTextPosition(
        node,
        radius,
        fontSize,
        textWidth,
        textHeight,
        nodes,
        usedTextPositionsRef.current
      );
      const paddingCompute = Math.max(6, fontSize * 0.5);
      const bounds = getTextBounds(computed.x, computed.y, textWidth, textHeight, paddingCompute);
      usedTextPositionsRef.current.set(node.id, bounds);
      const textPos = { x: computed.x, y: computed.y };

      // Larger padding for better readability
      const padding = Math.max(6, Math.min(12, 8 * Math.sqrt(globalScale)));

      // Background rect for text with rounded corners
      const rectX = textPos.x - textWidth / 2 - padding;
      const rectY = textPos.y - fontSize / 2 - padding;
      const rectWidth = textWidth + padding * 2;
      const rectHeight = textHeight + padding * 2;
      const cornerRadius = 6;

      // Draw rounded rectangle background
      ctx.fillStyle = isCenter ? 'rgba(29, 78, 216, 0.9)' : 'rgba(0, 0, 0, 0.8)';
      ctx.beginPath();
      drawRoundedRect(ctx, rectX, rectY, rectWidth, rectHeight, cornerRadius);
      ctx.fill();

      // Add subtle border to text background
      ctx.strokeStyle = isCenter ? 'rgba(59, 130, 246, 0.8)' : 'rgba(100, 116, 139, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw text with better positioning
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayText, textPos.x, textPos.y);
    },
    [centerId, nodes]
  );

  // Custom link rendering
  const linkCanvasObject = useCallback(
    (link: WordLink, ctx: CanvasRenderingContext2D) => {
      const isFromCenter = link.source === centerId || link.target === centerId;

      // Link styling
      ctx.strokeStyle = isFromCenter
        ? 'rgba(59, 130, 246, 0.8)' // blue for center links
        : 'rgba(100, 116, 139, 0.6)'; // slate for others
      ctx.lineWidth = isFromCenter ? 2.5 : 1.5;

      // Draw the link
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);

      if (sourceNode && targetNode) {
        ctx.beginPath();
        ctx.moveTo(sourceNode.x || 0, sourceNode.y || 0);
        ctx.lineTo(targetNode.x || 0, targetNode.y || 0);
        ctx.stroke();
      }
    },
    [centerId, nodes]
  );

  // Handle node clicks
  const handleNodeClick = useCallback(
    (node: any) => {
      if (node && typeof onNodeClick === 'function') {
        onNodeClick(node as WordNode);
      }
    },
    [onNodeClick]
  );

  // Handle node hover for cursor change
  const handleNodeHover = useCallback(
    (node: WordNode | null, _prev?: WordNode | null) => {
      if (fgRef.current) {
        fgRef.current.canvas().style.cursor = node ? 'pointer' : 'default';
      }
    },
    []
  );

  // Configure d3 forces on mount/updates (use ref API, not props)
  useEffect(() => {
    const api = fgRef.current;
    if (!api) return;
    const charge = api.d3Force('charge');
    if (charge && typeof charge.strength === 'function') {
      charge.strength(-2000);
      if (typeof charge.distanceMin === 'function') charge.distanceMin(50);
      if (typeof charge.distanceMax === 'function') charge.distanceMax(1200);
    }
    const link = api.d3Force('link');
    if (link) {
      if (typeof link.distance === 'function') link.distance(linkDistance);
      if (typeof link.strength === 'function') link.strength(0.7);
    }
    // Add collision and mild axis forces to spread nodes
    api.d3Force('collide', forceCollide((n: any) => (n?.id === centerId ? 28 : 20)).iterations(2));
    api.d3Force('x', forceX(0).strength(0.02));
    api.d3Force('y', forceY(0).strength(0.02));
    // Reheat simulation to apply changes
    api.d3ReheatSimulation?.();
  }, [linkDistance, nodes.length, centerId]);

  return (
    <div className="w-full h-full overflow-hidden rounded-lg border bg-background/95">
      <ForceGraph2D
        ref={fgRef}
        graphData={{ nodes, links }}
        width={width}
        height={height}
        backgroundColor="transparent"
        onRenderFramePre={() => { if (physicsEnabled) usedTextPositionsRef.current.clear(); }}
        nodeCanvasObject={nodeCanvasObject}
        linkCanvasObject={linkCanvasObject}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        nodeRelSize={0} // Disable default node rendering
        linkWidth={0} // Disable default link rendering
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={(_l) => 'rgba(59, 130, 246, 0.6)'}
        d3VelocityDecay={0.15} // Even slower decay for very smooth settling
        warmupTicks={300} // Extended warmup for optimal initial layout
        cooldownTicks={500} // Much longer cooldown for stability
        d3AlphaMin={0.001} // Lower alpha minimum for better convergence
        d3AlphaDecay={0.02} // Slower alpha decay
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        enablePointerInteraction={true}
        minZoom={0.1}
        maxZoom={8}
      />
    </div>
  );
}
