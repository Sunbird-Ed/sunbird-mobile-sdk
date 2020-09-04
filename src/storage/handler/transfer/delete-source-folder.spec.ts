import {DeleteSourceFolder} from './delete-source-folder';
import { EventsBusService, ExistingContentAction } from '../../..';
import { ContentEntry } from '../../../content/db/schema';
import { MoveContentResponse, MoveContentStatus, TransferContentContext } from '../transfer-content-handler';

declare const sbutility;

describe('DeleteSourceFolder', () => {
    let deleteSourceFolder: DeleteSourceFolder;
    const mockEventsBusService: Partial<EventsBusService> = {};

    beforeAll(() => {
        deleteSourceFolder = new DeleteSourceFolder(
            mockEventsBusService as EventsBusService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be created a instance of DeleteSourceFolder', () => {
        expect(deleteSourceFolder).toBeTruthy();
    });

    it('should update storage management for does not exist existing content', (done) => {
        // arrange
        spyOn(sbutility, 'copyDirectory').and.callFake((a, b, c, d) => {
            setTimeout(() => {
               c();
               d();
            }, 0);
        });
        spyOn(sbutility, 'rm').and.callFake((a, b, c, d) => {
            setTimeout(() => {
                c(),
                d();
            }, 0);
        });
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
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
        // act
        deleteSourceFolder.execute(request).subscribe(() => {
            done();
        });
    });

    it('should update storage management ', (done) => {
        // arrange
        spyOn(sbutility, 'copyDirectory').and.callFake((a, b, c, d) => {
            setTimeout(() => {
               c();
               d();
            }, 0);
        });
        spyOn(sbutility, 'rm').and.callFake((a, b, c, d) => {
            setTimeout(() => {
                c(),
                d();
            }, 0);
        });
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
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
          //  existingContentAction: ExistingContentAction.KEEP_HIGER_VERSION,
            duplicateContents: dupContents
        };
        // act
        deleteSourceFolder.execute(request).subscribe(() => {
            done();
        });
    });
    it('should delete source folder for same version', (done) => {
        // arrange
        spyOn(sbutility, 'copyDirectory').and.callFake((a, b, c, d) => {
            setTimeout(() => {
               c();
               d();
            }, 0);
        });
        spyOn(sbutility, 'rm').and.callFake((a, b, c, d) => {
            setTimeout(() => {
                c(),
                d();
            }, 0);
        });
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
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
        // act
        deleteSourceFolder.execute(request).subscribe(() => {
            done();
        });
    });

    it('should delete source folder for switch case higher version', (done) => {
        // arrange
        spyOn(sbutility, 'copyDirectory').and.callFake((a, b, c, d) => {
            setTimeout(() => {
               c();
               d();
            }, 0);
        });
        spyOn(sbutility, 'rm').and.callFake((a, b, c, d) => {
            setTimeout(() => {
                c(),
                d();
            }, 0);
        });
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
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
        // act
        deleteSourceFolder.execute(request).subscribe(() => {
            done();
        });
    });
    it('should delete source folder for switch case lower version', (done) => {
        // arrange
        spyOn(sbutility, 'copyDirectory').and.callFake((a, b, c, d) => {
            setTimeout(() => {
               c();
               d();
            }, 0);
        });
        spyOn(sbutility, 'rm').and.callFake((a, b, c, d) => {
            setTimeout(() => {
                c(),
                d();
            }, 0);
        });
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
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
        // act
        deleteSourceFolder.execute(request).subscribe(() => {
            done();
        });
    });

    it('should delete source folder for switch case lower version', (done) => {
        // arrange
        spyOn(sbutility, 'copyDirectory').and.callFake((a, b, c, d) => {
            setTimeout(() => {
               c();
               d();
            }, 0);
        });
        spyOn(sbutility, 'rm').and.callFake((a, b, c, d) => {
            setTimeout(() => {
                c(),
                d();
            }, 0);
        });
        const rootContentsInDb: ContentEntry.SchemaMap[] = [{
            identifier: 'IDENTIFIER',
            server_data: 'SERVER_DATA',
            local_data: '{"childNodes": [{"DOWNLOAD": 1}, "do_234", "do_345"], "artifactUrl": "http:///do_123"}',
            mime_type: '',
            manifest_version: 'MAINFEST_VERSION',
            content_type: 'CONTENT_TYPE',
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
            existingContentAction: ExistingContentAction.KEEP_SOURCE,
            duplicateContents: dupContents
        };
        // act
        deleteSourceFolder.execute(request).subscribe(() => {
            done();
        });
    });
});
