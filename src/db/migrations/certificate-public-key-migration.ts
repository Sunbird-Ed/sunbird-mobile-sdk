import { CertificatePublicKeyEntry } from '../../certificate/db/schema';
import {DbService, Migration} from '..';

export class CertificatePublicKeyMigration extends Migration {

  constructor() {
    super(17, 30);
  }

  public async apply(dbService: DbService) {
    await Promise.all(this.queries().map((query) => dbService.execute(query).toPromise()));
    return undefined;
  }

  queries(): Array<string> {
    return [
      CertificatePublicKeyEntry.getCreateEntry()
    ];
  }
}
