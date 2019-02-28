import {DbService, Migration} from '..';
import {ContentMarkerEntry} from '../../content/db/schema';

export class ContentMarkerMigration extends Migration {

    constructor() {
        super(5, 20);
    }

    public async apply(dbService: DbService) {
        this.queries().forEach(async (query) => {
            await dbService.execute(query).toPromise();
        });

        return undefined;
    }

    queries(): Array<string> {
        return [
            ContentMarkerEntry.getCreateEntry()
        ];
    }


}
