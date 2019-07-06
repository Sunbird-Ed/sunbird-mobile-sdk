import {ContentExportResponse, ExportContentContext} from '../../index';
import {Response} from '../../../../native/http';
import {Item, ShareDirection, ShareItemType, ShareType, TelemetryService, TelemetryShareRequest} from '../../../telemetry';
import {ContentUtil} from '../../util/content-util';

export class GenerateExportShareTelemetry {
    constructor(private telemetryService: TelemetryService) {
    }

    execute(exportContentContext: ExportContentContext): Promise<Response> {
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
        return this.telemetryService.share(req).toPromise().then(() => {
            const exportResponse: ContentExportResponse = {exportedFilePath: exportContentContext.ecarFilePath!};
            response.body = exportResponse;
            return Promise.resolve(response);
        }).catch(() => {
            return Promise.reject(response);
        });
    }


}
