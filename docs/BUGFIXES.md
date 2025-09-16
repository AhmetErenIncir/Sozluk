# Bug Fixes

## Graph Node Collision Issue - 2025-09-16

### Problem
When the graph visualization was initially loaded, all nodes would collapse onto each other at the center point, making the graph unusable and unreadable. This occurred because nodes weren't being assigned initial positions before the force simulation started.

### Solution
Several improvements were made to fix the graph visualization:

1. **Initial Node Positioning**
   - Added a circular layout system for initial node positions
   - Center node is placed at origin (0,0)
   - Related nodes are evenly distributed in a circle around the center
   - Radius of 150px for initial node placement
   - Position persistence for existing nodes

2. **Force Simulation Parameters**
   - Increased repulsion strength (-3000 from -2000)
   - Increased minimum distance between nodes (80px from 50px)
   - Enhanced collision detection
   - Optimized simulation parameters for stability
   - Added separate collision radii for center (80px) and regular nodes (60px)

3. **Graph Layout Adjustments**
   - Reduced default link distance to 150px for better compactness
   - Improved force parameter balancing
   - Added controlled randomness to prevent exact overlaps
   - Optimized force decay and simulation ticks

### Implementation Details

The fix was implemented across several files:

#### `frontend/store/graph-store.ts`:
```typescript
function generateInitialPositions(
  centerNode: string,
  relatedNodes: string[],
  existingNodes: Map<string, WordNode>
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  
  // Center node at origin
  const centerExisting = existingNodes.get(centerNode);
  if (!centerExisting || centerExisting.x === undefined) {
    positions.set(centerNode, { x: 0, y: 0 });
  }
  
  // Arrange related nodes in a circle
  const radius = 150;
  const angleStep = (2 * Math.PI) / Math.max(1, relatedNodes.length);
  
  relatedNodes.forEach((nodeId, index) => {
    const existing = existingNodes.get(nodeId);
    if (!existing || existing.x === undefined) {
      const angle = index * angleStep;
      positions.set(nodeId, {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }
  });
  
  return positions;
}
```

#### `frontend/components/GraphCanvas.tsx`:
```typescript
// Force simulation configuration
useEffect(() => {
  const api = fgRef.current;
  if (!api) return;
  
  // Charge force - stronger repulsion
  const charge = api.d3Force('charge');
  if (charge && typeof charge.strength === 'function') {
    charge.strength(-3000);
    if (typeof charge.distanceMin === 'function') charge.distanceMin(80);
    if (typeof charge.distanceMax === 'function') charge.distanceMax(1500);
  }
  
  // Collision detection
  api.d3Force('collide', forceCollide((n: any) => {
    return n?.id === centerId ? 80 : 60;
  }).iterations(3));
  
  // Gentle centering force
  api.d3Force('x', forceX(0).strength(0.01));
  api.d3Force('y', forceY(0).strength(0.01));
  
  api.d3ReheatSimulation?.();
}, [linkDistance, nodes.length, centerId]);
```

### Results
- Nodes now appear in a clear, readable layout from the start
- No more node collisions or overlapping
- Smooth transitions when expanding the graph
- Better overall stability and usability

### Testing
The fix has been tested with various scenarios:
- Initial graph loading
- Adding new nodes through expansion
- Different word lengths and node counts
- Various screen sizes and zoom levels

