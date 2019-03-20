import { PlayerService } from '../def/player-service';
import { Content } from '../../content';
import { ProfileService } from '../../profile';
import { GroupService } from '../../group';
import { Observable } from 'rxjs';
import { PlayerInput } from '../def/response';
import { DeviceInfo } from '../../util/device/def/device-info';
import { SdkConfig } from '../../sdk-config';
import { FrameworkService } from '../../framework';
import { AppInfo } from '../../util/app/def/app-info';
export declare class PlayerServiceImpl implements PlayerService {
    private profileService;
    private groupService;
    private config;
    private frameworkService;
    private deviceInfo;
    private appInfo;
    constructor(profileService: ProfileService, groupService: GroupService, config: SdkConfig, frameworkService: FrameworkService, deviceInfo: DeviceInfo, appInfo: AppInfo);
    getPlayerConfig(content: Content, extraInfo: {
        [key: string]: any;
    }): Observable<PlayerInput>;
}
