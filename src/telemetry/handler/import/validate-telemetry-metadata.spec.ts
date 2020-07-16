import {ValidateTelemetryMetadata} from './validate-telemetry-metadata';
import { DbService, ImportTelemetryContext } from '../../..';
import { MetaEntry } from '../../db/schema';
import { of } from 'rxjs';
import { ImportedMetadataEntry } from '../../../profile/db/schema';

describe('ValidateTelemetryMetadata', () => {
    let validateTelemetryMetadata: ValidateTelemetryMetadata;
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        validateTelemetryMetadata = new ValidateTelemetryMetadata(
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should create a instance of validateTelemetryMetadata', () => {
        expect(validateTelemetryMetadata).toBeTruthy();
    });

    it('should handle update telemetry metadata', (done) => {
        const request: ImportTelemetryContext = {
            sourceDBFilePath: 'sample-source-file-path',
            metadata: { event: 'share' }
        };
        mockDbService.open = jest.fn(() => Promise.resolve(undefined));
        const results: MetaEntry.SchemaMap[] = [{
            '_id': 'sample-id',
            'key': 'types',
            'value': 'telemetry'
        }];
        mockDbService.read = jest.fn(() => of(results));
        // act
        validateTelemetryMetadata.execute(request).then(() => {
            expect(mockDbService.read).toHaveBeenCalled();
            done();
        }, (e) => {
            done();
        });
    });

    it('should handle update telemetry metadata', (done) => {
        const request: ImportTelemetryContext = {
            sourceDBFilePath: 'sample-source-file-path',
            metadata: { event: 'share' }
        };
        mockDbService.open = jest.fn(() => Promise.resolve(undefined));
        const results: MetaEntry.SchemaMap[] = [{
            '_id': 'sample-id',
            'key': 'types',
            'value': 'sample-value'
        }];
        mockDbService.read = jest.fn(() => of(results));
        // act
        validateTelemetryMetadata.execute(request).then(() => {
            expect(mockDbService.read).toHaveBeenCalled();
            done();
        }, (e) => {
            done();
        });
    });

    it('should handle update telemetry metadata for empty array', (done) => {
        const request: ImportTelemetryContext = {
            sourceDBFilePath: 'sample-source-file-path',
            metadata: { event: 'share' }
        };
        mockDbService.open = jest.fn(() => Promise.resolve(undefined));
        mockDbService.read = jest.fn(() => of([]));
        // act
        validateTelemetryMetadata.execute(request).then(() => {
            expect(mockDbService.read).toHaveBeenCalled();
            done();
        }, (e) => {
            done();
        });
    });
});
