import {DbService, Migration} from '..';
import {ErrorStackEntry} from '../../error/db/schema';

export class ErrorStackMigration extends Migration {

    constructor() {
        super(7, 22);
    }

    public async apply(dbService: DbService) {
        this.queries().forEach(async (query) => {
            await dbService.execute(query).toPromise();
        });

        return undefined;
    }

    queries(): Array<string> {
        return [
            ErrorStackEntry.getCreateEntry()
        ];
    }
}
