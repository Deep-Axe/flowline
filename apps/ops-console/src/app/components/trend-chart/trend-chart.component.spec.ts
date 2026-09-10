import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testSnapshot } from '../../testing/fixtures';
import { TrendChartComponent } from './trend-chart.component';

describe('TrendChartComponent', () => {
  let fixture: ComponentFixture<TrendChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendChartComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TrendChartComponent);
  });

  it('plots bottleneck series and labels', async () => {
    fixture.componentRef.setInput('snapshot', testSnapshot());
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('gate a');
    const path = fixture.nativeElement.querySelector('path') as SVGPathElement | null;
    expect(path?.getAttribute('d')).toContain('M');
  });

  it('falls back to densest zones when there are no bottlenecks', async () => {
    fixture.componentRef.setInput(
      'snapshot',
      testSnapshot({
        bottlenecks: [],
        history: [
          { __typename: 'HistorySeriesType', zoneId: 'walk_side', values: [0.1, 0.2] },
          { __typename: 'HistorySeriesType', zoneId: 'gate_a', values: [0.4, 0.9] },
        ],
      }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.ids()).toContain('gate_a');
  });
});
