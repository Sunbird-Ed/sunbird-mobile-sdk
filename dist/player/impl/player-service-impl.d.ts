import { PlayerService } from '..';
import { Content } from '../../content';
import { ProfileService } from '../../profile';
import { GroupService } from '../../group';
import { PlayerInput } from '../def/response';
import { DeviceInfo } from '../../util/device';
import { SdkConfig } from '../../sdk-config';
import { FrameworkService } from '../../framework';
import { AppInfo } from '../../util/app';
import { Observable } from 'rxjs';
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
