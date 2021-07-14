import { of } from 'rxjs';
import { ApiService, CachedItemStore, GetLearnerCerificateRequest } from '../..';
import { GetLearnerCertificateHandler } from './get-learner-certificate-handler';

describe('GetLearnerCertificateHandler', () => {
    let getLearnerCertificateHandler: GetLearnerCertificateHandler;
    const mockApiService: Partial<ApiService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};

    beforeAll(() => {
        getLearnerCertificateHandler = new GetLearnerCertificateHandler(
            mockApiService as ApiService,
            mockCachedItemStore as CachedItemStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should be create a instance of GetLearnerCertificateHandler', () => {
        expect(getLearnerCertificateHandler).toBeTruthy();
    });

    it('should return learner certificate', (done) => {
        // arrange
        const request: GetLearnerCerificateRequest = {
            userId: 'sample-user-id'
        };
        mockCachedItemStore.get = jest.fn(() => of({})) as any;
        // act
        getLearnerCertificateHandler.handle(request).subscribe(() => {
          done();
        });
        // assert
    });
});
