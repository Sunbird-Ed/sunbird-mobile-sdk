import {PageAssemblerHandler} from './page-assembler-handler';
import {
    ApiService,
    CachedItemStore,
    KeyValueStore,
    SharedPreferences,
    CachedItemRequestSourceFrom,
    AuthService,
    ProfileService, SystemSettingsService
} from '../..';
import {PageServiceConfig, PageAssembleCriteria} from '..';
import {PageName} from '..';
import {of} from 'rxjs';

describe('PageAssemblerHandler', () => {
    let pageAssemblerHandler: PageAssemblerHandler;
    const mockApiService: Partial<ApiService> = {};
    const mockPageServiceConfig: Partial<PageServiceConfig> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};
    const mockKeyValueStore: Partial<KeyValueStore> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockAuthService: Partial<AuthService> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockSystemSettingsService: Partial<SystemSettingsService> = {};

    beforeAll(() => {
        pageAssemblerHandler = new PageAssemblerHandler(
            mockApiService as ApiService,
            mockPageServiceConfig as PageServiceConfig,
            mockCachedItemStore as CachedItemStore,
            mockKeyValueStore as KeyValueStore,
            mockSharedPreferences as SharedPreferences,
            mockAuthService as AuthService,
            mockProfileService as ProfileService,
            mockSystemSettingsService as SystemSettingsService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of pageAssemblerHandler', () => {
        expect(pageAssemblerHandler).toBeTruthy();
    });

    it('should be handle QrCode Scan for Page Assembler in local', (done) => {
        // arrange
        const request: PageAssembleCriteria = {
            name: PageName.DIAL_CODE,
            source: 'app',
        };
        mockCachedItemStore.getCached = jest.fn().mockImplementation(() => {
        });
        (mockCachedItemStore.getCached as jest.Mock).mockReturnValue(of(''));
        // act
        pageAssemblerHandler.handle(request).subscribe(() => {
            expect(mockCachedItemStore.getCached).toHaveBeenCalled();
            // assert
            done();
        });
    });

    it('should be handle QrCode Scan for Page Assembler in server', async (done) => {
        // arrange
        const request: PageAssembleCriteria = {
            name: PageName.DIAL_CODE,
            source: 'app',
            from: CachedItemRequestSourceFrom.SERVER
        };
        mockCachedItemStore.getCached = jest.fn().mockImplementation(() => {
        });
        (mockCachedItemStore.getCached as jest.Mock).mockReturnValue(of({
            name: 'SAMPLE_NAME',
            id: 'SAMPLE_ID',
            sections: []
        }));
        mockApiService.fetch = jest.fn().mockImplementation(() => {
        });
        (mockApiService.fetch as jest.Mock).mockReturnValue(of({
            body: {
                result: {
                    response: 'SAMPLE_RESPONSE'
                }
            }
        }));
        mockSharedPreferences.putString = jest.fn().mockImplementation(() => {
        });
        (mockSharedPreferences.putString as jest.Mock).mockReturnValue(of(''));
        mockKeyValueStore.setValue = jest.fn().mockImplementation(() => {
        });
        (mockKeyValueStore.setValue as jest.Mock).mockReturnValue(of(true));
        // act
        await pageAssemblerHandler.handle(request).subscribe(() => {
            // assert
            expect(mockSharedPreferences.putString).toHaveBeenCalled();
            expect(mockApiService.fetch).toHaveBeenCalled();
            expect(mockKeyValueStore.setValue).toBeTruthy();
            done();
        });
    });

    it('should be handle QrCode Scan for Page Assembler from local', async (done) => {
        // arrange
        const request: PageAssembleCriteria = {
            name: PageName.DIAL_CODE,
            source: 'app',
            from: CachedItemRequestSourceFrom.SERVER
        };
        mockCachedItemStore.getCached = jest.fn().mockImplementation(() => {
        });
        (mockCachedItemStore.getCached as jest.Mock).mockReturnValue(of({}));
        mockApiService.fetch = jest.fn().mockImplementation(() => {
        });
        (mockApiService.fetch as jest.Mock).mockReturnValue(of({}));
        // act
        await pageAssemblerHandler.handle(request).subscribe(() => {
            // assert
            expect(mockCachedItemStore.getCached).toHaveBeenCalled();
            done();
        });
    });

    describe('Default Request', () => {
        describe('when requesting CoursePage', () => {
            const request: PageAssembleCriteria = {
                name: PageName.COURSE,
                source: 'app',
                from: CachedItemRequestSourceFrom.SERVER
            };

            beforeAll(() => {
                mockCachedItemStore.getCached = jest.fn().mockImplementation(() => {
                });
                (mockCachedItemStore.getCached as jest.Mock).mockReturnValue(of({
                    name: 'SAMPLE_NAME',
                    id: 'SAMPLE_ID',
                    sections: []
                }));
                mockApiService.fetch = jest.fn().mockImplementation(() => {
                });
                (mockApiService.fetch as jest.Mock).mockReturnValue(of({
                    body: {
                        result: {
                            response: 'SAMPLE_RESPONSE'
                        }
                    }
                }));
                mockSharedPreferences.putString = jest.fn().mockImplementation(() => {
                });
                (mockSharedPreferences.putString as jest.Mock).mockReturnValue(of(''));
                mockKeyValueStore.setValue = jest.fn().mockImplementation(() => {
                });
                (mockKeyValueStore.setValue as jest.Mock).mockReturnValue(of(true));
            });

            describe('when overriddenPageAssembleChannel set', () => {
                beforeAll(() => {
                    mockSharedPreferences.getString = jest.fn().mockReturnValue(of('SOME_OVERRIDDEN_CHANNEL_ID'));
                });

                describe('when not ssoUser', () => {
                    beforeAll(() => {
                        mockAuthService.getSession = jest.fn().mockReturnValue(of({}));
                        mockProfileService.isDefaultChannelProfile = jest.fn().mockReturnValue(of(true));
                    });

                    it('should request with pageName from systemSettings', (done) => {
                        // arrange
                        mockSystemSettingsService.getSystemSettings = jest.fn().mockReturnValue(of({
                            value: JSON.stringify([
                                {channelId: 'SOME_OVERRIDDEN_CHANNEL_ID', page: PageName.ANONYMOUS_COURSE}
                            ])
                        }));

                        // act
                        pageAssemblerHandler.handle(request).toPromise().then(() => {
                            // assert
                            expect(mockApiService.fetch).toHaveBeenCalledWith(
                                expect.objectContaining({
                                    _body: expect.objectContaining({
                                        request: expect.objectContaining({
                                            organisationId: 'SOME_OVERRIDDEN_CHANNEL_ID',
                                            name: PageName.ANONYMOUS_COURSE
                                        })
                                    })
                                })
                            );
                            done();
                        });
                    });
                });
            });
        });
    });
});
