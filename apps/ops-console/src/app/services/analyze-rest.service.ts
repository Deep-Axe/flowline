import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RiskLevel, type Snapshot } from '../gql-models';

@Injectable({ providedIn: 'root' })
export class AnalyzeRestService {
  private readonly http = inject(HttpClient);

  async upload(file: File, phase = 'camera_upload'): Promise<Snapshot> {
    const body = new FormData();
    body.append('file', file);
    body.append('phase', phase);
    body.append('reset', 'false');
    const raw = await firstValueFrom(this.http.post<Record<string, unknown>>('/api/analyze', body));
    return mapRestSnapshot(raw);
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function riskFromRest(value: unknown): RiskLevel {
  const key = String(value ?? 'low').toLowerCase();
  switch (key) {
    case 'medium':
      return RiskLevel.Medium;
    case 'high':
      return RiskLevel.High;
    case 'critical':
      return RiskLevel.Critical;
    default:
      return RiskLevel.Low;
  }
}

export function mapRestSnapshot(raw: Record<string, unknown>): Snapshot {
  const model = asRecord(raw['model']);
  const history = asRecord(raw['history']);
  const zones = Array.isArray(raw['zones']) ? raw['zones'] : [];
  const routes = Array.isArray(raw['routes']) ? raw['routes'] : [];
  return {
    __typename: 'SnapshotType',
    venueId: String(raw['venue_id'] ?? ''),
    venueName: String(raw['venue_name'] ?? ''),
    t: typeof raw['t'] === 'number' ? raw['t'] : null,
    phase: typeof raw['phase'] === 'string' ? raw['phase'] : null,
    note: typeof raw['note'] === 'string' ? raw['note'] : null,
    bottlenecks: Array.isArray(raw['bottlenecks']) ? raw['bottlenecks'].map(String) : [],
    suggestion: String(raw['suggestion'] ?? ''),
    zones: zones.map((z) => {
      const zone = asRecord(z);
      return {
        __typename: 'ZoneSnapshotType' as const,
        id: String(zone['id'] ?? ''),
        label: String(zone['label'] ?? ''),
        type: String(zone['type'] ?? ''),
        capacity: Number(zone['capacity'] ?? 0),
        countEst: Number(zone['count_est'] ?? 0),
        density: Number(zone['density'] ?? 0),
        risk: riskFromRest(zone['risk']),
        centroid: Array.isArray(zone['centroid']) ? zone['centroid'].map(Number) : [],
        polygon: Array.isArray(zone['polygon'])
          ? (zone['polygon'] as number[][]).map((row) => row.map(Number))
          : [],
        trend: typeof zone['trend'] === 'string' ? zone['trend'] : null,
      };
    }),
    routes: routes.map((r) => {
      const route = asRecord(r);
      return {
        __typename: 'RouteSuggestionType' as const,
        fromZone: String(route['from'] ?? ''),
        to: String(route['to'] ?? ''),
        avoidZones: Array.isArray(route['avoid_zones']) ? route['avoid_zones'].map(String) : null,
        path: Array.isArray(route['path']) ? route['path'].map(String) : [],
        pathLabels: Array.isArray(route['path_labels']) ? route['path_labels'].map(String) : [],
        message: String(route['message'] ?? ''),
      };
    }),
    model: {
      __typename: 'ModelMetaType',
      source: String(model['source'] ?? ''),
      modelRepo: String(model['model_repo'] ?? ''),
      globalCount: Number(model['global_count'] ?? 0),
      ready: Boolean(model['ready']),
      error: typeof model['error'] === 'string' ? model['error'] : null,
    },
    history: Object.entries(history).map(([zoneId, values]) => ({
      __typename: 'HistorySeriesType' as const,
      zoneId,
      values: Array.isArray(values) ? values.map(Number) : [],
    })),
  };
}
