import {CopyContentFromSourceToDestination} from './copy-content-from-source-to-destination';
import { EventsBusService, ExistingContentAction } from '../../..';
import { TransferContentContext, MoveContentResponse, MoveContentStatus } from '../transfer-content-handler';
import { ContentEntry } from '../../../content/db/schema';
import { SunbirdError } from '../../../sunbird-error';
import { CancellationError } from '../../errors/cancellation-error';
import { Observable } from 'rxjs';

declare const buildconfigreader;

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
        spyOn(buildconfigreader, 'rm').and.callFake((a, b, c, d) => {
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
            content_type: 'CONTENT_TYPE',
            content_state: 2,
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
        spyOn(buildconfigreader, 'copyDirectory').and.callFake((a, b, c, d) => {
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
            content_type: 'CONTENT_TYPE',
            content_state: 2,
            path: 'SAMPLE_PATH'
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
        mockEventBusService.emit = jest.fn(() => Observable.of({}));
        // const error = t.throws(() => {
        //     throwError();
        //   }, TypeError);
        // act
        copyContentFromSourceToDestination.execute(request).subscribe(() => {
            done();
        });
    });
});
