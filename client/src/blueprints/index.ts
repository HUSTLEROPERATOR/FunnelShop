import type { Blueprint } from '../types';

const BLUEPRINT_ORDER = [
  'restaurant-ads-funnel',
  'email-marketing-funnel',
  'event-promotion-funnel',
] as const;

const blueprintModules = import.meta.glob<Blueprint>('./*.json', {
  eager: true,
  import: 'default',
});

const orderedBlueprints = Object.values(blueprintModules).sort((left, right) => {
  const leftIndex = BLUEPRINT_ORDER.indexOf(left.id as (typeof BLUEPRINT_ORDER)[number]);
  const rightIndex = BLUEPRINT_ORDER.indexOf(right.id as (typeof BLUEPRINT_ORDER)[number]);

  return leftIndex - rightIndex;
});

export const blueprints = orderedBlueprints;

export const getBlueprintById = (blueprintId: string): Blueprint | undefined =>
  blueprints.find((blueprint) => blueprint.id === blueprintId);

export const cloneBlueprint = (blueprint: Blueprint): Blueprint => ({
  ...blueprint,
  components: blueprint.components.map((component) => ({
    ...component,
    position: { ...component.position },
    properties: { ...component.properties },
  })),
  connections: blueprint.connections.map((connection) => ({ ...connection })),
  globalParameters: { ...blueprint.globalParameters },
});
