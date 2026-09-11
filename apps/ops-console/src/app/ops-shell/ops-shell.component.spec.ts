import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OpsGraphqlService } from '../services/ops-graphql.service';
import { testSnapshot, testVenue } from '../testing/fixtures';
import { OpsShellComponent } from './ops-shell.component';

describe('OpsShellComponent', () => {
  let fixture: ComponentFixture<OpsShellComponent>;
  const graphql = {
    loadVenue: () => Promise.resolve(testVenue()),
    loadModelStatus: () =>
      Promise.resolve({
        __typename: 'ModelStatusType' as const,
        ready: true,
        device: 'cpu',
        repo: 'rootstrap-org/crowd-counting',
        dataset: 'part-b',
        error: null,
      }),
    resetDemo: () => Promise.resolve(),
    demoTick: () => Promise.resolve(testSnapshot()),
    demoPlayback: () => of(testSnapshot({ t: 16.5, suggestion: 'live tick' })),
    analyzeCamera: () => Promise.resolve(testSnapshot({ suggestion: 'from camera' })),
    loadAlertConfig: () => Promise.resolve({ densityThreshold: 0.75, webhookUrl: null }),
    updateAlertConfig: () => Promise.resolve({ densityThreshold: 0.75, webhookUrl: null }),
    clearIncidents: () => Promise.resolve(),
    ackIncident: () => Promise.resolve(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpsShellComponent],
      providers: [
        { provide: OpsGraphqlService, useValue: graphql },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OpsShellComponent);
  });

  it('boots into the ops layout with venue and suggestion', async () => {
    fixture.detectChanges();
    await fixture.componentInstance.boot();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('FLOWLINE');
    expect(fixture.nativeElement.textContent).toContain('divert via Gate B');
    expect(fixture.nativeElement.textContent).toContain('Play event replay');
    expect(fixture.componentInstance.venue()?.id).toBe('plaksha_arena');
  });

  it('uploads a camera frame through GraphQL analyzeCamera', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    await fixture.componentInstance.onUpload(new File(['x'], 'frame.jpg', { type: 'image/jpeg' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.snapshot()?.suggestion).toBe('from camera');
    expect(fixture.componentInstance.busy()).toBe(false);
  });

  it('advances the clock from GraphQL demoPlayback', async () => {
    fixture.detectChanges();
    await fixture.componentInstance.boot();
    await fixture.componentInstance.onPlayToggle();
    fixture.detectChanges();
    expect(fixture.componentInstance.snapshot()?.suggestion).toBe('live tick');
    expect(fixture.componentInstance.clock()).toBe(16.5);
  });
});
