import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type GraphEdgeType = {
  __typename?: 'GraphEdgeType';
  capacity: Scalars['Float']['output'];
  fromZone: Scalars['String']['output'];
  to: Scalars['String']['output'];
};

export type HistorySeriesType = {
  __typename?: 'HistorySeriesType';
  values: Array<Scalars['Float']['output']>;
  zoneId: Scalars['String']['output'];
};

export type ModelMetaType = {
  __typename?: 'ModelMetaType';
  error: Maybe<Scalars['String']['output']>;
  globalCount: Scalars['Float']['output'];
  modelRepo: Scalars['String']['output'];
  ready: Scalars['Boolean']['output'];
  source: Scalars['String']['output'];
};

export type ModelStatusType = {
  __typename?: 'ModelStatusType';
  dataset: Scalars['String']['output'];
  device: Scalars['String']['output'];
  error: Maybe<Scalars['String']['output']>;
  ready: Scalars['Boolean']['output'];
  repo: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  resetDemo: ResetDemoPayload;
};

export type Query = {
  __typename?: 'Query';
  demoTick: SnapshotType;
  modelStatus: ModelStatusType;
  venue: VenueType;
};


export type QueryDemoTickArgs = {
  t?: Scalars['Float']['input'];
};

export type ResetDemoPayload = {
  __typename?: 'ResetDemoPayload';
  ok: Scalars['Boolean']['output'];
};

export enum RiskLevel {
  Critical = 'CRITICAL',
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

export type RouteSuggestionType = {
  __typename?: 'RouteSuggestionType';
  avoidZones: Maybe<Array<Scalars['String']['output']>>;
  fromZone: Scalars['String']['output'];
  message: Scalars['String']['output'];
  path: Array<Scalars['String']['output']>;
  pathLabels: Array<Scalars['String']['output']>;
  to: Scalars['String']['output'];
};

export type SnapshotType = {
  __typename?: 'SnapshotType';
  bottlenecks: Array<Scalars['String']['output']>;
  history: Array<HistorySeriesType>;
  model: ModelMetaType;
  note: Maybe<Scalars['String']['output']>;
  phase: Maybe<Scalars['String']['output']>;
  routes: Array<RouteSuggestionType>;
  suggestion: Scalars['String']['output'];
  t: Maybe<Scalars['Float']['output']>;
  venueId: Scalars['String']['output'];
  venueName: Scalars['String']['output'];
  zones: Array<ZoneSnapshotType>;
};

export type VenueGraphType = {
  __typename?: 'VenueGraphType';
  edges: Array<GraphEdgeType>;
  nodes: Array<Scalars['String']['output']>;
};

export type VenueType = {
  __typename?: 'VenueType';
  graph: VenueGraphType;
  height: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  width: Scalars['Float']['output'];
  zones: Array<VenueZoneType>;
};

export type VenueZoneType = {
  __typename?: 'VenueZoneType';
  capacity: Scalars['Float']['output'];
  centroid: Array<Scalars['Float']['output']>;
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  polygon: Array<Array<Scalars['Float']['output']>>;
  type: Scalars['String']['output'];
};

export type ZoneSnapshotType = {
  __typename?: 'ZoneSnapshotType';
  capacity: Scalars['Float']['output'];
  centroid: Array<Scalars['Float']['output']>;
  countEst: Scalars['Float']['output'];
  density: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  polygon: Array<Array<Scalars['Float']['output']>>;
  risk: RiskLevel;
  trend: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type DemoTickQueryVariables = Exact<{
  t?: InputMaybe<Scalars['Float']['input']>;
}>;


export type DemoTickQuery = { __typename?: 'Query', demoTick: { __typename?: 'SnapshotType', venueId: string, venueName: string, t: number | null, phase: string | null, note: string | null, bottlenecks: Array<string>, suggestion: string, zones: Array<{ __typename?: 'ZoneSnapshotType', id: string, label: string, type: string, capacity: number, countEst: number, density: number, risk: RiskLevel, centroid: Array<number>, polygon: Array<Array<number>>, trend: string | null }>, routes: Array<{ __typename?: 'RouteSuggestionType', fromZone: string, to: string, avoidZones: Array<string> | null, path: Array<string>, pathLabels: Array<string>, message: string }>, model: { __typename?: 'ModelMetaType', source: string, modelRepo: string, globalCount: number, ready: boolean, error: string | null }, history: Array<{ __typename?: 'HistorySeriesType', zoneId: string, values: Array<number> }> } };

export type ModelStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type ModelStatusQuery = { __typename?: 'Query', modelStatus: { __typename?: 'ModelStatusType', ready: boolean, device: string, repo: string, dataset: string, error: string | null } };

export type ResetDemoMutationVariables = Exact<{ [key: string]: never; }>;


export type ResetDemoMutation = { __typename?: 'Mutation', resetDemo: { __typename?: 'ResetDemoPayload', ok: boolean } };

export type VenueQueryVariables = Exact<{ [key: string]: never; }>;


export type VenueQuery = { __typename?: 'Query', venue: { __typename?: 'VenueType', id: string, name: string, width: number, height: number, zones: Array<{ __typename?: 'VenueZoneType', id: string, label: string, type: string, capacity: number, polygon: Array<Array<number>>, centroid: Array<number> }>, graph: { __typename?: 'VenueGraphType', nodes: Array<string>, edges: Array<{ __typename?: 'GraphEdgeType', fromZone: string, to: string, capacity: number }> } } };


export const DemoTickDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DemoTick"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"t"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"demoTick"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"t"},"value":{"kind":"Variable","name":{"kind":"Name","value":"t"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"venueId"}},{"kind":"Field","name":{"kind":"Name","value":"venueName"}},{"kind":"Field","name":{"kind":"Name","value":"t"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"bottlenecks"}},{"kind":"Field","name":{"kind":"Name","value":"suggestion"}},{"kind":"Field","name":{"kind":"Name","value":"zones"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"countEst"}},{"kind":"Field","name":{"kind":"Name","value":"density"}},{"kind":"Field","name":{"kind":"Name","value":"risk"}},{"kind":"Field","name":{"kind":"Name","value":"centroid"}},{"kind":"Field","name":{"kind":"Name","value":"polygon"}},{"kind":"Field","name":{"kind":"Name","value":"trend"}}]}},{"kind":"Field","name":{"kind":"Name","value":"routes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fromZone"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"avoidZones"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"pathLabels"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"Field","name":{"kind":"Name","value":"model"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"modelRepo"}},{"kind":"Field","name":{"kind":"Name","value":"globalCount"}},{"kind":"Field","name":{"kind":"Name","value":"ready"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"Field","name":{"kind":"Name","value":"history"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}}]}}]}}]} as unknown as DocumentNode<DemoTickQuery, DemoTickQueryVariables>;
export const ModelStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModelStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"modelStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ready"}},{"kind":"Field","name":{"kind":"Name","value":"device"}},{"kind":"Field","name":{"kind":"Name","value":"repo"}},{"kind":"Field","name":{"kind":"Name","value":"dataset"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<ModelStatusQuery, ModelStatusQueryVariables>;
export const ResetDemoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetDemo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetDemo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ok"}}]}}]}}]} as unknown as DocumentNode<ResetDemoMutation, ResetDemoMutationVariables>;
export const VenueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Venue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"venue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"zones"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"polygon"}},{"kind":"Field","name":{"kind":"Name","value":"centroid"}}]}},{"kind":"Field","name":{"kind":"Name","value":"graph"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fromZone"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}}]}}]}}]}}]}}]} as unknown as DocumentNode<VenueQuery, VenueQueryVariables>;