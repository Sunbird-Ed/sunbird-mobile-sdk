import { GenerateImportShareTelemetry } from './generate-import-share-telemetry';
import { TelemetryService, ContentImportResponse, ContentImportStatus, ImportContentContext } from '../../..';
import { of, throwError } from 'rxjs';

describe('GenerateImportShareTelemetry', () => {
    let generateImportShareTelemetry: GenerateImportShareTelemetry;
    const mockTelemetryService: Partial<TelemetryService> = {
        share: jest.fn().mockImplementation(() => { })
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

    it('should share telemetry file', (done) => {
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
            items: [{ primaryCategory: 'OnlineCourese' }],
            existedContentIdentifiers: { 'identifier': true },
        };
        mockTelemetryService.share = jest.fn(() => of(true));
        // act
        generateImportShareTelemetry.execute(request).then(() => {
            // assert
            expect(mockTelemetryService.share).toHaveBeenCalled();
            done();
        });
    });

    it('should share telemetry file', (done) => {
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
            items: [{ contentType: 'Course' }],
            existedContentIdentifiers: { 'identifier': true }
        };
        mockTelemetryService.share = jest.fn(() => throwError({error: {}}));
        // act
        generateImportShareTelemetry.execute(request).then(() => {
            // assert
            done();
        }, e => {
            done();
        });
    });
});
