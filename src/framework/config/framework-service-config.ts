export interface FrameworkServiceConfig {
    channelApiPath: string;
    frameworkApiPath: string;
    frameworkConfigDirPath: string;
    channelConfigDirPath: string;
    searchOrganizationApiPath: string;
    systemSettingsDefaultChannelIdKey: string;
    overriddenDefaultChannelId?: string;
}
