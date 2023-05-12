import {TelemetryDecoratorImpl} from './decorator-impl';
import {Container} from 'inversify';
import {SdkConfig} from '../../sdk-config';
import {InjectionTokens} from '../../injection-tokens';
import {DeviceInfo} from '../../util/device';
import {AppInfo} from '../../util/app';
import {CodePushExperimentService} from '../../codepush-experiment';
import {TelemetryDecorator} from '..';
import {of} from 'rxjs';
import {ProfileSession} from '../../profile';
import { UniqueId } from '../../db/util/unique-id';

describe('decorator-impl', () => {
    let decoratorImpl: TelemetryDecoratorImpl;
    const container = new Container();

    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockAppInfo: Partial<AppInfo> = {};
    const mockCodePushExperiment: Partial<CodePushExperimentService> = {};
    const mockSdkConfigWithSampleApiConfig: Partial<SdkConfig> = {
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
        }
    };

    beforeAll(() => {
        container.bind<TelemetryDecorator>(InjectionTokens.TELEMETRY_DECORATOR).to(TelemetryDecoratorImpl);
        container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfigWithSampleApiConfig as SdkConfig);
        container.bind<DeviceInfo>(InjectionTokens.DEVICE_INFO).toConstantValue(mockDeviceInfo as DeviceInfo);
        container.bind<AppInfo>(InjectionTokens.APP_INFO).toConstantValue(mockAppInfo as AppInfo);
        container.bind<CodePushExperimentService>(InjectionTokens.CODEPUSH_EXPERIMENT_SERVICE)
            .toConstantValue(mockCodePushExperiment as CodePushExperimentService);

        decoratorImpl = container.get(InjectionTokens.TELEMETRY_DECORATOR);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should run instance from the container', () => {
        // assert
        expect(decoratorImpl).toBeTruthy();
    });

    describe('decorate test cases', () => {
        it('should generate uniqueId and calls patchActor if uid available or not', () => {
            // arrange
            mockAppInfo.getVersionName = jest.fn(() => 'sample');
            mockCodePushExperiment.getExperimentKey = jest.fn(() => of('string'));
            mockDeviceInfo.getDeviceID = jest.fn(() => 'sample_device_id');
            const event = {
                mid: undefined,
                eid: 'sample_eid',
                ets: 1234,
                ver: '3.0',
                context: {
                    env: 'sample_env',
                    pdata: {
                        id: 'sample_id',
                        pid: undefined,
                        ver: undefined
                    }
                },
                object: {},
                edata: 'any',
                tags: ['1', '2'],
                actor: {
                    id: 'sampleActorId',
                    type: 'user'
                }
            } as any;
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')

            // act
            decoratorImpl.decorate(event, new ProfileSession('sample_uid'), 'sampleGid', 0, 'sampleChannelId');
            // assert
            expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
            expect(mockAppInfo.getVersionName).toHaveBeenCalled();
            expect(mockCodePushExperiment.getExperimentKey).toHaveBeenCalled();
        });

        it('should cover else part when called upon', () => {
            // arrange
            const event = {
                mid: 'sample_mid',
                eid: 'sample_eid',
                ets: 1234,
                ver: '3.0',
                context: {
                    cdata: [{id: 'sample_id', type: 'sample_type'}],
                    channel: 'sample_channel',
                    pdata: {},
                    sid: 'sample_sid',
                    did: 'sample_did'
                },
                object: {},
                edata: 'any',
                tags: ['1', '2'],
            } as any;
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')

            // act
            decoratorImpl.decorate(event, new ProfileSession('sample_uid'), 'sampleGid', 0, 'sampleChannelId');
            // assert
            mockAppInfo.getVersionName = jest.fn(() => 'sample');
            mockCodePushExperiment.getExperimentKey = jest.fn(() => of('sampleString'));
            mockDeviceInfo.getDeviceID = jest.fn(() => 'sample_device_id');
        });

        it('should handle data in if condition', () => {
            // arrange
            mockAppInfo.getVersionName = jest.fn(() => 'sample');
            mockCodePushExperiment.getExperimentKey = jest.fn(() => of('sampleString'));
            mockDeviceInfo.getDeviceID = jest.fn(() => 'sample_device_id');
            const event = {
                mid: undefined,
                eid: 'sample_eid',
                ets: 1234,
                ver: '3.0',
                context: undefined,
                object: {},
                edata: 'any',
                tags: ['1', '2'],
                actor: {
                    id: 'sampleActorId',
                    type: undefined
                }
            } as any;
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')

            // act
            decoratorImpl.decorate(event, new ProfileSession('sample_uid'), 'sampleGid', 0, 'sampleChannelId');
            // assert
            expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
            expect(mockAppInfo.getVersionName).toHaveBeenCalled();
            expect(mockCodePushExperiment.getExperimentKey).toHaveBeenCalled();
        });
        it('should handle context producer data if available', () => {
            // arrange
            mockCodePushExperiment.getExperimentKey = jest.fn(() => of('string'));
            mockDeviceInfo.getDeviceID = jest.fn(() => 'sample_device_id');
            const event = {
                mid: undefined,
                eid: 'sample_eid',
                ets: 1234,
                ver: '3.0',
                context: {
                    env: 'sample_env',
                    pdata: {
                        id: 'sample_id',
                        pid: 'sample_pid',
                        ver: '3.0'
                    }
                },
                object: {},
                edata: 'any',
                tags: ['1', '2'],
                actor: {
                    id: 'sampleActorId',
                    type: 'user'
                }
            } as any;
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')

            // act
            decoratorImpl.decorate(event, new ProfileSession('sample_uid'), 'sampleGid', 0, undefined);
            // assert
            expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
            expect(mockCodePushExperiment.getExperimentKey).toHaveBeenCalled();
        });

    });

    it('should call for data to send', () => {
        // arrange
        const event = {
            mid: 'sample_mid',
            eid: 'sample_eid',
            ets: 1234,
            ver: '3.0',
            context: {
                cdata: [{id: 'sample_id', type: 'sample_type'}],
                channel: 'sample_channel',
                pdata: {},
                sid: 'sample_sid',
                did: 'sample_did'
            },
            object: {},
            edata: 'any',
            tags: ['1', '2'],
        } as any;
        // act
        decoratorImpl.prepare(event, 1);
        // assert
    });
});
