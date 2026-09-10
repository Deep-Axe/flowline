import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testSnapshot } from '../../testing/fixtures';
import { CameraUploadComponent } from './camera-upload.component';

describe('CameraUploadComponent', () => {
  let fixture: ComponentFixture<CameraUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraUploadComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(CameraUploadComponent);
  });

  it('emits the chosen file', async () => {
    const files: File[] = [];
    fixture.componentInstance.fileChosen.subscribe((file) => files.push(file));
    await fixture.whenStable();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['frame'], 'entry.jpg', { type: 'image/jpeg' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    expect(files[0]?.name).toBe('entry.jpg');
  });

  it('shows model source after a preview', async () => {
    fixture.componentRef.setInput('previewUrl', 'blob:preview');
    fixture.componentRef.setInput(
      'snapshot',
      testSnapshot({
        model: {
          __typename: 'ModelMetaType',
          source: 'csrnet',
          modelRepo: 'hf',
          globalCount: 42,
          ready: true,
          error: null,
        },
      }),
    );
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Model: csrnet');
    expect(fixture.nativeElement.textContent).toContain('42');
  });
});
