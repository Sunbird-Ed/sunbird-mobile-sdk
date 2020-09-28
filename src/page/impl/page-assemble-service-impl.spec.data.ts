import {SdkConfig} from '../../sdk-config';

export const mockSdkConfig: Partial<SdkConfig> = {
    apiConfig: {
        host: 'BASE_URL',
        user_authentication: {
            redirectUrl: 'OAUTH_REDIRECT_URL',
            authUrl: '/auth/realms/sunbird/protocol/openid-connect',
            mergeUserHost: 'MERGE_ACCOUNT_BASE_URL',
            autoMergeApiPath: '/migrate/user/account'
        },
        api_authentication: {
            mobileAppKey: 'MOBILE_APP_KEY',
            mobileAppSecret: 'MOBILE_APP_SECRET',
            mobileAppConsumer: 'MOBILE_APP_CONSUMER',
            channelId: 'CHANNEL_ID',
            producerId: 'PRODUCER_ID',
            producerUniqueId: 'sunbird.app'
        },
        cached_requests: {
            timeToLive: 2 * 60 * 60 * 1000
        }
    },
    pageServiceConfig: {
        apiPath: 'SAMPLE_API_PATH'
    }
};
