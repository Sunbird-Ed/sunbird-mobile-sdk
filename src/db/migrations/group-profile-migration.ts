import {DbService, Migration} from '..';
import {GroupEntry, GroupProfileEntry} from '../../profile/db/schema';

export class GroupProfileMigration extends Migration {

    constructor() {
        super(3, 18);
    }

    public async apply(dbService: DbService) {
        this.queries().forEach(async (query) => {
            await dbService.execute(query);
        });

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
