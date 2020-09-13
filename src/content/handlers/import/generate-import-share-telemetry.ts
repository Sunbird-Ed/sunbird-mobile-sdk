import {ImportContentContext} from '../..';
import {Response} from '../../../api';
import {Item, ShareDirection, ShareItemType, ShareType, TelemetryService, TelemetryShareRequest} from '../../../telemetry';
import {ContentUtil} from '../../util/content-util';

export class GenerateImportShareTelemetry {

    constructor(private telemetryService: TelemetryService) {
    }

    execute(importContentContext: ImportContentContext): Promise<Response> {
        const metaData = importContentContext.metadata;
        const items: Item[] = [];
        for (const element of importContentContext.items!) {
            const item: Item = {
                type: ContentUtil.readPrimaryCategoryServer(element),
                origin: ContentUtil.readOriginFromContentMap(element),
                identifier: element.identifier,
                pkgVersion: Number(element.pkgVersion),
                transferCount: ContentUtil.readTransferCountFromContentMap(element),
                size: ContentUtil.readSizeFromContentMap(element)
            };
            items.push(item);
        }

        const req: TelemetryShareRequest = {
                dir: ShareDirection.IN,
                type: ShareType.FILE.valueOf(),
                items: items,
                env: 'sdk',
                correlationData: importContentContext.correlationData,
                objId: importContentContext.items && importContentContext.items!.length ?
                    importContentContext.items[0]['identifier'] : '',
                objType: importContentContext.items && importContentContext.items.length ?
                ContentUtil.readPrimaryCategoryServer(importContentContext.items[0]) : '',
                objVer: importContentContext.items && importContentContext.items.length ?
                    ContentUtil.readPkgVersion(importContentContext.items[0]) + '' : '',
                rollUp: importContentContext.rollUp
            }
        ;

        const response: Response = new Response();
        return this.telemetryService.share(req).toPromise()
            .then(() => {
                response.body = importContentContext;
                return Promise.resolve(response);
            }).catch(() => {
                return Promise.reject(response);
            });
    }
}
