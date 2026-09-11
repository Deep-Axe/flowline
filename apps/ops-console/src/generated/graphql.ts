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
  Upload: { input: File; output: File; }
};

export type AlertConfigType = {
  __typename?: 'AlertConfigType';
  densityThreshold: Scalars['Float']['output'];
  webhookUrl: Maybe<Scalars['String']['output']>;
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

export type IncidentType = {
  __typename?: 'IncidentType';
  createdAt: Scalars['Float']['output'];
  density: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  open: Scalars['Boolean']['output'];
  resolvedAt: Maybe<Scalars['Float']['output']>;
  risk: RiskLevel;
  suggestion: Scalars['String']['output'];
  t: Maybe<Scalars['Float']['output']>;
  zoneId: Scalars['String']['output'];
  zoneLabel: Scalars['String']['output'];
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
  ackIncident: Maybe<IncidentType>;
  analyzeCamera: SnapshotType;
  clearIncidents: ResetDemoPayload;
  resetDemo: ResetDemoPayload;
  updateAlertConfig: AlertConfigType;
};


export type MutationAckIncidentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationAnalyzeCameraArgs = {
  file: Scalars['Upload']['input'];
  phase?: InputMaybe<Scalars['String']['input']>;
  reset?: Scalars['Boolean']['input'];
};


export type MutationUpdateAlertConfigArgs = {
  densityThreshold?: InputMaybe<Scalars['Float']['input']>;
  webhookUrl?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  alertConfig: AlertConfigType;
  demoTick: SnapshotType;
  incidents: Array<IncidentType>;
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
  incidents: Array<IncidentType>;
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

export type Subscription = {
  __typename?: 'Subscription';
  demoPlayback: SnapshotType;
};


export type SubscriptionDemoPlaybackArgs = {
  intervalMs?: Scalars['Int']['input'];
  start?: Scalars['Float']['input'];
  step?: Scalars['Float']['input'];
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

export type AckIncidentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type AckIncidentMutation = { __typename?: 'Mutation', ackIncident: { __typename?: 'IncidentType', id: string, open: boolean, resolvedAt: number | null } | null };

export type AlertConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type AlertConfigQuery = { __typename?: 'Query', alertConfig: { __typename?: 'AlertConfigType', densityThreshold: number, webhookUrl: string | null } };

export type AnalyzeCameraMutationVariables = Exact<{
  file: Scalars['Upload']['input'];
  phase?: InputMaybe<Scalars['String']['input']>;
  reset?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type AnalyzeCameraMutation = { __typename?: 'Mutation', analyzeCamera: { __typename?: 'SnapshotType', venueId: string, venueName: string, t: number | null, phase: string | null, note: string | null, bottlenecks: Array<string>, suggestion: string, zones: Array<{ __typename?: 'ZoneSnapshotType', id: string, label: string, type: string, capacity: number, countEst: number, density: number, risk: RiskLevel, centroid: Array<number>, polygon: Array<Array<number>>, trend: string | null }>, routes: Array<{ __typename?: 'RouteSuggestionType', fromZone: string, to: string, avoidZones: Array<string> | null, path: Array<string>, pathLabels: Array<string>, message: string }>, model: { __typename?: 'ModelMetaType', source: string, modelRepo: string, globalCount: number, ready: boolean, error: string | null }, history: Array<{ __typename?: 'HistorySeriesType', zoneId: string, values: Array<number> }>, incidents: Array<{ __typename?: 'IncidentType', id: string, zoneId: string, zoneLabel: string, risk: RiskLevel, density: number, t: number | null, suggestion: string, open: boolean, createdAt: number, resolvedAt: number | null }> } };

export type ClearIncidentsMutationVariables = Exact<{ [key: string]: never; }>;


export type ClearIncidentsMutation = { __typename?: 'Mutation', clearIncidents: { __typename?: 'ResetDemoPayload', ok: boolean } };

export type DemoPlaybackSubscriptionVariables = Exact<{
  start?: InputMaybe<Scalars['Float']['input']>;
  step?: InputMaybe<Scalars['Float']['input']>;
  intervalMs?: InputMaybe<Scalars['Int']['input']>;
}>;


export type DemoPlaybackSubscription = { __typename?: 'Subscription', demoPlayback: { __typename?: 'SnapshotType', venueId: string, venueName: string, t: number | null, phase: string | null, note: string | null, bottlenecks: Array<string>, suggestion: string, zones: Array<{ __typename?: 'ZoneSnapshotType', id: string, label: string, type: string, capacity: number, countEst: number, density: number, risk: RiskLevel, centroid: Array<number>, polygon: Array<Array<number>>, trend: string | null }>, routes: Array<{ __typename?: 'RouteSuggestionType', fromZone: string, to: string, avoidZones: Array<string> | null, path: Array<string>, pathLabels: Array<string>, message: string }>, model: { __typename?: 'ModelMetaType', source: string, modelRepo: string, globalCount: number, ready: boolean, error: string | null }, history: Array<{ __typename?: 'HistorySeriesType', zoneId: string, values: Array<number> }>, incidents: Array<{ __typename?: 'IncidentType', id: string, zoneId: string, zoneLabel: string, risk: RiskLevel, density: number, t: number | null, suggestion: string, open: boolean, createdAt: number, resolvedAt: number | null }> } };

export type DemoTickQueryVariables = Exact<{
  t?: InputMaybe<Scalars['Float']['input']>;
}>;


export type DemoTickQuery = { __typename?: 'Query', demoTick: { __typename?: 'SnapshotType', venueId: string, venueName: string, t: number | null, phase: string | null, note: string | null, bottlenecks: Array<string>, suggestion: string, zones: Array<{ __typename?: 'ZoneSnapshotType', id: string, label: string, type: string, capacity: number, countEst: number, density: number, risk: RiskLevel, centroid: Array<number>, polygon: Array<Array<number>>, trend: string | null }>, routes: Array<{ __typename?: 'RouteSuggestionType', fromZone: string, to: string, avoidZones: Array<string> | null, path: Array<string>, pathLabels: Array<string>, message: string }>, model: { __typename?: 'ModelMetaType', source: string, modelRepo: string, globalCount: number, ready: boolean, error: string | null }, history: Array<{ __typename?: 'HistorySeriesType', zoneId: string, values: Array<number> }>, incidents: Array<{ __typename?: 'IncidentType', id: string, zoneId: string, zoneLabel: string, risk: RiskLevel, density: number, t: number | null, suggestion: string, open: boolean, createdAt: number, resolvedAt: number | null }> } };

export type ModelStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type ModelStatusQuery = { __typename?: 'Query', modelStatus: { __typename?: 'ModelStatusType', ready: boolean, device: string, repo: string, dataset: string, error: string | null } };

export type ResetDemoMutationVariables = Exact<{ [key: string]: never; }>;


export type ResetDemoMutation = { __typename?: 'Mutation', resetDemo: { __typename?: 'ResetDemoPayload', ok: boolean } };

export type UpdateAlertConfigMutationVariables = Exact<{
  densityThreshold?: InputMaybe<Scalars['Float']['input']>;
  webhookUrl?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateAlertConfigMutation = { __typename?: 'Mutation', updateAlertConfig: { __typename?: 'AlertConfigType', densityThreshold: number, webhookUrl: string | null } };

export type VenueQueryVariables = Exact<{ [key: string]: never; }>;


export type VenueQuery = { __typename?: 'Query', venue: { __typename?: 'VenueType', id: string, name: string, width: number, height: number, zones: Array<{ __typename?: 'VenueZoneType', id: string, label: string, type: string, capacity: number, polygon: Array<Array<number>>, centroid: Array<number> }>, graph: { __typename?: 'VenueGraphType', nodes: Array<string>, edges: Array<{ __typename?: 'GraphEdgeType', fromZone: string, to: string, capacity: number }> } } };


export const AckIncidentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AckIncident"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ackIncident"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"open"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedAt"}}]}}]}}]} as unknown as DocumentNode<AckIncidentMutation, AckIncidentMutationVariables>;
export const AlertConfigDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AlertConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alertConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"densityThreshold"}},{"kind":"Field","name":{"kind":"Name","value":"webhookUrl"}}]}}]}}]} as unknown as DocumentNode<AlertConfigQuery, AlertConfigQueryVariables>;
export const AnalyzeCameraDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AnalyzeCamera"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"file"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Upload"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"phase"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"analyzeCamera"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"file"},"value":{"kind":"Variable","name":{"kind":"Name","value":"file"}}},{"kind":"Argument","name":{"kind":"Name","value":"phase"},"value":{"kind":"Variable","name":{"kind":"Name","value":"phase"}}},{"kind":"Argument","name":{"kind":"Name","value":"reset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"venueId"}},{"kind":"Field","name":{"kind":"Name","value":"venueName"}},{"kind":"Field","name":{"kind":"Name","value":"t"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"bottlenecks"}},{"kind":"Field","name":{"kind":"Name","value":"suggestion"}},{"kind":"Field","name":{"kind":"Name","value":"zones"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"countEst"}},{"kind":"Field","name":{"kind":"Name","value":"density"}},{"kind":"Field","name":{"kind":"Name","value":"risk"}},{"kind":"Field","name":{"kind":"Name","value":"centroid"}},{"kind":"Field","name":{"kind":"Name","value":"polygon"}},{"kind":"Field","name":{"kind":"Name","value":"trend"}}]}},{"kind":"Field","name":{"kind":"Name","value":"routes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fromZone"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"avoidZones"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"pathLabels"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"Field","name":{"kind":"Name","value":"model"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"modelRepo"}},{"kind":"Field","name":{"kind":"Name","value":"globalCount"}},{"kind":"Field","name":{"kind":"Name","value":"ready"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"Field","name":{"kind":"Name","value":"history"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}},{"kind":"Field","name":{"kind":"Name","value":"incidents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"zoneLabel"}},{"kind":"Field","name":{"kind":"Name","value":"risk"}},{"kind":"Field","name":{"kind":"Name","value":"density"}},{"kind":"Field","name":{"kind":"Name","value":"t"}},{"kind":"Field","name":{"kind":"Name","value":"suggestion"}},{"kind":"Field","name":{"kind":"Name","value":"open"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedAt"}}]}}]}}]}}]} as unknown as DocumentNode<AnalyzeCameraMutation, AnalyzeCameraMutationVariables>;
export const ClearIncidentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClearIncidents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clearIncidents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ok"}}]}}]}}]} as unknown as DocumentNode<ClearIncidentsMutation, ClearIncidentsMutationVariables>;
export const DemoPlaybackDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"DemoPlayback"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"start"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"step"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"intervalMs"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"demoPlayback"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"start"},"value":{"kind":"Variable","name":{"kind":"Name","value":"start"}}},{"kind":"Argument","name":{"kind":"Name","value":"step"},"value":{"kind":"Variable","name":{"kind":"Name","value":"step"}}},{"kind":"Argument","name":{"kind":"Name","value":"intervalMs"},"value":{"kind":"Variable","name":{"kind":"Name","value":"intervalMs"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"venueId"}},{"kind":"Field","name":{"kind":"Name","value":"venueName"}},{"kind":"Field","name":{"kind":"Name","value":"t"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"bottlenecks"}},{"kind":"Field","name":{"kind":"Name","value":"suggestion"}},{"kind":"Field","name":{"kind":"Name","value":"zones"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"countEst"}},{"kind":"Field","name":{"kind":"Name","value":"density"}},{"kind":"Field","name":{"kind":"Name","value":"risk"}},{"kind":"Field","name":{"kind":"Name","value":"centroid"}},{"kind":"Field","name":{"kind":"Name","value":"polygon"}},{"kind":"Field","name":{"kind":"Name","value":"trend"}}]}},{"kind":"Field","name":{"kind":"Name","value":"routes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fromZone"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"avoidZones"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"pathLabels"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"Field","name":{"kind":"Name","value":"model"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"modelRepo"}},{"kind":"Field","name":{"kind":"Name","value":"globalCount"}},{"kind":"Field","name":{"kind":"Name","value":"ready"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"Field","name":{"kind":"Name","value":"history"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}},{"kind":"Field","name":{"kind":"Name","value":"incidents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"zoneLabel"}},{"kind":"Field","name":{"kind":"Name","value":"risk"}},{"kind":"Field","name":{"kind":"Name","value":"density"}},{"kind":"Field","name":{"kind":"Name","value":"t"}},{"kind":"Field","name":{"kind":"Name","value":"suggestion"}},{"kind":"Field","name":{"kind":"Name","value":"open"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedAt"}}]}}]}}]}}]} as unknown as DocumentNode<DemoPlaybackSubscription, DemoPlaybackSubscriptionVariables>;
export const DemoTickDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DemoTick"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"t"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"demoTick"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"t"},"value":{"kind":"Variable","name":{"kind":"Name","value":"t"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"venueId"}},{"kind":"Field","name":{"kind":"Name","value":"venueName"}},{"kind":"Field","name":{"kind":"Name","value":"t"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"bottlenecks"}},{"kind":"Field","name":{"kind":"Name","value":"suggestion"}},{"kind":"Field","name":{"kind":"Name","value":"zones"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"countEst"}},{"kind":"Field","name":{"kind":"Name","value":"density"}},{"kind":"Field","name":{"kind":"Name","value":"risk"}},{"kind":"Field","name":{"kind":"Name","value":"centroid"}},{"kind":"Field","name":{"kind":"Name","value":"polygon"}},{"kind":"Field","name":{"kind":"Name","value":"trend"}}]}},{"kind":"Field","name":{"kind":"Name","value":"routes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fromZone"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"avoidZones"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"pathLabels"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"Field","name":{"kind":"Name","value":"model"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"modelRepo"}},{"kind":"Field","name":{"kind":"Name","value":"globalCount"}},{"kind":"Field","name":{"kind":"Name","value":"ready"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}},{"kind":"Field","name":{"kind":"Name","value":"history"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}},{"kind":"Field","name":{"kind":"Name","value":"incidents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"zoneLabel"}},{"kind":"Field","name":{"kind":"Name","value":"risk"}},{"kind":"Field","name":{"kind":"Name","value":"density"}},{"kind":"Field","name":{"kind":"Name","value":"t"}},{"kind":"Field","name":{"kind":"Name","value":"suggestion"}},{"kind":"Field","name":{"kind":"Name","value":"open"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedAt"}}]}}]}}]}}]} as unknown as DocumentNode<DemoTickQuery, DemoTickQueryVariables>;
export const ModelStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ModelStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"modelStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ready"}},{"kind":"Field","name":{"kind":"Name","value":"device"}},{"kind":"Field","name":{"kind":"Name","value":"repo"}},{"kind":"Field","name":{"kind":"Name","value":"dataset"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<ModelStatusQuery, ModelStatusQueryVariables>;
export const ResetDemoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetDemo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetDemo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ok"}}]}}]}}]} as unknown as DocumentNode<ResetDemoMutation, ResetDemoMutationVariables>;
export const UpdateAlertConfigDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAlertConfig"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"densityThreshold"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"webhookUrl"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAlertConfig"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"densityThreshold"},"value":{"kind":"Variable","name":{"kind":"Name","value":"densityThreshold"}}},{"kind":"Argument","name":{"kind":"Name","value":"webhookUrl"},"value":{"kind":"Variable","name":{"kind":"Name","value":"webhookUrl"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"densityThreshold"}},{"kind":"Field","name":{"kind":"Name","value":"webhookUrl"}}]}}]}}]} as unknown as DocumentNode<UpdateAlertConfigMutation, UpdateAlertConfigMutationVariables>;
export const VenueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Venue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"venue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"zones"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"polygon"}},{"kind":"Field","name":{"kind":"Name","value":"centroid"}}]}},{"kind":"Field","name":{"kind":"Name","value":"graph"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fromZone"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}}]}}]}}]}}]}}]} as unknown as DocumentNode<VenueQuery, VenueQueryVariables>;