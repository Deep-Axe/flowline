import { ComponentFixture, TestBed } from '@angular/core/testing';
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
    analyzeCamera: () => Promise.resolve(testSnapshot({ suggestion: 'from camera' })),
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
});
