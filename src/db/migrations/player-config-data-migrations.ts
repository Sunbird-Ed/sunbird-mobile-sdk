import {Migration} from '../def/migration';
import {DbService} from '../def/db-service';
import {PlayerConfigEntry} from '../../player/db/schema';

export class PlayerConfigDataMigrations extends Migration {


    constructor() {
        super(16, 29);
    }

    public async apply(dbService: DbService) {
        this.queries().forEach(async (query) => {
            await dbService.execute(query).toPromise();
        });
        return undefined;
    }

    queries(): Array<string> {
        return [
            PlayerConfigEntry.getAlterEntryForPlayerConfig()
        ];
    }

}
