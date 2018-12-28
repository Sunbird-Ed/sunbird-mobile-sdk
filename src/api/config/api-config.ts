export type ApiConfig = {

    baseUrl: string,
    mobileAppKey: string,
    mobileAppSecret: string,
    mobileAppConsumer: string,
    channelId: string,
    producerId: string,
    deviceId: string,
    auth: {
        redirect_url: string;
        logout_url: string;
        auth_url: string;
    }
}