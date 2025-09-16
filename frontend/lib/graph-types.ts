// Graph data structures and types for Visual Thesaurus-style interface

export interface WordNode {
  id: string;
  label: string;
  isCenter?: boolean;
  isVisited?: boolean;
  degree?: number;
  x?: number;
  y?: number;
}

export interface WordLink {
  source: string;
  target: string;
  kind?: 'related';
}

export interface GraphPayload {
  word: string;
  related: string[];
}

export interface GraphState {
  nodes: WordNode[];
  links: WordLink[];
  centerId: string | null;
  history: string[];
  visitedCenters: Record<string, true>;
  maxNodes: number;
  maxRelatedPerNode: number;
  physicsEnabled: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface GraphActions {
  loadInitial: (word: string) => Promise<void>;
  expandTo: (word: string) => Promise<void>;
  goBack: () => void;
  reset: () => void;
  setMaxNodes: (n: number) => void;
  setMaxRelatedPerNode: (n: number) => void;
  togglePhysics: () => void;
  clearError: () => void;
}

// API response validation schema
export interface ApiGraphResponse {
  success: boolean;
  data?: GraphPayload;
  error?: string;
}