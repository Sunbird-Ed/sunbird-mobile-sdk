import {PageAssemblerHandler} from './page-assembler-handler';
import {
    ApiService,
    AuthService,
    CachedItemRequestSourceFrom,
    CachedItemStore,
    FrameworkService,
    KeyValueStore,
    SharedPreferences,
    SystemSettingsService
} from '../..';
import {PageAssembleCriteria, PageName, PageServiceConfig} from '..';
import {of} from 'rxjs';

describe('PageAssemblerHandler', () => {
    let pageAssemblerHandler: PageAssemblerHandler;
    const mockApiService: Partial<ApiService> = {};
    const mockPageServiceConfig: Partial<PageServiceConfig> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};
    const mockKeyValueStore: Partial<KeyValueStore> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockAuthService: Partial<AuthService> = {};
    const mockSystemSettingsService: Partial<SystemSettingsService> = {};

    beforeAll(() => {
        pageAssemblerHandler = new PageAssemblerHandler(
            mockApiService as ApiService,
            mockPageServiceConfig as PageServiceConfig,
            mockCachedItemStore as CachedItemStore,
            mockKeyValueStore as KeyValueStore,
            mockSharedPreferences as SharedPreferences,
            mockFrameworkService as FrameworkService,
            mockAuthService as AuthService,
            mockSystemSettingsService as SystemSettingsService
        );
    });

    beforeEach(() => {
        // jest.resetAllMocks();
    });

    it('should be able create an instance of PageAssemblerHandler', () => {
        expect(pageAssemblerHandler).toBeTruthy();
    });

    describe('when requesting from cache', () => {
        beforeEach(() => {
            mockCachedItemStore.getCached = jest.fn().mockReturnValue(of({
                name: 'SAMPLE_NAME',
                id: 'SAMPLE_ID',
                sections: []
            }));
        });

        it('should handle request when not from loggedIn User', (done) => {
            // arrange
            const request: PageAssembleCriteria = {
                name: PageName.COURSE,
                source: 'app',
            };
            mockAuthService.getSession = jest.fn().mockReturnValue(of(undefined));
            // act
            pageAssemblerHandler.handle(request).subscribe(() => {
                expect(mockCachedItemStore.getCached).toHaveBeenCalled();
                // assert
                done();
            });
        });

        it('should handle request when not from Course Page', (done) => {
            // arrange
            const request: PageAssembleCriteria = {
                name: PageName.DIAL_CODE,
                source: 'app',
            };
            mockAuthService.getSession = jest.fn().mockReturnValue(of({
                access_token: 'SOME_ACCESS_TOKEN',
                refresh_token: 'SOME_REFRESH_TOKEN',
                userToken: 'SOME_USER_TOKEN'
            }));
            // act
            pageAssemblerHandler.handle(request).subscribe(() => {
                expect(mockCachedItemStore.getCached).toHaveBeenCalled();
                // assert
                done();
            });
        });
    });

    describe('when requesting from server', () => {
        describe('when successful response', () => {
            it('should cache response and set TTL for the same', (done) => {
                // arrange
                const request: PageAssembleCriteria = {
                    name: PageName.DIAL_CODE,
                    source: 'app',
                    from: CachedItemRequestSourceFrom.SERVER
                };

                mockAuthService.getSession = jest.fn().mockReturnValue(of(undefined));
                mockApiService.fetch = jest.fn().mockReturnValue(of({
                    body: {
                        result: {
                            response: {
                                name: 'SAMPLE_NAME',
                                id: 'SAMPLE_ID',
                                sections: []
                            }
                        }
                    }
                }));
                mockSharedPreferences.putString = jest.fn().mockReturnValue(of(undefined));
                mockKeyValueStore.setValue = jest.fn().mockReturnValue(of(true));

                // act
                pageAssemblerHandler.handle(request).subscribe(() => {
                    setTimeout(() => {
                        // assert
                        expect(mockSharedPreferences.putString).toBeCalledWith(
                            expect.stringContaining('ttl_page_assemble--'),
                            expect.any(String)
                        );

                        expect(mockKeyValueStore.setValue).toBeCalledWith(
                            expect.stringContaining('page_assemble--'),
                            JSON.stringify({
                                name: 'SAMPLE_NAME',
                                id: 'SAMPLE_ID',
                                sections: []
                            })
                        );

                        done();
                    });
                });
            });
        });

        describe('when guest user', () => {
            it('should request without additional section details', (done) => {
                // arrange
                const request: PageAssembleCriteria = {
                    name: PageName.DIAL_CODE,
                    source: 'app',
                    from: CachedItemRequestSourceFrom.SERVER
                };

                mockAuthService.getSession = jest.fn().mockReturnValue(of(undefined));
                mockApiService.fetch = jest.fn().mockReturnValue(of({
                    body: {
                        result: {
                            response: {
                                name: 'SAMPLE_NAME',
                                id: 'SAMPLE_ID',
                                sections: []
                            }
                        }
                    }
                }));
                mockSharedPreferences.putString = jest.fn().mockReturnValue(of(undefined));
                mockKeyValueStore.setValue = jest.fn().mockReturnValue(of(true));

                // act
                pageAssemblerHandler.handle(request).subscribe(() => {
                    expect(mockApiService.fetch).toBeCalledWith(expect.objectContaining({
                        _body: expect.objectContaining({
                            request: expect.not.objectContaining({
                                sections: expect.anything()
                            })
                        })
                    }));
                    done();
                });
            });
        });

        describe('when logged in user and requesting for Course Page', () => {
            it('should request without additional section details for default channel users', (done) => {
                // arrange
                const request: PageAssembleCriteria = {
                    name: PageName.COURSE,
                    source: 'app',
                    from: CachedItemRequestSourceFrom.SERVER
                };

                mockFrameworkService.getDefaultChannelId = jest.fn().mockImplementation(() => of('SAMPLE_CHANNEL_ID'));
                mockFrameworkService.activeChannelId = 'SAMPLE_CHANNEL_ID';

                mockAuthService.getSession = jest.fn().mockReturnValue(of({
                    access_token: 'SOME_ACCESS_TOKEN',
                    refresh_token: 'SOME_REFRESH_TOKEN',
                    userToken: 'SOME_USER_TOKEN'
                }));

                mockApiService.fetch = jest.fn().mockReturnValue(of({
                    body: {
                        result: {
                            response: {
                                name: 'SAMPLE_NAME',
                                id: 'SAMPLE_ID',
                                sections: []
                            }
                        }
                    }
                }));
                mockSharedPreferences.putString = jest.fn().mockReturnValue(of(undefined));
                mockKeyValueStore.setValue = jest.fn().mockReturnValue(of(true));

                // act
                pageAssemblerHandler.handle(request).subscribe(() => {
                    expect(mockApiService.fetch).toBeCalledWith(expect.objectContaining({
                        _body: expect.objectContaining({
                            request: expect.not.objectContaining({
                                sections: expect.anything()
                            })
                        })
                    }));
                    done();
                });
            });

            it('should request with additional section details for SSO channel users', (done) => {
                // arrange
                const request: PageAssembleCriteria = {
                    name: PageName.COURSE,
                    source: 'app',
                    from: CachedItemRequestSourceFrom.SERVER
                };

                mockFrameworkService.getDefaultChannelId = jest.fn().mockReturnValue(of('SAMPLE_CHANNEL_ID'));
                mockFrameworkService.activeChannelId = 'SAMPLE_CHANNEL_ID_SSO';

                mockSystemSettingsService.getSystemSettings = jest.fn().mockReturnValue(of({ value: 'SOME_SECTION_ID' }));

                mockAuthService.getSession = jest.fn().mockReturnValue(of({
                    access_token: 'SOME_ACCESS_TOKEN',
                    refresh_token: 'SOME_REFRESH_TOKEN',
                    userToken: 'SOME_USER_TOKEN'
                }));

                mockApiService.fetch = jest.fn().mockReturnValue(of({
                    body: {
                        result: {
                            response: {
                                name: 'SAMPLE_NAME',
                                id: 'SAMPLE_ID',
                                sections: []
                            }
                        }
                    }
                }));
                mockSharedPreferences.putString = jest.fn().mockReturnValue(of(undefined));
                mockKeyValueStore.setValue = jest.fn().mockReturnValue(of(true));

                // act
                pageAssemblerHandler.handle(request).subscribe((response) => {
                    expect(mockApiService.fetch).toBeCalledWith(expect.objectContaining({
                        _body: expect.objectContaining({
                            request: expect.objectContaining({
                                sections: expect.objectContaining({
                                    'SOME_SECTION_ID': expect.objectContaining({
                                        filters: expect.objectContaining({
                                            'batches.createdFor': expect.arrayContaining([
                                                'SAMPLE_CHANNEL_ID_SSO'
                                            ])
                                        })
                                    })
                                })
                            })
                        })
                    }));
                    expect(response.ssoSectionId).toBeTruthy();
                    done();
                });
            });
        });
    });
});
