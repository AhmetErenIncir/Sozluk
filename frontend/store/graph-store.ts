// Zustand store for graph state management with persistence
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GraphState, GraphActions, WordNode, WordLink, GraphPayload } from '@/lib/graph-types';
import { createDataSource } from '@/lib/datasource';
import { normalizeWord, dedupeWords } from '@/lib/text-utils';

interface GraphStore extends GraphState, GraphActions {}

const dataSource = createDataSource();

// Default state
const initialState: GraphState = {
  nodes: [],
  links: [],
  centerId: null,
  history: [],
  visitedCenters: {},
  maxNodes: 250,
  maxRelatedPerNode: 20,
  physicsEnabled: true,
  isLoading: false,
  error: null,
};

/**
 * Prunes graph nodes using BFS from center to maintain performance
 * Never prunes nodes that are in history (previous centers)
 */
function pruneGraph(
  nodes: WordNode[],
  links: WordLink[],
  centerId: string | null,
  history: string[],
  maxNodes: number
): { nodes: WordNode[]; links: WordLink[] } {
  if (nodes.length <= maxNodes || !centerId) {
    return { nodes, links };
  }

  const protectedNodes = new Set([...history, centerId]);
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const adjacencyList = new Map<string, Set<string>>();

  // Build adjacency list
  nodes.forEach(node => adjacencyList.set(node.id, new Set()));
  links.forEach(link => {
    adjacencyList.get(link.source)?.add(link.target);
    adjacencyList.get(link.target)?.add(link.source);
  });

  // BFS to find nodes to keep
  const queue: Array<{ id: string; distance: number }> = [{ id: centerId, distance: 0 }];
  const visited = new Set<string>();
  const nodesToKeep = new Set<string>();

  while (queue.length > 0 && nodesToKeep.size < maxNodes) {
    const { id, distance } = queue.shift()!;

    if (visited.has(id)) continue;
    visited.add(id);
    nodesToKeep.add(id);

    // Add neighbors to queue (limit distance to prevent too sparse graphs)
    if (distance < 3) {
      const neighbors = adjacencyList.get(id) || new Set();
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          queue.push({ id: neighborId, distance: distance + 1 });
        }
      }
    }
  }

  // Ensure all protected nodes are kept
  protectedNodes.forEach(nodeId => nodesToKeep.add(nodeId));

  // Filter nodes and links
  const prunedNodes = nodes.filter(node => nodesToKeep.has(node.id));
  const prunedLinks = links.filter(
    link => nodesToKeep.has(link.source) && nodesToKeep.has(link.target)
  );

  return { nodes: prunedNodes, links: prunedLinks };
}

/**
 * Merges new graph data with existing data, avoiding duplicates
 */
function mergeGraphData(
  existingNodes: WordNode[],
  existingLinks: WordLink[],
  newData: GraphPayload,
  centerId: string,
  maxRelatedPerNode: number
): { nodes: WordNode[]; links: WordLink[] } {
  const nodeMap = new Map(existingNodes.map(node => [node.id, node]));
  const linkSet = new Set(existingLinks.map(link => `${link.source}-${link.target}`));

  // Add center node if it doesn't exist
  if (!nodeMap.has(centerId)) {
    nodeMap.set(centerId, {
      id: centerId,
      label: newData.word,
      isCenter: true,
      degree: 0,
    });
  } else {
    // Update existing node to be center
    const existingNode = nodeMap.get(centerId)!;
    existingNode.isCenter = true;
  }

  // Limit related words per the configuration
  const limitedRelated = newData.related.slice(0, maxRelatedPerNode);

  // Add related nodes and links
  limitedRelated.forEach(relatedWord => {
    const normalizedRelated = normalizeWord(relatedWord);

    // Skip self-links
    if (normalizedRelated === centerId) return;

    // Add related node if it doesn't exist
    if (!nodeMap.has(normalizedRelated)) {
      nodeMap.set(normalizedRelated, {
        id: normalizedRelated,
        label: relatedWord,
        degree: 1,
      });
    } else {
      // Update degree
      const existingNode = nodeMap.get(normalizedRelated)!;
      existingNode.degree = (existingNode.degree || 0) + 1;
    }

    // Add link if it doesn't exist
    const linkKey = `${centerId}-${normalizedRelated}`;
    const reverseLinkKey = `${normalizedRelated}-${centerId}`;

    if (!linkSet.has(linkKey) && !linkSet.has(reverseLinkKey)) {
      linkSet.add(linkKey);
      existingLinks.push({
        source: centerId,
        target: normalizedRelated,
        kind: 'related',
      });
    }
  });

  // Update center node degree
  const centerNode = nodeMap.get(centerId)!;
  centerNode.degree = limitedRelated.length;

  return {
    nodes: Array.from(nodeMap.values()),
    links: existingLinks,
  };
}

