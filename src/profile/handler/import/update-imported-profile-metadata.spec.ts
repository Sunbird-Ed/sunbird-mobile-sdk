import { UpdateImportedProfileMetadata } from './update-imported-profile-metadata';
import { DbService, ImportTelemetryContext } from '../../..';
import { of } from 'rxjs';

describe('TransportUser', () => {
    let updateImportedProfileMetadata: UpdateImportedProfileMetadata;
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        updateImportedProfileMetadata = new UpdateImportedProfileMetadata(
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of TransportGroupProfile', () => {
        expect(updateImportedProfileMetadata).toBeTruthy();
    });

    it('should update import profile metadate', (done) => {
        // arrange
        const request: ImportTelemetryContext = {
            sourceDBFilePath: 'src/db/path',
            metadata: { 'index': 1 }
        };
        mockDbService.read = jest.fn().mockImplementation(() => {
            return of([{
                imported_id: 'sample-imported_id',
                device_id: 'sample-device_id',
                count: 'count-1'
            }]);
        });
        mockDbService.update = jest.fn().mockImplementation(() => of(1));
        // act
        updateImportedProfileMetadata.execute(request).then(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockDbService.update).toHaveBeenCalled();
            done();
        });
    });

    it('should should not updated profile metadata for else part', (done) => {
        // arrange
        const request: ImportTelemetryContext = {
            sourceDBFilePath: 'src/db/path',
            metadata: { 'index': 1 }
        };
        mockDbService.read = jest.fn().mockImplementation(() => of({}));
        mockDbService.insert = jest.fn().mockImplementation(() => of(1));
        // act
        updateImportedProfileMetadata.execute(request).then(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockDbService.insert).toHaveBeenCalled();
            done();
        });
    });
});
