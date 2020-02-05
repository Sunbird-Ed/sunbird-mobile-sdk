import {DeviceRegisterHandler} from './device-register-handler';
import {ApiService, AppInfo, DeviceInfo, DeviceRegisterRequest, FrameworkService, SdkConfig, SharedPreferences} from '../..';
import {of, throwError} from 'rxjs';
import {mockSdkConfigWithSampleApiConfig} from './device-register-handler.spec.data';
import {GetDeviceProfileHandler} from './get-device-profile-handler';
import anything = jasmine.anything;

describe('DeviceRegisterHandler', () => {
    let deviceRegisterHandler: DeviceRegisterHandler;

    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockFrameworkService: Partial<FrameworkService> = {};
    const mockAppInfo: Partial<AppInfo> = {};
    const mockApiService: Partial<ApiService> = {};
    const mockGetDeviceProfileHandler: Partial<GetDeviceProfileHandler> = {};

    beforeAll(() => {
        deviceRegisterHandler = new DeviceRegisterHandler(
            mockSdkConfigWithSampleApiConfig as SdkConfig,
            mockDeviceInfo as DeviceInfo,
            mockSharedPreferences as SharedPreferences,
            mockFrameworkService as FrameworkService,
            mockAppInfo as AppInfo,
            mockApiService as ApiService,
            mockGetDeviceProfileHandler as GetDeviceProfileHandler
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be able to create an instance of deviceRegisterHandler', () => {
        expect(deviceRegisterHandler).toBeTruthy();
    });

    describe('handle()', () => {
        describe('when request is passed:', () => {
            it('should append deviceSpec, activeChannelId, firstAccessTimestamp to request', (done) => {
                // arrange
                const request: DeviceRegisterRequest = {
                    userDeclaredLocation: {
                        state: 'STATE',
                        district: 'DISTRICT'
                    }
                };

                mockDeviceInfo.getDeviceSpec = jest.fn().mockImplementation(() => of({}));

                mockFrameworkService.getActiveChannelId = jest.fn().mockImplementation(() => of('CHANNEL_ID'));

                mockAppInfo.getFirstAccessTimestamp = jest.fn().mockImplementation(() => of('0000'));

                mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => of('SAMPLE_DEVICE_ID'));

                mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(''));

                mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));

                mockApiService.fetch = jest.fn().mockImplementation(() => of({}));

                // act
                deviceRegisterHandler.handle(request).subscribe(() => {
                    // assert
                    expect(mockDeviceInfo.getDeviceSpec).toHaveBeenCalled();
                    expect(mockFrameworkService.getActiveChannelId).toHaveBeenCalled();
                    expect(mockAppInfo.getFirstAccessTimestamp).toHaveBeenCalled();
                    expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                    expect(mockApiService.fetch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            _body: expect.objectContaining({
                                request: expect.objectContaining({
                                    dspec: expect.any(Object),
                                    channel: expect.any(String),
                                    fcmToken: expect.any(String),
                                    producer: expect.any(String)
                                })
                            })
                        })
                    );
                    done();
                });
            });

            it('should append userDeclaredLocation from sharedPreferences if not present in request', (done) => {
                // arrange
                const request: DeviceRegisterRequest = {
                    fcmToken: 'SAMPLE_FCM_TOKEN'
                };

                mockDeviceInfo.getDeviceSpec = jest.fn().mockImplementation(() => of({}));

                mockFrameworkService.getActiveChannelId = jest.fn().mockImplementation(() => of('CHANNEL_ID'));

                mockAppInfo.getFirstAccessTimestamp = jest.fn().mockImplementation(() => of('0000'));

                mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => of('SAMPLE_DEVICE_ID'));

                mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(JSON.stringify({
                    state: 'STATE',
                    district: 'DISTRICT',
                    declaredOffline: true
                })));

                mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));

                mockApiService.fetch = jest.fn().mockImplementation(() => of({}));

                // act
                deviceRegisterHandler.handle(request).subscribe(() => {
                    // assert
                    expect(mockApiService.fetch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            _body: expect.objectContaining({
                                request: expect.objectContaining({
                                    userDeclaredLocation: expect.objectContaining({
                                        state: 'STATE',
                                        district: 'DISTRICT'
                                    })
                                })
                            })
                        })
                    );
                    done();
                });
            });

            it('should not append userDeclaredLocation if not in request and not in sharedPreferences', (done) => {
                // arrange
                const request: DeviceRegisterRequest = {
                    fcmToken: 'SAMPLE_FCM_TOKEN'
                };

                mockDeviceInfo.getDeviceSpec = jest.fn().mockImplementation(() => of({}));

                mockFrameworkService.getActiveChannelId = jest.fn().mockImplementation(() => of('CHANNEL_ID'));

                mockAppInfo.getFirstAccessTimestamp = jest.fn().mockImplementation(() => of('0000'));

                mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => of('SAMPLE_DEVICE_ID'));

                mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(''));

                mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));

                mockApiService.fetch = jest.fn().mockImplementation(() => of({}));

                // act
                deviceRegisterHandler.handle(request).subscribe(() => {
                    // assert
                    expect(mockApiService.fetch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            _body: expect.objectContaining({
                                request: expect.not.objectContaining({
                                    userDeclaredLocation: anything()
                                })
                            })
                        })
                    );
                    done();
                });
            });
        });

        describe('when request is not passed', () => {
            it('should create request with deviceSpec, activeChannelId, firstAccessTimestamp, deviceId', (done) => {
                // arrange
                mockDeviceInfo.getDeviceSpec = jest.fn().mockImplementation(() => of({}));

                mockFrameworkService.getActiveChannelId = jest.fn().mockImplementation(() => of('CHANNEL_ID'));

                mockAppInfo.getFirstAccessTimestamp = jest.fn().mockImplementation(() => of('0000'));

                mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => of('SAMPLE_DEVICE_ID'));

                mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(''));

                mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));

                mockApiService.fetch = jest.fn().mockImplementation(() => of({}));

                // act
                deviceRegisterHandler.handle().subscribe(() => {
                    // assert
                    expect(mockDeviceInfo.getDeviceSpec).toHaveBeenCalled();
                    expect(mockFrameworkService.getActiveChannelId).toHaveBeenCalled();
                    expect(mockAppInfo.getFirstAccessTimestamp).toHaveBeenCalled();
                    expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
                    expect(mockApiService.fetch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            _body: expect.objectContaining({
                                request: expect.objectContaining({
                                    dspec: expect.any(Object),
                                    channel: expect.any(String),
                                    fcmToken: expect.any(String),
                                    producer: expect.any(String)
                                })
                            })
                        })
                    );
                    done();
                });
            });
        });

        describe('when userDeclaredLocation is present', () => {
            it('should remove declaredOffline key for server API calls', (done) => {
                // arrange
                const request: DeviceRegisterRequest = {
                    fcmToken: 'SAMPLE_FCM_TOKEN',
                };

                mockDeviceInfo.getDeviceSpec = jest.fn().mockImplementation(() => of({}));

                mockFrameworkService.getActiveChannelId = jest.fn().mockImplementation(() => of('CHANNEL_ID'));

                mockAppInfo.getFirstAccessTimestamp = jest.fn().mockImplementation(() => of('0000'));

                mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => of('SAMPLE_DEVICE_ID'));

                mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(JSON.stringify({
                    state: 'STATE',
                    district: 'DISTRICT',
                    declaredOffline: false
                })));

                mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));

                mockApiService.fetch = jest.fn().mockImplementation(() => of({}));

                mockGetDeviceProfileHandler.handle = jest.fn().mockImplementation(() => of({
                    userDeclaredLocation: {
                        state: 'STATE',
                        district: 'DISTRICT',
                    }
                }));

                // act
                deviceRegisterHandler.handle(request).subscribe(() => {
                    // assert
                    expect(mockApiService.fetch).toHaveBeenCalledWith(
                        expect.objectContaining({
                            _body: expect.objectContaining({
                                request: expect.objectContaining({
                                    userDeclaredLocation: expect.not.objectContaining({
                                        declaredOffline: anything()
                                    })
                                })
                            })
                        })
                    );
                    done();
                });
            });

            describe('when not declaredOffline', () => {
                it('should verify stored location with server location', (done) => {
                    // arrange
                    const request: DeviceRegisterRequest = {
                        fcmToken: 'SAMPLE_FCM_TOKEN',
                    };

                    mockDeviceInfo.getDeviceSpec = jest.fn().mockImplementation(() => of({}));

                    mockFrameworkService.getActiveChannelId = jest.fn().mockImplementation(() => of('CHANNEL_ID'));

                    mockAppInfo.getFirstAccessTimestamp = jest.fn().mockImplementation(() => of('0000'));

                    mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => of('SAMPLE_DEVICE_ID'));

                    mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(JSON.stringify({
                        state: 'STATE',
                        district: 'DISTRICT'
                    })));

                    mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));

                    mockApiService.fetch = jest.fn().mockImplementation(() => of({}));

                    mockGetDeviceProfileHandler.handle = jest.fn().mockImplementation(() => of({
                        userDeclaredLocation: {
                            state: 'STATE',
                            district: 'DISTRICT'
                        }
                    }));

                    // act
                    deviceRegisterHandler.handle(request).subscribe(() => {
                        // assert
                        expect(mockGetDeviceProfileHandler.handle).toHaveBeenCalled();
                        done();
                    });
                });

                it('should reset stored location if verification fails', (done) => {
                    // arrange
                    const request: DeviceRegisterRequest = {
                        fcmToken: 'SAMPLE_FCM_TOKEN',
                    };

                    mockDeviceInfo.getDeviceSpec = jest.fn().mockImplementation(() => of({}));

                    mockFrameworkService.getActiveChannelId = jest.fn().mockImplementation(() => of('CHANNEL_ID'));

                    mockAppInfo.getFirstAccessTimestamp = jest.fn().mockImplementation(() => of('0000'));

                    mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => of('SAMPLE_DEVICE_ID'));

                    mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(JSON.stringify({
                        state: 'STATE',
                        district: 'DISTRICT'
                    })));

                    mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));

                    mockApiService.fetch = jest.fn().mockImplementation(() => of({}));

                    mockGetDeviceProfileHandler.handle = jest.fn().mockImplementation(() => of({
                        userDeclaredLocation: {}
                    }));

                    // act
                    deviceRegisterHandler.handle(request).subscribe(() => {
                        // assert
                        expect(mockSharedPreferences.putString).toHaveBeenCalledWith('device_location_new', '');
                        done();
                    });
                });

                it('should skip location register as fallback', (done) => {
                    // arrange
                    const request: DeviceRegisterRequest = {
                        fcmToken: 'SAMPLE_FCM_TOKEN',
                    };

                    mockDeviceInfo.getDeviceSpec = jest.fn().mockImplementation(() => of({}));

                    mockFrameworkService.getActiveChannelId = jest.fn().mockImplementation(() => of('CHANNEL_ID'));

                    mockAppInfo.getFirstAccessTimestamp = jest.fn().mockImplementation(() => of('0000'));

                    mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => of('SAMPLE_DEVICE_ID'));

                    mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(JSON.stringify({
                        state: 'STATE',
                        district: 'DISTRICT'
                    })));

                    mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));

                    mockApiService.fetch = jest.fn().mockImplementation(() => of({}));

                    mockGetDeviceProfileHandler.handle = jest.fn().mockImplementation(() => throwError('SOME_ERROR'));

                    // act
                    deviceRegisterHandler.handle(request).subscribe(() => {
                        // assert
                        expect(mockSharedPreferences.putString).not.toHaveBeenCalledWith('device_location_new', '');
                        expect(mockApiService.fetch).toHaveBeenCalledWith(
                            expect.objectContaining({
                                _body: expect.objectContaining({
                                    request: expect.not.objectContaining({
                                        userDeclaredLocation: anything()
                                    })
                                })
                            })
                        );
                        done();
                    });
                });
            });

            describe('when declaredOffline', () => {
                it('should skip verification of stored location with server', (done) => {
                    // arrange
                    const request: DeviceRegisterRequest = {
                        fcmToken: 'SAMPLE_FCM_TOKEN',
                    };

                    mockDeviceInfo.getDeviceSpec = jest.fn().mockImplementation(() => of({}));

                    mockFrameworkService.getActiveChannelId = jest.fn().mockImplementation(() => of('CHANNEL_ID'));

                    mockAppInfo.getFirstAccessTimestamp = jest.fn().mockImplementation(() => of('0000'));

                    mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => of('SAMPLE_DEVICE_ID'));

                    mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(JSON.stringify({
                        state: 'STATE',
                        district: 'DISTRICT',
                        declaredOffline: true
                    })));

                    mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));

                    mockApiService.fetch = jest.fn().mockImplementation(() => of({}));

                    mockGetDeviceProfileHandler.handle = jest.fn().mockImplementation();

                    // act
                    deviceRegisterHandler.handle(request).subscribe(() => {
                        // assert
                        expect(mockGetDeviceProfileHandler.handle).not.toHaveBeenCalled();
                        done();
                    });
                });
            });
        });
    });
});
