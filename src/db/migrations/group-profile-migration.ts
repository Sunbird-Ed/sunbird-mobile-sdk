import {DbService, Migration} from '..';
import {GroupEntry, GroupProfileEntry, ProfileEntry} from '../../profile/db/schema';
import {ProfileSource} from '../../profile';
import {map} from 'rxjs/operators';

export class GroupProfileMigration extends Migration {

    constructor() {
        super(3, 18);
    }

    public async apply(dbService: DbService) {
        this.queries().forEach(async (query) => {
            await dbService.execute(query).toPromise();
        });

        await dbService.read({
            table: ProfileEntry.TABLE_NAME,
            columns: []
        }).pipe(
            map((rows: ProfileEntry.SchemaMap[]) => {
                rows.forEach(async (row: ProfileEntry.SchemaMap) => {
                    if (row[ProfileEntry.COLUMN_NAME_UID] === row[ProfileEntry.COLUMN_NAME_HANDLE]) {
                        row[ProfileEntry.COLUMN_NAME_SOURCE] = ProfileSource.SERVER.valueOf();

                    } else {
                        row[ProfileEntry.COLUMN_NAME_SOURCE] = ProfileSource.LOCAL.valueOf();
                    }
                    await dbService.update({
                        table: ProfileEntry.TABLE_NAME,
                        modelJson: row
                    }).toPromise();
                });
            })
        ).toPromise();

        return undefined;
    }

    queries(): Array<string> {
        return [
            GroupProfileEntry.getCreateEntry(),
            GroupEntry.getCreateEntry()
        ];
    }

    private updateProfileTable() {

    }


}
