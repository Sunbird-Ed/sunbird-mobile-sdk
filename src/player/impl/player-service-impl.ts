import {PlayerService} from '../def/player-service';
import {Content} from '../../content';
import {ProfileService, ProfileSession} from '../../profile';
import {GroupService, GroupSession} from '../../group';
import {Observable} from 'rxjs';
import {Context, PlayerInput} from '../def/response';
import {DeviceInfo} from '../../util/device/def/device-info';
import {Actor, CorrelationData, ProducerData} from '../../telemetry';
import {SdkConfig} from '../../sdk-config';
import {FrameworkService} from '../../framework';
import {ContentUtil} from '../../content/util/content-util';
import {AppInfo} from '../../util/app/def/app-info';

export class PlayerServiceImpl implements PlayerService {
    constructor(private profileService: ProfileService,
                private groupService: GroupService,
                private config: SdkConfig,
                private frameworkService: FrameworkService,
                private deviceInfo: DeviceInfo,
                private appInfo: AppInfo) {
    }

    getPlayerConfig(content: Content, extraInfo: { [key: string]: any }): Observable<PlayerInput> {
        const context: Context = {};
        context.did = this.deviceInfo.getDeviceID();
        const pData = new ProducerData();
        pData.id = this.config.apiConfig.api_authentication.producerId;
        pData.pid = this.config.apiConfig.api_authentication.producerUniqueId;
        pData.ver = this.appInfo.getVersionName();
        context.pdata = pData;

        const playerInput: PlayerInput = {};
        content.rollup = ContentUtil.getRollup(content.identifier, content.hierarchyInfo!);
        content.basePath = content.basePath.replace(/\/$/, '');
        if (content.isAvailableLocally) {
            content.contentData.streamingUrl = content.basePath;
            content.contentData.previewUrl = content.basePath;
        }
        playerInput.metadata = content;
        playerInput.config = this.config.playerConfig;
        return this.profileService.getActiveProfileSession().mergeMap((session: ProfileSession | undefined) => {
            context.sid = session ? session.sid : '';
            const actor = new Actor();
            actor.id = session ? session.uid : '';
            context.actor = actor;
            const deeplinkBasePath = this.config.appConfig.deepLinkBasePath;
            context.deeplinkBasePath = deeplinkBasePath ? deeplinkBasePath : '';
            return this.groupService.getActiveGroupSession();
        }).mergeMap((groupSession: GroupSession | undefined) => {
            const corRelationList: CorrelationData[] = [];
            corRelationList.push({id: groupSession ? groupSession.gid : '', type: 'group'});
            const isStreaming = extraInfo && extraInfo.hasOwnProperty('streaming');
            corRelationList.push({id: isStreaming ? 'streaming' : 'offline', type: 'PlayerLaunch'});
            context.cdata = corRelationList;
            playerInput.context = context;
            const appContext: { [key: string]: any } = {};
            appContext['local'] = true;
            appContext['server'] = false;
            appContext['groupId'] = groupSession ? groupSession.gid : '';
            playerInput.appContext = appContext;
            return this.frameworkService.getActiveChannelId();
        }).mergeMap((channelId: string) => {
            context.channel = channelId ? channelId : this.config.apiConfig.api_authentication.channelId;
            playerInput.context = context;
            return Observable.of(playerInput);
        });

    }
}
