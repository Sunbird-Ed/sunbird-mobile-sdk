import { TransportFrameworkNChannel } from './transport-framework-n-channel';
import { DbService, ImportTelemetryContext } from '../../..';
import { of } from 'rxjs';

describe('TransportFrameworkNChannel', () => {
    let transportFrameworkNChannel: TransportFrameworkNChannel;
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        transportFrameworkNChannel = new TransportFrameworkNChannel(
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instace of transportFrameworkNChannel', () => {
        expect(transportFrameworkNChannel).toBeTruthy();
    });

    it('should save NoSqlEntry To Db', (done) => {
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
        transportFrameworkNChannel.execute(request).then(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockDbService.insert).toHaveBeenCalled();
            done();
        });
    });
});
