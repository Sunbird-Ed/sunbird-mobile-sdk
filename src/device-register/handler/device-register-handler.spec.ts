import {DeviceRegisterHandler} from './device-register-handler';
import {
    ApiService,
    AppInfo,
    DeviceInfo,
    DeviceRegisterRequest,
    FrameworkService, LocationSearchCriteria,
    ProfileService,
    SdkConfig,
    SharedPreferences
} from '../..';
import {of} from 'rxjs';
import {mockSdkConfigWithSampleApiConfig} from './device-register-handler.spec.data';
import objectContaining = jasmine.objectContaining;
import {LocationSearchResult} from '../../profile/def/location-search-result';

describe('DeviceRegisterHandler', () => {
    let deviceRegisterHandler: DeviceRegisterHandler;

    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockAppInfo: Partial<AppInfo> = {};
    const mockApiService: Partial<ApiService> = {};
    const mockProfileService: Partial<ProfileService> = {};

    beforeAll(() => {
        deviceRegisterHandler = new DeviceRegisterHandler(
            mockSdkConfigWithSampleApiConfig as SdkConfig,
            mockDeviceInfo as DeviceInfo,
            mockSharedPreferences as SharedPreferences,
            mockFrameworkService as FrameworkService,
            mockAppInfo as AppInfo,
            mockApiService as ApiService,
            mockProfileService as ProfileService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be able to create an instance of deviceRegisterHandler', () => {
        expect(deviceRegisterHandler).toBeTruthy();
    });

    it('should patch request aggregating deviceSpec, activeChannelId, firstAccessTimestamp and deviceLocation', (done) => {
        // arrange
        const request: DeviceRegisterRequest = {
            fcmToken: 'SAMPLE_FCM_TOKEN'
        };
        mockDeviceInfo.getDeviceSpec = jest.fn(() => {
        });
        (mockDeviceInfo.getDeviceSpec as jest.Mock).mockReturnValue(of({}));

        mockFrameworkService.getActiveChannelId = jest.fn(() => {
        });
        (mockFrameworkService.getActiveChannelId as jest.Mock).mockReturnValue(of('SOME_CHANNEL_ID'));

        mockAppInfo.getFirstAccessTimestamp = jest.fn(() => {
        });
        (mockAppInfo.getFirstAccessTimestamp as jest.Mock).mockReturnValue(of('0000'));

        mockDeviceInfo.getDeviceID = jest.fn(() => {
        });
        (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue(of('SAMPLE_DEVICE_ID'));

        mockSharedPreferences.getString = jest.fn(() => {
        });
        (mockSharedPreferences.getString as jest.Mock).mockReturnValue(of('{"state":"STATE","district":"DISTRICT"}'));

        mockApiService.fetch = jest.fn(() => {
        });
        (mockApiService.fetch as jest.Mock).mockReturnValue(of({}));

        mockProfileService.searchLocation = jest.fn((req: LocationSearchCriteria) => {
            if (req.filters.type === 'state') {
                return of([
                    {
                        code: 'SOME_CODE',
                        name: 'STATE',
                        id: 'SOME_ID',
                        type: 'SOME_TYPE'
                    }
                ] as LocationSearchResult[]);
            } else if (req.filters.type === 'district') {
                return of([
                    {
                        code: 'SOME_CODE',
                        name: 'DISTRICT',
                        id: 'SOME_ID',
                        type: 'SOME_TYPE'
                    }
                ] as LocationSearchResult[]);
            }
        });

        // act
        deviceRegisterHandler.handle(request).subscribe(() => {
            // assert
             expect(mockDeviceInfo.getDeviceSpec).toHaveBeenCalled();
             expect(mockFrameworkService.getActiveChannelId).toHaveBeenCalled();
             expect(mockAppInfo.getFirstAccessTimestamp).toHaveBeenCalled();
             expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
             expect(mockApiService.fetch).toHaveBeenCalledWith(
                 objectContaining({
                     _body: {
                         request: objectContaining({
                             dspec: expect.any(Object),
                             channel: 'SOME_CHANNEL_ID',
                             fcmToken: mockSdkConfigWithSampleApiConfig.deviceRegisterConfig!.fcmToken,
                             producer: mockSdkConfigWithSampleApiConfig.apiConfig!.api_authentication!.producerId,
                             first_access: Number('0000'),
                             userDeclaredLocation: objectContaining({
                                 state: 'STATE',
                                 district: 'DISTRICT'
                             })
                         })
                     }
                 })
             );
            done();
        });
    });

    it('should create request aggregating deviceSpec, activeChannelId, firstAccessTimestamp and deviceLocation', (done) => {
        // arrange
        const request: DeviceRegisterRequest = {
            fcmToken: 'SAMPLE_FCM_TOKEN'
        };
        mockDeviceInfo.getDeviceSpec = jest.fn(() => {
        });
        (mockDeviceInfo.getDeviceSpec as jest.Mock).mockReturnValue(of({}));

        mockFrameworkService.getActiveChannelId = jest.fn(() => {
        });
        (mockFrameworkService.getActiveChannelId as jest.Mock).mockReturnValue(of('SOME_CHANNEL_ID'));

        mockAppInfo.getFirstAccessTimestamp = jest.fn(() => {
        });
        (mockAppInfo.getFirstAccessTimestamp as jest.Mock).mockReturnValue(of('0000'));

        mockDeviceInfo.getDeviceID = jest.fn(() => {
        });
        (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue(of('SAMPLE_DEVICE_ID'));

        mockSharedPreferences.getString = jest.fn(() => {
        });
        (mockSharedPreferences.getString as jest.Mock).mockReturnValue(of('{"state":"STATE","district":"DISTRICT"}'));

        mockApiService.fetch = jest.fn(() => {
        });
        (mockApiService.fetch as jest.Mock).mockReturnValue(of({}));

        mockProfileService.searchLocation = jest.fn((req: LocationSearchCriteria) => {
            if (req.filters.type === 'state') {
                return of([
                    {
                        code: 'SOME_CODE',
                        name: 'STATE',
                        id: 'SOME_ID',
                        type: 'SOME_TYPE'
                    }
                ] as LocationSearchResult[]);
            } else if (req.filters.type === 'district') {
                return of([
                    {
                        code: 'SOME_CODE',
                        name: 'DISTRICT',
                        id: 'SOME_ID',
                        type: 'SOME_TYPE'
                    }
                ] as LocationSearchResult[]);
            }
        });

        // act
        deviceRegisterHandler.handle().subscribe(() => {
            // assert
            expect(mockDeviceInfo.getDeviceSpec).toHaveBeenCalled();
            expect(mockFrameworkService.getActiveChannelId).toHaveBeenCalled();
            expect(mockAppInfo.getFirstAccessTimestamp).toHaveBeenCalled();
            expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
            expect(mockApiService.fetch).toHaveBeenCalledWith(
                objectContaining({
                    _body: {
                        request: objectContaining({
                            dspec: expect.any(Object),
                            channel: 'SOME_CHANNEL_ID',
                            fcmToken: mockSdkConfigWithSampleApiConfig.deviceRegisterConfig!.fcmToken,
                            producer: mockSdkConfigWithSampleApiConfig.apiConfig!.api_authentication!.producerId,
                            first_access: Number('0000'),
                            userDeclaredLocation: objectContaining({
                                state: 'STATE',
                                district: 'DISTRICT'
                            })
                        })
                    }
                })
            );
            done();
        });
    });

    describe('should ignore userDeclaredLocation if not valid', () => {
        it('should be invalid if state not in valid list', (done) => {
            // arrange
            const request: DeviceRegisterRequest = {
                fcmToken: 'SAMPLE_FCM_TOKEN'
            };
            mockDeviceInfo.getDeviceSpec = jest.fn(() => {
            });
            (mockDeviceInfo.getDeviceSpec as jest.Mock).mockReturnValue(of({}));

            mockFrameworkService.getActiveChannelId = jest.fn(() => {
            });
            (mockFrameworkService.getActiveChannelId as jest.Mock).mockReturnValue(of('SOME_CHANNEL_ID'));

            mockAppInfo.getFirstAccessTimestamp = jest.fn(() => {
            });
            (mockAppInfo.getFirstAccessTimestamp as jest.Mock).mockReturnValue(of('0000'));

            mockDeviceInfo.getDeviceID = jest.fn(() => {
            });
            (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue(of('SAMPLE_DEVICE_ID'));

            mockSharedPreferences.getString = jest.fn(() => {
            });
            (mockSharedPreferences.getString as jest.Mock).mockReturnValue(of('{"state":"STATE","district":"DISTRICT"}'));

            mockApiService.fetch = jest.fn(() => {
            });
            (mockApiService.fetch as jest.Mock).mockReturnValue(of({}));

            mockProfileService.searchLocation = jest.fn((req: LocationSearchCriteria) => {
                if (req.filters.type === 'state') {
                    return of([] as LocationSearchResult[]);
                } else if (req.filters.type === 'district') {
                    return of([
                        {
                            code: 'SOME_CODE',
                            name: 'DISTRICT',
                            id: 'SOME_ID',
                            type: 'SOME_TYPE'
                        }
                    ] as LocationSearchResult[]);
                }
            });

            mockSharedPreferences.putString = jest.fn(() => of(undefined));

            // act
            deviceRegisterHandler.handle().subscribe(() => {
                // assert
                expect(mockDeviceInfo.getDeviceSpec).toHaveBeenCalled();
                expect(mockFrameworkService.getActiveChannelId).toHaveBeenCalled();
                expect(mockAppInfo.getFirstAccessTimestamp).toHaveBeenCalled();
                expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                expect(mockApiService.fetch).toHaveBeenCalledWith(
                    objectContaining({
                        _body: {
                            request: expect.not.objectContaining({
                                userDeclaredLocation: expect.any(Object)
                            })
                        }
                    })
                );
                expect(mockSharedPreferences.putString).toHaveBeenCalledWith('device_location', '');
                done();
            });
        });

        it('should be invalid if district not in valid list', (done) => {
            // arrange
            const request: DeviceRegisterRequest = {
                fcmToken: 'SAMPLE_FCM_TOKEN'
            };
            mockDeviceInfo.getDeviceSpec = jest.fn(() => {
            });
            (mockDeviceInfo.getDeviceSpec as jest.Mock).mockReturnValue(of({}));

            mockFrameworkService.getActiveChannelId = jest.fn(() => {
            });
            (mockFrameworkService.getActiveChannelId as jest.Mock).mockReturnValue(of('SOME_CHANNEL_ID'));

            mockAppInfo.getFirstAccessTimestamp = jest.fn(() => {
            });
            (mockAppInfo.getFirstAccessTimestamp as jest.Mock).mockReturnValue(of('0000'));

            mockDeviceInfo.getDeviceID = jest.fn(() => {
            });
            (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue(of('SAMPLE_DEVICE_ID'));

            mockSharedPreferences.getString = jest.fn(() => {
            });
            (mockSharedPreferences.getString as jest.Mock).mockReturnValue(of('{"state":"STATE","district":"DISTRICT"}'));

            mockApiService.fetch = jest.fn(() => {
            });
            (mockApiService.fetch as jest.Mock).mockReturnValue(of({}));

            mockProfileService.searchLocation = jest.fn((req: LocationSearchCriteria) => {
                if (req.filters.type === 'state') {
                    return of([
                        {
                            code: 'SOME_CODE',
                            name: 'STATE',
                            id: 'SOME_ID',
                            type: 'SOME_TYPE'
                        }
                    ] as LocationSearchResult[]);
                } else if (req.filters.type === 'district') {
                    return of([
                    ] as LocationSearchResult[]);
                }
            });

            mockSharedPreferences.putString = jest.fn(() => of(undefined));

            // act
            deviceRegisterHandler.handle().subscribe(() => {
                // assert
                expect(mockDeviceInfo.getDeviceSpec).toHaveBeenCalled();
                expect(mockFrameworkService.getActiveChannelId).toHaveBeenCalled();
                expect(mockAppInfo.getFirstAccessTimestamp).toHaveBeenCalled();
                expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                expect(mockApiService.fetch).toHaveBeenCalledWith(
                    objectContaining({
                        _body: {
                            request: expect.not.objectContaining({
                                userDeclaredLocation: expect.any(Object)
                            })
                        }
                    })
                );
                expect(mockSharedPreferences.putString).toHaveBeenCalledWith('device_location', '');
                done();
            });
        });

        it('should be invalid if either district or state is missing', (done) => {
            // arrange
            const request: DeviceRegisterRequest = {
                fcmToken: 'SAMPLE_FCM_TOKEN'
            };
            mockDeviceInfo.getDeviceSpec = jest.fn(() => {
            });
            (mockDeviceInfo.getDeviceSpec as jest.Mock).mockReturnValue(of({}));

            mockFrameworkService.getActiveChannelId = jest.fn(() => {
            });
            (mockFrameworkService.getActiveChannelId as jest.Mock).mockReturnValue(of('SOME_CHANNEL_ID'));

            mockAppInfo.getFirstAccessTimestamp = jest.fn(() => {
            });
            (mockAppInfo.getFirstAccessTimestamp as jest.Mock).mockReturnValue(of('0000'));

            mockDeviceInfo.getDeviceID = jest.fn(() => {
            });
            (mockDeviceInfo.getDeviceID as jest.Mock).mockReturnValue(of('SAMPLE_DEVICE_ID'));

            mockSharedPreferences.getString = jest.fn(() => {
            });
            (mockSharedPreferences.getString as jest.Mock).mockReturnValue(of('{"state":"STATE"}'));

            mockApiService.fetch = jest.fn(() => {
            });
            (mockApiService.fetch as jest.Mock).mockReturnValue(of({}));

            mockProfileService.searchLocation = jest.fn((req: LocationSearchCriteria) => {
                if (req.filters.type === 'state') {
                    return of([
                        {
                            code: 'SOME_CODE',
                            name: 'STATE',
                            id: 'SOME_ID',
                            type: 'SOME_TYPE'
                        }
                    ] as LocationSearchResult[]);
                } else if (req.filters.type === 'district') {
                    return of([
                    ] as LocationSearchResult[]);
                }
            });

            mockSharedPreferences.putString = jest.fn(() => of(undefined));

            // act
            deviceRegisterHandler.handle().subscribe(() => {
                // assert
                expect(mockDeviceInfo.getDeviceSpec).toHaveBeenCalled();
                expect(mockFrameworkService.getActiveChannelId).toHaveBeenCalled();
                expect(mockAppInfo.getFirstAccessTimestamp).toHaveBeenCalled();
                expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                expect(mockApiService.fetch).toHaveBeenCalledWith(
                    objectContaining({
                        _body: {
                            request: expect.not.objectContaining({
                                userDeclaredLocation: expect.any(Object)
                            })
                        }
                    })
                );
                expect(mockSharedPreferences.putString).toHaveBeenCalledWith('device_location', '');
                done();
            });
        });
    });
});
