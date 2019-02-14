import {FileService} from '../../../util/file/def/file-service';
import {ExportProfileContext} from '../../def/profile-export-request';
import {DbService} from '../../../db';
import {LearnerAssessmentsEntry, LearnerSummaryEntry, ProfileEntry, UserEntry} from '../../db/schema';
import {GroupEntry, GroupProfileEntry} from '../../../group/db/schema';
import {KeyValueStoreEntry} from '../../../key-value-store/db/schema';

export class CleanUpExportedFile {
    constructor(private dbService: DbService) {
    }

    execute(profileExportContext: ExportProfileContext) {

    }

    getAllTablesToExclude(): string[] {
        return [UserEntry.getCreateEntry(),
            ProfileEntry.getCreateEntry(),
            LearnerAssessmentsEntry.getCreateEntry(),
            LearnerSummaryEntry.getCreateEntry(),
            GroupEntry.getCreateEntry(),
            GroupProfileEntry.getCreateEntry(),
            KeyValueStoreEntry.getCreateEntry()];
    }

    getAllTables(): Promise<string[]> {
        const query = `select name from sqlite_master where type='table'`;
        return this.dbService.execute(query).toPromise();
    }

    dropTables(allTables: string[], allTablesToExclude: string[]) {
        allTables.forEach(async (table) => {
            if (allTablesToExclude.indexOf(table) !== -1) {
                return;
            }
            const query = `DROP TABLE IF EXISTS ${table}`;
            await this.dbService.execute(query);
        });
    }

    cleanTable(tableName: string): Promise<any> {
        const query = `Delete from ${tableName}`;
        return this.dbService.execute(query).toPromise();
    }

    deleteUnWantedProfilesAndUsers(userIds: string[]) {

    }

    deleteUnwantedGroupProfileMapping(groupIds: string[]) {
        if (groupIds && groupIds.length) {
            const query = ``;
        }
    }

    keepAllFrameworkAndChannel(): Promise<any> {
        const query = 'SELECT *  FROM  no_sql WHERE key LIKE \'channel_details_key-%\' ' +
            'OR key LIKE \'framework_details_key-%\' OR key LIKE \'form-%\' ';
        let noSqlData: KeyValueStoreEntry.SchemaMap[];
        return this.dbService.execute(query).toPromise().then(async (data: KeyValueStoreEntry.SchemaMap[]) => {
            noSqlData = data;
            await this.cleanTable(KeyValueStoreEntry.TABLE_NAME);
            noSqlData.forEach(async (sqlData) => {
                await this.dbService.insert({
                    table: KeyValueStoreEntry.TABLE_NAME,
                    modelJson: sqlData
                });
            });
        });
    }
}
