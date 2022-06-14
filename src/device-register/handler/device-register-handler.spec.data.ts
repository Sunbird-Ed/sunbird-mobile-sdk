import {SdkConfig} from '../../sdk-config';

export const mockSdkConfigWithSampleApiConfig: Partial<SdkConfig> = {
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
    deviceRegisterConfig: {
        apiPath: 'some/path',
        fcmToken: 'SAMPLE_FCM_TOKEN'
    },
    profileServiceConfig: {
        profileApiPath: '',
        profileApiPath_V2: '',
        profileApiPath_V5: '',
        tenantApiPath: '',
        otpApiPath: '',
        searchLocationApiPath: '',
        locationDirPath: ''
    }
};
