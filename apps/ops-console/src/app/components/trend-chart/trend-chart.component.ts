import { Component, computed, input } from '@angular/core';
import type { Snapshot } from '../../gql-models';

const COLORS = [
  'oklch(0.68 0.18 22)',
  'oklch(0.72 0.12 210)',
  'oklch(0.75 0.14 75)',
  'oklch(0.70 0.10 160)',
];

@Component({
  selector: 'app-trend-chart',
  templateUrl: './trend-chart.component.html',
})
export class TrendChartComponent {
  readonly snapshot = input<Snapshot | null>(null);
  readonly width = 420;
  readonly height = 140;
  readonly pad = 16;
  readonly colors = COLORS;

  readonly ids = computed(() => {
    const snap = this.snapshot();
    if (!snap) {
      return [];
    }
    if (snap.bottlenecks.length) {
      return snap.bottlenecks.slice(0, 4);
    }
    return snap.zones
      .slice()
      .sort((a, b) => b.density - a.density)
      .slice(0, 3)
      .map((z) => z.id);
  });

  readonly historyMap = computed(() => {
    const map: Record<string, number[]> = {};
    for (const series of this.snapshot()?.history ?? []) {
      map[series.zoneId] = series.values;
    }
    return map;
  });

  gridY(g: number): number {
    return this.height - this.pad - g * (this.height - this.pad * 2);
  }

  pathFor(id: string): string {
    const values = this.historyMap()[id] ?? [];
    if (!values.length) {
      return '';
    }
    const maxLen = Math.max(
      2,
      ...this.ids().map((key) => (this.historyMap()[key] ?? []).length),
    );
    return values
      .map((v, i) => {
        const x = this.pad + (i / (maxLen - 1 || 1)) * (this.width - this.pad * 2);
        const y = this.height - this.pad - Math.min(1, v) * (this.height - this.pad * 2);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  }

  label(id: string): string {
    return id.replace(/_/g, ' ');
  }
}
