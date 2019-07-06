import {ExportTelemetryContext, Item, ShareDirection, ShareItemType, ShareType, TelemetryService, TelemetryShareRequest} from '../../index';
import {Response} from '../../../../native/http';
import {DbService} from '../../../../native/db';
import {ImportedMetadataEntry} from '../../../profile/db/schema';

export class GenerateShareTelemetry {
    constructor(private dbService: DbService,
                private telemetryService: TelemetryService) {
    }

    public execute(exportContext: ExportTelemetryContext): Promise<Response> {
        const response: Response = new Response();
        return this.dbService.read({
            table: ImportedMetadataEntry.TABLE_NAME
        }).toPromise().then((results: ImportedMetadataEntry.SchemaMap[]) => {
            const items: Item[] = [];
            results.forEach((result: ImportedMetadataEntry.SchemaMap) => {
                const item: Item = {
                    type: ShareItemType.TELEMETRY,
                    origin: result[ImportedMetadataEntry.COLUMN_NAME_DEVICE_ID],
                    identifier: result[ImportedMetadataEntry.COLUMN_NAME_IMPORTED_ID],
                    pkgVersion: 0,
                    transferCount: 0,
                    size: exportContext.size!
                };
                items.push(item);
            });
            const req: TelemetryShareRequest = {
                dir: ShareDirection.OUT,
                type: ShareType.FILE.valueOf(),
                items: items,
                env: 'sdk'
            };
            return this.telemetryService.share(req).toPromise();
        }).then(() => {
            response.body = exportContext;
            return response;
        });

    }
}
