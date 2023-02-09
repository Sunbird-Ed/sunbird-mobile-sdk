import {PlayerService, PlayerServiceImpl} from '..';
import {Container} from 'inversify';
import {ProfileService, ProfileSession} from '../../profile';
import {InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';
import {mockSdkConfigWithSamplePlayerConfig} from './player-service-impl.spec.data';
import {GroupServiceDeprecated, GroupSessionDeprecated} from '../../group-deprecated';
import {FrameworkService} from '../../framework';
import {DeviceInfo} from '../../util/device';
import {AppInfo} from '../../util/app';
import {of} from 'rxjs';
import {Content} from '../../content';
import {Rollup} from '../../telemetry';
import {DbService} from '../../db';

describe('PlayerServiceImpl', () => {
    let playerService: PlayerService;

    const container = new Container();

    const mockDeviceInfoService: Partial<DeviceInfo> = {
        getDeviceID: jest.fn().mockImplementation(() => {
        })
    };
    const mockProfileService: Partial<ProfileService> = {
        getActiveSessionProfile: jest.fn().mockImplementation(() => {
        })
    };
    const mockGroupService: Partial<GroupServiceDeprecated> = {};

    const mockFrameWorkService: Partial<FrameworkService> = {
        getActiveChannelId: jest.fn().mockImplementation(() => {
        })
    };
    const mockAppInfo: Partial<AppInfo> = {
        getVersionName: jest.fn().mockImplementation(() => {
        })
    };
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        container.bind<PlayerService>(InjectionTokens.PLAYER_SERVICE).to(PlayerServiceImpl);
        container.bind<ProfileService>(InjectionTokens.PROFILE_SERVICE).toConstantValue(mockProfileService as ProfileService);
        container.bind<GroupServiceDeprecated>(InjectionTokens.GROUP_SERVICE_DEPRECATED).toConstantValue(mockGroupService as GroupServiceDeprecated);
        container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfigWithSamplePlayerConfig as SdkConfig);
        container.bind<FrameworkService>(InjectionTokens.FRAMEWORK_SERVICE).toConstantValue(mockFrameWorkService as FrameworkService);
        container.bind<DeviceInfo>(InjectionTokens.DEVICE_INFO).toConstantValue(mockDeviceInfoService as DeviceInfo);
        container.bind<AppInfo>(InjectionTokens.APP_INFO).toConstantValue(mockAppInfo as AppInfo);
        container.bind<DbService>(InjectionTokens.DB_SERVICE).toConstantValue(mockDbService as DbService);

        playerService = container.get(InjectionTokens.PLAYER_SERVICE);
    });

    beforeEach(() => {
        window['device'] = {uuid: 'some_uuid', platform: 'android'};
        jest.clearAllMocks();
    });

    it('should return an instance from PlayerServiceImpl from Container', () => {
        // assert
        expect(playerService).toBeTruthy();
    });

    it('should return playerConfig when getPlayerConfig() invoked', (done) => {
        // arrange
        const content: Content = {
            rollup: Rollup,
            basePath: 'sample_base_path',
            isAvailableLocally: true,
            identifier: 'do_123',
            hierarchyInfo: [{
                contentType: 'sample-contentType',
                identifier: 'do_456'
            }],
            contentData: {
                streamingUrl: 'sample-url'
            } as any
        } as Partial<Content> as Content;

        const mockProfileSession: ProfileSession = new ProfileSession('SAMPLE_UID');
        mockProfileService.getActiveProfileSession = jest.fn().mockImplementation(() => of(mockProfileSession));
        (mockProfileService.getActiveSessionProfile as jest.Mock).mockReturnValue(of({
            serverProfile: {
                organisations: [{
                    organisationId: 'org-id'
                }]
            },
            profileType: 'teacher'
        }));

        const mockGroupSession: GroupSessionDeprecated = new GroupSessionDeprecated('MOCK_GID');
        mockGroupService.getActiveGroupSession = jest.fn().mockImplementation(() => of(mockGroupSession));

        (mockFrameWorkService.getActiveChannelId as jest.Mock).mockReturnValue(of('MOCK_CHANNEL_ID'));
        (mockDeviceInfoService.getDeviceID as jest.Mock).mockReturnValue('SAMPLE_DEVICE_ID');
        (mockAppInfo.getVersionName as jest.Mock).mockReturnValue('SAMPLE_APP_VERSION_NAME');
        mockDbService.read = jest.fn(() => of([{saveState: 1}]));
        // act
        playerService.getPlayerConfig(content, {}).subscribe(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
            expect(mockGroupService.getActiveGroupSession).toHaveBeenCalled();
            expect(mockFrameWorkService.getActiveChannelId).toHaveBeenCalled();
            done();
        });
    });

    it('should return playerConfig when getPlayerConfig() invoked for ios', (done) => {
        // arrange
        window['device'] = {
            platform: 'ios'
        } as any;
        const content: Content = {
            rollup: Rollup,
            basePath: 'sample_base_path',
            isAvailableLocally: true,
            identifier: 'do_123',
            hierarchyInfo: [{
                contentType: 'sample-contentType',
                identifier: 'do_456'
            }],
            contentData: {
                streamingUrl: 'sample-url'
            } as any
        } as Partial<Content> as Content;

        const mockProfileSession: ProfileSession = new ProfileSession('SAMPLE_UID');
        mockProfileService.getActiveProfileSession = jest.fn().mockImplementation(() => of(mockProfileSession));
        (mockProfileService.getActiveSessionProfile as jest.Mock).mockReturnValue(of({
            serverProfile: {
                organisations: [{
                    organisationId: 'org-id'
                }]
            },
            profileType: 'teacher'
        }));

        const mockGroupSession: GroupSessionDeprecated = new GroupSessionDeprecated('MOCK_GID');
        mockGroupService.getActiveGroupSession = jest.fn().mockImplementation(() => of(mockGroupSession));

        (mockFrameWorkService.getActiveChannelId as jest.Mock).mockReturnValue(of('MOCK_CHANNEL_ID'));
        (mockDeviceInfoService.getDeviceID as jest.Mock).mockReturnValue('SAMPLE_DEVICE_ID');
        (mockAppInfo.getVersionName as jest.Mock).mockReturnValue('SAMPLE_APP_VERSION_NAME');
        mockDbService.read = jest.fn(() => of([{saveState: 1}]));
        // act
        playerService.getPlayerConfig(content, {}).subscribe(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockProfileService.getActiveProfileSession).toHaveBeenCalled();
            expect(mockGroupService.getActiveGroupSession).toHaveBeenCalled();
            expect(mockFrameWorkService.getActiveChannelId).toHaveBeenCalled();
            done();
        });
    });

    describe('savePlayerState()', () => {
        it('should read the db and data is present if present update the db', (done) => {
            // arrange
            const userId = 'sample-uid';
            const parentId = 'sample-parentId',  identifier = 'do_123', saveState = 'state';
            mockDbService.read = jest.fn(() => of());
            mockDbService.update = jest.fn(() => of(1));
            mockDbService.insert = jest.fn(() => of(1));
            // act
            playerService.savePlayerState(userId, parentId, identifier, saveState).then(() => {
                 // assert
                 expect(mockDbService.read).toHaveBeenCalled();
                 expect(mockDbService.insert).toHaveBeenCalled();
                done();
            });
        });

        it('should read the db and data is present if present update the db', (done) => {
            // arrange
            const userId = 'sample-uid';
            const parentId = 'sample-parentId',  identifier = 'do_123', saveState = 'state';
            mockDbService.read = jest.fn(() => of([{saveState: 1}]));
            mockDbService.update = jest.fn(() => of(1));
            // act
            playerService.savePlayerState(userId, parentId, identifier, saveState).then(() => {
                 // assert
                 expect(mockDbService.read).toHaveBeenCalled();
                 expect(mockDbService.update).toHaveBeenCalled();
                done();
            });
        });
    });

    it('should be delete save content state', (done) => {
        const userId = 'sample-userid', parentId = 'sample-parentid', contentId = 'sample-contentId';
        mockDbService.delete = jest.fn(() => of(undefined));
        playerService.deletePlayerSaveState(userId, parentId, contentId).then(() => {
            // assert
            expect(mockDbService.delete).toHaveBeenCalled();
            done();
        });
    });
});
