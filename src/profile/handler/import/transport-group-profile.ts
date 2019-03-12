import {DbService} from '../../../db';
import {ImportProfileContext} from '../../def/import-profile-context';
import {ProfileEntry, UserEntry} from '../../db/schema';
import {Response} from '../../../api';
import {GroupProfile} from '../../../group';
import {GroupProfileEntry} from '../../../group/db/schema';

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
