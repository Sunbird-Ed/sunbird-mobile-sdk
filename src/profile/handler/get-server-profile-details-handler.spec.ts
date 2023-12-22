import {GetServerProfileDetailsHandler} from './get-server-profile-details-handler';
import { ApiService, CachedItemStore, KeyValueStore } from '../..';
import { ProfileServiceConfig } from '..';
import {of, throwError} from 'rxjs';
import {Container} from 'inversify';
import {CsUserService} from '@project-sunbird/client-services/services/user';
import {CsInjectionTokens} from '../../injection-tokens';

describe('GetServerProfileDetailsHandler', () => {
    let getServerProfileDetailsHandler: GetServerProfileDetailsHandler;
    const mockCachedItemStore: Partial<CachedItemStore> = {};
    const mockKeyValueStore: Partial<KeyValueStore> = {};
    const container = new Container();
    const mockCsUserService: Partial<CsUserService> = {
        getProfileDetails: jest.fn()
    };
    const mockProfileServiceConfig: Partial<ProfileServiceConfig> = {};
    beforeAll(() => {
        container.bind<CsUserService>(CsInjectionTokens.USER_SERVICE).toConstantValue(mockCsUserService as CsUserService);
        getServerProfileDetailsHandler = new GetServerProfileDetailsHandler(
            mockCachedItemStore as CachedItemStore,
            mockKeyValueStore as KeyValueStore,
            container,
            mockProfileServiceConfig as ProfileServiceConfig
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
        mockCsUserService.getProfileDetails = jest.fn().mockImplementation(() => of({
            userId: 'U-001'
        }));
        mockKeyValueStore.setValue = jest.fn().mockImplementation(() => of(true));
        // act
        getServerProfileDetailsHandler.handle(serverProfileDetailsRequest).subscribe(() => {
            // assert
            expect(mockCsUserService.getProfileDetails).toHaveBeenCalled();
            expect(mockKeyValueStore.setValue).toHaveBeenCalled();
            done();
        });
    });

    it('should fetch profile data from server on handle() incase of error', (done) => {
        // arrange
        const serverProfileDetailsRequest = {
            userId: 'U-001',
            from: 'server',
            requiredFields: [],
            forceRefresh: false
        };
        mockCachedItemStore.getCached = jest.fn().mockImplementation(() => of({
            userId: 'U-001',
            from: 'cache'
        }));
        mockCsUserService.getProfileDetails = jest.fn().mockImplementation(() => throwError({
            userId: 'U-001'
        }));
        // act
        getServerProfileDetailsHandler.handle(serverProfileDetailsRequest).subscribe(() => {
            // assert
            expect(mockCachedItemStore.getCached).toHaveBeenCalled();
            expect(mockCsUserService.getProfileDetails).toHaveBeenCalled();
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
        mockCsUserService.getProfileDetails = jest.fn().mockImplementation(() => of({
            userId: 'U-001'
        }));
        // act
        getServerProfileDetailsHandler.handle(serverProfileDetailsRequest).subscribe(() => {
            // assert
            expect(mockCachedItemStore.getCached).toHaveBeenCalled();
            done();
        });
    });
});
