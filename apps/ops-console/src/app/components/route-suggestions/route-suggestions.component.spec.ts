import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouteSuggestionsComponent } from './route-suggestions.component';
import type { Snapshot } from '../../gql-models';

describe('RouteSuggestionsComponent', () => {
  let fixture: ComponentFixture<RouteSuggestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteSuggestionsComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(RouteSuggestionsComponent);
  });

  it('shows empty routes', async () => {
    fixture.componentRef.setInput('snapshot', {
      __typename: 'SnapshotType',
      venueId: 'v',
      venueName: 'Arena',
      t: 0,
      phase: null,
      note: null,
      bottlenecks: [],
      suggestion: '',
      zones: [],
      routes: [],
      model: {
        __typename: 'ModelMetaType',
        source: 't',
        modelRepo: 'x',
        globalCount: 0,
        ready: true,
        error: null,
      },
      history: [],
      incidents: [],
    } satisfies Snapshot);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No alternate paths needed');
  });

  it('renders reroute labels', async () => {
    fixture.componentRef.setInput('snapshot', {
      __typename: 'SnapshotType',
      venueId: 'v',
      venueName: 'Arena',
      t: 16,
      phase: null,
      note: null,
      bottlenecks: ['gate_a'],
      suggestion: 'reroute',
      zones: [],
      routes: [
        {
          __typename: 'RouteSuggestionType',
          fromZone: 'gate_b',
          to: 'stand_south',
          avoidZones: ['gate_a'],
          path: ['gate_b', 'walk_side'],
          pathLabels: ['Gate B', 'Side Walkway'],
          message: 'go',
        },
      ],
      model: {
        __typename: 'ModelMetaType',
        source: 't',
        modelRepo: 'x',
        globalCount: 0,
        ready: true,
        error: null,
      },
      history: [],
      incidents: [],
    } satisfies Snapshot);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Gate B -> Side Walkway');
  });
});
