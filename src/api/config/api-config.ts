export interface ApiConfig {
    baseUrl: string;
    user_authentication: {
        redirectUrl: string;
        logoutUrl: string;
        authUrl: string;
    };
    api_authentication: {
        mobileAppKey: string,
        mobileAppSecret: string,
        mobileAppConsumer: string,
        channelId: string,
        producerId: string,
        deviceId: string,
    };
    cached_requests: {
        timeToLive: number
    };
}
