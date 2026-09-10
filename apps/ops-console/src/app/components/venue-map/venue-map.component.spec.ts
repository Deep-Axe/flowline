import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testSnapshot, testVenue } from '../../testing/fixtures';
import { VenueMapComponent } from './venue-map.component';

describe('VenueMapComponent', () => {
  let fixture: ComponentFixture<VenueMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueMapComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(VenueMapComponent);
  });

  it('renders zone labels and live density', async () => {
    fixture.componentRef.setInput('venue', testVenue());
    fixture.componentRef.setInput('snapshot', testSnapshot());
    await fixture.whenStable();
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg.venue-map') as SVGElement;
    expect(svg.getAttribute('aria-label')).toContain('Plaksha Arena Concourse');
    expect(fixture.nativeElement.textContent).toContain('Gate A');
    expect(fixture.nativeElement.textContent).toContain('88%');
    expect(fixture.componentInstance.isHot('gate_a')).toBe(true);
    expect(fixture.componentInstance.routePath(['gate_a', 'walk_side'])).toContain('M');
  });
});
