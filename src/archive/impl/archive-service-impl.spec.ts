import {ArchiveServiceImpl} from './archive-service-impl';
import {ZipService} from '../../util/zip/def/zip-service';
import {ProducerData, TelemetryService} from '../../telemetry';
import {DbService} from '../../db';
import {FileService} from '../../util/file/def/file-service';
import {ArchiveExportProgress, ArchiveImportProgress, ArchiveObjectType} from '..';
import {from, of} from 'rxjs';
import {TelemetryExportDelegate} from '../export/impl/telemetry-export-delegate';
import {InvalidRequestError} from '..';
import {reduce, take} from 'rxjs/operators';
import {TelemetryImportDelegate} from '../import/impl/telemetry-import-delegate';
import {DeviceInfo} from '../../util/device';
import {NetworkQueue} from '../../api/network-queue';
import {SdkConfig} from '../../sdk-config';
import { UniqueId } from '../../db/util/unique-id';

jest.mock('../export/impl/telemetry-export-delegate');
jest.mock('../import/impl/telemetry-import-delegate');

describe('ArchiveServiceImpl', () => {
    const mockFileService: Partial<FileService> = {};
    const mockDbService: Partial<DbService> = {};
    const mockTelemetryService: Partial<TelemetryService> = {
        share: () => of(true)
    };
    const mockZipService: Partial<ZipService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {
        getDeviceID: jest.fn(() => 'SOME_DEVICE_ID')
    };
    const mockNetworkQueue: Partial<NetworkQueue> = {};
    const mockSdkConfig: Partial<SdkConfig> = {};
    let archiveService: ArchiveServiceImpl;

    beforeAll(() => {
        archiveService = new ArchiveServiceImpl(
            mockFileService as FileService,
            mockDbService as DbService,
            mockTelemetryService as TelemetryService,
            mockZipService as ZipService,
            mockDeviceInfo as DeviceInfo,
            mockNetworkQueue as NetworkQueue,
            mockSdkConfig as SdkConfig
        );
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should be able to create an instance', () => {
        expect(archiveService).toBeTruthy();
    });

    describe('export()', () => {
        it('should throw InvalidRequestError if no objects to export in request', (done) => {
            // arrange
            mockFileService.createDir = jest.fn().mockImplementation(() => of(undefined));
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            // act
            archiveService.export({
                objects: [],
                filePath: 'some_base_path'
            }).pipe(
                take(1)
            ).subscribe(() => {}, (e) => {
                expect(e instanceof InvalidRequestError).toBeTruthy();
                done();
            });
        });

        it('should initiate with a content working directory in cache', (done) => {
            // arrange
            mockFileService.createDir = jest.fn().mockImplementation(() => of(undefined));

            (TelemetryExportDelegate as jest.Mock<TelemetryExportDelegate>).mockImplementation(() => {
                return {
                    export: () => {
                        return from([
                            {
                                task: 'VALIDATING',
                                completed: []
                            }
                        ]);
                    }
                } as Partial<TelemetryExportDelegate> as TelemetryExportDelegate;
            });
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            // act
            archiveService.export({
                objects: [{
                    type: ArchiveObjectType.CONTENT
                }],
                filePath: 'some_base_path'
            }).pipe(
                take(1)
            ).toPromise().catch(() => {
                // assert
                expect(mockFileService.createDir).toHaveBeenCalledWith(
                    expect.stringMatching(`${cordova.file.externalCacheDirectory}`),
                    false
                );

                done();
            });
        });

        it('should initiate with a profile working directory in cache', (done) => {
            // arrange
            mockFileService.createDir = jest.fn().mockImplementation(() => of(undefined));

            (TelemetryExportDelegate as jest.Mock<TelemetryExportDelegate>).mockImplementation(() => {
                return {
                    export: () => {
                        return from([
                            {
                                task: 'VALIDATING',
                                completed: []
                            }
                        ]);
                    }
                } as Partial<TelemetryExportDelegate> as TelemetryExportDelegate;
            });
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            // act
            archiveService.export({
                objects: [{
                    type: ArchiveObjectType.PROFILE
                }],
                filePath: 'some_base_path'
            }).pipe(
                take(1)
            ).toPromise().catch(() => {
                // assert
                expect(mockFileService.createDir).toHaveBeenCalledWith(
                    expect.stringMatching(`${cordova.file.externalCacheDirectory}`),
                    false
                );

                done();
            });
        });

        it('should initiate with a temporary working directory in cache', (done) => {
            // arrange
            mockFileService.createDir = jest.fn().mockImplementation(() => of(undefined));

            (TelemetryExportDelegate as jest.Mock<TelemetryExportDelegate>).mockImplementation(() => {
                return {
                    export: () => {
                        return from([
                            {
                                task: 'VALIDATING',
                                completed: []
                            }
                        ]);
                    }
                } as Partial<TelemetryExportDelegate> as TelemetryExportDelegate;
            });
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            // act
            archiveService.export({
                objects: [{
                    type: ArchiveObjectType.TELEMETRY
                }],
                filePath: 'some_base_path'
            }).pipe(
                take(1)
            ).subscribe(() => {
                // assert
                expect(mockFileService.createDir).toHaveBeenCalledWith(
                    expect.stringMatching(`${cordova.file.externalCacheDirectory}`),
                    false
                );

                done();
            });
        });

        it('should return progress sequentially till completion', (done) => {
            // arrange
            mockFileService.createDir = jest.fn().mockImplementation(() => of(undefined));
            mockFileService.writeFile = jest.fn().mockImplementation(() => Promise.resolve());
            mockTelemetryService.buildContext = jest.fn().mockImplementation(() => of({
                pdata: new ProducerData()
            }));
            mockZipService.zip = jest.fn().mockImplementation((_, __, ___, ____, cb) => { cb(); });

            (TelemetryExportDelegate as jest.Mock<TelemetryExportDelegate>).mockImplementation(() => {
                return {
                    export: (_, __) => {
                        return from([
                            {
                                task: 'VALIDATING',
                                completed: []
                            },
                            {
                                task: 'BUILDING',
                                completed: [
                                    {
                                        file: 'some_file.some_extension',
                                        contentEncoding: 'gzip'
                                    }
                                ]
                            },
                            {
                                task: 'BUILDING',
                                completed: [
                                    {
                                        file: 'some_file.some_extension',
                                        contentEncoding: 'gzip'
                                    },
                                    {
                                        file: 'some_file.some_extension',
                                        contentEncoding: 'gzip'
                                    }
                                ]
                            },
                            {
                                task: 'BUILDING',
                                completed: [
                                    {
                                        file: 'some_file.some_extension',
                                        contentEncoding: 'gzip'
                                    },
                                    {
                                        file: 'some_file.some_extension',
                                        contentEncoding: 'gzip'
                                    }
                                ]
                            }
                        ]);
                    }
                } as Partial<TelemetryExportDelegate> as TelemetryExportDelegate;
            });
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            // act
            archiveService.export({
                objects: [{
                    type: ArchiveObjectType.TELEMETRY
                }],
                filePath: 'some_base_path'
            }).pipe(
                reduce((acc: ArchiveExportProgress[], v) => { acc.push(v); return acc; }, [])
            ).subscribe((values) => {
                // assert
                expect(values.length).toEqual(7);
                expect(values.pop()).toEqual(expect.objectContaining({
                    task: 'COMPLETE'
                }));
                done();
            }, (e) => {
                fail(e);
            });
        });

        it('should return progress sequentially till completion for zip error part', (done) => {
            // arrange
            mockFileService.createDir = jest.fn().mockImplementation(() => of(undefined));
            mockFileService.writeFile = jest.fn().mockImplementation(() => Promise.resolve());
            mockTelemetryService.buildContext = jest.fn().mockImplementation(() => of({
                pdata: new ProducerData()
            }));
            mockZipService.zip = jest.fn().mockImplementation((_, __, ___, ____, cb, err) => { err(); });

            (TelemetryExportDelegate as jest.Mock<TelemetryExportDelegate>).mockImplementation(() => {
                return {
                    export: (_, __) => {
                        return from([
                            {
                                task: 'VALIDATING',
                                completed: []
                            },
                            {
                                task: 'BUILDING',
                                completed: [
                                    {
                                        file: 'some_file.some_extension',
                                        contentEncoding: 'gzip'
                                    }
                                ]
                            },
                            {
                                task: 'BUILDING',
                                completed: [
                                    {
                                        file: 'some_file.some_extension',
                                        contentEncoding: 'gzip'
                                    },
                                    {
                                        file: 'some_file.some_extension',
                                        contentEncoding: 'gzip'
                                    }
                                ]
                            },
                            {
                                task: 'BUILDING',
                                completed: [
                                    {
                                        file: 'some_file.some_extension',
                                        contentEncoding: 'gzip'
                                    },
                                    {
                                        file: 'some_file.some_extension',
                                        contentEncoding: 'gzip'
                                    }
                                ]
                            }
                        ]);
                    }
                } as Partial<TelemetryExportDelegate> as TelemetryExportDelegate;
            });
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            // act
            archiveService.export({
                objects: [{
                    type: ArchiveObjectType.TELEMETRY
                }],
                filePath: 'some_base_path'
            }).pipe(
                reduce((acc: ArchiveExportProgress[], v) => { acc.push(v); return acc; }, [])
            ).toPromise().catch(() => {
                // assert
                expect(mockZipService.zip).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('import()', () => {
        window['device'] = {
            uuid:'some_id',
            platform: 'android'
        }
        it('should throw InvalidRequestError if no objects to import in request', (done) => {
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            // act
            archiveService.import({
                objects: [],
                filePath: 'some_base_path'
            }).pipe(
                take(1)
            ).subscribe(() => {
            }, (e) => {
                expect(e instanceof InvalidRequestError).toBeTruthy();
                done();
            });
        });

        it('should initiate with a temporary working directory in cache', (done) => {
            // arrange
            sbutility.copyFile = jest.fn().mockImplementation((_, __, ___, cb, err) => { cb(); err(); });
            mockFileService.createDir = jest.fn().mockImplementation(() => of(undefined));
            mockZipService.unzip = jest.fn().mockImplementation((_, __, cb) => { cb(); });
            mockFileService.readAsText = jest.fn().mockImplementation(() => of(JSON.stringify({
                id: 'some_id',
                ver: 'some_version',
                ts: (new Date()).toISOString(),
                producer: new ProducerData(),
                archive: {
                    count: 1,
                    items: [
                        {
                            file: 'some_relative_path',
                            objectType: ArchiveObjectType.TELEMETRY,
                            contentEncoding: 'gzip'
                        }
                    ]
                }
            })));

            (TelemetryImportDelegate as jest.Mock<TelemetryImportDelegate>).mockImplementation(() => {
                return {
                    import: () => {
                        return from([
                            {
                                task: 'VALIDATING',
                                pending: []
                            }
                        ]);
                    }
                } as Partial<TelemetryImportDelegate> as TelemetryImportDelegate;
            });
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            // act
            archiveService.import({
                objects: [{
                    type: ArchiveObjectType.TELEMETRY
                }],
                filePath: 'some_base_path'
            }).pipe(
                take(3)
            ).subscribe(() => {}, (e) => {
                fail(e);
            }, () => {
                // assert
                expect(mockFileService.createDir).toHaveBeenCalledWith(
                    expect.stringMatching(`${cordova.file.externalCacheDirectory}`),
                    false
                );

                done();
            });
        });

        it('should return progress sequentially till completion', (done) => {
            // arrange
            sbutility.copyFile = jest.fn().mockImplementation((_, __, ___, cb) => { cb(); });
            mockFileService.createDir = jest.fn().mockImplementation(() => of(undefined));
            mockZipService.unzip = jest.fn().mockImplementation((_, __, cb) => { cb(); });
            mockFileService.readAsText = jest.fn().mockImplementation(() => of(JSON.stringify({
                id: 'some_id',
                ver: 'some_version',
                ts: (new Date()).toISOString(),
                producer: new ProducerData(),
                archive: {
                    count: 1,
                    items: [
                        {
                            file: 'some_relative_path_1',
                            objectType: ArchiveObjectType.TELEMETRY,
                            contentEncoding: 'gzip'
                        },
                        {
                            file: 'some_relative_path_2',
                            objectType: ArchiveObjectType.TELEMETRY,
                            contentEncoding: 'gzip'
                        }
                    ]
                }
            })));

            (TelemetryImportDelegate as jest.Mock<TelemetryImportDelegate>).mockImplementation(() => {
                return {
                    import: () => {
                        return from([
                            {
                                task: 'VALIDATING',
                                pending: [
                                    {
                                        file: 'some_relative_path_1',
                                        contentEncoding: 'gzip'
                                    },
                                    {
                                        file: 'some_relative_path_2',
                                        contentEncoding: 'gzip'
                                    }
                                ]
                            },
                            {
                                task: 'VALIDATING',
                                pending: [
                                    {
                                        file: 'some_relative_path_1',
                                        contentEncoding: 'gzip'
                                    }
                                ]
                            }
                        ]);
                    }
                } as Partial<TelemetryImportDelegate> as TelemetryImportDelegate;
            });
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            // act
            archiveService.import({
                objects: [{
                    type: ArchiveObjectType.TELEMETRY
                }],
                filePath: 'some_base_path'
            }).pipe(
                reduce((acc: ArchiveImportProgress[], v) => { acc.push(v); return acc; }, [])
            ).subscribe((values) => {
                // assert
                expect(values.length).toEqual(6);
                done();
            }, (e) => {
                fail(e);
            });
        });
    });
});
