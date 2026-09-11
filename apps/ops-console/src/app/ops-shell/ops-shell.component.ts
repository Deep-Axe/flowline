import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { AlertPanelComponent } from '../components/alert-panel/alert-panel.component';
import { CameraUploadComponent } from '../components/camera-upload/camera-upload.component';
import { BottleneckListComponent } from '../components/bottleneck-list/bottleneck-list.component';
import { ModelStatusComponent } from '../components/model-status/model-status.component';
import { PlaybackControlsComponent } from '../components/playback-controls/playback-controls.component';
import { RouteSuggestionsComponent } from '../components/route-suggestions/route-suggestions.component';
import { StatusBannerComponent } from '../components/status-banner/status-banner.component';
import { TrendChartComponent } from '../components/trend-chart/trend-chart.component';
import { VenueMapComponent } from '../components/venue-map/venue-map.component';
import { playAlertTone } from '../services/alert-tone';
import {
  OpsGraphqlService,
  type AlertConfig,
  type ModelStatus,
  type Snapshot,
  type Venue,
} from '../services/ops-graphql.service';

const DEMO_DURATION = 60;
const MUTE_KEY = 'flowline.alertMute';

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
    AlertPanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ops-shell.component.html',
})
export class OpsShellComponent implements OnInit {
  private readonly graphql = inject(OpsGraphqlService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly uploader = viewChild(CameraUploadComponent);
  private playback: Subscription | null = null;
  private knownOpen = new Set<string>();

  readonly duration = DEMO_DURATION;
  readonly venue = signal<Venue | null>(null);
  readonly snapshot = signal<Snapshot | null>(null);
  readonly modelStatus = signal<ModelStatus | null>(null);
  readonly alertConfig = signal<AlertConfig | null>(null);
  readonly playing = signal(false);
  readonly clock = signal(0);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly booting = signal(true);
  readonly muted = signal(this.readMuted());
  readonly openIncidents = computed(
    () => this.snapshot()?.incidents.filter((item) => item.open).length ?? 0,
  );

  constructor() {
    this.destroyRef.onDestroy(() => this.stopPlayback());
  }

  ngOnInit(): void {
    void this.boot();
  }

  async boot(): Promise<void> {
    this.booting.set(true);
    try {
      const [venue, status, config] = await Promise.all([
        this.graphql.loadVenue(),
        this.graphql.loadModelStatus(),
        this.graphql.loadAlertConfig(),
      ]);
      this.venue.set(venue);
      this.modelStatus.set(status);
      this.alertConfig.set(config);
      await this.graphql.resetDemo();
      const params = new URLSearchParams(window.location.search);
      const startT = Math.min(DEMO_DURATION, Math.max(0, Number(params.get('t') ?? 0) || 0));
      this.clock.set(startT);
      this.applySnapshot(await this.graphql.demoTick(startT), false);
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
      this.applySnapshot(await this.graphql.demoTick(0), false);
    }
    this.playing.update((value) => !value);
    if (this.playing()) {
      this.startPlayback();
    } else {
      this.stopPlayback();
    }
  }

  async onReset(): Promise<void> {
    this.stopPlayback();
    this.playing.set(false);
    this.clock.set(0);
    this.previewUrl.set(null);
    this.error.set(null);
    await this.graphql.resetDemo();
    this.applySnapshot(await this.graphql.demoTick(0), false);
  }

  openUpload(): void {
    this.uploader()?.openPicker();
  }

  async onUpload(file: File): Promise<void> {
    this.stopPlayback();
    this.playing.set(false);
    this.busy.set(true);
    this.error.set(null);
    this.previewUrl.set(URL.createObjectURL(file));
    try {
      this.applySnapshot(await this.graphql.analyzeCamera(file));
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Upload analyze failed');
    } finally {
      this.busy.set(false);
    }
  }

  toggleMute(): void {
    this.muted.update((value) => !value);
    localStorage.setItem(MUTE_KEY, this.muted() ? '1' : '0');
  }

  async onThreshold(value: number): Promise<void> {
    this.alertConfig.set(await this.graphql.updateAlertConfig(value));
    this.applySnapshot(await this.graphql.demoTick(this.clock()), false);
  }

  async onWebhook(url: string): Promise<void> {
    this.alertConfig.set(await this.graphql.updateAlertConfig(undefined, url));
  }

  async onAck(id: string): Promise<void> {
    await this.graphql.ackIncident(id);
    this.applySnapshot(await this.graphql.demoTick(this.clock()), false);
  }

  async onClearIncidents(): Promise<void> {
    await this.graphql.clearIncidents();
    this.applySnapshot(await this.graphql.demoTick(this.clock()), false);
  }

  private startPlayback(): void {
    this.stopPlayback();
    this.playback = this.graphql
      .demoPlayback(this.clock())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (snap) => {
          this.applySnapshot(snap);
          if (typeof snap.t === 'number') {
            this.clock.set(snap.t);
          }
          if ((snap.t ?? 0) >= DEMO_DURATION) {
            this.playing.set(false);
            this.stopPlayback();
          }
        },
        error: (err: unknown) => {
          this.error.set(err instanceof Error ? err.message : 'Demo failed');
          this.playing.set(false);
          this.stopPlayback();
        },
        complete: () => {
          this.playing.set(false);
          this.stopPlayback();
        },
      });
  }

  private stopPlayback(): void {
    this.playback?.unsubscribe();
    this.playback = null;
  }

  private applySnapshot(snap: Snapshot, announce = true): void {
    const openIds = new Set(snap.incidents.filter((item) => item.open).map((item) => item.id));
    if (announce && !this.muted()) {
      for (const id of openIds) {
        if (!this.knownOpen.has(id)) {
          playAlertTone();
          break;
        }
      }
    }
    this.knownOpen = openIds;
    this.snapshot.set(snap);
  }

  private readMuted(): boolean {
    try {
      return localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      return false;
    }
  }
}
