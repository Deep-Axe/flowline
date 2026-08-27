import { Component } from '@angular/core';
import { OpsShellComponent } from './ops-shell/ops-shell.component';

@Component({
  selector: 'app-root',
  imports: [OpsShellComponent],
  template: '<app-ops-shell />',
})
export class App {}
