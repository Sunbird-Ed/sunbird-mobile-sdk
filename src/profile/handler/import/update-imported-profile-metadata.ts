import {DbService} from '../../../db';
import {Response} from '../../../api';
import {ImportedMetadataEntry} from '../../db/schema';
import {ImportProfileContext} from '../../def/import-profile-context';

export class UpdateImportedProfileMetadata {

    constructor(private dbService: DbService) {

    }

    public execute(importContext: ImportProfileContext): Promise<Response> {
        const response: Response = new Response();
        const importId = importContext.metadata!['export_id'];
        const did = importContext.metadata!['did'];
        const importMetaDataModel: ImportedMetadataEntry.SchemaMap = {
            imported_id: importId,
            device_id: did,
            count: importContext.metadata!['profiles_count']
        };
        return this.dbService.read({
            table: ImportedMetadataEntry.TABLE_NAME,
            selection: `${ImportedMetadataEntry.COLUMN_NAME_IMPORTED_ID} =? AND ${ImportedMetadataEntry.COLUMN_NAME_DEVICE_ID} = ?`,
            selectionArgs: [importId, did],
            limit: '1'
        }).toPromise().then((results: ImportedMetadataEntry.SchemaMap[]) => {
            if (results && results.length) {
                return this.dbService.update({
                    table: ImportedMetadataEntry.TABLE_NAME,
                    modelJson: importMetaDataModel,
                    selection: `${ImportedMetadataEntry.COLUMN_NAME_IMPORTED_ID} =? AND ${ImportedMetadataEntry.COLUMN_NAME_DEVICE_ID} =?`,
                    selectionArgs: [importId, did]
                }).toPromise();
            } else {
                return this.dbService.insert({
                    table: ImportedMetadataEntry.TABLE_NAME,
                    modelJson: importMetaDataModel,
                }).toPromise();
            }
        }).then(() => {
            response.body = importContext;
            return response;
        });
    }
}
