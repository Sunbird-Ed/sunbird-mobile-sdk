import {AppInfoImpl} from './app-info-impl';
import {SdkConfig} from '../../../sdk-config';
import {SharedPreferences} from '../../..';
import {of} from 'rxjs';
import {AppInfoKeys} from '../../../preference-keys';
import {CsModule} from '@project-sunbird/client-services';

declare const sbutility;

describe('AppInfoImpl', () => {
    let appInfoImpl: AppInfoImpl;
    const mockSharedPreferences: Partial<SharedPreferences> = {};
    const mockSdkConfig: Partial<SdkConfig> = {
        apiConfig: {
            host: 'SAMPLE_HOST',
            user_authentication: {
                redirectUrl: 'SAMPLE_REDIRECT_URL',
                authUrl: 'SAMPLE_AUTH_URL',
                mergeUserHost: '',
                autoMergeApiPath: ''
            },
            api_authentication: {
                mobileAppKey: 'SAMPLE_MOBILE_APP_KEY',
                mobileAppSecret: 'SAMPLE_MOBILE_APP_SECRET',
                mobileAppConsumer: 'SAMPLE_MOBILE_APP_CONSTANT',
                channelId: 'SAMPLE_CHANNEL_ID',
                producerId: 'SAMPLE_PRODUCER_ID',
                producerUniqueId: 'SAMPLE_PRODUCER_UNIQUE_ID'
            },
            cached_requests: {
                timeToLive: 2 * 60 * 60 * 1000
            }
        },
        appConfig: {
            maxCompatibilityLevel: 10,
            minCompatibilityLevel: 1,
            deepLinkBasePath: '',
            buildConfigPackage: 'build_config_package'
        }
    };

    beforeAll(() => {
        window['cordova'] = {getAppVersion: {getAppName: (cb) => cb('SOME_APP_NAME')}} as any;
        appInfoImpl = new AppInfoImpl(
            mockSdkConfig as SdkConfig,
            mockSharedPreferences as SharedPreferences
        );
    });

    beforeEach(() => {
        jest.spyOn(CsModule.instance, 'isInitialised', 'get').mockReturnValue(false);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of appInfoImpl', () => {
        expect(appInfoImpl).toBeTruthy();
    });

    it('should return app version name', () => {
        // arrange
        // act
        appInfoImpl.getVersionName();
        // arrange
    });

    describe('init()', () => {
        beforeEach(() => {
            const mockSdkConfigApi: Partial<SdkConfig> = {
                platform: 'cordova',
                apiConfig: {
                    host: 'SAMPLE_HOST',
                    user_authentication: {
                        redirectUrl: 'SAMPLE_REDIRECT_URL',
                        authUrl: 'SAMPLE_AUTH_URL',
                        mergeUserHost: '',
                        autoMergeApiPath: ''
                    },
                    api_authentication: {
                        mobileAppKey: 'SAMPLE_MOBILE_APP_KEY',
                        mobileAppSecret: 'SAMPLE_MOBILE_APP_SECRET',
                        mobileAppConsumer: 'SAMPLE_MOBILE_APP_CONSTANT',
                        channelId: 'SAMPLE_CHANNEL_ID',
                        producerId: 'SAMPLE_PRODUCER_ID',
                        producerUniqueId: 'SAMPLE_PRODUCER_UNIQUE_ID'
                    },
                    cached_requests: {
                        timeToLive: 2 * 60 * 60 * 1000
                    }
                },
                appConfig: {
                    maxCompatibilityLevel: 10,
                    minCompatibilityLevel: 1,
                    deepLinkBasePath: '',
                    buildConfigPackage: 'build_config_package'
                }
            };
            appInfoImpl = new AppInfoImpl(
                mockSdkConfigApi as SdkConfig,
                mockSharedPreferences as SharedPreferences
            );
        });

        it('should update CsModule app version configuration', (done) => {
            // arrange
            window['sbutility'] = {
                getBuildConfigValue: (_, __, cb) => {
                    cb('SOME_APP_NAME');
                }
            } as any;
            mockSharedPreferences.getString = jest.fn().mockImplementation(() => of('first_access_timestamp'));
            jest.spyOn(CsModule.instance, 'isInitialised', 'get').mockReturnValue(true);
            jest.spyOn(CsModule.instance, 'config', 'get').mockReturnValue({
                core: {
                    httpAdapter: 'HttpClientCordovaAdapter',
                    global: {
                        channelId: 'channelId',
                        producerId: 'producerId',
                        deviceId: 'deviceId'
                    },
                    api: {
                        host: 'host',
                        authentication: {}
                    }
                },
                services: {}
            });
            spyOn(CsModule.instance, 'updateConfig').and.returnValue(undefined);
            // act
            appInfoImpl.init().then(() => {
                // assert
                expect(CsModule.instance.updateConfig).toHaveBeenCalledWith({
                    core: {
                        httpAdapter: 'HttpClientCordovaAdapter',
                        global: {
                            channelId: 'channelId',
                            producerId: 'producerId',
                            deviceId: 'deviceId',
                            appVersion: 'SOME_APP_NAME'
                        },
                        api: {
                            host: 'host',
                            authentication: {}
                        }
                    },
                    services: {}
                });
                done();
            });
        });
    });

    it('should get setFirstAccessTimestamp for debugmode is true', async (done) => {
        // arrange
        mockSharedPreferences.getString = jest.fn().mockImplementation(() => of('first_access_timestamp'));
        // act
        await appInfoImpl.init().then(() => {
            // assert
            expect(mockSharedPreferences.getString).toHaveBeenCalledWith(AppInfoKeys.KEY_FIRST_ACCESS_TIMESTAMP);
            done();
        });
    });

    it('should get setFirstAccessTimestamp if debugMode is false', async(done) => {
        // arrange
        mockSharedPreferences.getString = jest.fn().mockImplementation(() => of(undefined));
        mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));
        const mockSdkConfigApi: Partial<SdkConfig> = {
            apiConfig: {
                host: 'SAMPLE_HOST',
                user_authentication: {
                    redirectUrl: 'SAMPLE_REDIRECT_URL',
                    authUrl: 'SAMPLE_AUTH_URL',
                    mergeUserHost: '',
                    autoMergeApiPath: ''
                },
                api_authentication: {
                    mobileAppKey: 'SAMPLE_MOBILE_APP_KEY',
                    mobileAppSecret: 'SAMPLE_MOBILE_APP_SECRET',
                    mobileAppConsumer: 'SAMPLE_MOBILE_APP_CONSTANT',
                    channelId: 'SAMPLE_CHANNEL_ID',
                    producerId: 'SAMPLE_PRODUCER_ID',
                    producerUniqueId: 'SAMPLE_PRODUCER_UNIQUE_ID'
                },
                cached_requests: {
                    timeToLive: 2 * 60 * 60 * 1000
                }
            },
            appConfig: {
                maxCompatibilityLevel: 10,
                minCompatibilityLevel: 1,
                deepLinkBasePath: '',
                buildConfigPackage: 'build_config_package'
            }
        };
        appInfoImpl = new AppInfoImpl(
            mockSdkConfigApi as SdkConfig,
            mockSharedPreferences as SharedPreferences
        );
        spyOn(sbutility, 'getBuildConfigValue').and.callFake((a, b, c, d) => {
            setTimeout(() => {
                c('2.6.0'),
                d('buildConfig_error');
            });
        });
        // act
       await appInfoImpl.init().then(() => {
            // assert
            expect(mockSharedPreferences.getString).toHaveBeenCalledWith(AppInfoKeys.KEY_FIRST_ACCESS_TIMESTAMP);
            expect(mockSharedPreferences.putString).toHaveBeenCalledWith(AppInfoKeys.KEY_FIRST_ACCESS_TIMESTAMP, expect.any(String));
            done();
        });
    });

    it('should get FirstAccessTimestamp', (done) => {
        // arrange
        mockSharedPreferences.getString = jest.fn().mockImplementation(() => of('first_access_timestamp'));
        // act
        appInfoImpl.getFirstAccessTimestamp().subscribe(() => {
            // assert
            expect(mockSharedPreferences.getString).toHaveBeenCalledWith(AppInfoKeys.KEY_FIRST_ACCESS_TIMESTAMP);
            done();
        });
    });
});

