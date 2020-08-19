import {DbService} from '../../../db';
import {ImportProfileContext} from '../../def/import-profile-context';
import {Response} from '../../../api';
import {GroupEntry} from '../../../group-deprecated/db/schema';

export class TransportGroup {
    constructor(private dbService: DbService) {
    }

    public execute(importContext: ImportProfileContext): Promise<Response> {
        const response: Response = new Response();
        return this.dbService.read({
            table: GroupEntry.TABLE_NAME,
            useExternalDb: true
        }).toPromise().then((groups: GroupEntry.SchemaMap[]) => {
            return this.saveGroupsToDb(importContext, groups);
        }).then(() => {
            response.body = importContext;
            return response;
        });
    }

    private async saveGroupsToDb(importContext: ImportProfileContext, groups: GroupEntry.SchemaMap[]) {
        let imported = 0;
        let failed = 0;
        groups.forEach(async (group: GroupEntry.SchemaMap) => {
            const existingGroup: GroupEntry.SchemaMap[] = await this.dbService.read({
                table: GroupEntry.TABLE_NAME,
                selection: `${GroupEntry.COLUMN_NAME_GID} = ?`,
                selectionArgs: [group[GroupEntry.COLUMN_NAME_GID]],
                limit: '1'
            }).toPromise();
            if (!existingGroup || !existingGroup.length) {
                if (!group[GroupEntry.COLUMN_NAME_CREATED_AT]) {
                    group[GroupEntry.COLUMN_NAME_CREATED_AT] = Date.now();
                }
                await this.dbService.insert({
                    table: GroupEntry.TABLE_NAME,
                    modelJson: group
                }).toPromise();
                imported++;

            } else {
                failed++;
            }

        });
        importContext.failed = importContext.failed ? importContext.failed + failed : failed;
        importContext.imported = importContext.imported ? importContext.imported + imported : imported;
    }

}
