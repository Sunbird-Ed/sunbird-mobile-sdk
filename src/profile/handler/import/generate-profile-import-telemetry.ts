import {Response} from '../../../api';
import {DbService} from '../../../db';
import {ImportedMetadataEntry} from '../../db/schema';
import {
    ImportTelemetryContext,
    Item,
    ShareDirection,
    ShareItemType,
    ShareType,
    TelemetryShareRequest
} from '../../../telemetry';
import {TelemetryLogger} from '../../../telemetry/util/telemetry-logger';

export class GenerateProfileImportTelemetry {
    constructor(private dbService: DbService) {
    }

    public execute(importContext: ImportTelemetryContext): Promise<Response> {
        const response: Response = new Response();
        return this.dbService.read({
            table: ImportedMetadataEntry.TABLE_NAME
        }).toPromise().then((results: ImportedMetadataEntry.SchemaMap[]) => {
            const items: Item[] = [];
            results.forEach((result: ImportedMetadataEntry.SchemaMap) => {
                const item: Item = {
                    type: ShareItemType.PROFILE,
                    origin: result[ImportedMetadataEntry.COLUMN_NAME_DEVICE_ID],
                    identifier: result[ImportedMetadataEntry.COLUMN_NAME_IMPORTED_ID],
                    pkgVersion: 0,
                    transferCount: 0,
                    size: ''
                };
                items.push(item);
            });
            const req: TelemetryShareRequest = {
                dir: ShareDirection.IN,
                type: ShareType.FILE.valueOf(),
                items: items,
                env: 'sdk'
            };
            return TelemetryLogger.log.share(req).toPromise();
        }).then(() => {
            response.body = importContext;
            return response;
        });

    }
}
