import {DbService} from '../../../db';
import {Response} from '../../../api';
import {ErrorCode} from '../../../content';
import {ArrayUtil} from '../../../util/array-util';
import {ImportProfileContext} from '../../def/import-profile-context';
import {MetaEntry} from '../../../telemetry/db/schema';

export class ValidateProfileMetadata {

    constructor(private dbService: DbService) {
    }

    public execute(importContext: ImportProfileContext): Promise<Response> {
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
            const metaData: { [key: string]: any } = {};
            results.forEach((result) => {
                metaData[result['key']] = result['value'];
            });
            importContext.metadata = metaData;
            const importTypes: string[] = this.getImportTypes(metaData);
            if (importTypes && !ArrayUtil.contains(importTypes, 'userprofile')) {
                response.errorMesg = ErrorCode.IMPORT_FAILED.valueOf();
                throw response;
            }
            response.body = importContext;
            return response;
        });
    }

    private getImportTypes(result): string[] {
        let importTypes: string[] = [];
        if (result.hasOwnProperty('types')) {
            importTypes = JSON.parse(result['types']);
        }
        return importTypes;

    }
}
