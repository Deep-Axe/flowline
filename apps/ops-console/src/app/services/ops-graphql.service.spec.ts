import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { of, throwError } from 'rxjs';
import { OpsGraphqlService } from './ops-graphql.service';

describe('OpsGraphqlService', () => {
  it('unwraps venue query data', async () => {
    const apollo = {
      query: () =>
        of({
          data: { venue: { id: 'plaksha_arena', name: 'Arena' } },
          error: undefined,
        }),
    };
    TestBed.configureTestingModule({
      providers: [OpsGraphqlService, { provide: Apollo, useValue: apollo }],
    });
    const venue = await TestBed.inject(OpsGraphqlService).loadVenue();
    expect(venue.id).toBe('plaksha_arena');
  });

  it('surfaces GraphQL errors', async () => {
    const apollo = {
      query: () => throwError(() => new Error('network down')),
    };
    TestBed.configureTestingModule({
      providers: [OpsGraphqlService, { provide: Apollo, useValue: apollo }],
    });
    await expect(TestBed.inject(OpsGraphqlService).loadModelStatus()).rejects.toThrow('network down');
  });
});
