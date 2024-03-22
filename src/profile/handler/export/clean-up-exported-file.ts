import {DbService} from '../../../db';
import {ArrayUtil} from '../../../util/array-util';
import {FileService} from '../../../util/file/def/file-service';
import {Response} from '../../../api';
import {ErrorCode} from '../../../content';
import {ExportProfileContext} from '../../def/export-profile-context';
import {LearnerAssessmentsEntry, LearnerSummaryEntry, ProfileEntry, UserEntry} from '../../db/schema';
import {MetaEntry} from '../../../telemetry/db/schema';
import {GroupEntry, GroupProfileEntry} from '../../../group-deprecated/db/schema';
import {KeyValueStoreEntry} from '../../../key-value-store/db/schema';

export class CleanupExportedFile {

    constructor(private dbService: DbService,
                private fileService: FileService) {
    }

    public async execute(exportContext: ExportProfileContext): Promise<Response> {
        const response: Response = new Response();
        return this.getAllTables().then((tables: any[]) => {
            const allTables: string[] = tables.map((obj) => {
                return obj.name;
            });
            return this.removeTables(allTables, this.getAllTablesToExclude());
        }).then(() => {
            return this.deleteUnwantedProfilesAndUsers(exportContext.userIds);
        }).then(() => {
            return this.deleteUnwantedProfileSummary(exportContext.userIds);
        }).then(() => {
            return this.deleteUnwantedGroups(exportContext.groupIds);
        }).then(() => {
            return this.deleteUnwantedGroupProfiles(exportContext.groupIds);
        }).then(() => {
            return this.keepAllFrameworknChannel();
        }).then(() => {
            return this.fileService.getMetaData(exportContext.destinationDBFilePath!);
        }).then((metaData: any) => {
            exportContext.size = metaData.size.toString();
            return this.populateMetaData({FILE_SIZE: metaData.size});
        }).then(() => {
            return this.fileService.removeFile(exportContext.destinationDBFilePath!.concat('-journal'));
        }).then(() => {
            response.body = exportContext;
            return response;
        }).catch((e) => {
            response.errorMesg = ErrorCode.EXPORT_FAILED;
            throw response;
        });
    }

    private getAllTables(): Promise<any[]> {
        const allTblesQuery = `SELECT name FROM sqlite_master WHERE type = 'table'`;
        return this.dbService.execute(allTblesQuery, true).toPromise();
    }

