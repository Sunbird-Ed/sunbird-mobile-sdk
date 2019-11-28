import {ProducerData} from '../../telemetry';
import {ApiConfig} from '../../api';
import {DeviceInfo, DeviceSpec} from '../../util/device';
import {defer, Observable} from 'rxjs';
import {AppInfo} from '../../util/app';

interface Context {
    did: string;
    spec: DeviceSpec;
}

interface Request {
    pdata?: ProducerData;
    context?: Context;
}

export class ErrorStackSyncRequestDecorator {
    constructor(
        private apiConfig: ApiConfig,
        private deviceInfo: DeviceInfo,
        private appInfo: AppInfo
    ) {
    }

    decorate(request: Request): Observable<Request> {
        return defer(async () => {
                this.patchPData(request);
                await this.patchContext(request);
                return request;
            });
    }

    private async patchContext(request: Request) {
        request.context = {
            did: this.deviceInfo.getDeviceID(),
            spec: await this.deviceInfo.getDeviceSpec().toPromise()
        };
    }

    private patchPData(request: Request) {
        request.pdata = new ProducerData();

        request.pdata.id = this.apiConfig.api_authentication.producerId;

        const pid = request.pdata.pid;

        if (pid) {
            request.pdata.pid = pid;
        } else if (this.apiConfig.api_authentication.producerUniqueId) {
            request.pdata.pid = this.apiConfig.api_authentication.producerUniqueId;
        } else {
            request.pdata.pid = 'sunbird.android';
        }

        if (!request.pdata.ver) {
            request.pdata.ver = this.appInfo.getVersionName();
        }
    }
}
