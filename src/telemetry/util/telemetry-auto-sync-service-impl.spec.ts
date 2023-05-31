import {TelemetryAutoSyncServiceImpl} from './telemetry-auto-sync-service-impl';
import {TelemetryAutoSyncModes, TelemetryService} from '..';
import {SharedPreferences} from '../../util/shared-preferences';
import {TelemetryKeys} from '../../preference-keys';
import {of} from 'rxjs';
import {take} from 'rxjs/operators';
import advanceTimersByTime = jest.advanceTimersByTime;

describe('TelemetryAutoSyncServiceImpl', () => {
    let telemetryAutoSyncService: TelemetryAutoSyncServiceImpl;
    const mockTelemetryService = {} as Partial<TelemetryService>;
    const mockSharedPreferences = {} as Partial<SharedPreferences>;

    beforeAll(() => {
        telemetryAutoSyncService = new TelemetryAutoSyncServiceImpl(
            mockTelemetryService as TelemetryService,
            mockSharedPreferences as SharedPreferences
        );
    });

    beforeEach(() => {
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    it('should be able to create an instance of TelemetryAutoSyncServiceImpl', () => {
        expect(telemetryAutoSyncService).toBeTruthy();
    });

    describe('getSyncMode()', () => {
        it('should default to undefined if no sync mode set', (done) => {
            // arrange
            mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(undefined));

            // act
            telemetryAutoSyncService.getSyncMode().subscribe((mode) => {
                // assert
                expect(mode).toEqual(undefined);
                expect(mockSharedPreferences.getString).toHaveBeenCalledWith(TelemetryKeys.KEY_AUTO_SYNC_MODE);
                done();
            });
        });

        it('should resolve to mode if sync mode is set', (done) => {
            // arrange
            mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(TelemetryAutoSyncModes.ALWAYS_ON));

            // act
            telemetryAutoSyncService.getSyncMode().subscribe((mode) => {
                // assert
                expect(mode).toEqual(TelemetryAutoSyncModes.ALWAYS_ON);
                expect(mockSharedPreferences.getString).toHaveBeenCalledWith(TelemetryKeys.KEY_AUTO_SYNC_MODE);
                done();
            });
        });
    });

    describe('setSyncMode()', () => {
        it('should be able to set sync mode', (done) => {
            // arrange
            mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));

            // act
            telemetryAutoSyncService.setSyncMode(TelemetryAutoSyncModes.OVER_WIFI).subscribe(() => {
                // assert
                expect(mockSharedPreferences.putString).toHaveBeenCalledWith(TelemetryKeys.KEY_AUTO_SYNC_MODE, TelemetryAutoSyncModes.OVER_WIFI);
                done();
            });
        });
    });

    describe('start', () => {
        beforeEach(() => jest.useFakeTimers());

        afterEach(() => jest.clearAllTimers());

        it('should be able to start telemetry sync', (done) => {
            // arrange
            window['downloadManager'] = {
                fetchSpeedLog: jest.fn().mockImplementation(() => {
                    return {};
                }),
                enqueue: jest.fn(),
                query: jest.fn(),
                remove: jest.fn()
            };

            window['device'] = {
                uuid:'some_id',
                platform: 'android'
            }
            mockTelemetryService.sync = jest.fn().mockImplementation(() => {
                return of({
                    syncedEventCount: 0,
                    syncTime: Date.now(),
                    syncedFileSize: 0
                });
            });

            // act
            telemetryAutoSyncService.start(30000).pipe(
                take(2),
            ).subscribe(() => {}, (e) => {
                console.error(e);
                fail(e);
            }, () => {
                expect(mockTelemetryService.sync).toHaveBeenCalledTimes(2);
                done();
            });

            advanceTimersByTime(61000);
        });

        describe('should generateDownloadSpeedTelemetry every 1 minute', () => {
            it('for start(30000) it should be invoked every 2 iteration', (done) => {
                // arrange
                window['downloadManager'] = {
                    fetchSpeedLog: jest.fn().mockImplementation(() => {
                        return {};
                    }),
                    enqueue: jest.fn(),
                    query: jest.fn(),
                    remove: jest.fn()
                };

                mockTelemetryService.sync = jest.fn().mockImplementation(() => {
                    return of({
                        syncedEventCount: 0,
                        syncTime: Date.now(),
                        syncedFileSize: 0
                    });
                });

                // act
                telemetryAutoSyncService.start(30000).pipe(
                    take(4),
                ).subscribe(() => {}, (e) => {
                    console.error(e);
                    fail(e);
                }, () => {
                    expect(window['downloadManager'].fetchSpeedLog).toHaveBeenCalledTimes(2);
                    done();
                });

                advanceTimersByTime((30000 * 4) + 500);
            });

            it('for start(10000) it should be invoked every 6 iteration', (done) => {
                // arrange
                window['downloadManager'] = {
                    fetchSpeedLog: jest.fn().mockImplementation(() => {
                        return {};
                    }),
                    enqueue: jest.fn(),
                    query: jest.fn(),
                    remove: jest.fn()
                };

                mockTelemetryService.sync = jest.fn().mockImplementation(() => {
                    return of({
                        syncedEventCount: 0,
                        syncTime: Date.now(),
                        syncedFileSize: 0
                    });
                });


                // act
                telemetryAutoSyncService.start(10000).pipe(
                    take(18),
                ).subscribe(() => {}, (e) => {
                    console.error(e);
                    fail(e);
                }, () => {
                    expect(window['downloadManager'].fetchSpeedLog).toHaveBeenCalledTimes(3);
                    done();
                });

                advanceTimersByTime((10000 * 18) + 500);
            });
        });

        it('should attempt Course progress and Assessment sync if online user', (done) => {
            // arrange
            window['downloadManager'] = {
                fetchSpeedLog: jest.fn().mockImplementation(() => {
                    return {};
                }),
                enqueue: jest.fn(),
                query: jest.fn(),
                remove: jest.fn()
            };

            mockTelemetryService.sync = jest.fn().mockImplementation(() => {
                return of({
                    syncedEventCount: 0,
                    syncTime: Date.now(),
                    syncedFileSize: 0
                });
            });

            // act
            telemetryAutoSyncService.start(30000).pipe(
                take(1),
            ).subscribe(() => {}, (e) => {
                console.error(e);
                fail(e);
            }, () => {
                expect(mockTelemetryService.sync).toHaveBeenCalledTimes(1);

                jest.useRealTimers();

                setTimeout(() => {
                    done();
                });
            });

            advanceTimersByTime(31000);
        });
    });

    describe('pause/continue', () => {
        beforeEach(() => jest.useFakeTimers());

        afterEach(() => jest.clearAllTimers());

        it('should be able to start telemetry sync', (done) => {
            // arrange
            window['downloadManager'] = {
                fetchSpeedLog: jest.fn().mockImplementation(() => {
                    return {};
                }),
                enqueue: jest.fn(),
                query: jest.fn(),
                remove: jest.fn()
            };

            mockTelemetryService.sync = jest.fn().mockImplementation(() => {
                return of({
                    syncedEventCount: 0,
                    syncTime: Date.now(),
                    syncedFileSize: 0
                });
            });

            // act
            telemetryAutoSyncService.start(30000).pipe(
                take(2),
            ).subscribe(() => {}, (e) => {
                console.error(e);
                fail(e);
            }, () => {
                expect(mockTelemetryService.sync).toHaveBeenCalledTimes(2);
                done();
            });

            advanceTimersByTime(31000);

            telemetryAutoSyncService.pause();

            advanceTimersByTime(31000);

            telemetryAutoSyncService.continue();

            advanceTimersByTime(31000);
        });
    });
});
