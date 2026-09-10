import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
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
      providers: [OpsGraphqlService, provideHttpClient(), { provide: Apollo, useValue: apollo }],
    });
    const venue = await TestBed.inject(OpsGraphqlService).loadVenue();
    expect(venue.id).toBe('plaksha_arena');
  });

  it('surfaces GraphQL errors', async () => {
    const apollo = {
      query: () => throwError(() => new Error('network down')),
    };
    TestBed.configureTestingModule({
      providers: [OpsGraphqlService, provideHttpClient(), { provide: Apollo, useValue: apollo }],
    });
    await expect(TestBed.inject(OpsGraphqlService).loadModelStatus()).rejects.toThrow('network down');
  });

  it('posts camera frames as GraphQL multipart', async () => {
    TestBed.configureTestingModule({
      providers: [
        OpsGraphqlService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Apollo, useValue: {} },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const pending = TestBed.inject(OpsGraphqlService).analyzeCamera(
      new File(['x'], 'frame.jpg', { type: 'image/jpeg' }),
    );
    const req = http.expectOne('/graphql');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    const body = req.request.body as FormData;
    expect(body.get('map')).toContain('variables.file');
    req.flush({
      data: {
        analyzeCamera: {
          suggestion: 'ok',
          venueId: 'v',
          venueName: 'n',
          t: null,
          phase: 'camera_upload',
          note: null,
          bottlenecks: [],
          zones: [],
          routes: [],
          model: { source: 'csrnet', modelRepo: 'hf', globalCount: 1, ready: true, error: null },
          history: [],
        },
      },
    });
    const snap = await pending;
    expect(snap.suggestion).toBe('ok');
    http.verify();
  });

  it('surfaces GraphQL analyzeCamera errors', async () => {
    TestBed.configureTestingModule({
      providers: [
        OpsGraphqlService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Apollo, useValue: {} },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const pending = TestBed.inject(OpsGraphqlService).analyzeCamera(
      new File(['x'], 'frame.jpg', { type: 'image/jpeg' }),
    );
    const req = http.expectOne('/graphql');
    req.flush({ errors: [{ message: 'Empty file' }] });
    await expect(pending).rejects.toThrow('Empty file');
    http.verify();
  });
});
