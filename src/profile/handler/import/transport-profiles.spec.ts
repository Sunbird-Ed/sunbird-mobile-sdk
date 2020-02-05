import {TransportProfiles} from './transport-profiles';
import { DbService, ImportTelemetryContext } from '../../..';
import { of } from 'rxjs';

describe('TransportProfiles', () => {
    let transportProfiles: TransportProfiles;
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        transportProfiles = new TransportProfiles(
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of TransportGroupProfile', () => {
        expect(transportProfiles).toBeTruthy();
    });

    it('should saved profile and transport to db', (done) => {
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
        transportProfiles.execute(request).then(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockDbService.insert).toHaveBeenCalled();
            done();
        });
    });

    it('should saved profile to db for import context failed', (done) => {
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

            return of([{}]);
        });
        // act
        transportProfiles.execute(request).then(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            done();
        });
    });
});
