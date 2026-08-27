import { Component, input } from '@angular/core';
import type { ModelStatus, Venue } from '../../gql-models';

@Component({
  selector: 'app-model-status',
  templateUrl: './model-status.component.html',
})
export class ModelStatusComponent {
  readonly status = input<ModelStatus | null>(null);
  readonly venue = input<Venue | null>(null);
}
