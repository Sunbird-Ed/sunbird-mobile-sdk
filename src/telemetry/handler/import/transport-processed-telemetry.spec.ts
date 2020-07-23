import {TransportProcessedTelemetry} from './transport-processed-telemetry';
import { DbService, ImportTelemetryContext } from '../../..';
import { of } from 'rxjs';
import { TelemetryProcessedEntry } from '../../db/schema';

describe('TransportProcessedTelemetry', () => {
    let transportProcessedTelemetry: TransportProcessedTelemetry;
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        transportProcessedTelemetry = new TransportProcessedTelemetry(
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be generate a instance of transportProcessedTelemetry', () => {
        expect(transportProcessedTelemetry).toBeTruthy();
    });

    it('should handle processed telemetry', (done) => {
        const request: ImportTelemetryContext = {
            sourceDBFilePath: 'sample-source-file-path',
            metadata: { event: 'share' }
        };
        const results: TelemetryProcessedEntry.SchemaMap[] = [{
            '_id': 'sample-id',
            'msg_id': 'sample-msg-id',
            'data': 'sample-data',
            'event_count': 1,
            'priority': 1
        }];
        mockDbService.read = jest.fn(() => of(results));
        mockDbService.insert = jest.fn(() => of(1));
        // act
        transportProcessedTelemetry.execute(request).then(() => {
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockDbService.insert).toHaveBeenCalled();
            done();
        });
    });
});
