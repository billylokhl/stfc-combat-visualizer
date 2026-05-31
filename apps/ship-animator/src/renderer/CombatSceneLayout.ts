import type { ShipVisualDefinition } from '@stfc-vi/visualization-model';

export interface Point {
  x: number;
  y: number;
}

export interface CombatSceneLayout {
  attackerAnchor: Point;
  defenderAnchor: Point;
  attackerScale: number;
  defenderScale: number;
}

function calculateScale(
  visualDefinition: ShipVisualDefinition,
  availableWidth: number,
  availableHeight: number
): number {
  const hull = visualDefinition.hull;
  const maxVisualWidth = Math.max(
    hull.width,
    ...visualDefinition.hardpoints.map((hardpoint) =>
      Math.abs(hardpoint.location.x) * 2 + 32
    )
  );
  const maxVisualHeight = Math.max(
    hull.height,
    ...visualDefinition.hardpoints.map((hardpoint) =>
      Math.abs(hardpoint.location.y) * 2 + 32
    )
  );

  return Math.min(
    availableWidth / maxVisualWidth,
    availableHeight / maxVisualHeight,
    2
  );
}

export function createCombatSceneLayout(
  width: number,
  height: number,
  attackerVisual: ShipVisualDefinition,
  defenderVisual: ShipVisualDefinition
): CombatSceneLayout {
  const halfWidth = width / 2;
  const availableWidth = halfWidth * 0.65;
  const availableHeight = height * 0.65;

  return {
    attackerAnchor: {
      x: width * 0.25,
      y: height * 0.5,
    },
    defenderAnchor: {
      x: width * 0.75,
      y: height * 0.5,
    },
    attackerScale: calculateScale(attackerVisual, availableWidth, availableHeight),
    defenderScale: calculateScale(defenderVisual, availableWidth, availableHeight),
  };
}
