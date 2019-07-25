import {FileService} from '../../../util/file/def/file-service';
import {Response} from '../../../api';
import {ContentErrorCode, FileName} from '../../util/content-constants';
import {ExportContentContext} from '../..';
import {DeviceInfo} from '../../../util/device';

export class WriteManifest {

    constructor(private fileService: FileService,
                private deviceInfo: DeviceInfo) {

    }

    execute(exportContentContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        return this.deviceInfo.getAvailableInternalMemorySize().toPromise()
            .then((deviceUsableSpace) => {
                const usableSpace = Number(deviceUsableSpace);
                if (usableSpace > 0 && usableSpace < (1024 * 1024)) {
                    response.errorMesg = ContentErrorCode.EXPORT_FAILED_MEMORY_NOT_SUFFICIENT;
                    throw response;
                }

                return this.fileService.writeFile(exportContentContext.tmpLocationPath!,
                    FileName.MANIFEST.valueOf(),
                    JSON.stringify(exportContentContext.manifest),
                    {replace: true});
            }).then(() => {
                response.body = exportContentContext;
                return Promise.resolve(response);
            }).catch(() => {
                response.errorMesg = ContentErrorCode.EXPORT_FAILED_WRITING_MANIFEST;
                return Promise.reject(response);
            });
    }
}
