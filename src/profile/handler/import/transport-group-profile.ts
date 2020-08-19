import {DbService} from '../../../db';
import {ImportProfileContext} from '../../def/import-profile-context';
import {Response} from '../../../api';
import {GroupProfileEntry} from '../../../group-deprecated/db/schema';

export class TransportGroupProfile {
    constructor(private dbService: DbService) {
    }

    public execute(importContext: ImportProfileContext): Promise<Response> {
        const response: Response = new Response();
        return this.dbService.read({
            table: GroupProfileEntry.TABLE_NAME,
            useExternalDb: true
        }).toPromise().then((groupProfiles: GroupProfileEntry.SchemaMap[]) => {
            return this.saveGroupProfilesToDb(importContext, groupProfiles);
        }).then(() => {
            response.body = importContext;
            return response;
        });
    }

    private async saveGroupProfilesToDb(importContext: ImportProfileContext, groupProfiles: GroupProfileEntry.SchemaMap[]) {
        groupProfiles.forEach(async (groupProfile: GroupProfileEntry.SchemaMap) => {
            delete groupProfile[GroupProfileEntry._ID];
            const existingGroupProfile: GroupProfileEntry.SchemaMap[] = await this.dbService.read({
                table: GroupProfileEntry.TABLE_NAME,
                selection: `${GroupProfileEntry.COLUMN_NAME_GID} = ? AND ${GroupProfileEntry.COLUMN_NAME_UID} = ?`,
                selectionArgs: [groupProfiles[GroupProfileEntry.COLUMN_NAME_GID], groupProfile[GroupProfileEntry.COLUMN_NAME_UID]],
                limit: '1'
            }).toPromise();
            if (!existingGroupProfile || !existingGroupProfile.length) {
                await this.dbService.insert({
                    table: GroupProfileEntry.TABLE_NAME,
                    modelJson: groupProfile
                });
            }
        });

    }

}
