import type { DemoTickQuery, ModelStatusQuery, VenueQuery } from '../generated/graphql';

export { RiskLevel } from '../generated/graphql';

export type Snapshot = DemoTickQuery['demoTick'];
export type Venue = VenueQuery['venue'];
export type ModelStatus = ModelStatusQuery['modelStatus'];
