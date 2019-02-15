export interface ApiConfig {
    debugMode: boolean;
    host: string;
    baseUrl: string;
    user_authentication: {
        redirectUrl: string;
        authUrl: string;
    };
    api_authentication: {
        mobileAppKey: string;
        mobileAppSecret: string;
        mobileAppConsumer: string;
        channelId: string;
        producerId: string;
        deviceId: string;
    };
    cached_requests: {
        timeToLive: number;
    };
}
