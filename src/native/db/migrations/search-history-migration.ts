import {DbService, Migration} from '../index';
import {SearchHistoryEntry} from '../../../services/search-history/db/schema';

export class SearchHistoryMigration extends Migration {

    constructor() {
        super(8, 23);
    }

    public async apply(dbService: DbService) {
        this.queries().forEach(async (query) => {
            await dbService.execute(query).toPromise();
        });

        return undefined;
    }

    queries(): Array<string> {
        return [
            SearchHistoryEntry.getCreateEntry()
        ];
    }
}