import {GetServerProfileDetailsHandler} from './get-server-profile-details-handler';
import { ApiService, CachedItemStore, KeyValueStore } from '../..';
import { ProfileServiceConfig } from '..';
import { of } from 'rxjs';

describe('GetServerProfileDetailsHandler', () => {
    let getServerProfileDetailsHandler: GetServerProfileDetailsHandler;
    const mockApiService: Partial<ApiService> = {};
    const mockProfileServiceConfig: Partial<ProfileServiceConfig> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};
    const mockKeyValueStore: Partial<KeyValueStore> = {};

    beforeAll(() => {
        getServerProfileDetailsHandler = new GetServerProfileDetailsHandler(
            mockApiService as ApiService,
            mockProfileServiceConfig as ProfileServiceConfig,
            mockCachedItemStore as CachedItemStore,
            mockKeyValueStore as KeyValueStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of GetServerProfileDetailsHandler', () => {
        expect(getServerProfileDetailsHandler).toBeTruthy();
    });

    it('should fetch profile data from server on handle()', (done) => {
        // arrange
        const serverProfileDetailsRequest = {
            userId: 'U-001',
            from: 'server',
            requiredFields: []
        };
        mockCachedItemStore.getCached = jest.fn().mockImplementation((a, b, c, d) => d());
        mockApiService.fetch = jest.fn().mockImplementation(() => of({body: {result: {response: {
            userId: 'U-001'
        }}}}));
        mockKeyValueStore.setValue = jest.fn().mockImplementation(() => of(true));
        // act
        getServerProfileDetailsHandler.handle(serverProfileDetailsRequest).subscribe(() => {
            // assert
            expect(mockApiService.fetch).toHaveBeenCalled();
            expect(mockKeyValueStore.setValue).toHaveBeenCalled();
            done();
        });
    });

    it('should fetch profile data from server on handle() for ctachError', (done) => {
        // arrange
        const serverProfileDetailsRequest = {
            userId: 'U-001',
            from: 'server',
            requiredFields: []
        };
        mockCachedItemStore.getCached = jest.fn().mockImplementation(() => of({
            userId: 'U-001',
            from: 'cache'
        }));
        mockApiService.fetch = jest.fn().mockImplementation(() => of({}));
        // act
        getServerProfileDetailsHandler.handle(serverProfileDetailsRequest).subscribe(() => {
            // assert
            expect(mockCachedItemStore.getCached).toHaveBeenCalled();
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
    });

    it('should fetch profile data from cache on handle()', (done) => {
        // arrange
        const serverProfileDetailsRequest = {
            userId: 'U-001',
            requiredFields: []
        };
        mockCachedItemStore.getCached = jest.fn().mockImplementation((a, b, c, d) => d());
        mockApiService.fetch = jest.fn().mockImplementation(() => of({body: {result: {response: {
            userId: 'U-001'
        }}}}));
        // act
        getServerProfileDetailsHandler.handle(serverProfileDetailsRequest).subscribe(() => {
            // assert
            expect(mockCachedItemStore.getCached).toHaveBeenCalled();
            done();
        });
    });
});
