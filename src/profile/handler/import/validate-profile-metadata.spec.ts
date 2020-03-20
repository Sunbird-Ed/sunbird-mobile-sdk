import { ValidateProfileMetadata } from './validate-profile-metadata';
import { DbService, ImportTelemetryContext } from '../../..';
import { of } from 'rxjs';

describe('TransportUser', () => {
    let validateProfileMetadata: ValidateProfileMetadata;
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        validateProfileMetadata = new ValidateProfileMetadata(
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of TransportGroupProfile', () => {
        expect(validateProfileMetadata).toBeTruthy();
    });

    it('should import valid profile metadate', (done) => {
        // arrange
        const request: ImportTelemetryContext = {
            sourceDBFilePath: 'src/db/path',
            metadata: { 'index': 1 }
        };
        mockDbService.open = jest.fn().mockImplementation(() => Promise.resolve(undefined));
        mockDbService.read = jest.fn().mockImplementation(() => of([{
            _id: 'sample_id',
            meta_data: 'sample-meta_data',
            key: 'sample-key'
        }]));
        // act
        validateProfileMetadata.execute(request).catch((e) => {
            // assert
            expect(mockDbService.open).toHaveBeenCalled();
            expect(mockDbService.read).toHaveBeenCalled();
            expect(e._errorMesg).toBe('IMPORT_FAILED');
            done();
        });
    });


    it('should be valid profile metadate for error case', (done) => {
        // arrange
        const request: ImportTelemetryContext = {
            sourceDBFilePath: 'src/db/path',
        };
        mockDbService.open = jest.fn().mockImplementation(() => Promise.resolve(
            [{
                _id: 'sample_id',
                meta_data: 'sample-meta_data',
            }]
        ));
        mockDbService.read = jest.fn().mockImplementation(() => of([]));
        // act
        validateProfileMetadata.execute(request).catch((e) => {
            // assert
            expect(mockDbService.open).toHaveBeenCalled();
            expect(mockDbService.read).toHaveBeenCalled();
            expect(e._errorMesg).toBe('IMPORT_FAILED');
            done();
        });
    });

    it('should import valid profile metadate for metadata key', (done) => {
        // arrange
        const request: ImportTelemetryContext = {
            sourceDBFilePath: 'src/db/path',
            metadata: { 'key': 's1-key', 'types': 'sample-type' }
        };
        mockDbService.open = jest.fn().mockImplementation(() => Promise.resolve(
            [{
                _id: 'sample_id',
                meta_data: 'sample-meta_data',
            }]
        ));
        mockDbService.read = jest.fn().mockImplementation(() => of([{
            _id: 'sample-id',
            meta_data: 'sample-meta-data',
            key: 'sample-key'
        }]));
        // act
        validateProfileMetadata.execute(request).catch((e) => {
            // assert
            expect(mockDbService.open).toHaveBeenCalled();
            expect(mockDbService.read).toHaveBeenCalled();
            done();
        });
    });
});
