import { DownloadServiceImpl } from './download-service-impl';
import {EventsBusService, DownloadRequest, ContentDownloadRequest} from '../../..';
import {SharedPreferencesLocalStorage} from '../../shared-preferences/impl/shared-preferences-local-storage';
import {TelemetryLogger} from '../../../telemetry/util/telemetry-logger';
import {of} from 'rxjs';
import {take} from 'rxjs/operators';
import {DownloadCompleteDelegate} from '../def/download-complete-delegate';
import Set from 'typescript-collections/dist/lib/Set';

jest.mock('../../../telemetry/util/telemetry-logger');

describe('DownloadServiceImpl', () => {
    let downloadService: DownloadServiceImpl;
    (TelemetryLogger as any)['log'] = {
        interact: jest.fn().mockImplementation(() => of(undefined))
    };
    const mockEventsBusService: Partial<EventsBusService> = {
        emit: jest.fn().mockImplementation(() => undefined)
    };
    const mockSharedPreferences = new SharedPreferencesLocalStorage();

    beforeAll(() => {
        downloadService = new DownloadServiceImpl(
            mockEventsBusService as EventsBusService,
            mockSharedPreferences
        );
    });
    window['device'] = {
        uuid:'some_id',
        platform: 'android'
    }

    beforeEach(async (done) => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.useRealTimers();

        await downloadService['sharedPreferencesSetCollection'].clear().toPromise();

        downloadService = new DownloadServiceImpl(
            mockEventsBusService as EventsBusService,
            mockSharedPreferences
        );

        done();
    });

    it('should be able to create an instance', () => {
        expect(downloadService).toBeTruthy();
    });

    describe('onInit()', () => {
        beforeEach(async (done) => {
            await downloadService['sharedPreferencesSetCollection'].clear().toPromise();

            downloadService = new DownloadServiceImpl(
                mockEventsBusService as EventsBusService,
                mockSharedPreferences
            );

            done();
        });

        describe('when queue empty', () => {
            it('should not have resumed any downloads', (done) => {
                // act
                downloadService.onInit().pipe(
                    take(1)
                ).subscribe(() => {
                    // assert
                    expect(mockEventsBusService.emit).not.toHaveBeenCalled();
                    done();
                });
            });
        });

        describe('when queue has DownloadRequest', () => {
            it('should resume download', (done) => {
                // arrange
                const downloadRequest: DownloadRequest = {
                    identifier: 'SAMPLE_ID',
                    downloadUrl: 'http://sample-url/',
                    mimeType: 'SAMPLE_MIME_TYPE',
                    destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                    filename: 'SAMPLE_FILE_NAME'
                };

                const downloadId = Date.now().toString();
                window['downloadManager'] = {
                    enqueue: jest.fn(() => {}),
                    query: jest.fn((_, cb) => {
                        cb!(undefined, [{
                            id: downloadId,
                            title: 'SAMPLE_TITLE',
                            description: 'SAMPLE_MIME_TYPE',
                            mediaType: 'SAMPLE_MIME_TYPE',
                            localFilename: 'SOME_LOCAL_FILE_NAME',
                            localUri: 'SOME_LOCAL_FILE_URI',
                            mediaproviderUri: 'SOME_MEDIA_PROVIDER_URI',
                            uri: 'SOME_URI',
                            lastModifiedTimestamp: Date.now(),
                            status: 0x00000008,
                            reason: 0,
                            bytesDownloadedSoFar: 100,
                            totalSizeBytes: 100
                        }]);
                    })
                } as any

                downloadService['sharedPreferencesSetCollection'].add(downloadRequest).toPromise();

                const onDownloadCompleteDelegate: DownloadCompleteDelegate = {
                    onDownloadCompletion: (request) => {
                        // assert
                        expect(request).toEqual(expect.objectContaining({
                            ...downloadRequest,
                            downloadId: downloadId
                        }));
                        done();
                        return of(undefined);
                    }
                };

                downloadService.registerOnDownloadCompleteDelegate(onDownloadCompleteDelegate);

                // act
                downloadService.onInit().pipe(take(1)).toPromise();
                setTimeout(() => {
                    done()
                }, 500);
            });

            it('should cancel and dequeue download if it fails ', async (done) => {
                // arrange
                const downloadRequest_1: DownloadRequest = {
                    identifier: 'SAMPLE_ID_1',
                    downloadUrl: 'http://sample-url/',
                    mimeType: 'SAMPLE_MIME_TYPE',
                    destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                    filename: 'SAMPLE_FILE_NAME'
                };

                const downloadRequest_2: DownloadRequest = {
                    identifier: 'SAMPLE_ID_2',
                    downloadUrl: 'http://sample-url/',
                    mimeType: 'SAMPLE_MIME_TYPE',
                    destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                    filename: 'SAMPLE_FILE_NAME'
                };

                const orderStack_2 = [Date.now().toString(), (Date.now() + 1).toString()];
                const downloadId = Date.now().toString();
                window['downloadManager'] = {
                    enqueue: jest.fn((_, cb) => {
                        cb!(undefined, orderStack_2.pop()!);
                    })
                } as any
                const orderStack = [
                    [{
                        id: downloadId,
                        title: 'SAMPLE_TITLE',
                        description: 'SAMPLE_MIME_TYPE',
                        mediaType: 'SAMPLE_MIME_TYPE',
                        localFilename: 'SOME_LOCAL_FILE_NAME',
                        localUri: 'SOME_LOCAL_FILE_URI',
                        mediaproviderUri: 'SOME_MEDIA_PROVIDER_URI',
                        uri: 'SOME_URI',
                        lastModifiedTimestamp: Date.now(),
                        status: 0x00000008,
                        reason: 0,
                        bytesDownloadedSoFar: 100,
                        totalSizeBytes: 100
                    }],
                    new Error('SOME_ERROR')
                ];
                window['downloadManager'] = {
                    'remove':jest.fn((_, cb) => {
                        cb!(undefined, 1);
                    }),
                    'query': jest.fn((_, cb) => {
                        const res = orderStack.pop();

                        if (res instanceof Error) {
                            cb!(res, []);
                        }

                        cb!(_, res as any);
                    })
                } as any

                downloadService['sharedPreferencesSetCollection'].add(downloadRequest_1).toPromise();
                downloadService['sharedPreferencesSetCollection'].add(downloadRequest_2).toPromise();

                spyOn(downloadService, 'cancel').and.callThrough();

                // act
                downloadService.onInit().pipe(take(2)).toPromise();
                downloadService.getActiveDownloadRequests().subscribe((v) => {
                    if (v.length === 1) {
                        // assert
                        expect(downloadService.cancel).toHaveBeenCalled();
                        done();
                    }
                });
            });
        });
    });

    describe('download()', () => {
        beforeEach(async (done) => {
            await downloadService['sharedPreferencesSetCollection'].clear().toPromise();

            downloadService = new DownloadServiceImpl(
                mockEventsBusService as EventsBusService,
                mockSharedPreferences
            );

            done();
        });

        it('should enqueue download request to be downloaded', (done) => {
            // arrange
            const downloadRequest: DownloadRequest = {
                identifier: 'SAMPLE_ID',
                downloadUrl: 'http://sample-url/',
                mimeType: 'SAMPLE_MIME_TYPE',
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                filename: 'SAMPLE_FILE_NAME'
            };

            const downloadId = Date.now().toString();
            window['downloadManager'] = {
                enqueue: jest.fn((_, cb) => {
                    cb!(undefined, downloadId);
                }),
                query: jest.fn((_, cb) => {
                cb!(undefined, [{
                    id: downloadId,
                    title: 'SAMPLE_TITLE',
                    description: 'SAMPLE_MIME_TYPE',
                    mediaType: 'SAMPLE_MIME_TYPE',
                    localFilename: 'SOME_LOCAL_FILE_NAME',
                    localUri: 'SOME_LOCAL_FILE_URI',
                    mediaproviderUri: 'SOME_MEDIA_PROVIDER_URI',
                    uri: 'SOME_URI',
                    lastModifiedTimestamp: Date.now(),
                    status: 0x00000008,
                    reason: 0,
                    bytesDownloadedSoFar: 100,
                    totalSizeBytes: 100
                }]);
            })
        } as any

            const onDownloadCompleteDelegate: DownloadCompleteDelegate = {
                onDownloadCompletion: (request) => {
                    // assert
                    expect(request).toEqual(expect.objectContaining({
                        ...downloadRequest,
                        downloadId: downloadId
                    }));
                    done();
                    return of(undefined);
                }
            };

            downloadService.registerOnDownloadCompleteDelegate(onDownloadCompleteDelegate);

            // act
            downloadService.onInit().pipe().toPromise();
            downloadService.download([downloadRequest]).pipe().toPromise();
        });

        it('should enqueue multiple download requests to be downloaded', (done) => {
            // arrange
            const downloadRequest_1: DownloadRequest = {
                identifier: 'SAMPLE_ID_1',
                downloadUrl: 'http://sample-url/',
                mimeType: 'SAMPLE_MIME_TYPE',
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                filename: 'SAMPLE_FILE_NAME'
            };
            const downloadRequest_2: DownloadRequest = {
                identifier: 'SAMPLE_ID_2',
                downloadUrl: 'http://sample-url/',
                mimeType: 'SAMPLE_MIME_TYPE',
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                filename: 'SAMPLE_FILE_NAME'
            };

            const downloadId_1 = Date.now().toString();
            const downloadId_2 = Date.now().toString();
            const orderStack_1 = [downloadId_2, downloadId_1];
            const orderStack_2 = [downloadId_2, downloadId_1, downloadId_1];
            window['downloadManager'] = {
                'remove': jest.fn((_, cb) => {
                    cb!(undefined, 1);
                }),
                'enqueue': jest.fn((_, cb) => {
                    cb!(undefined, orderStack_1.pop()!);
                }),
                'query': jest.fn((_, cb) => {
                setTimeout(() => {
                    if (orderStack_2.length === 3) {
                        cb!(undefined, [{
                            id: orderStack_2.pop()!,
                            title: 'SAMPLE_TITLE',
                            description: 'SAMPLE_MIME_TYPE',
                            mediaType: 'SAMPLE_MIME_TYPE',
                            localFilename: 'SOME_LOCAL_FILE_NAME',
                            localUri: 'SOME_LOCAL_FILE_URI',
                            mediaproviderUri: 'SOME_MEDIA_PROVIDER_URI',
                            uri: 'SOME_URI',
                            lastModifiedTimestamp: Date.now(),
                            status: 0x00000002,
                            reason: 0,
                            bytesDownloadedSoFar: 50,
                            totalSizeBytes: 100
                        }]);
                    }

                    cb!(undefined, [{
                        id: orderStack_2.pop()!,
                        title: 'SAMPLE_TITLE',
                        description: 'SAMPLE_MIME_TYPE',
                        mediaType: 'SAMPLE_MIME_TYPE',
                        localFilename: 'SOME_LOCAL_FILE_NAME',
                        localUri: 'SOME_LOCAL_FILE_URI',
                        mediaproviderUri: 'SOME_MEDIA_PROVIDER_URI',
                        uri: 'SOME_URI',
                        lastModifiedTimestamp: Date.now(),
                        status: 0x00000008,
                        reason: 0,
                        bytesDownloadedSoFar: 100,
                        totalSizeBytes: 100
                    }]);
                }, 500);
            })
        } as any

            const orderStack_3 = [downloadId_2, downloadId_1];
            const orderStack_4 = [downloadRequest_2, downloadRequest_1];
            const onDownloadCompleteDelegate: DownloadCompleteDelegate = {
                onDownloadCompletion: (request) => {
                    // assert
                    expect(request).toEqual(expect.objectContaining({
                        identifier: orderStack_4.pop()!.identifier,
                        downloadId: orderStack_3.pop()
                    }));

                    if (!orderStack_3.length) {
                        done();
                        return of(undefined);
                    }

                    downloadService.cancel({identifier: request.identifier!}, false).toPromise();
                    return of(undefined);
                }
            };

            downloadService.registerOnDownloadCompleteDelegate(onDownloadCompleteDelegate);

            // act
            jest.useFakeTimers();
            downloadService.onInit().subscribe(() => {}, (e) => fail(e));
            downloadService.download([downloadRequest_1, downloadRequest_2]).pipe().toPromise();
            jest.advanceTimersByTime(10000);
        });
    });

    describe('cancelAll()', () => {
        beforeEach(async (done) => {
            await downloadService['sharedPreferencesSetCollection'].clear().toPromise();

            downloadService = new DownloadServiceImpl(
                mockEventsBusService as EventsBusService,
                mockSharedPreferences
            );

            done();
        });

        it('should cancel current download request and remove rest from queue', (done) => {
            const downloadRequest_1: DownloadRequest = {
                identifier: 'SAMPLE_ID_1',
                downloadUrl: 'http://sample-url/',
                mimeType: 'SAMPLE_MIME_TYPE',
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                filename: 'SAMPLE_FILE_NAME'
            };

            const downloadRequest_2: DownloadRequest = {
                identifier: 'SAMPLE_ID_2',
                downloadUrl: 'http://sample-url/',
                mimeType: 'SAMPLE_MIME_TYPE',
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                filename: 'SAMPLE_FILE_NAME'
            };

            const downloadRequest_3: DownloadRequest = {
                identifier: 'SAMPLE_ID_3',
                downloadUrl: 'http://sample-url/',
                mimeType: 'SAMPLE_MIME_TYPE',
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                filename: 'SAMPLE_FILE_NAME'
            };

            const orderStack_1 = [
                Date.now().toString(),
                (Date.now() + 1).toString(),
                (Date.now() + 2).toString()
            ];

            window['downloadManager'] = {
                'enqueue': jest.fn((_, cb) => {
                    cb!(undefined, orderStack_1.pop()!);
                }),
                'remove': jest.fn((_, cb) => {
                    cb!(undefined, 1);
                }),

                'query': jest.fn((_, cb) => {
                })
            } as any

            downloadService['sharedPreferencesSetCollection'].add(downloadRequest_1).toPromise();
            downloadService['sharedPreferencesSetCollection'].add(downloadRequest_2).toPromise();
            downloadService['sharedPreferencesSetCollection'].add(downloadRequest_3).toPromise();


            downloadService.onInit().subscribe();

            downloadService.getActiveDownloadRequests().subscribe((v) => {
                if (!v.length) {
                    // assert
                    expect(window['downloadManager'].remove).toBeCalledTimes(1);
                    done();
                }
            });

            // act
            downloadService.cancelAll().toPromise();
        });
    });

    describe('getActiveDownloadRequests()', () => {
        it('should return pending download requests in order of priority', async (done) => {
            const downloadRequest_1: DownloadRequest = {
                identifier: 'SAMPLE_ID_1',
                downloadUrl: 'http://sample-url/',
                mimeType: 'SAMPLE_MIME_TYPE',
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                filename: 'SAMPLE_FILE_NAME'
            };

            const downloadRequest_2: DownloadRequest = {
                identifier: 'SAMPLE_ID_2',
                downloadUrl: 'http://sample-url/',
                mimeType: 'SAMPLE_MIME_TYPE',
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                filename: 'SAMPLE_FILE_NAME'
            };

            await downloadService['sharedPreferencesSetCollection'].addAll([downloadRequest_1, downloadRequest_2]).toPromise();

            downloadService.getActiveDownloadRequests().pipe(take(1)).subscribe((requests) => {
                done();
            });
        });
    });

    describe('trackDownloads()', () => {
        it('should return queued and completed request groupedBy request criteria', async (done) => {
            const downloadRequest_1: ContentDownloadRequest = {
                contentMeta: {},
                identifier: 'SAMPLE_ID_1',
                downloadUrl: 'http://sample-url/',
                mimeType: 'SAMPLE_MIME_TYPE',
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                filename: 'SAMPLE_FILE_NAME',
                rollUp: {
                    l1: 'SAMPLE_PARENT_ID'
                }
            };

            const downloadRequest_2: ContentDownloadRequest = {
                contentMeta: {},
                identifier: 'SAMPLE_ID_2',
                downloadUrl: 'http://sample-url/',
                mimeType: 'SAMPLE_MIME_TYPE',
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                filename: 'SAMPLE_FILE_NAME',
                rollUp: {
                    l1: 'SAMPLE_PARENT_ID'
                }
            };

            const downloadRequest_3: ContentDownloadRequest = {
                contentMeta: {},
                identifier: 'SAMPLE_ID_3',
                downloadUrl: 'http://sample-url/',
                mimeType: 'SAMPLE_MIME_TYPE',
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                filename: 'SAMPLE_FILE_NAME',
                rollUp: {
                    l1: 'SAMPLE_OTHER_PARENT_ID'
                }
            };

            const downloadRequest_4: ContentDownloadRequest = {
                contentMeta: {},
                identifier: 'SAMPLE_ID_4',
                downloadUrl: 'http://sample-url/',
                mimeType: 'SAMPLE_MIME_TYPE',
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                filename: 'SAMPLE_FILE_NAME',
                rollUp: {
                    l1: 'SAMPLE_PARENT_ID'
                }
            };

            const downloadRequest_5: ContentDownloadRequest = {
                contentMeta: {},
                identifier: 'SAMPLE_ID_5',
                downloadUrl: 'http://sample-url/',
                mimeType: 'SAMPLE_MIME_TYPE',
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                filename: 'SAMPLE_FILE_NAME',
                rollUp: {
                    l1: 'SAMPLE_OTHER_PARENT_ID'
                }
            };

            const downloadRequest_6: DownloadRequest = {
                identifier: 'SAMPLE_ID_5',
                downloadUrl: 'http://sample-url/',
                mimeType: 'SAMPLE_MIME_TYPE',
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                filename: 'SAMPLE_FILE_NAME'
            };

            const downloadRequest_7: ContentDownloadRequest = {
                contentMeta: {},
                identifier: 'SAMPLE_ID_7',
                downloadUrl: 'http://sample-url/',
                mimeType: 'SAMPLE_MIME_TYPE',
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                filename: 'SAMPLE_FILE_NAME',
                rollUp: {
                    l1: 'SAMPLE_PARENT_ID'
                }
            };

            downloadService['completedDownloadRequestsCache'] = new Set();
            [downloadRequest_4, downloadRequest_5, downloadRequest_6].forEach((r) => {
                downloadService['completedDownloadRequestsCache'].add(r);
            });
            await downloadService['sharedPreferencesSetCollection'].addAll([downloadRequest_1, downloadRequest_2, downloadRequest_3]).toPromise();

            downloadService.trackDownloads({
                groupBy: {
                    fieldPath: 'rollUp.l1',
                    value: 'SAMPLE_PARENT_ID'
                }
            }).pipe(take(1)).subscribe((tracking) => {
                expect(tracking.queued).toEqual(expect.arrayContaining([downloadRequest_1, downloadRequest_2]));
                expect(tracking.queued).not.toEqual(expect.arrayContaining([downloadRequest_3]));
                expect(tracking.completed).toEqual(expect.arrayContaining([downloadRequest_4]));
                expect(tracking.completed).not.toEqual(expect.arrayContaining([downloadRequest_5]));
                expect(tracking.completed).not.toEqual(expect.arrayContaining([downloadRequest_7]));
                expect(tracking.completed).not.toEqual(expect.arrayContaining([downloadRequest_6]));
                done();
            });
        });
    });
});

