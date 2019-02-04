import {DbService, Migration} from '..';

export class MillisecondsToSecondsMigration extends Migration {

    constructor() {
        super(4, 19);
    }

    public async apply(dbService: DbService) {
        this.queries().forEach(async (query) => {
            await dbService.execute(query);
        });

        return undefined;
    }

    queries(): Array<string> {
        return [
        ];
    }


}
