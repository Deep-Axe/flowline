import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaybackControlsComponent } from './playback-controls.component';

describe('PlaybackControlsComponent', () => {
  let fixture: ComponentFixture<PlaybackControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaybackControlsComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(PlaybackControlsComponent);
  });

  it('labels idle playback as play', async () => {
    fixture.componentRef.setInput('playing', false);
    fixture.componentRef.setInput('clock', 0);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Play event replay');
  });

  it('labels an in-progress clock as resume', async () => {
    fixture.componentRef.setInput('playing', false);
    fixture.componentRef.setInput('clock', 12);
    fixture.componentRef.setInput('duration', 60);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Resume replay');
  });

  it('emits play, reset, and upload', async () => {
    const play: string[] = [];
    const reset: string[] = [];
    const upload: string[] = [];
    fixture.componentInstance.playToggle.subscribe(() => play.push('play'));
    fixture.componentInstance.resetDemo.subscribe(() => reset.push('reset'));
    fixture.componentInstance.uploadClick.subscribe(() => upload.push('upload'));
    fixture.componentRef.setInput('playing', true);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Pause replay');
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    buttons[0].click();
    buttons[1].click();
    buttons[2].click();
    expect(play).toEqual(['play']);
    expect(reset).toEqual(['reset']);
    expect(upload).toEqual(['upload']);
  });
});
