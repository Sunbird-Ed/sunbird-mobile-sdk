import {DbService, Migration} from '..';
import {ContentEntry, ContentAccessEntry} from '../../content/db/schema';
import {CategoryMapper} from '../../content/util/category-mapper';

export class ContentGeneralizationMigration extends Migration {

  constructor() {
    super(15, 28);
  }

  public async apply(dbService: DbService) {
    await Promise.all(this.queries().map((query) => dbService.execute(query).toPromise()));
    await this.updateContentTable(dbService);
    return undefined;
  }

  private async updateContentTable(dbService: DbService) {
    dbService.beginTransaction();

    try {
      const entries: ContentEntry.SchemaMap[] = await dbService.read({
        table: ContentEntry.TABLE_NAME
      }).toPromise();
      const contentMap: Map<string, string> = entries.reduce((acc, entry) => {
        const primaryCategory = CategoryMapper.getPrimaryCategory(
          entry[ContentEntry.COLUMN_NAME_CONTENT_TYPE], entry[ContentEntry.COLUMN_NAME_MIME_TYPE]).toLowerCase();
        acc.set(entry[ContentEntry.COLUMN_NAME_IDENTIFIER], primaryCategory);
        return acc;
      }, new Map());

      if (!contentMap.size) {
        dbService.endTransaction(true);
        return;
      }

      const primaryCategoryCases = this.buildPrimaryCategoryCases(contentMap);
      const updateQuery = `UPDATE ${ContentEntry.TABLE_NAME} SET ${primaryCategoryCases};`.trim();
      await dbService.execute(updateQuery).toPromise();

      dbService.endTransaction(true);
    } catch (e) {
      console.error(e);
      dbService.endTransaction(false);
      throw e;
    }
  }

  private buildPrimaryCategoryCases(contentMap: Map<string, string>) {
    return Array.from(contentMap.entries()).reduce<string>((acc, [identifier, primaryCategory]) => {
      return primaryCategory ? acc.concat(` WHEN '${identifier}' THEN '${primaryCategory}' `) : acc;
    }, ` ${ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY} = CASE ${ContentEntry.COLUMN_NAME_IDENTIFIER} `).concat(' ELSE \'\' END ');
  }

  queries(): Array<string> {
    return [
      ContentEntry.getAlterEntryForPrimaryCategory(),
    ];
  }
}
