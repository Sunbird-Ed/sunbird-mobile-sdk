import {TransportGroupProfile} from './transport-group-profile';
import { DbService, ImportTelemetryContext } from '../../..';
import { of } from 'rxjs';

describe('TransportGroupProfile', () => {
    let transportGroupProfile: TransportGroupProfile;
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        transportGroupProfile = new TransportGroupProfile(
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of TransportGroupProfile', () => {
        expect(transportGroupProfile).toBeTruthy();
    });

    it('should saved group profile in local from Db', (done) => {
        // arrange
        const request: ImportTelemetryContext = {
            sourceDBFilePath: 'src/db/path',
            metadata: { 'index': 1 }
        };
        mockDbService.read = jest.fn().mockImplementation((req) => {
            if (req.useExternalDb) {
                return of([{
                    uid: 'sample-uid',
                    gid: 'sample-gid'
                }]);
            }

            return of({});
        });
        mockDbService.insert = jest.fn().mockImplementation(() => of(1));
        // act
        transportGroupProfile.execute(request).then(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockDbService.insert).toHaveBeenCalled();
            done();
        });
    });
});
