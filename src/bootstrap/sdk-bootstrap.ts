import {SdkConfig} from './sdk-config';
import {EnvironmentConfigProvider} from './environment-config-provider';
import {Environments} from './environments';
import {BootstrapConfig} from './bootstrap-config';

export class SdkBootstrap {
    public static async build(
        environment: Environments,
        bootstrapConfig: BootstrapConfig,
        environmentConfigProvider: EnvironmentConfigProvider
    ): Promise<SdkConfig> {
        const environmentConfig = await environmentConfigProvider.provide(bootstrapConfig).toPromise();

        return {
            environment,
            bootstrapConfig,
            httpConfig: {
                host: environmentConfig['BASE_URL'],
                user_authentication: {
                    redirectUrl: environmentConfig['OAUTH_REDIRECT_URL'],
                    authUrl: '/auth/realms/sunbird/protocol/openid-connect',
                },
                api_authentication: {
                    mobileAppKey: environmentConfig['MOBILE_APP_KEY'],
                    mobileAppSecret: environmentConfig['MOBILE_APP_SECRET'],
                    mobileAppConsumer: environmentConfig['MOBILE_APP_CONSUMER'],
                    channelId: environmentConfig['CHANNEL_ID'],
                    producerId: environmentConfig['PRODUCER_ID'],
                    producerUniqueId: 'sunbird.app'
                },
                cached_requests: {
                    timeToLive: 2 * 60 * 60 * 1000
                }
            },
            eventsBusConfig: {
                debugMode: true
            },
            dbConfig: {
                dbName: 'GenieServices.db'
            },
            contentServiceConfig: {
                apiPath: '/api/content/v1',
                searchApiPath: '/api/composite/v1'
            },
            courseServiceConfig: {
                apiPath: '/api/course/v1'
            },
            formServiceConfig: {
                apiPath: '/api/data/v1/form',
                formConfigDirPath: '/data/form',
            },
            frameworkServiceConfig: {
                channelApiPath: '/api/channel/v1',
                frameworkApiPath: '/api/framework/v1',
                frameworkConfigDirPath: '/data/framework',
                channelConfigDirPath: '/data/channel',
                searchOrganizationApiPath: '/api/org/v1',
                systemSettingsDefaultChannelIdKey: 'custodianOrgId'
            },
            profileServiceConfig: {
                profileApiPath: '/api/user/v1',
                tenantApiPath: '/v1/tenant',
                otpApiPath: '/api/otp/v1',
                searchLocationApiPath: '/api/data/v1'
            },
            pageServiceConfig: {
                apiPath: '/api/data/v1',
            },
            appConfig: {
                maxCompatibilityLevel: 4,
                minCompatibilityLevel: 1
            },
            systemSettingsConfig: {
                systemSettingsApiPath: '/api/data/v1',
                systemSettingsDirPath: '/data/system',
            },
            telemetryConfig: {
                deviceRegisterApiPath: '',
                telemetryApiPath: '/api/data/v1',
                deviceRegisterHost: environmentConfig['DEVICE_REGISTER_BASE_URL'],
                telemetrySyncBandwidth: 200,
                telemetrySyncThreshold: 200,
                telemetryLogMinAllowedOffset: 86400000
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
                }
            },
            errorLoggerConfig: {
                errorLoggerApiPath: '/api/data/v1/client/logs'
            }
        };
    }
}
