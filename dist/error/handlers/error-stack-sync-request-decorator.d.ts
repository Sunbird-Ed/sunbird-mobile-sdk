import { ProducerData } from '../../telemetry';
import { ApiConfig } from '../../api';
import { DeviceInfo, DeviceSpec } from '../../util/device';
import { Observable } from 'rxjs';
import { AppInfo } from '../../util/app';
interface Context {
    did: string;
    spec: DeviceSpec;
}
interface Request {
    pdata?: ProducerData;
    context?: Context;
}
export declare class ErrorStackSyncRequestDecorator {
    private apiConfig;
    private deviceInfo;
    private appInfo;
    constructor(apiConfig: ApiConfig, deviceInfo: DeviceInfo, appInfo: AppInfo);
    decorate(request: Request): Observable<Request>;
    private patchContext;
    private patchPData;
}
export {};
