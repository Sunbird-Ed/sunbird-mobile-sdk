import {DbService, Migration} from '..';
import {ContentEntry, ContentAccessEntry} from '../../content/db/schema';
import {CsPrimaryCategoryMapper} from '@project-sunbird/client-services/services/content/utilities/primary-category-mapper';
import {ContentUtil} from '../../content/util/content-util';
import {ContentData} from '../../content';

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
        let contentData: ContentData;
        if (entry[ContentEntry.COLUMN_NAME_LOCAL_DATA] && ContentUtil.isAvailableLocally(entry[ContentEntry.COLUMN_NAME_CONTENT_STATE]!)) {
          contentData = JSON.parse(entry[ContentEntry.COLUMN_NAME_LOCAL_DATA]);
        } else if (entry[ContentEntry.COLUMN_NAME_SERVER_DATA]) {
          contentData = JSON.parse(entry[ContentEntry.COLUMN_NAME_SERVER_DATA]);
        }

        const resourceType = contentData! ? contentData!.resourceType : undefined;
        const primaryCategory = CsPrimaryCategoryMapper.getPrimaryCategory(
          entry[ContentEntry.COLUMN_NAME_CONTENT_TYPE],
          entry[ContentEntry.COLUMN_NAME_MIME_TYPE], resourceType).toLowerCase();
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
