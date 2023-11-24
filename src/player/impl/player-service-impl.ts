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
import {DbService} from '../../db';
import {PlayerConfigEntry, PlayerDbEntryMapper} from '../db/schema';

@injectable()
export class PlayerServiceImpl implements PlayerService {

    devicePlatform = "";
    constructor(@inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService,
                @inject(InjectionTokens.GROUP_SERVICE_DEPRECATED) private groupService: GroupServiceDeprecated,
                @inject(InjectionTokens.SDK_CONFIG) private config: SdkConfig,
                @inject(InjectionTokens.FRAMEWORK_SERVICE) private frameworkService: FrameworkService,
                @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo,
                @inject(InjectionTokens.APP_INFO) private appInfo: AppInfo,
                @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
    ) {
        window['Capacitor']['Plugins'].Device.getInfo().then((val) => {
            this.devicePlatform = val.platform
        });
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
        console.log('content ', content, this.devicePlatform);
        if (this.devicePlatform.toLowerCase() === 'ios') {
            content.basePath = (content.basePath || (content.basePath = '')).replace(/\/$/, '');
        } else {
            content.basePath = content?.basePath?.replace(/\/$/, '');
        }
        if (content.isAvailableLocally) {
            content.contentData.streamingUrl = content.basePath;
            content.contentData.previewUrl = content.basePath;
        }
        playerInput.metadata = content;
        playerInput.config = this.config.playerConfig;
        console.log('before get active profile session ********* ');
        return this.profileService.getActiveProfileSession().pipe(
            mergeMap((session: ProfileSession | undefined) => {
                console.log('before get active profile session ********* 1 ', session );
                context.sid = session ? session.sid : '';
                const actor = new Actor();
                actor.id = session ? session.uid : '';
                context.actor = actor;
                const deeplinkBasePath = this.config.appConfig.deepLinkBasePath;
                context.deeplinkBasePath = deeplinkBasePath ? deeplinkBasePath : '';
                const parentId: string = (content.rollup && content.rollup.l1) ? content.rollup.l1 : content.identifier;
                this.fetchPlayerState(actor.id, parentId, content.identifier).then((result) => {
                    if (result && playerInput.config) {
                        playerInput.config = {
                            ...playerInput.config, ...JSON.parse(result.saveState)
                        };
                    }
                });
                return this.profileService.getActiveSessionProfile({requiredFields: []});
            }),
            mergeMap((profile: Profile) => {
                console.log('before get active profile session ********* 2 profile ', profile);
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
                console.log('before get active profile session ********* 3 group ', groupSession);
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
                console.log('before get active profile session ********* 4 channelid ', channelId);
                context.channel = channelId ? channelId : this.config.apiConfig.api_authentication.channelId;
                playerInput.context = context;
                return of(playerInput);
            })
        );
    }

    savePlayerState(userId: string, parentId: string,  identifier: string, saveState: string) {
        return this.dbService.read({
            table: PlayerConfigEntry.TABLE_NAME,
            selection: `${PlayerConfigEntry.COLUMN_NAME_USER_ID} = ? AND ${PlayerConfigEntry.COLUMN_PARENT_IDENTIFIER} = ?
                 AND ${PlayerConfigEntry.COLUMN_IDENTIFIER} = ?`,
            selectionArgs: [userId, parentId, identifier]
        }).toPromise().then(async (rows) => {
            if (rows && rows.length) {
                return this.dbService.update({
                    table: PlayerConfigEntry.TABLE_NAME,
                    selection: `${PlayerConfigEntry.COLUMN_NAME_USER_ID} = ? AND ${PlayerConfigEntry.COLUMN_PARENT_IDENTIFIER} = ?
                        AND ${PlayerConfigEntry.COLUMN_IDENTIFIER} = ?`,
                    selectionArgs: [userId, parentId, identifier],
                    modelJson: PlayerDbEntryMapper.mapPlayerStateToPlayerDbEntry(userId, parentId, identifier, saveState)
                }).toPromise();
            } else {
                return this.dbService.insert({
                    table: PlayerConfigEntry.TABLE_NAME,
                    modelJson: PlayerDbEntryMapper.mapPlayerStateToPlayerDbEntry(userId, parentId, identifier, saveState)
                }).toPromise();
            }
        });
    }

    private fetchPlayerState(userId: string, parentId: string, contentId: string) {
        return this.dbService.read({
            table: PlayerConfigEntry.TABLE_NAME,
            selection: `${PlayerConfigEntry.COLUMN_NAME_USER_ID} = ? AND ${PlayerConfigEntry.COLUMN_PARENT_IDENTIFIER} = ?
             AND ${PlayerConfigEntry.COLUMN_IDENTIFIER} = ?`,
            selectionArgs: [userId, parentId, contentId],
        }).toPromise().then((rows) =>
            rows && rows[0] && PlayerDbEntryMapper.mapPlayerDbEntryToPlayer(rows[0])
        );
    }

    deletePlayerSaveState(userId: string, parentId: string, contentId: string) {
        return this.dbService.delete({
            table: PlayerConfigEntry.TABLE_NAME,
            selection: `${PlayerConfigEntry.COLUMN_NAME_USER_ID} =? AND ${PlayerConfigEntry.COLUMN_PARENT_IDENTIFIER} = ?
            AND ${PlayerConfigEntry.COLUMN_IDENTIFIER} = ?`,
            selectionArgs: [userId, parentId, contentId]
        }).toPromise();
    }
}
