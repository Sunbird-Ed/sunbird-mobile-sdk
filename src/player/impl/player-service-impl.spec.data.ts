import {SdkConfig} from '../../sdk-config';

export const mockSdkConfigWithSamplePlayerConfig: Partial<SdkConfig> = {
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
    playerConfig: {
        showEndPage: false,
        splash: {
            webLink: '',
            text: '',
            icon: '',
            bgImage: 'assets/icons/splacebackground_1.png'
        },
        overlay: {
            enableUserSwitcher: false,
            showUser: false
        },
        endPage: []
    },
    appConfig: {
        deepLinkBasePath: 'SAMPLE_DEEP_LINKING_BASE_PATH',
        maxCompatibilityLevel: 4,
        minCompatibilityLevel: 1
    }
};
