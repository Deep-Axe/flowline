import {
  Component,
  ElementRef,
  input,
  output,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import type { Snapshot } from '../../gql-models';

@Component({
  selector: 'app-camera-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './camera-upload.component.html',
})
export class CameraUploadComponent {
  readonly previewUrl = input<string | null>(null);
  readonly snapshot = input<Snapshot | null>(null);
  readonly fileChosen = output<File>();
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  openPicker(): void {
    this.fileInput()?.nativeElement.click();
  }

  onChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    if (file) {
      this.fileChosen.emit(file);
    }
    inputEl.value = '';
  }
}
