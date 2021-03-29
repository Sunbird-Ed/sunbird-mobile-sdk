import {CopyContentFromSourceToDestination} from './copy-content-from-source-to-destination';
import { EventsBusService, ExistingContentAction } from '../../..';
import { TransferContentContext, MoveContentResponse, MoveContentStatus } from '../transfer-content-handler';
import { ContentEntry } from '../../../content/db/schema';
import { SunbirdError } from '../../../sunbird-error';
import { CancellationError } from '../../errors/cancellation-error';
import { Observable } from 'rxjs';
import { of } from 'rxjs';

declare const sbutility;

describe('CopyContentFromSourceToDestination', () => {
    let copyContentFromSourceToDestination: CopyContentFromSourceToDestination;
    const mockEventBusService: Partial<EventsBusService> = {};

    beforeAll(() => {
        copyContentFromSourceToDestination = new CopyContentFromSourceToDestination(
            mockEventBusService as EventsBusService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of CopyContentFromSourceToDestination', () => {
        expect(copyContentFromSourceToDestination).toBeTruthy();
    });

    it('should handle storage transfer', (done) => {
        // arrange
        spyOn(sbutility, 'rm').and.callFake((a, b, c, d) => {
            setTimeout(() => {
                c(),
                d();
            }, 0);
        });
      //  spyOn(CancellationError, 'prototype').and.returnValue('CANCELLED');
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            content_state: 2,
            primary_category: 'textbook'
        }];
        const request: TransferContentContext = {
            contentIds: ['SAMPLE_ID'],
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentsInSource: rootContentsInDb,
            hasTransferCancelled: true,
        };
        copyContentFromSourceToDestination.execute(request).subscribe(null, (e) => {
            // assert
            expect(e instanceof CancellationError).toBeTruthy();
           done();
        });
    });

    it('should handle storage transfer', (done) => {
        // arrange
        spyOn(sbutility, 'copyDirectory').and.callFake((a, b, c, d) => {
            setTimeout(() => {
               c();
               d();
            }, 0);
        });
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            content_state: 2,
            path: 'SAMPLE_PATH',
            primary_category: 'textbook'
        }];
        const dupContents: MoveContentResponse[] = [
            {
                identifier: 'SAMPLE_IDENTIFIER',
                status: MoveContentStatus.HIGHER_VERSION_IN_DESTINATION
            }
        ];
        const request: TransferContentContext = {
            contentIds: ['SAMPLE_ID'],
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER/',
            contentsInSource: rootContentsInDb,
            hasTransferCancelled: false,
            existingContentAction: ExistingContentAction.KEEP_HIGER_VERSION,
            duplicateContents: dupContents
        };
        mockEventBusService.emit = jest.fn().mockImplementation(() => of({}));
        copyContentFromSourceToDestination.execute(request).subscribe(() => {
            done();
        });
    });

    it('should return StorageTransferProgress', (done) => {
        // arrange
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            content_state: 2,
            path: 'SAMPLE_PATH',
            primary_category: 'textbook'
        }];
        const dupContents: MoveContentResponse[] = [
            {
                identifier: 'IDENTIFIER',
                status: MoveContentStatus.HIGHER_VERSION_IN_DESTINATION
            }
        ];
        const request: TransferContentContext = {
            contentIds: ['SAMPLE_ID'],
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER/',
            contentsInSource: rootContentsInDb,
            hasTransferCancelled: false,
            existingContentAction: undefined,
            duplicateContents: dupContents
        };
        mockEventBusService.emit = jest.fn();
        copyContentFromSourceToDestination.execute(request).subscribe(() => {
            expect(mockEventBusService.emit).toHaveBeenCalled();
            done();
        });
    });

    it('should return void if status is SAME_VERSION_IN_BOT', (done) => {
        // arrange
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            content_state: 2,
            path: 'SAMPLE_PATH',
            primary_category: 'textbook'
        }];
        const dupContents: MoveContentResponse[] = [
            {
                identifier: 'IDENTIFIER',
                status: MoveContentStatus.SAME_VERSION_IN_BOTH
            }
        ];
        const request: TransferContentContext = {
            contentIds: ['SAMPLE_ID'],
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER/',
            contentsInSource: rootContentsInDb,
            hasTransferCancelled: false,
            existingContentAction: ExistingContentAction.KEEP_HIGER_VERSION,
            duplicateContents: dupContents
        };
        mockEventBusService.emit = jest.fn();
        copyContentFromSourceToDestination.execute(request).subscribe(() => {
            expect(mockEventBusService.emit).toHaveBeenCalled();
            done();
        });
    });

    it('should invoked for case ExistingContentAction.KEEP_HIGER_VERSION and status HIGHER_VERSION_IN_DESTINATION', (done) => {
        // arrange
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            content_state: 2,
            path: 'SAMPLE_PATH',
            primary_category: 'textbook'
        }];
        const dupContents: MoveContentResponse[] = [
            {
                identifier: 'IDENTIFIER',
                status: MoveContentStatus.HIGHER_VERSION_IN_DESTINATION
            }
        ];
        const request: TransferContentContext = {
            contentIds: ['SAMPLE_ID'],
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER/',
            contentsInSource: rootContentsInDb,
            hasTransferCancelled: false,
            existingContentAction: ExistingContentAction.KEEP_HIGER_VERSION,
            duplicateContents: dupContents
        };
        mockEventBusService.emit = jest.fn();
        copyContentFromSourceToDestination.execute(request).subscribe(() => {
            expect(mockEventBusService.emit).toHaveBeenCalled();
            done();
        });
    });

    it('should invoked for case ExistingContentAction.KEEP_HIGER_VERSION and status is not matched', (done) => {
        // arrange
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            content_state: 2,
            path: 'SAMPLE_PATH',
            primary_category: 'textbook'
        }];
        const dupContents: MoveContentResponse[] = [
            {
                identifier: 'IDENTIFIER',
                status: MoveContentStatus.LOWER_VERSION_IN_DESTINATION
            }
        ];
        const request: TransferContentContext = {
            contentIds: ['SAMPLE_ID'],
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER/',
            contentsInSource: rootContentsInDb,
            hasTransferCancelled: false,
            existingContentAction: ExistingContentAction.KEEP_HIGER_VERSION,
            duplicateContents: dupContents
        };
        sbutility.renameDirectory = jest.fn((_, __, cb, err) => cb());
        sbutility.copyDirectory = jest.fn((_, __, cb, err) => cb());
        sbutility.rm = jest.fn((_, __, cb, err) => cb());
        mockEventBusService.emit = jest.fn();
        // act
        copyContentFromSourceToDestination.execute(request).subscribe(() => {
            expect(mockEventBusService.emit).toHaveBeenCalled();
            done();
        });
    });

    it('should invoked for case ExistingContentAction.KEEP_LOWER_VERSION and status LOWER_VERSION_IN_DESTINATION', (done) => {
        // arrange
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            content_state: 2,
            path: 'SAMPLE_PATH',
            primary_category: 'textbook'
        }];
        const dupContents: MoveContentResponse[] = [
            {
                identifier: 'IDENTIFIER',
                status: MoveContentStatus.LOWER_VERSION_IN_DESTINATION
            }
        ];
        const request: TransferContentContext = {
            contentIds: ['SAMPLE_ID'],
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER/',
            contentsInSource: rootContentsInDb,
            hasTransferCancelled: false,
            existingContentAction: ExistingContentAction.KEEP_LOWER_VERSION,
            duplicateContents: dupContents
        };
        mockEventBusService.emit = jest.fn();
        copyContentFromSourceToDestination.execute(request).subscribe(() => {
            expect(mockEventBusService.emit).toHaveBeenCalled();
            done();
        });
    });

    it('should invoked for case ExistingContentAction.KEEP_LOWER_VERSION and status is not matched', (done) => {
        // arrange
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            content_state: 2,
            path: 'SAMPLE_PATH',
            primary_category: 'textbook'
        }];
        const dupContents: MoveContentResponse[] = [
            {
                identifier: 'IDENTIFIER',
                status: undefined
            } as any
        ];
        const request: TransferContentContext = {
            contentIds: ['SAMPLE_ID'],
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER/',
            contentsInSource: rootContentsInDb,
            hasTransferCancelled: false,
            existingContentAction: ExistingContentAction.KEEP_LOWER_VERSION,
            duplicateContents: dupContents
        };
        sbutility.renameDirectory = jest.fn((_, __, cb, err) => cb());
        sbutility.copyDirectory = jest.fn((_, __, cb, err) => cb());
        sbutility.rm = jest.fn((_, __, cb, err) => cb());
        mockEventBusService.emit = jest.fn();
        // act
        copyContentFromSourceToDestination.execute(request).subscribe(() => {
            expect(mockEventBusService.emit).toHaveBeenCalled();
            done();
        });
    });

    it('should invoked for case ExistingContentAction.KEEP_SOURCE', (done) => {
        // arrange
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'textbook',
            content_state: 2,
            path: 'SAMPLE_PATH',
            primary_category: 'textbook'
        }];
        const dupContents: MoveContentResponse[] = [
            {
                identifier: 'IDENTIFIER',
                status: undefined
            } as any
        ];
        const request: TransferContentContext = {
            contentIds: ['SAMPLE_ID'],
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER/',
            contentsInSource: rootContentsInDb,
            hasTransferCancelled: false,
            existingContentAction: ExistingContentAction.KEEP_SOURCE,
            duplicateContents: dupContents
        };
        sbutility.renameDirectory = jest.fn((_, __, cb, err) => cb());
        sbutility.copyDirectory = jest.fn((_, __, cb, err) => cb());
        sbutility.rm = jest.fn((_, __, cb, err) => cb());
        mockEventBusService.emit = jest.fn();
        // act
        copyContentFromSourceToDestination.execute(request).subscribe(() => {
            expect(mockEventBusService.emit).toHaveBeenCalled();
            done();
        });
    });
});
