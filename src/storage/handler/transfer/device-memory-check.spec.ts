import { DbService } from '../../../db';
import { DeviceMemoryCheck } from './device-memory-check';
import { ContentEntry } from '../../../content/db/schema';
import { MoveContentResponse, MoveContentStatus, TransferContentContext } from '../transfer-content-handler';
import { ExistingContentAction } from '../..';
import {ContentStorageHandler} from '../../../content/handlers/content-storage-handler';
import { CancellationError } from '../../errors/cancellation-error';
import { LowMemoryError } from '../../errors/low-memory-error';

declare const sbutility;
jest.mock('../../../content/handlers/content-storage-handler');

describe('DeviceMemoryCheck', () => {
    let deviceMemoryCheck: DeviceMemoryCheck;
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        deviceMemoryCheck = new DeviceMemoryCheck(
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (ContentStorageHandler as any as jest.Mock<ContentStorageHandler>).mockClear();
    });

    it('should be create a instance of DeviceMemoryCheck', () => {
        expect(deviceMemoryCheck).toBeTruthy();
    });

    it('should check memory before file transfer operation', (done) => {
        // arrange
        spyOn(sbutility, 'getFreeUsableSpace').and.callFake((a, b, c) => {
            setTimeout(() => {
                b();
                c();
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
        deviceMemoryCheck.execute(request).subscribe(null, (e) => {
            expect(e instanceof LowMemoryError).toBeTruthy();
            done();
        });
        // assert
    });
});