export const useGraphStore = create<GraphStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      loadInitial: async (word: string) => {
        set({ isLoading: true, error: null });

        try {
          const normalizedWord = normalizeWord(word);
          if (!normalizedWord) {
            throw new Error('Invalid word provided');
          }

          const data = await dataSource.fetchWord(normalizedWord);

          // Create initial graph
          const { nodes, links } = mergeGraphData(
            [],
            [],
            data,
            normalizedWord,
            get().maxRelatedPerNode
          );

          set({
            nodes,
            links,
            centerId: normalizedWord,
            history: [normalizedWord],
            visitedCenters: { [normalizedWord]: true },
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Failed to load initial word:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load word',
          });
        }
      },

      expandTo: async (word: string) => {
        const state = get();
        const normalizedWord = normalizeWord(word);

        if (!normalizedWord) return;

        // Prevent infinite loops
        if (state.visitedCenters[normalizedWord] && state.centerId === normalizedWord) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const data = await dataSource.fetchWord(normalizedWord);

          // Update all nodes to not be center
          const updatedNodes = state.nodes.map(node => ({
            ...node,
            isCenter: false,
          }));

          // Merge new data with existing graph
          const { nodes, links } = mergeGraphData(
            updatedNodes,
            [...state.links],
            data,
            normalizedWord,
            state.maxRelatedPerNode
          );

          // Prune if necessary
          const { nodes: prunedNodes, links: prunedLinks } = pruneGraph(
            nodes,
            links,
            normalizedWord,
            [...state.history, normalizedWord],
            state.maxNodes
          );

          // Mark visited nodes
          const finalNodes = prunedNodes.map(node => ({
            ...node,
            isVisited: state.visitedCenters[node.id] || node.id === normalizedWord,
          }));

          set({
            nodes: finalNodes,
            links: prunedLinks,
            centerId: normalizedWord,
            history: [...state.history, normalizedWord],
            visitedCenters: { ...state.visitedCenters, [normalizedWord]: true },
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Failed to expand to word:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to expand word',
          });
        }
      },

      goBack: () => {
        const state = get();
        if (state.history.length <= 1) return;

        const newHistory = [...state.history];
        newHistory.pop(); // Remove current center
        const previousCenter = newHistory[newHistory.length - 1];

        // Update nodes to reflect new center
        const updatedNodes = state.nodes.map(node => ({
          ...node,
          isCenter: node.id === previousCenter,
        }));

        set({
          nodes: updatedNodes,
          history: newHistory,
          centerId: previousCenter,
        });
      },

      reset: () => {
        const state = get();
        set({
          ...initialState,
          maxNodes: state.maxNodes,
          maxRelatedPerNode: state.maxRelatedPerNode,
          physicsEnabled: state.physicsEnabled,
        });

        // Reload with default word
        get().loadInitial('kitap');
      },

      setMaxNodes: (maxNodes: number) => {
        const state = get();
        set({ maxNodes });

        // Prune immediately if current graph exceeds new limit
        if (state.nodes.length > maxNodes && state.centerId) {
          const { nodes, links } = pruneGraph(
            state.nodes,
            state.links,
            state.centerId,
            state.history,
            maxNodes
          );
          set({ nodes, links });
        }
      },

      setMaxRelatedPerNode: (maxRelatedPerNode: number) => {
        set({ maxRelatedPerNode });
      },

      togglePhysics: () => {
        set(state => ({ physicsEnabled: !state.physicsEnabled }));
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'graph-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist settings, not the graph data itself
      partialize: (state) => ({
        maxNodes: state.maxNodes,
        maxRelatedPerNode: state.maxRelatedPerNode,
        physicsEnabled: state.physicsEnabled,
      }),
    }
  )
);