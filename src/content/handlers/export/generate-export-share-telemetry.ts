import {ContentExportResponse, ExportContentContext, ContentExportRequest} from '../..';
import {Response} from '../../../api';
import {Item, ShareDirection, ShareItemType, ShareType, TelemetryService, TelemetryShareRequest} from '../../../telemetry';
import {ContentUtil} from '../../util/content-util';

export class GenerateExportShareTelemetry {
    constructor(private telemetryService: TelemetryService) {
    }

    execute(exportContentContext: ExportContentContext, fileName: string, contentExportRequest: ContentExportRequest): Promise<Response> {
        const response: Response = new Response();
        const items: Item[] = [];
        for (const element of exportContentContext.items!) {
            const item: Item = {
                type: ShareItemType.CONTENT,
                origin: ContentUtil.readOriginFromContentMap(element),
                identifier: element.identifier,
                pkgVersion: Number(element.pkgVersion),
                transferCount: ContentUtil.readTransferCountFromContentMap(element),
                size: ContentUtil.readSizeFromContentMap(element)
            };
        }
        const req: TelemetryShareRequest = {
            dir: ShareDirection.OUT,
            type: ShareType.FILE.valueOf(),
            items: items,
            env: 'sdk'
        };
        return this.telemetryService.share(req).toPromise()
            .then(() => {
                let exportedFilePath;
                if (contentExportRequest.saveLocally) {
                    exportedFilePath = contentExportRequest.destinationFolder.concat(fileName);
                } else {
                    let devicePlatform = "";
                    window['Capacitor']['Plugins'].Device.getInfo().then((val) => {
                        devicePlatform = val.platform
                        const folderPath = (devicePlatform.toLowerCase() === "ios") ? cordova.file.documentsDirectory : cordova.file.externalCacheDirectory;
                        exportedFilePath = folderPath.concat(fileName);
                    })
                }
                const exportResponse: ContentExportResponse = {exportedFilePath: exportedFilePath};
                response.body = exportResponse;
                return Promise.resolve(response);
            }).catch(() => {
                return Promise.reject(response);
            });
    }

}
