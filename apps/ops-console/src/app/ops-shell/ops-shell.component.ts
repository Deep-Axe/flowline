import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { from, Subject, switchMap } from 'rxjs';
import { CameraUploadComponent } from '../components/camera-upload/camera-upload.component';
import { BottleneckListComponent } from '../components/bottleneck-list/bottleneck-list.component';
import { ModelStatusComponent } from '../components/model-status/model-status.component';
import { PlaybackControlsComponent } from '../components/playback-controls/playback-controls.component';
import { RouteSuggestionsComponent } from '../components/route-suggestions/route-suggestions.component';
import { StatusBannerComponent } from '../components/status-banner/status-banner.component';
import { TrendChartComponent } from '../components/trend-chart/trend-chart.component';
import { VenueMapComponent } from '../components/venue-map/venue-map.component';
import {
  OpsGraphqlService,
  type ModelStatus,
  type Snapshot,
  type Venue,
} from '../services/ops-graphql.service';

const DEMO_DURATION = 60;

@Component({
  selector: 'app-ops-shell',
  imports: [
    VenueMapComponent,
    TrendChartComponent,
    PlaybackControlsComponent,
    ModelStatusComponent,
    BottleneckListComponent,
    RouteSuggestionsComponent,
    CameraUploadComponent,
    StatusBannerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ops-shell.component.html',
})
export class OpsShellComponent implements OnInit {
  private readonly graphql = inject(OpsGraphqlService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tickRequests = new Subject<number>();
  private readonly uploader = viewChild(CameraUploadComponent);

  readonly duration = DEMO_DURATION;
  readonly venue = signal<Venue | null>(null);
  readonly snapshot = signal<Snapshot | null>(null);
  readonly modelStatus = signal<ModelStatus | null>(null);
  readonly playing = signal(false);
  readonly clock = signal(0);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly booting = signal(true);

  private raf: number | null = null;
  private startMs: number | null = null;

  constructor() {
    this.tickRequests
      .pipe(
        switchMap((t) => from(this.graphql.demoTick(t))),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (snap) => this.snapshot.set(snap),
        error: (err: unknown) => {
          this.error.set(err instanceof Error ? err.message : 'Demo failed');
          this.playing.set(false);
        },
      });
    this.destroyRef.onDestroy(() => this.stopLoop());
  }

  ngOnInit(): void {
    void this.boot();
  }

  async boot(): Promise<void> {
    this.booting.set(true);
    try {
      const [venue, status] = await Promise.all([
        this.graphql.loadVenue(),
        this.graphql.loadModelStatus(),
      ]);
      this.venue.set(venue);
      this.modelStatus.set(status);
      await this.graphql.resetDemo();
      const params = new URLSearchParams(window.location.search);
      const startT = Math.min(DEMO_DURATION, Math.max(0, Number(params.get('t') ?? 0) || 0));
      this.clock.set(startT);
      this.snapshot.set(await this.graphql.demoTick(startT));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to connect to backend');
    } finally {
      this.booting.set(false);
    }
  }

  async onPlayToggle(): Promise<void> {
    this.error.set(null);
    if (!this.playing() && this.clock() >= DEMO_DURATION) {
      this.clock.set(0);
      await this.graphql.resetDemo();
      this.snapshot.set(await this.graphql.demoTick(0));
    }
    this.playing.update((value) => !value);
    if (this.playing()) {
      this.startLoop();
    } else {
      this.stopLoop();
    }
  }

  async onReset(): Promise<void> {
    this.stopLoop();
    this.playing.set(false);
    this.clock.set(0);
    this.previewUrl.set(null);
    this.error.set(null);
    await this.graphql.resetDemo();
    this.snapshot.set(await this.graphql.demoTick(0));
  }

  openUpload(): void {
    this.uploader()?.openPicker();
  }

  async onUpload(file: File): Promise<void> {
    this.stopLoop();
    this.playing.set(false);
    this.busy.set(true);
    this.error.set(null);
    this.previewUrl.set(URL.createObjectURL(file));
    try {
      this.snapshot.set(await this.graphql.analyzeCamera(file));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Upload analyze failed');
    } finally {
      this.busy.set(false);
    }
  }

  private startLoop(): void {
    this.stopLoop();
    this.startMs = null;
    let lastFetch = -1;
    const step = (now: number) => {
      if (this.startMs == null) {
        this.startMs = now - this.clock() * 1000;
      }
      const elapsed = Math.min(DEMO_DURATION, (now - this.startMs) / 1000);
      this.clock.set(elapsed);
      const bucket = Math.floor(elapsed * 2) / 2;
      if (bucket !== lastFetch) {
        lastFetch = bucket;
        this.tickRequests.next(bucket);
      }
      if (elapsed >= DEMO_DURATION) {
        this.playing.set(false);
        this.clock.set(DEMO_DURATION);
        this.stopLoop();
        return;
      }
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  private stopLoop(): void {
    if (this.raf != null) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }
    this.startMs = null;
  }
}
