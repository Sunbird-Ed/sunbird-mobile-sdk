import {DbService} from '../../../db';
import {ImportTelemetryContext} from '../..';
import {Response} from '../../../api';
import {MetaEntry} from '../../db/schema';
import {ErrorCode} from '../../../content';
import {ArrayUtil} from '../../../util/array-util';
import {ImportedMetadataEntry} from '../../../profile/db/schema';

export class ValidateTelemetryMetadata {

    constructor(private dbService: DbService) {
    }

    public execute(importContext: ImportTelemetryContext): Promise<Response> {
        const response: Response = new Response();
        return this.dbService.open(importContext.sourceDBFilePath).then(() => {
            return this.dbService.read({
                table: MetaEntry.TABLE_NAME,
                useExternalDb: true
            }).toPromise();
        }).then((results: MetaEntry.SchemaMap[]) => {
            if (!results || !results.length) {
                response.errorMesg = ErrorCode.IMPORT_FAILED.valueOf();
                throw response;
            }
            const result = results[0];
            importContext.metadata = result;
            const importTypes: string[] = this.getImportTypes(results[0]);
            if (importTypes && ArrayUtil.contains(importTypes, 'telemetry')) {
                const importId = result['export_id'];
                const did = result['did'];
                return this.dbService.read({
                    table: ImportedMetadataEntry.TABLE_NAME,
                    selection: `${ImportedMetadataEntry.COLUMN_NAME_IMPORTED_ID} = ?
                    AND ${ImportedMetadataEntry.COLUMN_NAME_DEVICE_ID} = ?`,
                    selectionArgs: [importId, did],
                    useExternalDb: true
                }).toPromise();
            } else {
                response.errorMesg = ErrorCode.IMPORT_FAILED.valueOf();
                throw response;
            }
        }).then((importedResults: ImportedMetadataEntry.SchemaMap[]) => {
            if (importedResults && importedResults.length) {
                response.errorMesg = ErrorCode.IMPORT_FAILED.valueOf();
                throw response;
            }
            response.body = importContext;
            return response;
        });
    }

    private getImportTypes(result: MetaEntry.SchemaMap): string[] {
        let importTypes: string[] = [];
        if (result.hasOwnProperty('types')) {
            importTypes = result['types'];
        }
        return importTypes;

    }
}
