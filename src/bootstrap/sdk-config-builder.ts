import {SdkConfig} from './sdk-config';
import {EnvironmentConfigProvider} from './environment-config-provider';
import {Environments} from './environments';

export class SdkConfigBuilder {
    public static build(environment: Environments, environmentConfigProvider: EnvironmentConfigProvider): SdkConfig {
        return {
            environment,
            httpConfig: {
                host: environmentConfigProvider['BASE_URL'],
                user_authentication: {
                    redirectUrl: environmentConfigProvider['OAUTH_REDIRECT_URL'],
                    authUrl: '/auth/realms/sunbird/protocol/openid-connect',
                },
                api_authentication: {
                    mobileAppKey: environmentConfigProvider['MOBILE_APP_KEY'],
                    mobileAppSecret: environmentConfigProvider['MOBILE_APP_SECRET'],
                    mobileAppConsumer: environmentConfigProvider['MOBILE_APP_CONSUMER'],
                    channelId: environmentConfigProvider['CHANNEL_ID'],
                    producerId: environmentConfigProvider['PRODUCER_ID'],
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
                deviceRegisterHost: environmentConfigProvider['DEVICE_REGISTER_BASE_URL'],
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
