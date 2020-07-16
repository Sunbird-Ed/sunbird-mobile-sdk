import {UpdateImportedTelemetryMetadata} from './update-imported-telemetry-metadata';
import { DbService } from '../../../db';
import { ImportedMetadataEntry } from '../../../profile/db/schema';
import { ImportTelemetryContext } from '../..';
import { of } from 'rxjs';

describe('UpdateImportedTelemetryMetadata', () => {
    let updateImportedTelemetryMetadata: UpdateImportedTelemetryMetadata;
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        updateImportedTelemetryMetadata = new UpdateImportedTelemetryMetadata(
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create a instance of UpdateImportedTelemetryMetadata', () => {
        expect(updateImportedTelemetryMetadata).toBeTruthy();
    });

    it('should handle update telemetry metadata', (done) => {
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
        mockDbService.update = jest.fn(() => of(1));
        // act
        updateImportedTelemetryMetadata.execute(request).then(() => {
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockDbService.update).toHaveBeenCalled();
            done();
        });
    });

    it('should handle update telemetry insert only', (done) => {
        const request: ImportTelemetryContext = {
            sourceDBFilePath: 'sample-source-file-path',
            metadata: { event: 'share' }
        };
        mockDbService.read = jest.fn(() => of([]));
        mockDbService.insert = jest.fn(() => of(1));
        // act
        updateImportedTelemetryMetadata.execute(request).then(() => {
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockDbService.insert).toHaveBeenCalled();
            done();
        });
    });
});
