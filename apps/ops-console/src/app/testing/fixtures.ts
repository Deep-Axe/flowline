import { RiskLevel, type Snapshot, type Venue } from '../gql-models';

export function testVenue(): Venue {
  return {
    __typename: 'VenueType',
    id: 'plaksha_arena',
    name: 'Plaksha Arena Concourse',
    width: 800,
    height: 400,
    zones: [
      {
        __typename: 'VenueZoneType',
        id: 'gate_a',
        label: 'Gate A',
        type: 'entry',
        capacity: 90,
        polygon: [
          [0, 0],
          [40, 0],
          [40, 40],
          [0, 40],
        ],
        centroid: [20, 20],
      },
      {
        __typename: 'VenueZoneType',
        id: 'walk_side',
        label: 'Side Walkway',
        type: 'walkway',
        capacity: 80,
        polygon: [
          [60, 0],
          [100, 0],
          [100, 40],
          [60, 40],
        ],
        centroid: [80, 20],
      },
    ],
    graph: {
      __typename: 'VenueGraphType',
      nodes: ['gate_a', 'walk_side'],
      edges: [{ __typename: 'GraphEdgeType', fromZone: 'gate_a', to: 'walk_side', capacity: 50 }],
    },
  };
}

export function testSnapshot(over: Partial<Snapshot> = {}): Snapshot {
  return {
    __typename: 'SnapshotType',
    venueId: 'plaksha_arena',
    venueName: 'Plaksha Arena Concourse',
    t: 16,
    phase: null,
    note: null,
    bottlenecks: ['gate_a'],
    suggestion: 'divert via Gate B',
    zones: [
      {
        __typename: 'ZoneSnapshotType',
        id: 'gate_a',
        label: 'Gate A',
        type: 'entry',
        capacity: 90,
        countEst: 80,
        density: 0.88,
        risk: RiskLevel.High,
        centroid: [20, 20],
        polygon: [],
        trend: 'worsening',
      },
      {
        __typename: 'ZoneSnapshotType',
        id: 'walk_side',
        label: 'Side Walkway',
        type: 'walkway',
        capacity: 80,
        countEst: 18,
        density: 0.22,
        risk: RiskLevel.Low,
        centroid: [80, 20],
        polygon: [],
        trend: 'stable',
      },
    ],
    routes: [
      {
        __typename: 'RouteSuggestionType',
        fromZone: 'gate_a',
        to: 'walk_side',
        avoidZones: ['gate_a'],
        path: ['gate_a', 'walk_side'],
        pathLabels: ['Gate A', 'Side Walkway'],
        message: 'go',
      },
    ],
    model: {
      __typename: 'ModelMetaType',
      source: 'timeline',
      modelRepo: 'x',
      globalCount: 1,
      ready: true,
      error: null,
    },
    history: [
      {
        __typename: 'HistorySeriesType',
        zoneId: 'gate_a',
        values: [0.2, 0.5, 0.88],
      },
    ],
    ...over,
  };
}
