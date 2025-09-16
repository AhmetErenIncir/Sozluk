// GraphCanvas component using react-force-graph-2d with custom rendering
'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
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
  const [currentZoom, setCurrentZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isZooming, setIsZooming] = useState(false);
  const zoomTimeoutRef = useRef<NodeJS.Timeout>();
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
      // Short delay to ensure nodes are positioned
      setTimeout(() => {
        // Center at origin since we always position center node there
        fgRef.current?.centerAt(0, 0, 600);
        // Reset zoom to default for consistent viewing
        fgRef.current?.zoom(1.2, 600);
        setCurrentZoom(1.2);
      }, 100); // Minimal delay since we have predetermined positions
    }
  }, [centerId]); // Only trigger on centerId change

  // Physics control
  useEffect(() => {
    if (fgRef.current && !isZooming) {
      if (physicsEnabled) {
        fgRef.current.resumeAnimation();
      } else {
        fgRef.current.pauseAnimation();
      }
    }
  }, [physicsEnabled, isZooming]);

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

      // Node styling based on state - larger nodes for better text display
      const baseRadius = 20; // Larger base radius for text visibility
      const radius = isCenter ? baseRadius * 1.3 : baseRadius;
      // Scale font size with zoom level - readable text
      const fontSize = Math.max(12, Math.min(16, 14 / Math.sqrt(globalScale)));

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

      // Text rendering - show label clearly
      const displayText = label || node.id; // Use label or id
      ctx.font = `${isCenter ? 'bold' : 'normal'} ${fontSize}px Inter, system-ui, sans-serif`;

      const textWidth = ctx.measureText(displayText).width;
      const textHeight = fontSize;

      // Draw text directly on the node
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Use smaller font if text is too wide for node
      let finalFontSize = fontSize;
      let finalText = displayText;
      
      // Adjust font size to fit text in node if needed
      if (textWidth > radius * 2.2) {
        finalFontSize = Math.max(10, fontSize * (radius * 2.2 / textWidth));
        ctx.font = `${isCenter ? 'bold' : 'normal'} ${finalFontSize}px Inter, system-ui, sans-serif`;
      }
      
      // Draw the full label on the node
      ctx.fillText(finalText, node.x || 0, node.y || 0);
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
    (node: any, _evt?: MouseEvent) => {
      if (node && typeof onNodeClick === 'function') {
        onNodeClick(node as WordNode);
      }
    },
    [onNodeClick]
  );

  // Handle node hover for cursor change
  const handleNodeHover = useCallback(
    (node: WordNode | null, _prev?: WordNode | null) => {
      try {
        if (fgRef.current && fgRef.current.canvas) {
          const canvas = fgRef.current.canvas();
          if (canvas && canvas.style) {
            canvas.style.cursor = node ? 'pointer' : 'default';
          }
        }
      } catch (e) {
        // Silently handle any errors during hover
        console.debug('Hover cursor update skipped');
      }
    },
    []
  );

  // Define pointer area for nodes so clicks/hover work with custom rendering
  const nodePointerAreaPaint = useCallback(
    (node: any, color: string, ctx: CanvasRenderingContext2D, _globalScale: number) => {
      const isCenter = node.id === centerId;
      const baseRadius = 20; // Match the visual node size
      const radius = isCenter ? baseRadius * 1.3 : baseRadius;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x || 0, node.y || 0, radius + 4, 0, 2 * Math.PI);
      ctx.fill();
    },
    [centerId]
  );

  // Configure d3 forces on mount/updates (use ref API, not props)
  useEffect(() => {
    const api = fgRef.current;
    if (!api) return;
    
    // Don't modify forces while zooming
    if (isZooming) return;
    
    // Charge force - balanced for good clustering
    const charge = api.d3Force('charge');
    if (charge && typeof charge.strength === 'function') {
      charge.strength(-1200); // Balanced repulsion
      if (typeof charge.distanceMin === 'function') charge.distanceMin(40);
      if (typeof charge.distanceMax === 'function') charge.distanceMax(400);
    }
    
    // Link force - maintain connection distances
    const link = api.d3Force('link');
    if (link) {
      if (typeof link.distance === 'function') link.distance(100); // Optimal distance
      if (typeof link.strength === 'function') link.strength(1); // Strong links to maintain structure
    }
    
    // Collision force - prevent nodes from overlapping
    api.d3Force('collide', forceCollide((n: any) => {
      // Adjusted for larger nodes
      return n?.id === centerId ? 35 : 30;
    }).iterations(3));
    
    // Center force - stronger to keep graph centered
    api.d3Force('x', forceX(0).strength(0.05));
    api.d3Force('y', forceY(0).strength(0.05));
    
    // Reheat simulation to apply changes only if not zooming
    if (!isZooming) {
      api.d3ReheatSimulation?.();
    }
  }, [linkDistance, nodes.length, centerId, isZooming]);

  // Manual zoom controls
  const handleZoomIn = useCallback(() => {
    if (!fgRef.current) return;
    
    // Completely stop physics during zoom
    setIsZooming(true);
    fgRef.current.pauseAnimation();
    
    // Stop the D3 simulation
    const simulation = fgRef.current.d3Force;
    if (simulation) {
      simulation.stop();
    }
    
    const newZoom = Math.min(8, currentZoom * 1.2);
    fgRef.current.zoom(newZoom, 400);
    setCurrentZoom(newZoom);
    
    // Resume physics after zoom if it was enabled
    clearTimeout(zoomTimeoutRef.current);
    zoomTimeoutRef.current = setTimeout(() => {
      setIsZooming(false);
      if (physicsEnabled) {
        fgRef.current?.resumeAnimation();
      }
    }, 500);
  }, [currentZoom, physicsEnabled]);

  const handleZoomOut = useCallback(() => {
    if (!fgRef.current) return;
    
    // Completely stop physics during zoom
    setIsZooming(true);
    fgRef.current.pauseAnimation();
    
    // Stop the D3 simulation
    const simulation = fgRef.current.d3Force;
    if (simulation) {
      simulation.stop();
    }
    
    const newZoom = Math.max(0.1, currentZoom * 0.8);
    fgRef.current.zoom(newZoom, 400);
    setCurrentZoom(newZoom);
    
    // Resume physics after zoom if it was enabled
    clearTimeout(zoomTimeoutRef.current);
    zoomTimeoutRef.current = setTimeout(() => {
      setIsZooming(false);
      if (physicsEnabled) {
        fgRef.current?.resumeAnimation();
      }
    }, 500);
  }, [currentZoom, physicsEnabled]);

  const handleZoomReset = useCallback(() => {
    if (!fgRef.current) return;
    
    // Completely stop physics during zoom
    setIsZooming(true);
    fgRef.current.pauseAnimation();
    
    // Stop the D3 simulation
    const simulation = fgRef.current.d3Force;
    if (simulation) {
      simulation.stop();
    }
    
    fgRef.current.zoom(1, 400);
    setCurrentZoom(1);
    
    // Resume physics after zoom if it was enabled
    clearTimeout(zoomTimeoutRef.current);
    zoomTimeoutRef.current = setTimeout(() => {
      setIsZooming(false);
      if (physicsEnabled) {
        fgRef.current?.resumeAnimation();
      }
    }, 500);
  }, [physicsEnabled]);

  // Setup zoom wheel handler
  useEffect(() => {
    if (!containerRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      if (!fgRef.current) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      // Completely stop the physics engine during zoom
      setIsZooming(true);
      fgRef.current.pauseAnimation();
      
      // Stop the D3 simulation completely
      const simulation = fgRef.current.d3Force;
      if (simulation) {
        simulation.stop();
      }
      
      const delta = e.deltaY;
      const zoomFactor = delta > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(8, currentZoom * zoomFactor));
      
      fgRef.current.zoom(newZoom, 100);
      setCurrentZoom(newZoom);
      
      // Resume physics after zoom if it was enabled
      clearTimeout(zoomTimeoutRef.current);
      zoomTimeoutRef.current = setTimeout(() => {
        setIsZooming(false);
        if (physicsEnabled && fgRef.current) {
          fgRef.current.resumeAnimation();
        }
      }, 300);
    };

    const container = containerRef.current;
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      clearTimeout(zoomTimeoutRef.current);
    };
  }, [currentZoom, physicsEnabled]);

  // Track zoom changes from the graph itself
  useEffect(() => {
    if (!fgRef.current) return;
    
    const checkZoom = () => {
      if (fgRef.current && fgRef.current.zoom) {
        const zoom = fgRef.current.zoom();
        if (zoom !== currentZoom) {
          setCurrentZoom(zoom);
        }
      }
    };
    
    const interval = setInterval(checkZoom, 500);
    return () => clearInterval(interval);
  }, [currentZoom]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-lg border bg-background/95">
      <ForceGraph2D
        ref={fgRef}
        graphData={{ nodes, links }}
        width={width}
        height={height}
        backgroundColor="transparent"
        onRenderFramePre={() => { 
          if (physicsEnabled && !isZooming) usedTextPositionsRef.current.clear();
        }}
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={nodePointerAreaPaint}
        linkCanvasObject={linkCanvasObject}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        nodeRelSize={0} // Disable default node rendering
        linkWidth={0} // Disable default link rendering
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={(_l) => 'rgba(59, 130, 246, 0.6)'}
        d3VelocityDecay={0.5} // Quick stabilization
        warmupTicks={20} // Fast initial positioning
        cooldownTicks={50} // Quick settling
        d3AlphaMin={0.01} // Stop simulation sooner
        d3AlphaDecay={0.05} // Faster decay
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        enablePointerInteraction={true}
        minZoom={0.1}
        maxZoom={8}
        onZoom={(evt: any) => {
          if (evt && evt.k) setCurrentZoom(evt.k);
        }}
      />
      
      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-background/95 backdrop-blur-sm rounded-lg p-1 border shadow-lg">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-muted rounded transition-colors"
          title="Yakınlaştır (Zoom In)"
          aria-label="Yakınlaştır"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <button
          onClick={handleZoomReset}
          className="p-2 hover:bg-muted rounded transition-colors text-xs font-medium min-w-[60px]"
          title="Zoom Sıfırla (Reset Zoom)"
          aria-label="Zoom Sıfırla"
        >
          {Math.round(currentZoom * 100)}%
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-muted rounded transition-colors"
          title="Uzaklaştır (Zoom Out)"
          aria-label="Uzaklaştır"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
      </div>
    </div>
  );
}
