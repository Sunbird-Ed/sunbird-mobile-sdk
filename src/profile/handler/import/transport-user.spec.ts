import { TransportUser } from './transport-user';
import { DbService, ImportTelemetryContext } from '../../..';
import { of } from 'rxjs';

describe('TransportUser', () => {
    let transportUser: TransportUser;
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        transportUser = new TransportUser(
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of TransportGroupProfile', () => {
        expect(transportUser).toBeTruthy();
    });

    it('should saved user profile in Db', (done) => {
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
        transportUser.execute(request).then(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockDbService.insert).toHaveBeenCalled();
            done();
        });
    });
});
