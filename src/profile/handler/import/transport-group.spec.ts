import { TransportGroup } from './transport-group';
import { DbService, ImportTelemetryContext } from '../../..';
import { of } from 'rxjs';

describe('TransportGroup', () => {
    let transportGroup: TransportGroup;
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        transportGroup = new TransportGroup(
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of TransportGroupProfile', () => {
        expect(transportGroup).toBeTruthy();
    });

    it('should saved group in local from Db', (done) => {
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
        transportGroup.execute(request).then(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockDbService.insert).toHaveBeenCalled();
            done();
        });
    });


    it('should saved group in local from Db for Failed', (done) => {
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
        transportGroup.execute(request).then(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            done();
        });
    });
});
