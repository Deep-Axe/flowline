import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RiskLevel } from '../../gql-models';
import { testSnapshot } from '../../testing/fixtures';
import { AlertPanelComponent } from './alert-panel.component';

describe('AlertPanelComponent', () => {
  let fixture: ComponentFixture<AlertPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertPanelComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AlertPanelComponent);
  });

  it('shows empty incident copy', async () => {
    fixture.componentRef.setInput('snapshot', testSnapshot());
    fixture.componentRef.setInput('config', { densityThreshold: 0.75, webhookUrl: null });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No incidents this session');
    expect(fixture.nativeElement.textContent).toContain('Alert ≥ 75%');
  });

  it('lists an open incident and can ack it', async () => {
    const acks: string[] = [];
    fixture.componentInstance.ack.subscribe((id) => acks.push(id));
    fixture.componentRef.setInput(
      'snapshot',
      testSnapshot({
        incidents: [
          {
            __typename: 'IncidentType',
            id: 'inc-1',
            zoneId: 'gate_a',
            zoneLabel: 'Gate A',
            risk: RiskLevel.High,
            density: 0.88,
            t: 16,
            suggestion: 'divert',
            open: true,
            createdAt: 1,
            resolvedAt: null,
          },
        ],
      }),
    );
    fixture.componentRef.setInput('config', { densityThreshold: 0.75, webhookUrl: null });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Gate A');
    expect(fixture.nativeElement.textContent).toContain('1 open');
    fixture.nativeElement.querySelector('button.compact')?.click();
    expect(acks).toEqual(['inc-1']);
  });
});
