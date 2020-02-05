import { GenerateProfileImportTelemetry } from './generate-profile-import-telemetry';
import { DbService, TelemetryService, ImportTelemetryContext } from '../../..';
import { of } from 'rxjs';
import { TelemetryLogger } from '../../../telemetry/util/telemetry-logger';

jest.mock('../../../telemetry/util/telemetry-logger');

describe('GenerateProfileImportTelemetry', () => {
    let generateProfileImportTelemetry: GenerateProfileImportTelemetry;
    const mockDbService: Partial<DbService> = {};
    const mockTelemetryService: Partial<TelemetryService> = {
        share: jest.fn().mockImplementation(() => of(undefined))
    };
    (TelemetryLogger as any)['log'] = mockTelemetryService;

    beforeAll(() => {
        generateProfileImportTelemetry = new GenerateProfileImportTelemetry(
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of GenerateProfileImportTelemetry', () => {
        expect(generateProfileImportTelemetry).toBeTruthy();
    });

    it('should generate import profile telemetry', (done) => {
        // arrange
        const request: ImportTelemetryContext = {
            sourceDBFilePath: 'src/db/path',
            metadata: { 'index': 1 }
        };
        mockDbService.read = jest.fn().mockImplementation(() => of([{
            imported_id: 'sample-imported_id',
            device_id: 'sample-device_id',
            count: 'no-of-count'
        }]));
        // act
        generateProfileImportTelemetry.execute(request).then(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockTelemetryService.share).toHaveBeenCalled();
            done();
        }).catch((e) => {
            console.error(e);
            fail(e);
        });
    });
});
