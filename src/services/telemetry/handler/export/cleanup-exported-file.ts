import {DbService} from '../../../../native/db';
import {MetaEntry, TelemetryProcessedEntry} from '../../db/schema';
import {ArrayUtil} from '../../../../util/array-util';
import {FileService} from '../../../../native/file/def/file-service';
import {ExportTelemetryContext} from '../../index';
import {Response} from '../../../../native/http';
import {ErrorCode} from '../../../content';

export class CleanupExportedFile {

    constructor(private dbService: DbService,
                private fileService: FileService) {
    }

    public async execute(exportContext: ExportTelemetryContext): Promise<Response> {
        const response: Response = new Response();
        return this.getAllTables().then((tables: any[]) => {
            const allTables: string[] = tables.map((obj) => {
                return obj.name;
            });
            return this.removeTables(allTables, this.getAllTablesToExclude());
        }).then(() => {
            return this.fileService.getMetaData(exportContext.destinationDBFilePath!);
        }).then((metaData: Metadata) => {
            exportContext.size = metaData.size.toString();
            return this.populateMetaData({FILE_SIZE: metaData.size});
        }).then(() => {
            return this.fileService.removeFile(exportContext.destinationDBFilePath!.concat('-journal'));
        }).then(() => {
            response.body = exportContext;
            return response;
        }).catch(() => {
            response.errorMesg = ErrorCode.EXPORT_FAILED;
            throw response;
        });
    }

    private getAllTables(): Promise<any[]> {
        const allTblesQuery = `SELECT name FROM sqlite_master WHERE type = 'table'`;
        return this.dbService.execute(allTblesQuery, true).toPromise();
    }

    private getAllTablesToExclude(): string[] {
        return [MetaEntry.TABLE_NAME, TelemetryProcessedEntry.TABLE_NAME];
    }

    private async removeTables(allTables: string[], allTablesToExclude: string[]): Promise<boolean> {
        for (const table of allTables) {
            if (ArrayUtil.contains(allTablesToExclude, table)) {
                continue;
            }
            await this.dbService.execute(`DROP TABLE IF EXISTS ${table}`, true).toPromise();
        }
        return true;
    }

    private async populateMetaData(metaData: { [key: string]: any }) {
        Object.keys(metaData).forEach(async (key) => {
            const model = {key: key, value: metaData[key]};
            await this.dbService.insert({
                table: MetaEntry.TABLE_NAME,
                modelJson: model, useExternalDb: true
            }).toPromise();
        });
    }

}
