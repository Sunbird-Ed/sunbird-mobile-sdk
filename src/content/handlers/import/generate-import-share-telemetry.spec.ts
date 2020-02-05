import { GenerateImportShareTelemetry } from './generate-import-share-telemetry';
import { TelemetryService, ContentImportResponse, ContentImportStatus, ImportContentContext } from '../../..';
import { of } from 'rxjs';

describe('GenerateImportShareTelemetry', () => {
    let generateImportShareTelemetry: GenerateImportShareTelemetry;
    const mockTelemetryService: Partial<TelemetryService> = {
        share: jest.fn().mockImplementation(() => {})
    };

    beforeAll(() => {
        generateImportShareTelemetry = new GenerateImportShareTelemetry(
            mockTelemetryService as TelemetryService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of GenerateImportShareTelemetry', () => {
        expect(generateImportShareTelemetry).toBeTruthy();
    });

    it('should share telemetry file', () => {
        // arrange
        const contentImportResponse: ContentImportResponse[] = [{
            identifier: 'SAMPLE_IDENTIFIER',
            status: ContentImportStatus.IMPORT_COMPLETED
        }];
        const request: ImportContentContext = {
            isChildContent: true,
            ecarFilePath: 'SAMPLE_ECAR_FILE_PATH',
            tmpLocation: 'SAMPLE_TEMP_LOCATION',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentImportResponseList: contentImportResponse,
            contentIdsToDelete: new Set(['1', '2']),
            items: ['item_1', 'item_2', 'item_3'],
            existedContentIdentifiers: {'identifier' : true}
        };
        (mockTelemetryService.share as jest.Mock).mockReturnValue(of(false));
        // act
        generateImportShareTelemetry.execute(request).then(() => {

        });
        // assert
    });

    it('should share telemetry file', () => {
        // arrange
        const contentImportResponse: ContentImportResponse[] = [{
            identifier: 'SAMPLE_IDENTIFIER',
            status: ContentImportStatus.IMPORT_COMPLETED
        }];
        const request: ImportContentContext = {
            isChildContent: true,
            ecarFilePath: 'SAMPLE_ECAR_FILE_PATH',
            tmpLocation: 'SAMPLE_TEMP_LOCATION',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentImportResponseList: contentImportResponse,
            contentIdsToDelete: new Set(['1', '2']),
            items: ['item_1', 'item_2', 'item_3'],
            existedContentIdentifiers: {'identifier' : true}
        };
        (mockTelemetryService.share as jest.Mock).mockReturnValue(of(''));
        // act
        generateImportShareTelemetry.execute(request).catch(() => {

        });
        // assert
    });
});
