import { Position, internalsSymbol, Node, XYPosition } from "reactflow";

interface NodeHandleBounds {
  position: Position;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NodeInternals extends Node {
  positionAbsolute?: XYPosition;
  width?: number | null; // Allow undefined
  height?: number | null; // Allow undefined
  [internalsSymbol]: {
    handleBounds: {
      source: NodeHandleBounds[];
      target: NodeHandleBounds[];
    };
  };
}

// returns the position (top, right, bottom, or left) of nodeA compared to nodeB
function getParams(
  nodeA: NodeInternals,
  nodeB: NodeInternals
): [number, number, Position] {
  const centerA = getNodeCenter(nodeA);
  const centerB = getNodeCenter(nodeB);

  const horizontalDiff = Math.abs(centerA.x - centerB.x);
  const verticalDiff = Math.abs(centerA.y - centerB.y);

  let position: Position;

  // when the horizontal difference between the nodes is bigger, we use Position.Left or Position.Right for the handle
  if (horizontalDiff > verticalDiff) {
    position = centerA.x > centerB.x ? Position.Left : Position.Right;
  } else {
    // here the vertical difference between the nodes is bigger, so we use Position.Top or Position.Bottom for the handle
    position = centerA.y > centerB.y ? Position.Top : Position.Bottom;
  }

  const [x, y] = getHandleCoordsByPosition(nodeA, position);
  return [x, y, position];
}

function getHandleCoordsByPosition(
  node: NodeInternals,
  handlePosition: Position
): [number, number] {
  if (!node[internalsSymbol] || !node[internalsSymbol].handleBounds) {
    throw new Error(`Handle bounds not found for position ${handlePosition}`);
  }

  // all handles are of type source, that's why we use handleBounds.source here
  const handle = node[internalsSymbol].handleBounds.source.find(
    (h) => h.position === handlePosition
  );

  if (!handle) {
    throw new Error(`Handle not found for position ${handlePosition}`);
  }

  let offsetX = handle.width / 2;
  let offsetY = handle.height / 2;

  // this is a tiny detail to make the markerEnd of an edge visible.
  // The handle position that gets calculated has the origin top-left, so depending on which side we are using, we add a little offset
  // when the handlePosition is Position.Right, for example, we need to add an offset as big as the handle itself in order to get the correct position
  switch (handlePosition) {
    case Position.Left:
      offsetX = 0;
      break;
    case Position.Right:
      offsetX = handle.width;
      break;
    case Position.Top:
      offsetY = 0;
      break;
    case Position.Bottom:
      offsetY = handle.height;
      break;
  }

  if (!node.positionAbsolute) {
    throw new Error(`Node positionAbsolute is undefined for node ${node.id}`);
  }

  const x = node.positionAbsolute.x + handle.x + offsetX;
  const y = node.positionAbsolute.y + handle.y + offsetY;

  return [x, y];
}

function getNodeCenter(node: NodeInternals): { x: number; y: number } {
  if (!node.positionAbsolute) {
    throw new Error(`Node positionAbsolute is undefined for node ${node.id}`);
  }

  const width = node.width ?? 0;
  const height = node.height ?? 0;

  return {
    x: node.positionAbsolute.x + width / 2,
    y: node.positionAbsolute.y + height / 2,
  };
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(
  source: NodeInternals,
  target: NodeInternals
): {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  sourcePos: Position;
  targetPos: Position;
} {
  const [sx, sy, sourcePos] = getParams(source, target);
  const [tx, ty, targetPos] = getParams(target, source);

  return {
    sx,
    sy,
    tx,
    ty,
    sourcePos,
    targetPos,
  };
}
