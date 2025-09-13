// GraphCanvas component using react-force-graph-2d with custom rendering
'use client';

import { useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { WordNode, WordLink } from '@/lib/graph-types';
import { truncateText } from '@/lib/text-utils';

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

  // Custom node rendering function
  const nodeCanvasObject = useCallback(
    (node: WordNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const label = node.label || node.id;
      const isCenter = node.id === centerId;
      const isVisited = node.isVisited || false;

      // Node styling based on state
      const baseRadius = 8;
      const radius = isCenter ? baseRadius * 1.8 : baseRadius;
      // Scale font size with zoom level - larger when zoomed in
      const fontSize = Math.max(8, Math.min(24, 12 * Math.sqrt(globalScale)));

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
        const glowRadius = radius + 6;
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

      // Draw node circle
      ctx.fillStyle = nodeColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(node.x || 0, node.y || 0, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Text rendering with background for readability
      const maxChars = Math.max(8, Math.min(20, Math.floor(15 / Math.sqrt(globalScale))));
      const displayText = truncateText(label, maxChars);
      ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
      ctx.fontWeight = isCenter ? 'bold' : 'normal';

      const textWidth = ctx.measureText(displayText).width;
      const textHeight = fontSize;

      // Position text below the node
      const padding = Math.max(2, Math.min(8, 4 * Math.sqrt(globalScale)));
      const textX = node.x || 0;
      const textY = (node.y || 0) + radius + fontSize + padding * 2;

      // Background rect for text
      const rectX = textX - textWidth / 2 - padding;
      const rectY = textY - fontSize / 2 - padding;
      const rectWidth = textWidth + padding * 2;
      const rectHeight = textHeight + padding * 2;

      // Semi-transparent background
      ctx.fillStyle = isCenter ? 'rgba(29, 78, 216, 0.8)' : 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

      // Text - positioned below the node
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayText, textX, textY);
    },
    [centerId]
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
  const handleNodeHover = useCallback((node: WordNode | null) => {
    if (fgRef.current) {
      fgRef.current.canvas().style.cursor = node ? 'pointer' : 'default';
    }
  }, []);

  return (
    <div className="w-full h-full overflow-hidden rounded-lg border bg-background/95">
      <ForceGraph2D
        ref={fgRef}
        graphData={{ nodes, links }}
        width={width}
        height={height}
        backgroundColor="transparent"
        nodeCanvasObject={nodeCanvasObject}
        linkCanvasObject={linkCanvasObject}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        nodeRelSize={0} // Disable default node rendering
        linkWidth={0} // Disable default link rendering
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => 'rgba(59, 130, 246, 0.6)'}
        // Force simulation settings - much larger distances between nodes
        d3Force={{
          charge: { strength: -1500 },
          link: { distance: linkDistance * 2.5 },
          center: { strength: 0.05 },
          collision: { radius: 80 },
        }}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        cooldownTicks={200}
        enableNodeDrag={true}
        enableZoomPanInteraction={true}
        enablePointerInteraction={true}
        minZoom={0.1}
        maxZoom={8}
      />
    </div>
  );
}