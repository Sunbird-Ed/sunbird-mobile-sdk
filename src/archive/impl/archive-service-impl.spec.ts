import {ArchiveServiceImpl} from './archive-service-impl';
import {ZipService} from '../../util/zip/def/zip-service';
import {ProducerData, TelemetryService} from '../../telemetry';
import {DbService} from '../../db';
import {FileService} from '../../util/file/def/file-service';
import {ArchiveExportProgress, ArchiveObjectType} from '..';
import {from, of} from 'rxjs';
import {TelemetryExportDelegate} from '../export/impl/telemetry-export-delegate';
import {InvalidRequestError} from '../export/error/invalid-request-error';
import {reduce, take} from 'rxjs/operators';

jest.mock('../export/impl/telemetry-export-delegate');

describe('ArchiveServiceImpl', () => {
    const mockFileService: Partial<FileService> = {};
    const mockDbService: Partial<DbService> = {};
    const mockTelemetryService: Partial<TelemetryService> = {};
    const mockZipService: Partial<ZipService> = {};
    let archiveService: ArchiveServiceImpl;

    beforeAll(() => {
        archiveService = new ArchiveServiceImpl(
            mockFileService as FileService,
            mockDbService as DbService,
            mockTelemetryService as TelemetryService,
            mockZipService as ZipService
        );
    });

    it('should be able to create an instance', () => {
        expect(archiveService).toBeTruthy();
    });

    describe('export()', () => {
        it('should throw InvalidRequestError if no objects to export in request', (done) => {
            // arrange
            mockFileService.createDir = jest.fn(() => of(undefined));

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

        it('should initiate with a temporary working directory in cache', (done) => {
            // arrange
            mockFileService.createDir = jest.fn(() => of(undefined));

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
                };
            });

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
                    expect.stringMatching(`${global['cordova'].file.externalCacheDirectory}`),
                    false
                );

                done();
            });
        });

        it('should return progress sequentially till completion', (done) => {
            // arrange
            mockFileService.createDir = jest.fn(() => of(undefined));
            mockFileService.writeFile = jest.fn(() => Promise.resolve());
            mockTelemetryService.buildContext = jest.fn(() => of({
                pdata: new ProducerData()
            }));
            mockZipService.zip = jest.fn((_, __, ___, ____, cb) => { cb(); });

            (TelemetryExportDelegate as jest.Mock<TelemetryExportDelegate>).mockImplementation(() => {
                return {
                    export: () => {
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
                };
            });

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
                expect(values.length).toEqual(6);
                done();
            }, (e) => {
                fail(e);
            });
        });
    });
});
