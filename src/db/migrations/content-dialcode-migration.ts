import {DbService, Migration} from '..';
import {ContentEntry, ContentMarkerEntry} from '../../content/db/schema';
import {map} from 'rxjs/operators';

export class ContentDialcodeMigration extends Migration {

  constructor() {
    super(11, 26);
  }

  public async apply(dbService: DbService) {
    await Promise.all(this.queries().map((query) => dbService.execute(query).toPromise()));
    return undefined;
  }

  queries(): Array<string> {
    return [
      ContentEntry.getAlterEntryForDialCode(),
      ContentEntry.getAlterEntryForChildNodes()
    ];
  }

}
