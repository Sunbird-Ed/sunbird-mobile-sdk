import { AppInfoImpl } from './app-info-impl';
import { SdkConfig } from '../../../sdk-config';
import { SharedPreferences } from '../../..';
import { of } from 'rxjs';
import { AppInfoKeys } from '../../../preference-keys';

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
        appInfoImpl = new AppInfoImpl(
            mockSdkConfig as SdkConfig,
            mockSharedPreferences as SharedPreferences
        );
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

    it('should get setFirstAccessTimestamp for debugmode is true', async(done) => {
        // arrange
        mockSharedPreferences.getString = jest.fn(() => of('first_access_timestamp'));
        // act
        await appInfoImpl.init().then(() => {
        // assert
        expect(mockSharedPreferences.getString).toHaveBeenCalledWith(AppInfoKeys.KEY_FIRST_ACCESS_TIMESTAMP);
        done();
    });
    });

    it('should get setFirstAccessTimestamp if debugMode is false', async(done) => {
        // arrange
        mockSharedPreferences.getString = jest.fn(() => of(undefined));
        mockSharedPreferences.putString = jest.fn(() => of(undefined));
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
        mockSharedPreferences.getString = jest.fn(() => of('first_access_timestamp'));
        // act
        appInfoImpl.getFirstAccessTimestamp().subscribe(() => {
            // assert
            expect(mockSharedPreferences.getString).toHaveBeenCalledWith(AppInfoKeys.KEY_FIRST_ACCESS_TIMESTAMP);
            done();
        });
    });
});

