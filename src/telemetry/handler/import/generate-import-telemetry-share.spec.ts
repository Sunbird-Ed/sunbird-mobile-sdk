import { GenerateImportTelemetryShare } from './generate-import-telemetry-share';
import { DbService, ImportTelemetryContext } from '../../..';
import { TelemetryService } from '../..';
import { of } from 'rxjs';
import { ImportedMetadataEntry } from '../../../profile/db/schema';

describe('GenerateImportTelemetryShare', () => {
    let generateImportTelemetryShare: GenerateImportTelemetryShare;
    const mockDbService: Partial<DbService> = {};
    const mockTelemetryService: Partial<TelemetryService> = {};

    beforeAll(() => {
        generateImportTelemetryShare = new GenerateImportTelemetryShare(
            mockDbService as DbService,
            mockTelemetryService as TelemetryService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be generate a instance of generateImportTelemetryShare', () => {
        expect(generateImportTelemetryShare).toBeTruthy();
    });

    it('should handle share telemetry', (done) => {
        const request: ImportTelemetryContext = {
            sourceDBFilePath: 'sample-source-file-path',
            metadata: { event: 'share' }
        };
        const results: ImportedMetadataEntry.SchemaMap[] = [{
            'imported_id': 'sample-imported-id',
            'device_id': 'sample-device-id',
            'count': '3'
        }] as any;
        mockDbService.read = jest.fn(() => of(results));
        mockTelemetryService.share = jest.fn(() => of(true));
        // act
        generateImportTelemetryShare.execute(request).then(() => {
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockTelemetryService.share).toHaveBeenCalled();
            done();
        });
    });
});
