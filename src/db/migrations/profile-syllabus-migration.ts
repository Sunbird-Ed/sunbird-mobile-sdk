import {DbService, Migration} from '..';
import {ProfileEntry} from '../../profile/db/schema';

export class ProfileSyllabusMigration extends Migration {

    constructor() {
        super(2, 17);
    }

    public async apply(dbService: DbService) {
        this.queries().forEach(async (query) => {
            await dbService.execute(query).toPromise();
        });

        return undefined;
    }

    queries(): Array<string> {
        return [
            ProfileEntry.getAlterEntryForProfileSyllabus()
        ];
    }


}
