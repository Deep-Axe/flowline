import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OpsShellComponent } from './ops-shell/ops-shell.component';

@Component({
  selector: 'app-root',
  imports: [OpsShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<app-ops-shell />',
})
export class App {}
