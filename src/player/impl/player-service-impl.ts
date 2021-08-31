import {PlayerService} from '..';
import {Content} from '../../content';
import {Profile, ProfileService, ProfileSession} from '../../profile';
import {GroupServiceDeprecated, GroupSessionDeprecated} from '../../group-deprecated';
import {Context, PlayerInput} from '../def/response';
import {DeviceInfo} from '../../util/device';
import {Actor, CorrelationData, ProducerData} from '../../telemetry';
import {SdkConfig} from '../../sdk-config';
import {FrameworkService} from '../../framework';
import {ContentUtil} from '../../content/util/content-util';
import {AppInfo} from '../../util/app';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {Observable, of} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

@injectable()
export class PlayerServiceImpl implements PlayerService {
    constructor(@inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService,
                @inject(InjectionTokens.GROUP_SERVICE_DEPRECATED) private groupService: GroupServiceDeprecated,
                @inject(InjectionTokens.SDK_CONFIG) private config: SdkConfig,
                @inject(InjectionTokens.FRAMEWORK_SERVICE) private frameworkService: FrameworkService,
                @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo,
                @inject(InjectionTokens.APP_INFO) private appInfo: AppInfo) {
    }

    getPlayerConfig(content: Content, extraInfo: { [key: string]: any }): Observable<PlayerInput> {
        const context: Context = {};
        context.did = this.deviceInfo.getDeviceID();
        context.origin = this.config.apiConfig.host;
        const pData = new ProducerData();
        pData.id = this.config.apiConfig.api_authentication.producerId;
        pData.pid = this.config.apiConfig.api_authentication.producerUniqueId;
        pData.ver = this.appInfo.getVersionName();
        context.pdata = pData;

        const playerInput: PlayerInput = {};
        content.rollup = ContentUtil.getRollup(content.identifier, content.hierarchyInfo!);
        context.objectRollup = content.rollup;
        if (window.device.platform.toLowerCase() === "ios") {
            content.basePath = (content.basePath || (content.basePath = '')).replace(/\/$/, '');
        } else {
            content.basePath = content.basePath.replace(/\/$/, '');
        }
        if (content.isAvailableLocally) {
            content.contentData.streamingUrl = content.basePath;
            content.contentData.previewUrl = content.basePath;
        }
        playerInput.metadata = content;
        playerInput.config = this.config.playerConfig;
        return this.profileService.getActiveProfileSession().pipe(
            mergeMap((session: ProfileSession | undefined) => {
                context.sid = session ? session.sid : '';
                const actor = new Actor();
                actor.id = session ? session.uid : '';
                context.actor = actor;
                const deeplinkBasePath = this.config.appConfig.deepLinkBasePath;
                context.deeplinkBasePath = deeplinkBasePath ? deeplinkBasePath : '';
                return this.profileService.getActiveSessionProfile({requiredFields: []});
            }),
            mergeMap((profile: Profile) => {
                if (profile && profile.serverProfile) {
                    const organisations = profile.serverProfile['organisations'];
                    if (organisations) {
                        const orgId = organisations[0] && organisations[0]['organisationId'];
                        context.contextRollup = {l1: orgId};
                    }
                }
                if (profile && profile.profileType) {
                    extraInfo['correlationData'] = (extraInfo['correlationData'] || []).concat([
                        {id: profile.profileType, type: 'UserType'}
                    ]);
                }
                return this.groupService.getActiveGroupSession();
            }),
            mergeMap((groupSession: GroupSessionDeprecated | undefined) => {
                let corRelationList: CorrelationData[] = [];
                if (groupSession && groupSession.gid) {
                    corRelationList.push({id: groupSession.gid, type: 'group'});
                }
                const isStreaming = extraInfo && extraInfo.hasOwnProperty('streaming');
                const appCorrelationData: CorrelationData[] = extraInfo['correlationData'];
                if (appCorrelationData && appCorrelationData.length) {
                    corRelationList = corRelationList.concat(appCorrelationData);
                }
                corRelationList.push({id: isStreaming ? 'streaming' : 'offline', type: 'PlayerLaunch'});
                context.cdata = corRelationList;
                playerInput.context = context;
                const appContext: { [key: string]: any } = {};
                appContext['local'] = true;
                appContext['server'] = false;
                appContext['groupId'] = groupSession ? groupSession.gid : '';
                playerInput.appContext = appContext;
                return this.frameworkService.getActiveChannelId();
            }),
            mergeMap((channelId: string) => {
                context.channel = channelId ? channelId : this.config.apiConfig.api_authentication.channelId;
                playerInput.context = context;
                return of(playerInput);
            })
        );
    }
}
