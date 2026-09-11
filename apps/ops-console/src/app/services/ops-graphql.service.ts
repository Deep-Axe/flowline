import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { print } from 'graphql';
import { first, firstValueFrom, map, type Observable } from 'rxjs';
import {
  AnalyzeCameraDocument,
  DemoPlaybackDocument,
  DemoTickDocument,
  ModelStatusDocument,
  ResetDemoDocument,
  VenueDocument,
  type AnalyzeCameraMutation,
  type DemoPlaybackSubscription,
  type DemoTickQuery,
  type ModelStatusQuery,
  type ResetDemoMutation,
  type VenueQuery,
} from '../../generated/graphql';
import type { ModelStatus, Snapshot, Venue } from '../gql-models';

export type { ModelStatus, Snapshot, Venue };

type ApolloResult<T> = {
  data?: T | null;
  error?: unknown;
  errors?: unknown;
};

@Injectable({ providedIn: 'root' })
export class OpsGraphqlService {
  private readonly apollo = inject(Apollo);
  private readonly http = inject(HttpClient);

  loadVenue(): Promise<Venue> {
    return firstValueFrom(
      this.apollo
        .query<VenueQuery>({ query: VenueDocument, fetchPolicy: 'network-only' })
        .pipe(
          first(),
          map((r) => this.require(r.data?.venue, this.resultError(r), 'venue')),
        ),
    );
  }

  loadModelStatus(): Promise<ModelStatus> {
    return firstValueFrom(
      this.apollo
        .query<ModelStatusQuery>({ query: ModelStatusDocument, fetchPolicy: 'network-only' })
        .pipe(
          first(),
          map((r) => this.require(r.data?.modelStatus, this.resultError(r), 'model status')),
        ),
    );
  }

  demoTick(t: number): Promise<Snapshot> {
    return firstValueFrom(
      this.apollo
        .query<DemoTickQuery>({
          query: DemoTickDocument,
          variables: { t },
          fetchPolicy: 'network-only',
        })
        .pipe(
          first(),
          map((r) => this.require(r.data?.demoTick, this.resultError(r), 'demo tick')),
        ),
    );
  }

  demoPlayback(start: number, step = 0.5, intervalMs = 500): Observable<Snapshot> {
    return this.apollo
      .subscribe<DemoPlaybackSubscription>({
        query: DemoPlaybackDocument,
        variables: { start, step, intervalMs },
      })
      .pipe(map((r) => this.require(r.data?.demoPlayback, this.resultError(r), 'demo playback')));
  }

  resetDemo(): Promise<void> {
    return firstValueFrom(
      this.apollo.mutate<ResetDemoMutation>({ mutation: ResetDemoDocument }).pipe(
        first(),
        map((r) => {
          if (this.resultError(r) || !r.data?.resetDemo.ok) {
            throw new Error('demo reset failed');
          }
        }),
      ),
    );
  }

  async analyzeCamera(file: File, phase = 'camera_upload'): Promise<Snapshot> {
    // Apollo HttpLink does not send the GraphQL multipart spec; post FormData instead.
    const body = new FormData();
    body.append(
      'operations',
      JSON.stringify({
        query: print(AnalyzeCameraDocument),
        variables: { file: null, phase, reset: false },
      }),
    );
    body.append('map', JSON.stringify({ '0': ['variables.file'] }));
    body.append('0', file, file.name);
    const payload = await firstValueFrom(
      this.http.post<{ data?: AnalyzeCameraMutation; errors?: { message: string }[] }>('/graphql', body),
    );
    const err = payload.errors?.[0]?.message;
    if (err) {
      throw new Error(err);
    }
    return this.require(payload.data?.analyzeCamera, null, 'camera analyze');
  }

  private resultError(result: ApolloResult<unknown>): unknown {
    return result.error ?? result.errors;
  }

  private require<T>(value: T | null | undefined, error: unknown, label: string): T {
    if (error) {
      throw error instanceof Error ? error : new Error(`${label} failed`);
    }
    if (value == null) {
      throw new Error(`${label} failed`);
    }
    return value;
  }
}
