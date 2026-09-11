import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { OpsGraphqlService } from './services/ops-graphql.service';
import { EMPTY } from 'rxjs';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: OpsGraphqlService,
          useValue: {
            loadVenue: () => Promise.resolve(null),
            loadModelStatus: () => Promise.resolve({ ready: true }),
            resetDemo: () => Promise.resolve(),
            demoTick: () => Promise.resolve(null),
            demoPlayback: () => EMPTY,
            analyzeCamera: () => Promise.resolve(null),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
