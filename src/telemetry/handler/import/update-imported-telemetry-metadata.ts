import {DbService} from '../../../db';
import {Response} from '../../../api';
import {ImportTelemetryContext} from '../..';
import {ImportedMetadataEntry} from '../../../profile/db/schema';

export class UpdateImportedTelemetryMetadata {

    constructor(private dbService: DbService) {
    }

    public execute(importContext: ImportTelemetryContext): Promise<Response> {
        const response: Response = new Response();
        const importId = importContext.metadata!['export_id'];
        const did = importContext.metadata!['did'];
        const importMetaDataModel: ImportedMetadataEntry.SchemaMap = {
            imported_id: importId,
            device_id: did,
            count: importContext.metadata!['events_count']
        };
        return this.dbService.read({
            table: ImportedMetadataEntry.TABLE_NAME,
            selection: `${ImportedMetadataEntry.COLUMN_NAME_IMPORTED_ID} = ? AND ${ImportedMetadataEntry.COLUMN_NAME_DEVICE_ID} = ?`,
            selectionArgs: [importId, did],
            limit: '1'
        }).toPromise().then((results: ImportedMetadataEntry.SchemaMap[]) => {
            if (results && results.length) {
                return this.dbService.update({
                    table: ImportedMetadataEntry.TABLE_NAME,
                    modelJson: importMetaDataModel
                }).toPromise();
            } else {
                return this.dbService.insert({
                    table: ImportedMetadataEntry.TABLE_NAME,
                    modelJson: importMetaDataModel
                }).toPromise();
            }
        }).then(() => {
            response.body = importContext;
            return response;
        });
    }
}
