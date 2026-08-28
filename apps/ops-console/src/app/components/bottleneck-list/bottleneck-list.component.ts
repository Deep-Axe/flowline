import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import type { Snapshot } from '../../gql-models';

@Component({
  selector: 'app-bottleneck-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bottleneck-list.component.html',
})
export class BottleneckListComponent {
  readonly snapshot = input<Snapshot | null>(null);

  zone(id: string) {
    return this.snapshot()?.zones.find((z) => z.id === id);
  }

  percent(id: string): number {
    return Math.round((this.zone(id)?.density ?? 0) * 100);
  }
}
