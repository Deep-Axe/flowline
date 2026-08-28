import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import type { Snapshot } from '../../gql-models';

@Component({
  selector: 'app-route-suggestions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './route-suggestions.component.html',
})
export class RouteSuggestionsComponent {
  readonly snapshot = input<Snapshot | null>(null);
}
