import { Component, input } from '@angular/core';
import { RiskLevel, type Snapshot, type Venue } from '../../gql-models';

const RISK_FILL: Record<string, string> = {
  low: 'oklch(0.42 0.04 220 / 0.35)',
  medium: 'oklch(0.62 0.12 75 / 0.55)',
  high: 'oklch(0.55 0.16 35 / 0.65)',
  critical: 'oklch(0.48 0.18 22 / 0.78)',
};

const RISK_STROKE: Record<string, string> = {
  low: 'oklch(0.72 0.06 220)',
  medium: 'oklch(0.78 0.14 75)',
  high: 'oklch(0.68 0.17 35)',
  critical: 'oklch(0.72 0.19 22)',
};

@Component({
  selector: 'app-venue-map',
  templateUrl: './venue-map.component.html',
})
export class VenueMapComponent {
  readonly venue = input.required<Venue>();
  readonly snapshot = input<Snapshot | null>(null);
  readonly playing = input(false);

  polyPoints(polygon: number[][]): string {
    return polygon.map(([x, y]) => `${x},${y}`).join(' ');
  }

  zoneById(id: string) {
    return this.snapshot()?.zones.find((z) => z.id === id);
  }

  isHot(id: string): boolean {
    return (this.zoneById(id)?.density ?? 0) >= 0.75;
  }

  riskKey(id: string): string {
    const risk = this.zoneById(id)?.risk ?? RiskLevel.Low;
    return String(risk).toLowerCase();
  }

  fill(id: string): string {
    return RISK_FILL[this.riskKey(id)] ?? RISK_FILL['low'];
  }

  stroke(id: string): string {
    return RISK_STROKE[this.riskKey(id)] ?? RISK_STROKE['low'];
  }

  meta(id: string, fallback: string): string {
    const live = this.zoneById(id);
    if (!live) {
      return fallback;
    }
    return `${Math.round(live.density * 100)}% · ${Math.round(live.countEst)}`;
  }

  edgeEnds(fromZone: string, to: string) {
    const zones = this.venue().zones;
    const a = zones.find((z) => z.id === fromZone);
    const b = zones.find((z) => z.id === to);
    if (!a || !b) {
      return null;
    }
    return { a, b };
  }

  routePath(path: string[]): string | null {
    const pts = path
      .map((id) => this.venue().zones.find((z) => z.id === id)?.centroid)
      .filter((p): p is number[] => Array.isArray(p) && p.length >= 2);
    if (pts.length < 2) {
      return null;
    }
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  }
}
