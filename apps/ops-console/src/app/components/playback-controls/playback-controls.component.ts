import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-playback-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './playback-controls.component.html',
})
export class PlaybackControlsComponent {
  readonly playing = input(false);
  readonly clock = input(0);
  readonly duration = input(60);
  readonly busy = input(false);
  readonly playToggle = output<void>();
  readonly resetDemo = output<void>();
  readonly uploadClick = output<void>();

  label(): string {
    if (this.playing()) {
      return 'Pause replay';
    }
    if (this.clock() > 0 && this.clock() < this.duration()) {
      return 'Resume replay';
    }
    return 'Play event replay';
  }
}
