import {Migration} from '..';
import {DbService} from '../def/db-service';
import {ProfileEntry} from '../../profile/db/schema';
import {ContentEntry} from '../../content/db/schema';

export class FrameworkMigration extends Migration {
    constructor() {
        super(18, 31);
    }

    public async apply(dbService: DbService) {
        this.queries().forEach(async (query) => {
            await dbService.execute(query).toPromise();
        });
        this.updateProfileDB(dbService);

        return undefined;
    }

    queries(): Array<string> {
        return [ProfileEntry.getAlterEntryForProfileCategories()];
    }

    async updateProfileDB(dbService: DbService) {
        try {
            const entries: ProfileEntry.SchemaMap[] = await dbService.read({
                table: ProfileEntry.TABLE_NAME
              }).toPromise();
              entries.forEach(async (val) => {
                const categories = this.getUpdateQueries(val);
                const req = {};
                req[ProfileEntry.COLUMN_NAME_CATEGORIES] = JSON.stringify(categories);
                await dbService.update({
                  table: ProfileEntry.TABLE_NAME,
                  selection: `${ProfileEntry.COLUMN_NAME_UID} = ?`,
                  selectionArgs: [val.uid],
                  modelJson: req
              }).toPromise();
              });
        } catch (e) {
            console.log('error', e);
        }
    }

    private getUpdateQueries(entries) {
        const categories = {};
        categories['fwCategory1'] = entries.board;
        categories['fwCategory2'] = entries.medium;
        categories['fwCategory3'] = entries.grade;
        categories['fwCategory4'] = entries.subject;
        return categories;
    }
}