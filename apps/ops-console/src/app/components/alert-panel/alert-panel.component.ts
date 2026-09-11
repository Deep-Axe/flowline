import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import type { Snapshot } from '../../gql-models';

export type AlertConfigView = {
  densityThreshold: number;
  webhookUrl: string | null;
};

@Component({
  selector: 'app-alert-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alert-panel.component.html',
})
export class AlertPanelComponent {
  readonly snapshot = input<Snapshot | null>(null);
  readonly config = input<AlertConfigView | null>(null);
  readonly muted = input(false);
  readonly muteToggle = output<void>();
  readonly thresholdChange = output<number>();
  readonly webhookSave = output<string>();
  readonly ack = output<string>();
  readonly clearLog = output<void>();

  incidents() {
    return this.snapshot()?.incidents ?? [];
  }

  openCount(): number {
    return this.incidents().filter((item) => item.open).length;
  }

  percent(): number {
    return Math.round((this.config()?.densityThreshold ?? 0.75) * 100);
  }

  densityPercent(value: number): number {
    return Math.round(value * 100);
  }

  onThreshold(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (!Number.isNaN(value)) {
      this.thresholdChange.emit(value);
    }
  }

  onWebhook(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const input = form.elements.namedItem('webhook') as HTMLInputElement | null;
    this.webhookSave.emit(input?.value?.trim() ?? '');
  }
}
