import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AnalyzeRestService, mapRestSnapshot } from './analyze-rest.service';
import { RiskLevel } from '../gql-models';

describe('AnalyzeRestService', () => {
  it('maps REST snapshot JSON onto the generated GraphQL Snapshot type', () => {
    const snap = mapRestSnapshot({
      venue_id: 'plaksha_arena',
      venue_name: 'Arena',
      t: 0,
      phase: 'camera_upload',
      note: null,
      bottlenecks: ['walk_main'],
      suggestion: 'divert',
      zones: [
        {
          id: 'walk_main',
          label: 'Main Walkway',
          type: 'walkway',
          capacity: 140,
          count_est: 120,
          density: 0.86,
          risk: 'high',
          centroid: [1, 2],
          polygon: [[0, 0]],
          trend: 'worsening',
        },
      ],
      routes: [
        {
          from: 'gate_b',
          to: 'stand_south',
          avoid_zones: ['walk_main'],
          path: ['gate_b'],
          path_labels: ['Gate B'],
          message: 'go',
        },
      ],
      model: { source: 'csrnet', model_repo: 'hf', global_count: 25.8, ready: true, error: null },
      history: { walk_main: [0.2, 0.86] },
    });
    expect(snap.venueId).toBe('plaksha_arena');
    expect(snap.zones[0].countEst).toBe(120);
    expect(snap.zones[0].risk).toBe(RiskLevel.High);
    expect(snap.routes[0].fromZone).toBe('gate_b');
    expect(snap.history[0].zoneId).toBe('walk_main');
  });

  it('posts multipart analyze requests', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AnalyzeRestService],
    });
    const http = TestBed.inject(HttpTestingController);
    const service = TestBed.inject(AnalyzeRestService);
    const pending = service.upload(new File(['x'], 'frame.jpg', { type: 'image/jpeg' }));
    const req = http.expectOne('/api/analyze');
    expect(req.request.method).toBe('POST');
    req.flush({
      venue_id: 'v',
      venue_name: 'n',
      bottlenecks: [],
      suggestion: 'ok',
      zones: [],
      routes: [],
      model: { source: 'csrnet', model_repo: 'hf', global_count: 1, ready: true, error: null },
      history: {},
    });
    const snap = await pending;
    expect(snap.suggestion).toBe('ok');
    http.verify();
  });
});
