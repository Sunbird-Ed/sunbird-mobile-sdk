import {DbService} from '../../../db';
import {FileService} from '../../../util/file/def/file-service';
import {TelemetryImportDelegate} from './telemetry-import-delegate';
import {ArchiveImportProgress, ArchiveObjectExportProgress, ArchiveObjectImportProgress, ArchiveObjectType} from '../..';
import {UnknownObjectError} from '../error/unknown-object-error';
import {reduce} from 'rxjs/operators';
import {of} from 'rxjs';
import {NetworkQueue} from '../../../api/network-queue';
import {SdkConfig} from '../../../sdk-config';

describe('TelemetryImportDelegate', () => {
    let telemetryImportDelegate: TelemetryImportDelegate;
    const mockDbService: Partial<DbService> = {};
    const mockFileService: Partial<FileService> = {};
    const mockNetworkQueue: Partial<NetworkQueue> = {
        enqueue: jest.fn(() => of())
    };
    const mockSdkConfig: Partial<SdkConfig> = {
        telemetryConfig: {
            host: 'https://sunbirded.org'
        } as any
    };

    beforeAll(() => {
        telemetryImportDelegate = new TelemetryImportDelegate(
            mockDbService as DbService,
            mockFileService as FileService,
            mockNetworkQueue as NetworkQueue,
            mockSdkConfig as SdkConfig
        );
    });

    it('should be able to create an instance', () => {
        expect(telemetryImportDelegate).toBeTruthy();
    });

    describe('import()', () => {
        it('should throw UnknownObjectError if contentEncoding is other than gzip', (done) => {
            // act
            telemetryImportDelegate.import({
                filePath: 'some_base_path'
            }, {
                workspacePath: 'some_base_path',
                items: [
                    {
                        objectType: ArchiveObjectType.TELEMETRY,
                        file: 'some_relative_file_path',
                        contentEncoding: 'identity',
                        size: -1,
                        explodedSize: -1,
                        mid: 'some_mid',
                        eventsCount: 2
                    }
                ]
            }).subscribe(() => {}, (e) => {
                expect(e instanceof UnknownObjectError).toBeTruthy();
                done();
            });
        });

        it('should import telemetry for every batch emitting progress', (done) => {
            mockFileService.readAsBinaryString = jest.fn().mockImplementation(() => Promise.resolve('SOME_DATA'));
            mockDbService.insert = jest.fn().mockImplementation(() => of(1));
            // act
            telemetryImportDelegate.import({
                filePath: 'some_base_path'
            }, {
                workspacePath: 'some_base_path',
                items: [
                    {
                        objectType: ArchiveObjectType.TELEMETRY,
                        file: 'some_relative_file_path',
                        contentEncoding: 'gzip',
                        size: -1,
                        explodedSize: -1,
                        mid: 'some_mid_1',
                        eventsCount: 2
                    },
                    {
                        objectType: ArchiveObjectType.TELEMETRY,
                        file: 'some_relative_file_path',
                        contentEncoding: 'gzip',
                        size: -1,
                        explodedSize: -1,
                        mid: 'some_mid_2',
                        eventsCount: 2
                    }
                ]
            }).pipe(
                reduce((acc: ArchiveObjectImportProgress<any>[], v) => { acc.push(v); return acc; }, [])
            ).subscribe((progress) => {
                expect(progress).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        task: 'PREPARING'
                    }),
                    expect.objectContaining({
                        task: 'IMPORTING_BATCH'
                    }),
                    expect.objectContaining({
                        task: 'IMPORTING_BATCH'
                    }),
                    expect.objectContaining({
                        task: 'OBJECT_IMPORT_COMPLETE'
                    }),
                ]));
                done();
            }, (e) => {
                fail(e);
            });
        });
    });
});
