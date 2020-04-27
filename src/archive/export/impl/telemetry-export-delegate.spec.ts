import {TelemetryExportDelegate} from './telemetry-export-delegate';
import {FileService} from '../../../util/file/def/file-service';
import {DbService} from '../../../db';
import {ObjectNotFoundError} from '../error/object-not-found-error';
import {TelemetryProcessedEntry} from '../../../telemetry/db/schema';
import {of} from 'rxjs';
import {reduce} from 'rxjs/operators';
import {ArchiveObjectExportProgress} from '../..';
import {NetworkQueueEntry, NetworkQueueType} from '../../../api/network-queue';

describe('TelemetryExportDelegate', () => {
    let telemetryExportDelegate: TelemetryExportDelegate;
    const mockDbService: Partial<DbService> = {};
    const mockFileService: Partial<FileService> = {};

    beforeAll(() => {
       telemetryExportDelegate = new TelemetryExportDelegate(
           mockDbService as DbService,
           mockFileService as FileService
       );
    });

    it('should be able to create an instance', () => {
        expect(telemetryExportDelegate).toBeTruthy();
    });

    describe('export()', () => {
        it('should throw ObjectNotFound if no telemetry to export', (done) => {
            mockDbService.execute = jest.fn().mockImplementation(() => of([{ COUNT: 0 }]));

            telemetryExportDelegate.export({
                    filePath: 'some_path'
                }, {
                    workspacePath: 'some_temp_path'
                }
            ).subscribe(() => {
            }, (e) => {
                expect(mockDbService.execute).toHaveBeenCalledWith(
                    `SELECT count(*) as COUNT FROM ${NetworkQueueEntry.TABLE_NAME} WHERE type = '${NetworkQueueType.TELEMETRY}'`
                );
                expect(e instanceof ObjectNotFoundError).toBeTruthy();
                done();
            });
        });

        it('should write file for every batch emitting progress for each', (done) => {
            mockFileService.createDir = jest.fn().mockImplementation(() => of(undefined));
            mockDbService.execute = jest.fn().mockImplementation(() => of([{ COUNT: 2 }]));
            const telemetryEntries = [
                {
                    [TelemetryProcessedEntry.COLUMN_NAME_MSG_ID]: 'some_msg_id_1',
                    [TelemetryProcessedEntry.COLUMN_NAME_DATA]: 'some_data_1'
                },
                {
                    [TelemetryProcessedEntry.COLUMN_NAME_MSG_ID]: 'some_msg_id_2',
                    [TelemetryProcessedEntry.COLUMN_NAME_DATA]: 'some_data_2'
                }
            ];
            mockDbService.read = jest.fn().mockImplementation((request) => {
                if (request.columns && request.columns.length) {
                    return of([
                        {
                            [TelemetryProcessedEntry.COLUMN_NAME_MSG_ID]: 'some_msg_id_1'
                        },
                        {
                            [TelemetryProcessedEntry.COLUMN_NAME_MSG_ID]: 'some_msg_id_2'
                        }
                    ]);
                }

                return of([telemetryEntries.pop()]);
            });
            mockFileService.writeFile = jest.fn().mockImplementation(() => Promise.resolve());

            telemetryExportDelegate.export({
                    filePath: 'some_path'
                }, {
                    workspacePath: 'some_temp_path'
                }
            ).pipe(
                reduce((acc: ArchiveObjectExportProgress<any>[], v) => { acc.push(v); return acc; }, [])
            ).subscribe((progress) => {
                expect(progress.length).toEqual(6);
                expect(mockFileService.writeFile).nthCalledWith(
                    1,
                    'some_temp_path',
                    'some_msg_id_2',
                    'some_data_2',
                    expect.anything()
                );
                expect(mockFileService.writeFile).nthCalledWith(
                    2,
                    'some_temp_path',
                    'some_msg_id_1',
                    'some_data_1',
                    expect.anything()
                );
                done();
            }, (e) => {
                fail(e);
            });
        });

        it('should skip write file for batch possibly synced from another process', (done) => {
            mockFileService.createDir = jest.fn().mockImplementation(() => of(undefined));
            mockDbService.execute = jest.fn().mockImplementation(() => of([{ COUNT: 2 }]));
            const telemetryEntries = [
                {
                    [TelemetryProcessedEntry.COLUMN_NAME_MSG_ID]: 'some_msg_id_1',
                    [TelemetryProcessedEntry.COLUMN_NAME_DATA]: 'some_data_1'
                }
            ];
            mockDbService.read = jest.fn().mockImplementation((request) => {
                if (request.columns && request.columns.length) {
                    return of([
                        {
                            [TelemetryProcessedEntry.COLUMN_NAME_MSG_ID]: 'some_msg_id_1'
                        },
                        {
                            [TelemetryProcessedEntry.COLUMN_NAME_MSG_ID]: 'some_msg_id_2'
                        }
                    ]);
                }

                return of([telemetryEntries.pop()]);
            });
            mockFileService.writeFile = jest.fn().mockImplementation(() => Promise.resolve());

            telemetryExportDelegate.export({
                    filePath: 'some_path'
                }, {
                    workspacePath: 'some_temp_path'
                }
            ).pipe(
                reduce((acc: ArchiveObjectExportProgress<any>[], v) => { acc.push(v); return acc; }, [])
            ).subscribe((progress) => {
                expect(progress).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        task: 'SKIPPING_BATCH'
                    })
                ]));
                expect(mockFileService.writeFile).nthCalledWith(
                    1,
                    'some_temp_path',
                    'some_msg_id_1',
                    'some_data_1',
                    expect.anything()
                );
                done();
            }, (e) => {
                fail(e);
            });
        });
    });
});
