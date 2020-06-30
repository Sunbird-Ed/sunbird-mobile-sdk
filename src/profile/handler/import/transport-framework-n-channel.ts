import {DbService} from '../../../db';
import {ImportProfileContext} from '../../def/import-profile-context';
import {Response} from '../../../api';
import {GroupProfileEntry} from '../../../group-deprecated/db/schema';
import {KeyValueStoreEntry} from '../../../key-value-store/db/schema';

export class TransportFrameworkNChannel {
    constructor(private dbService: DbService) {
    }

    public execute(importContext: ImportProfileContext): Promise<Response> {
        const response: Response = new Response();
        return this.dbService.read({
            table: KeyValueStoreEntry.TABLE_NAME,
            useExternalDb: true
        }).toPromise().then((keyValueStoreEntriesInExternalDb: KeyValueStoreEntry.SchemaMap[]) => {
            return this.saveNoSqlEntryToDb(keyValueStoreEntriesInExternalDb);
        }).then(() => {
            response.body = importContext;
            return response;
        });
    }

    private async saveNoSqlEntryToDb(keyValueStoreEntriesInExternalDb: KeyValueStoreEntry.SchemaMap[]) {
        keyValueStoreEntriesInExternalDb.forEach(async (keyValueStoreEntryInExternalDb: KeyValueStoreEntry.SchemaMap) => {
            delete keyValueStoreEntryInExternalDb[KeyValueStoreEntry._ID];
            const existingKeyvalueStore: GroupProfileEntry.SchemaMap[] = await this.dbService.read({
                table: KeyValueStoreEntry.TABLE_NAME,
                selection: `${KeyValueStoreEntry.COLUMN_NAME_KEY} = ?`,
                selectionArgs: [keyValueStoreEntryInExternalDb[KeyValueStoreEntry.COLUMN_NAME_KEY]],
                limit: '1'
            }).toPromise();
            if (!existingKeyvalueStore || !existingKeyvalueStore.length) {
                await this.dbService.insert({
                    table: KeyValueStoreEntry.TABLE_NAME,
                    modelJson: keyValueStoreEntryInExternalDb
                }).toPromise();
            }
        });

    }



}
