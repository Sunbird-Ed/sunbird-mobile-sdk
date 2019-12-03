import {DbService} from '../../../db';
import {ImportProfileContext} from '../../def/import-profile-context';
import {ProfileEntry} from '../../db/schema';
import {Response} from '../../../api';

export class TransportProfiles {
    constructor(private dbService: DbService) {
    }

    public execute(importContext: ImportProfileContext): Promise<Response> {
        const response: Response = new Response();
        return this.dbService.read({
            table: ProfileEntry.TABLE_NAME,
            orderBy: `${ProfileEntry.COLUMN_NAME_HANDLE} asc`,
            useExternalDb: true
        }).toPromise().then((profiles: ProfileEntry.SchemaMap[]) => {
            return this.saveProfilesToDb(importContext, profiles);
        }).then(() => {
            response.body = importContext;
            return response;
        });
    }

    private async saveProfilesToDb(importContext: ImportProfileContext, profiles: ProfileEntry.SchemaMap[]) {
        let imported = 0;
        let failed = 0;
        for (const profile of profiles) {
            const existingProfile: ProfileEntry.SchemaMap[] = await this.dbService.read({
                table: ProfileEntry.TABLE_NAME,
                selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                selectionArgs: [profile[ProfileEntry.COLUMN_NAME_UID]],
                limit: '1'
            }).toPromise();

            if (!existingProfile || !existingProfile.length) {
                if (!profile[ProfileEntry.COLUMN_NAME_CREATED_AT]) {
                    profile[ProfileEntry.COLUMN_NAME_CREATED_AT] = new Date().getTime();
                }
                delete profile[ProfileEntry._ID];
                await this.dbService.insert({
                    table: ProfileEntry.TABLE_NAME,
                    modelJson: profile
                }).toPromise();
                imported++;
                importContext.imported = imported;
            } else {
                failed++;
                importContext.failed = failed;
            }
        }
        importContext.failed = failed;
        importContext.imported = imported;
    }

}
