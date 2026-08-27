import { Component, input } from '@angular/core';
import type { Snapshot } from '../../gql-models';

@Component({
  selector: 'app-route-suggestions',
  templateUrl: './route-suggestions.component.html',
})
export class RouteSuggestionsComponent {
  readonly snapshot = input<Snapshot | null>(null);
}
