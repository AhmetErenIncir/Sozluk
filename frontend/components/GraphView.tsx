// Main GraphView component integrating all graph functionality
'use client';

import { useEffect, useRef } from 'react';
import { GraphCanvas } from './GraphCanvas';
import { GraphControls } from './GraphControls';
import { Breadcrumb } from './Breadcrumb';
import { useGraphStore } from '@/store/graph-store';
import { useWindowSize } from '@/lib/hooks';
import { WordNode } from '@/lib/graph-types';

interface GraphViewProps {
  initialWord?: string;
  className?: string;
}

export function GraphView({ initialWord = 'kitap', className }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useWindowSize();

  const {
    nodes,
    links,
    centerId,
    physicsEnabled,
    isLoading,
    error,
    loadInitial,
    expandTo,
    clearError,
  } = useGraphStore();

  // Initialize graph on mount
  useEffect(() => {
    if (!centerId && initialWord) {
      loadInitial(initialWord);
    }
  }, [centerId, initialWord, loadInitial]);

  // Handle node clicks in the graph
  const handleNodeClick = async (node: WordNode) => {
    if (isLoading || !node.id) return;

    try {
      await expandTo(node.id);
    } catch (error) {
      console.error('Failed to expand to node:', error);
    }
  };

  // Calculate graph dimensions based on container
  const graphHeight = height ? Math.max(400, height - 200) : 600;
  const graphWidth = width ? Math.max(600, width - 100) : 800;

  // Error handling
  if (error) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <GraphControls />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-destructive text-lg font-semibold mb-2">
              Graf Yüklenemedi
            </div>
            <div className="text-muted-foreground mb-4">
              {error}
            </div>
            <button
              onClick={clearError}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Yeniden Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading && nodes.length === 0) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <GraphControls />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-lg font-semibold mb-2">Graf Yükleniyor</div>
            <div className="text-muted-foreground">
              {initialWord ? `"${initialWord}" kelimesi için ilişkili kelimeler getiriliyor...` : 'Graf verileri yükleniyor...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Top Controls */}
      <GraphControls />

      {/* Breadcrumb Navigation */}
      <div className="border-b bg-muted/5">
        <Breadcrumb className="px-4" maxItems={6} />
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 relative overflow-hidden" ref={containerRef}>
        {nodes.length > 0 ? (
          <GraphCanvas
            nodes={nodes}
            links={links}
            centerId={centerId}
            physicsEnabled={physicsEnabled}
            onNodeClick={handleNodeClick}
            width={graphWidth}
            height={graphHeight}
            linkDistance={80}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <div className="text-muted-foreground text-lg mb-2">
                Graf Boş
              </div>
              <div className="text-sm text-muted-foreground">
                Başlamak için yukarıdan bir kelime arayın
              </div>
            </div>
          </div>
        )}

        {/* Overlay loading indicator for ongoing operations */}
        {isLoading && nodes.length > 0 && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Graf genişletiliyor...</span>
          </div>
        )}

        {/* Graph Statistics Overlay */}
        {nodes.length > 0 && (
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border text-xs text-muted-foreground">
            <div>Kelimeler: {nodes.length}</div>
            <div>Bağlantılar: {links.length}</div>
            {centerId && <div>Merkez: {centerId}</div>}
          </div>
        )}

        {/* Graph Instructions */}
        <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border text-xs text-muted-foreground max-w-xs">
          <div className="font-medium mb-1">Nasıl Kullanılır:</div>
          <ul className="space-y-1">
            <li>• Kelimeye tıklayarak merkez yapın</li>
            <li>• Fare tekerleği ile yakınlaştırın</li>
            <li>• Sürükleyerek grafi hareket ettirin</li>
            <li>• Node'ları sürükleyerek konumlandırın</li>
          </ul>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t bg-muted/5 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Fizik: {physicsEnabled ? 'Aktif' : 'Pasif'}</span>
          {centerId && <span>Merkez: {centerId}</span>}
        </div>
        <div className="flex items-center gap-4">
          <span>{nodes.length} kelime</span>
          <span>{links.length} bağlantı</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Simplified GraphView for embedding in other components
 */
export function EmbeddedGraphView({
  initialWord,
  width = 600,
  height = 400,
  className
}: {
  initialWord?: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const {
    nodes,
    links,
    centerId,
    physicsEnabled,
    loadInitial,
    expandTo,
  } = useGraphStore();

  useEffect(() => {
    if (!centerId && initialWord) {
      loadInitial(initialWord);
    }
  }, [centerId, initialWord, loadInitial]);

  const handleNodeClick = async (node: WordNode) => {
    if (!node.id) return;
    try {
      await expandTo(node.id);
    } catch (error) {
      console.error('Failed to expand node:', error);
    }
  };

  return (
    <div className={`relative border rounded-lg overflow-hidden ${className}`}>
      {nodes.length > 0 ? (
        <GraphCanvas
          nodes={nodes}
          links={links}
          centerId={centerId}
          physicsEnabled={physicsEnabled}
          onNodeClick={handleNodeClick}
          width={width}
          height={height}
          linkDistance={60}
        />
      ) : (
        <div className="flex items-center justify-center" style={{ width, height }}>
          <div className="text-center text-muted-foreground">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <div className="text-sm">Graf yükleniyor...</div>
          </div>
        </div>
      )}
    </div>
  );
}