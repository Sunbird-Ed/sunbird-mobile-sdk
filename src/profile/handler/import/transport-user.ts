import {DbService} from '../../../db';
import {ImportProfileContext} from '../../def/import-profile-context';
import {ProfileEntry, UserEntry} from '../../db/schema';
import {Response} from '../../../api';

export class TransportUser {
    constructor(private dbService: DbService) {
    }

    public execute(importContext: ImportProfileContext): Promise<Response> {
        const response: Response = new Response();
        return this.dbService.read({
            table: UserEntry.TABLE_NAME,
            useExternalDb: true
        }).toPromise().then((users: UserEntry.SchemaMap[]) => {
            return this.saveUsersToDb(importContext, users);
        }).then(() => {
            response.body = importContext;
            return response;
        });
    }

    private async saveUsersToDb(importContext: ImportProfileContext, users: UserEntry.SchemaMap[]) {
        users.forEach(async (user: UserEntry.SchemaMap) => {
            delete user[UserEntry._ID];
            const existingUser: UserEntry.SchemaMap[] = await this.dbService.read({
                table: ProfileEntry.TABLE_NAME,
                selection: `${UserEntry.COLUMN_NAME_UID} = ?`,
                selectionArgs: [user[UserEntry.COLUMN_NAME_UID]],
                limit: '1'
            }).toPromise();
            if (!existingUser || !existingUser.length) {
                await this.dbService.insert({
                    table: UserEntry.TABLE_NAME,
                    modelJson: user
                }).toPromise();
            }
        });

    }

}
