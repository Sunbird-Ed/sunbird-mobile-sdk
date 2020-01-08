import {TransportAssesments} from './transport-assesments';
import { DbService, ImportTelemetryContext } from '../../..';
import { of } from 'rxjs';

describe('TransportAssesments', () => {
    let transportAssesments: TransportAssesments;
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        transportAssesments = new TransportAssesments(
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of transportAssesments', () => {
        expect(transportAssesments).toBeTruthy();
    });

    it('should delete unwanted assessment and save lerner assessment', (done) => {
        // arrange
        const request: ImportTelemetryContext = {
            sourceDBFilePath: 'src/db/path',
            metadata: { 'index': 1 }
        };
        mockDbService.read = jest.fn(() => of([{uid: 'sample-uid'}]));
        mockDbService.execute = jest.fn(() => of({}));
        mockDbService.insert = jest.fn(() => of(2));
        mockDbService.update = jest.fn(() => of(2));
        // act
        transportAssesments.execute(request).then(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockDbService.execute).toHaveBeenCalled();
            expect(mockDbService.insert).toHaveBeenCalled();
            expect(mockDbService.update).toHaveBeenCalled();

            done();
        });
    });
});
