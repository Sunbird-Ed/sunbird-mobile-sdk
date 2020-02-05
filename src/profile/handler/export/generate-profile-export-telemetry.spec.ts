import {GenerateProfileExportTelemetry} from './generate-profile-export-telemetry';
import { DbService, ImportTelemetryContext } from '../../..';
import { of } from 'rxjs';
import { TelemetryLogger } from '../../../telemetry/util/telemetry-logger';
import { share } from 'rxjs/operators';
import { ProfileServiceImpl } from '../../impl/profile-service-impl';
import { TelemetryService } from '../../../telemetry';

jest.mock('../../../telemetry/util/telemetry-logger');

describe('GenerateProfileExportTelemetry', () => {
    let generateProfileExportTelemetry: GenerateProfileExportTelemetry;
    const mockDbService: Partial<DbService> = {};
    const mockTelemetryService: Partial<TelemetryService> = {
        share: jest.fn().mockImplementation(() => of(undefined))
    };
    (TelemetryLogger as any)['log'] = mockTelemetryService;

    beforeAll(() => {
        generateProfileExportTelemetry = new GenerateProfileExportTelemetry(
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of GenerateProfileExportTelemetry', () => {
        expect(generateProfileExportTelemetry).toBeTruthy();
    });

    it('should generate export profile telemetry', (done) => {
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
        generateProfileExportTelemetry.execute(request).then(() => {
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
