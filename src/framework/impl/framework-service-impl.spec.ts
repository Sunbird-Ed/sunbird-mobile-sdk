import {CachedItemStore} from '../../key-value-store';
import {Channel, ChannelDetailsRequest, FrameworkService, OrganizationSearchCriteria, FrameworkServiceImpl} from '..';
import {GetChannelDetailsHandler} from '../handler/get-channel-detail-handler';
import {FileService} from '../../util/file/def/file-service';
import {of, throwError} from 'rxjs';
import {ApiService} from '../../api';
import {SharedPreferences} from '../../util/shared-preferences';
import {NoActiveChannelFoundError} from '../errors/no-active-channel-found-error';
import {SystemSettingsService, SystemSettings} from '../../system-settings';
import {SdkConfig} from '../../sdk-config';
import {FrameworkKeys} from '../../preference-keys';
import {inject, injectable, Container} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import { HttpSerializer } from '../..';

jest.mock('../handler/get-channel-detail-handler');

describe('FrameworkServiceImpl', () => {
    let frameworkService: FrameworkService;
    const container = new Container();
    const mockSdkConfig: Partial<SdkConfig> = {
        frameworkServiceConfig: {
            systemSettingsDefaultChannelIdKey: 'SOME_KEY'
        } as any
    };
    const mockApiService: Partial<ApiService> = {};
    const mockFileService: Partial<FileService> = {};
    const mockCacheItemStore: Partial<CachedItemStore> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockSystemSettingsService:   Partial<SystemSettingsService> = {};
    const mockgetChannelDetailHandler: Partial<GetChannelDetailsHandler> = {};
    beforeAll(() => {
        container.bind<FrameworkService>(InjectionTokens.FRAMEWORK_SERVICE).to(FrameworkServiceImpl).inSingletonScope();
        container.bind<Container>(InjectionTokens.CONTAINER).toConstantValue(container);
        container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfig as SdkConfig);
        container.bind<FileService>(InjectionTokens.FILE_SERVICE).toConstantValue(mockFileService as FileService);
        container.bind<ApiService>(InjectionTokens.API_SERVICE).toConstantValue(mockApiService as ApiService);
        container.bind<CachedItemStore>(InjectionTokens.CACHED_ITEM_STORE).toConstantValue(mockCacheItemStore as CachedItemStore);
        container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).toConstantValue(mockSharedPreferences as SharedPreferences);
        // tslint:disable-next-line:max-line-length
        container.bind<SystemSettingsService>(InjectionTokens.SYSTEM_SETTINGS_SERVICE).toConstantValue(mockSystemSettingsService as SystemSettingsService);
        frameworkService = container.get(InjectionTokens.FRAMEWORK_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return an instance of FrameworkService from container', () => {
        expect(frameworkService).toBeTruthy();
    });

    it('should return getActiveChannelId using framework Service', (done) => {
        // arrange
         mockSharedPreferences.getString = jest.fn().mockImplementation(() => of('NO_ACTIVE_CHANNEL_FOUND_ERROR'));
         // act
         frameworkService.getActiveChannelId().subscribe((channelId: string) => {
              // assert
             expect(channelId).toBe('NO_ACTIVE_CHANNEL_FOUND_ERROR');
             expect(mockSharedPreferences.getString).toHaveBeenCalled();
              done();
         });
     });

     it('should throw error when getActiveChannelId() if no active channel set', () => {
        // arrange
         mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(undefined));
         // act
         frameworkService.getActiveChannelId().subscribe((channelId: string) => {}, (e) => {
            expect(mockSharedPreferences.getString).toHaveBeenCalled();
             expect(e instanceof NoActiveChannelFoundError).toBeTruthy();
             // done();
         });
     });

    it('should return preInit Using FrameworkService', (done) => {
        // arrange
         frameworkService.getActiveChannelId = jest.fn().mockImplementation(() => of('SOME_CHANNEL_ID'));
        // act
         frameworkService.preInit().subscribe(() => {
             // assert
             expect(frameworkService.getActiveChannelId).toHaveBeenCalled();
             done();
         });
    });

    it('should execute preInit Catch Error Using FrameworkService', (done) => {
        // arrange
         const channelId = '1233';
       frameworkService.getActiveChannelId = jest.fn().mockImplementation(() => throwError('NO_ACTIVE_CHANNEL_FOUND_ERROR'));
        // acty
         frameworkService.preInit().subscribe(() => {},  (e) => {
             // assert
             expect(frameworkService.getActiveChannelId).toHaveBeenCalled();
             done();
         });
    });

    it('should return getDefaultChannelDetails Using FrameworkService', (done) => {
        // arrange
         mockSystemSettingsService.getSystemSettings = jest.fn().mockImplementation(() => of<SystemSettings>({
             id: 'SOME_ID',
             field: 'SOME_FIELD',
             value: 'SOME_CHANNEL_ID'
         }));
         frameworkService.getChannelDetails = jest.fn().mockImplementation(() => of<Partial<Channel>>({
             identifier: 'SOME_IDENTIFIER',
         }));
        // act
         frameworkService.getDefaultChannelDetails().subscribe(() => {
             // assert
             expect(mockSystemSettingsService.getSystemSettings).toHaveBeenCalledWith(expect.objectContaining({ id: 'SOME_KEY' }));
             expect(frameworkService.getChannelDetails).toHaveBeenCalledWith(expect.objectContaining({ channelId: 'SOME_CHANNEL_ID' }));
             done();
         });
    });

    it('should return setActiveChannelId Using FrameworkService', (done) => {
        // arrange
        const  channelId = '12345';
        mockSharedPreferences.putString = jest.fn().mockImplementation(() => of([]));
        (mockSharedPreferences.putString as jest.Mock).mockReturnValue(of(''));
        // act
         frameworkService.setActiveChannelId(channelId).subscribe(() => {
             // assert
             expect(mockSharedPreferences.putString).toHaveBeenCalledWith(FrameworkKeys.KEY_ACTIVE_CHANNEL_ID, channelId);
             done();
         });
    });


    it('should get ChannelDetails with ChannelDetailsRequest', (done) => {

        // arrange
        const request: ChannelDetailsRequest = {
            channelId: 'SAMPLE_CHANNEL_ID'
        };

        (GetChannelDetailsHandler as any).mockImplementation(() => {
            return {
                handle: () => {
                    return of({
                        identifier: 'SOME_IDENTIFIER',
                    } as Channel);
                }
            };
        });
        // act
        frameworkService.getChannelDetails(request).subscribe((channel: Channel) => {
            // assert
            expect(channel.identifier).toBe('SOME_IDENTIFIER');
            done();
        });
    });

    it('should searchOrganisation using frameworkService', (done) => {
        // arrange
       const request: OrganizationSearchCriteria<any> = {
            filters: {
                isRootOrg: true
            }
        };

        mockApiService.fetch =  jest.fn().mockImplementation(() => of({ body: {result: request}}));
        // act
        frameworkService.searchOrganization(request).subscribe(() => {
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
        // assert
    });

    it('should return active channelId', () => {
        expect(frameworkService.activeChannelId).toBe('12345');
    });

    it('should return system setting information', (done) => {
        // arrange
        mockSystemSettingsService.getSystemSettings = jest.fn().mockImplementation(() => of({
            id: 'sample-id',
            field: 'sample-field',
            value: 'sample-value'
        }));
        // act
        frameworkService.getDefaultChannelId().subscribe(() => {
            // assert
            expect(mockSystemSettingsService.getSystemSettings).toHaveBeenCalled();
            done();
        });
    });

    it('should return channel details using getChannelDetailsHandler', (done) => {
        // arrange
        const request: ChannelDetailsRequest = {
            channelId: 'sample-channel-id'
        };
        frameworkService.getChannelDetails(request).subscribe((chennal: Channel) => {
            // assert
            expect(chennal.identifier).toBe('SOME_IDENTIFIER');
            done();
        });
    });

});