    private getAllTablesToExclude(): string[] {
        return [MetaEntry.TABLE_NAME,
            UserEntry.TABLE_NAME,
            ProfileEntry.TABLE_NAME,
            LearnerAssessmentsEntry.TABLE_NAME,
            LearnerSummaryEntry.TABLE_NAME,
            GroupEntry.TABLE_NAME,
            GroupProfileEntry.TABLE_NAME,
            KeyValueStoreEntry.TABLE_NAME];
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

    private async deleteUnwantedProfilesAndUsers(userIds: string[]) {
        const profilesToRetain: string[] = [];
        const usersToRetain: string[] = [];
        for (const userId of userIds) {
            const profilesInDb: ProfileEntry.SchemaMap[] = await this.dbService.read({
                table: ProfileEntry.TABLE_NAME,
                useExternalDb: true,
                selection: `${ProfileEntry.COLUMN_NAME_UID}=?`,
                selectionArgs: [userId],
                limit: '1'
            }).toPromise();
            if (profilesInDb && profilesInDb.length) {
                profilesToRetain.push(profilesInDb[0][ProfileEntry.COLUMN_NAME_UID]);
            }

            const usersInDb: UserEntry.SchemaMap[] = await this.dbService.read({
                table: UserEntry.TABLE_NAME,
                useExternalDb: true,
                selection: `${UserEntry.COLUMN_NAME_UID}=?`,
                selectionArgs: [userId],
                limit: '1'
            }).toPromise();
            if (usersInDb && usersInDb.length) {
                usersToRetain.push(usersInDb[0][UserEntry.COLUMN_NAME_UID]);
            }
        }

        await this.cleanTable(ProfileEntry.TABLE_NAME, ProfileEntry.COLUMN_NAME_UID, profilesToRetain);
        await this.cleanTable(UserEntry.TABLE_NAME, UserEntry.COLUMN_NAME_UID, profilesToRetain);
    }

    private async deleteUnwantedProfileSummary(userIds: string[]) {
        await this.cleanTable(LearnerAssessmentsEntry.TABLE_NAME, LearnerAssessmentsEntry.COLUMN_NAME_UID, userIds);
        await this.cleanTable(LearnerSummaryEntry.TABLE_NAME, LearnerSummaryEntry.COLUMN_NAME_UID, userIds);
    }

    private async deleteUnwantedGroups(groupIds: string[]) {
        if (!groupIds || !groupIds.length) {
            return;
        }
        const groupsToRetain: string[] = [];
        for (const groupId of groupIds) {
            const groupsInDb: GroupEntry.SchemaMap[] = await this.dbService.read({
                table: GroupEntry.TABLE_NAME,
                useExternalDb: true,
                selection: `${GroupEntry.COLUMN_NAME_GID}=?`,
                selectionArgs: [groupId],
                limit: '1'
            }).toPromise();
            if (groupsInDb && groupsInDb.length) {
                groupsToRetain.push(groupsInDb[0][GroupProfileEntry.COLUMN_NAME_GID]);
            }
        }
        await this.cleanTable(GroupEntry.TABLE_NAME, GroupEntry.COLUMN_NAME_GID, groupsToRetain);
    }

    private async deleteUnwantedGroupProfiles(groupIds: string[]) {
        if (!groupIds || !groupIds.length) {
            return;
        }
        const groupsToRetain: string[] = [];
        for (const groupId of groupIds) {
            const groupsInDb: GroupProfileEntry.SchemaMap[] = await this.dbService.read({
                table: GroupProfileEntry.TABLE_NAME,
                useExternalDb: true,
                selection: `${GroupProfileEntry.COLUMN_NAME_GID}=?`,
                selectionArgs: [groupId],
                limit: '1'
            }).toPromise();
            if (groupsInDb && groupsInDb.length) {
                groupsToRetain.push(groupsInDb[0][ProfileEntry.COLUMN_NAME_UID]);
            }
        }
        await this.cleanTable(GroupEntry.TABLE_NAME, GroupEntry.COLUMN_NAME_GID, groupIds);
    }

    private async keepAllFrameworknChannel() {
        const query = `SELECT *  FROM  ${KeyValueStoreEntry.TABLE_NAME}
                       WHERE ${KeyValueStoreEntry.COLUMN_NAME_KEY} LIKE 'channel_details_key-%'
                       OR ${KeyValueStoreEntry.COLUMN_NAME_KEY} LIKE 'framework_details_key-%'
                       OR ${KeyValueStoreEntry.COLUMN_NAME_KEY} LIKE 'form-%'`;

        const keyvalueStores: KeyValueStoreEntry.SchemaMap[] = await this.dbService.execute(query, true).toPromise();

        await this.dbService.execute(`DELETE FROM ${KeyValueStoreEntry.TABLE_NAME}`, true);
        keyvalueStores.forEach(async (keyValueInDb: KeyValueStoreEntry.SchemaMap) => {
            await this.dbService.insert({
                table: KeyValueStoreEntry.TABLE_NAME,
                useExternalDb: true,
                modelJson: keyValueInDb
            });
        });

    }


    private async cleanTable(tableName: string, coloumn: string, entities: string[]) {
        if (!entities || !entities.length) {
            return;
        }
        const entityFilter: string = ArrayUtil.joinPreservingQuotes(entities);
        const query =
            `DELETE FROM ${tableName}
             WHERE ${coloumn}  NOT IN(${entityFilter})`;
        await this.dbService.execute(query, true).toPromise();
    }
}
