import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBannerComponent } from './status-banner.component';

describe('StatusBannerComponent', () => {
  let fixture: ComponentFixture<StatusBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBannerComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(StatusBannerComponent);
  });

  it('shows loading state', async () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('error', null);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('FLOWLINE');
    expect(fixture.nativeElement.textContent).toContain('Connecting to crowd ops backend');
  });

  it('shows error state', async () => {
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('error', 'demo tick failed');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('demo tick failed');
  });
});
