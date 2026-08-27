import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-banner',
  templateUrl: './status-banner.component.html',
})
export class StatusBannerComponent {
  readonly loading = input(false);
  readonly loadingText = input('Connecting to crowd ops backend…');
  readonly error = input<string | null>(null);
}
