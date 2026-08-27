import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BottleneckListComponent } from './bottleneck-list.component';
import { RiskLevel, type Snapshot } from '../../gql-models';

function snapshot(over: Partial<Snapshot> = {}): Snapshot {
  return {
    __typename: 'SnapshotType',
    venueId: 'v',
    venueName: 'Arena',
    t: 0,
    phase: null,
    note: null,
    bottlenecks: [],
    suggestion: 'ok',
    zones: [
      {
        __typename: 'ZoneSnapshotType',
        id: 'gate_a',
        label: 'Gate A',
        type: 'entry',
        capacity: 90,
        countEst: 80,
        density: 0.88,
        risk: RiskLevel.High,
        centroid: [0, 0],
        polygon: [],
        trend: 'worsening',
      },
    ],
    routes: [],
    model: {
      __typename: 'ModelMetaType',
      source: 'timeline',
      modelRepo: 'x',
      globalCount: 1,
      ready: true,
      error: null,
    },
    history: [],
    ...over,
  };
}

describe('BottleneckListComponent', () => {
  let fixture: ComponentFixture<BottleneckListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottleneckListComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(BottleneckListComponent);
  });

  it('shows empty state when there are no bottlenecks', async () => {
    fixture.componentRef.setInput('snapshot', snapshot());
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('None — concourse within capacity');
  });

  it('lists populated bottlenecks', async () => {
    fixture.componentRef.setInput('snapshot', snapshot({ bottlenecks: ['gate_a'] }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Gate A');
    expect(fixture.nativeElement.textContent).toContain('88%');
    expect(fixture.nativeElement.textContent).toContain('worsening');
  });
});
