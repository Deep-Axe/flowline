import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { first, firstValueFrom, map } from 'rxjs';
import {
  DemoTickDocument,
  ModelStatusDocument,
  ResetDemoDocument,
  VenueDocument,
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
