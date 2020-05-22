import {PageAssemblerFactory} from './page-assembler-factory';
import {
    ApiService,
    AuthService,
    CachedItemRequestSourceFrom,
    CachedItemStore, DbService,
    FrameworkService,
    KeyValueStore,
    SharedPreferences,
    SystemSettingsService
} from '../..';
import {PageAssembleCriteria, PageName, PageServiceConfig} from '..';
import {of, throwError} from 'rxjs';
import {DialcodeRequestData} from './page-assembler-factory.spec.data';
import {ContentMapper} from '../../content/util/content-mapper';
import { ProfileService } from '../../profile';

describe('PageAssemblerFactory', () => {
    let pageAssemblerHandler: PageAssemblerFactory;
    const mockApiService: Partial<ApiService> = {};
    const mockPageServiceConfig: Partial<PageServiceConfig> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {};
    const mockKeyValueStore: Partial<KeyValueStore> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {
        getString: jest.fn(() => of(''))
    };
    const mockFrameworkService: Partial<FrameworkService> = {
        getDefaultChannelId: jest.fn(() => of(''))
    };
    const mockAuthService: Partial<AuthService> = {};
    const mockSystemSettingsService: Partial<SystemSettingsService> = {};
    const mockDbService: Partial<DbService> = {};
    const mockProfileService: Partial<ProfileService> = {};

    beforeAll(() => {
        pageAssemblerHandler = new PageAssemblerFactory(
            mockApiService as ApiService,
            mockPageServiceConfig as PageServiceConfig,
            mockCachedItemStore as CachedItemStore,
            mockKeyValueStore as KeyValueStore,
            mockSharedPreferences as SharedPreferences,
            mockFrameworkService as FrameworkService,
            mockAuthService as AuthService,
            mockSystemSettingsService as SystemSettingsService,
            mockDbService as DbService,
            mockProfileService as ProfileService
        );
    });

    beforeEach(() => {
        // jest.resetAllMocks();
    });

    it('should be able create an instance of PageAssemblerHandler', () => {
        expect(pageAssemblerHandler).toBeTruthy();
    });

    describe('Default Request', () => {
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
        });

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

    describe('Course Request', () => {
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

        describe('when logged in user', () => {
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
                    expect(response).toEqual(expect.objectContaining({
                        ssoSectionId: 'SOME_SECTION_ID'
                    }));
                    done();
                });
            });
        });
    });

    describe('Dialcode Request', () => {
        describe('when offline or server API fail', () => {
           describe('when no local content available for dialcode', () => {
               it('should throw no data error', (done) => {
                   // arrange
                   const request: PageAssembleCriteria = {
                       name: PageName.DIAL_CODE,
                       source: 'app',
                       from: CachedItemRequestSourceFrom.SERVER
                   };

                   mockCachedItemStore.getCached = jest.fn().mockReturnValue(throwError(new Error('some_error')));
                   mockDbService.execute = jest.fn().mockReturnValue(of([]));
                   mockApiService.fetch = jest.fn().mockReturnValue(throwError(new Error('some_error')));

                   // act
                   pageAssemblerHandler.handle(request).subscribe(() => {
                       fail();
                   }, (e) => {
                       expect(e.message).toEqual('NO_DATA');
                       done();
                   });
               });
           });

            describe('when local content available', () => {
                describe('when only content without parent collection available', () => {
                    it('should return locally built pageAssemble with only contents and no collection', (done) => {
                        // arrange
                        const request: PageAssembleCriteria = {
                            name: PageName.DIAL_CODE,
                            source: 'app',
                            from: CachedItemRequestSourceFrom.SERVER,
                            filters: {
                                dialcodes: 'some_dialcode'
                            }
                        };

                        mockCachedItemStore.getCached = jest.fn().mockReturnValue(throwError(new Error('some_error')));
                        mockApiService.fetch = jest.fn().mockReturnValue(throwError(new Error('some_error')));
                        mockDbService.execute = jest.fn().mockImplementation((query: string) => {
                            if (query.includes('dialcodes LIKE')) {
                                return of(DialcodeRequestData.contentsWithOnlyDialcode
                                    .map((c) => ContentMapper.mapContentDataToContentDBEntry(c.contentData, '')));
                            }

                            return of([]);
                        });

                        // act
                        pageAssemblerHandler.handle(request).subscribe((pageAssemble) => {
                            expect(pageAssemble.sections[0]!).toBeTruthy();
                            expect(pageAssemble.sections[0].contents!.length).toBe(1);
                            expect(pageAssemble.sections[0].collections!.length).toBe(0);

                            done();
                        });
                    });
                });

                describe('when content with parent collection available', () => {
                    it('should return locally built pageAssemble with both contents and collections', (done) => {
                        // arrange
                        const request: PageAssembleCriteria = {
                            name: PageName.DIAL_CODE,
                            source: 'app',
                            from: CachedItemRequestSourceFrom.SERVER,
                            filters: {
                                dialcodes: 'some_dialcode'
                            }
                        };

                        mockCachedItemStore.getCached = jest.fn().mockReturnValue(throwError(new Error('some_error')));
                        mockApiService.fetch = jest.fn().mockReturnValue(throwError(new Error('some_error')));
                        mockDbService.execute = jest.fn().mockImplementation((query: string) => {
                            if (query.includes('dialcodes LIKE')) {
                                return of(DialcodeRequestData.contentsWithContentsAndCorrespondingCollection.contents
                                    .map((c) => ContentMapper.mapContentDataToContentDBEntry(c.contentData, '')));
                            }

                            return of(DialcodeRequestData.contentsWithContentsAndCorrespondingCollection.collections
                                .map((c) => ContentMapper.mapContentDataToContentDBEntry(c.contentData, '')));
                        });

                        // act
                        pageAssemblerHandler.handle(request).subscribe((pageAssemble) => {
                            expect(pageAssemble.sections[0]).toBeTruthy();
                            expect(pageAssemble.sections[0].contents!.length).toBe(1);
                            expect(pageAssemble.sections[0].collections!.length).toBe(1);
                            expect(pageAssemble.sections[0].contents![0].identifier).toBe('child_id');
                            expect(pageAssemble.sections[0].collections![0].identifier).toBe('collection_id');

                            done();
                        });
                    });
                });
            });
        });

        describe('when online with successful response', () => {
            describe('when local content available', () => {
                describe('when only content without parent collection available', () => {
                    it('should return both local and server response content removing and duplicates', (done) => {
                        // arrange
                        const request: PageAssembleCriteria = {
                            name: PageName.DIAL_CODE,
                            source: 'app',
                            from: CachedItemRequestSourceFrom.SERVER,
                            filters: {
                                dialcodes: 'some_dialcode'
                            }
                        };

                        mockCachedItemStore.getCached = jest.fn().mockReturnValue(of(
                            DialcodeRequestData.mockPageAssembleWithMissingLocalContentAndMissingCollection
                        ));
                        mockApiService.fetch = jest.fn().mockReturnValue(throwError(new Error('some_error')));
                        mockDbService.execute = jest.fn().mockImplementation((query: string) => {
                            if (query.includes('dialcodes LIKE')) {
                                return of(DialcodeRequestData.contentsWithContentsAndCorrespondingCollection.contents
                                    .map((c) => ContentMapper.mapContentDataToContentDBEntry(c.contentData, '')));
                            }

                            return of(DialcodeRequestData.contentsWithContentsAndCorrespondingCollection.collections
                                .map((c) => ContentMapper.mapContentDataToContentDBEntry(c.contentData, '')));
                        });

                        // act
                        pageAssemblerHandler.handle(request).subscribe((pageAssemble) => {
                            expect(pageAssemble.sections[0]).toBeTruthy();
                            expect(pageAssemble.sections[0].contents!.length).toBe(3);
                            expect(pageAssemble.sections[0].collections!.length).toBe(1);

                            done();
                        });
                    });
                });

                describe('when content with parent collection available', () => {
                    it('should return both local and server response content and parent collection removing and duplicates', (done) => {
                        // arrange
                        const request: PageAssembleCriteria = {
                            name: PageName.DIAL_CODE,
                            source: 'app',
                            from: CachedItemRequestSourceFrom.SERVER,
                            filters: {
                                dialcodes: 'some_dialcode'
                            }
                        };

                        mockCachedItemStore.getCached = jest.fn().mockReturnValue(of(
                            DialcodeRequestData.mockPageAssembleWithMissingLocalContentAndCollection
                        ));
                        mockApiService.fetch = jest.fn().mockReturnValue(throwError(new Error('some_error')));
                        mockDbService.execute = jest.fn().mockImplementation((query: string) => {
                            if (query.includes('dialcodes LIKE')) {
                                return of(DialcodeRequestData.contentsWithContentsAndCorrespondingCollection.contents
                                    .map((c) => ContentMapper.mapContentDataToContentDBEntry(c.contentData, '')));
                            }

                            return of(DialcodeRequestData.contentsWithContentsAndCorrespondingCollection.collections
                                .map((c) => ContentMapper.mapContentDataToContentDBEntry(c.contentData, '')));
                        });

                        // act
                        pageAssemblerHandler.handle(request).subscribe((pageAssemble) => {
                            expect(pageAssemble.sections[0]).toBeTruthy();
                            expect(pageAssemble.sections[0].contents!.length).toBe(3);
                            expect(pageAssemble.sections[0].collections!.length).toBe(1);
                            expect(pageAssemble.sections[0].collections![0].childNodes)
                                .toEqual(expect.arrayContaining(['do_31265486640564633624236']));

                            done();
                        });
                    });
                });
            });
        });
    });
});
