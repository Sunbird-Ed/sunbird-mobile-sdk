import {DbService, Migration} from '..';
import {ContentEntry} from '../../content/db/schema';
import {ContentData} from '../../content';
import {ContentUtil} from '../../content/util/content-util';
import COLUMN_NAME_LOCAL_DATA = ContentEntry.COLUMN_NAME_LOCAL_DATA;
import COLUMN_NAME_CONTENT_STATE = ContentEntry.COLUMN_NAME_CONTENT_STATE;
import COLUMN_NAME_SERVER_DATA = ContentEntry.COLUMN_NAME_SERVER_DATA;
import COLUMN_NAME_DIALCODES = ContentEntry.COLUMN_NAME_DIALCODES;
import COLUMN_NAME_IDENTIFIER = ContentEntry.COLUMN_NAME_IDENTIFIER;
import COLUMN_NAME_CHILD_NODES = ContentEntry.COLUMN_NAME_CHILD_NODES;

export class ContentDialcodeMigration extends Migration {

    constructor() {
        super(11, 26);
    }

    public async apply(dbService: DbService) {
        await Promise.all(this.queries().map((query) => dbService.execute(query).toPromise()));
        await this.updateEntries(dbService);
        return undefined;
    }

    queries(): Array<string> {
        return [
            ContentEntry.getAlterEntryForDialCode(),
            ContentEntry.getAlterEntryForChildNodes()
        ];
    }

    private async updateEntries(dbService: DbService) {
        dbService.beginTransaction();

        try {
            const entries: ContentEntry.SchemaMap[] = await dbService.read({
                table: ContentEntry.TABLE_NAME
            }).toPromise();

            const contentDataMap: Map<string, ContentData> = entries.reduce((acc, entry) => {
                if (entry[COLUMN_NAME_LOCAL_DATA] && ContentUtil.isAvailableLocally(entry[COLUMN_NAME_CONTENT_STATE]!)) {
                    const localData: ContentData = JSON.parse(entry[COLUMN_NAME_LOCAL_DATA]);
                    if (localData.dialcodes || localData.childNodes) {
                        acc.set(entry[COLUMN_NAME_IDENTIFIER], localData);
                    }
                } else if (entry[COLUMN_NAME_SERVER_DATA]) {
                    const serverData: ContentData = JSON.parse(entry[COLUMN_NAME_SERVER_DATA]);
                    if (serverData.dialcodes || serverData.childNodes) {
                        acc.set(entry[COLUMN_NAME_IDENTIFIER], serverData);
                    }
                }

                return acc;
            }, new Map());

            if (!contentDataMap.size) {
                dbService.endTransaction(true);
                return;
            }

            const dialcodeCases = this.buildDialcodesCases(contentDataMap);
            const childNodeCases = this.buildChildNodesCases(contentDataMap);
            const updateQuery = `UPDATE ${ContentEntry.TABLE_NAME} SET ${dialcodeCases} ${dialcodeCases && childNodeCases ? ',' : ''} ${childNodeCases} WHERE ${COLUMN_NAME_IDENTIFIER} IN(${Array.from(contentDataMap.keys()).map(id => `'${id}'`).join(',')});`.trim();

            dbService.execute(updateQuery);

            dbService.endTransaction(true);
        } catch (e) {
            console.error(e);
            dbService.endTransaction(false);
            throw e;
        }
    }

    private buildDialcodesCases(
        contentDataMap: Map<string, ContentData>,
    ) {
        if (!Array.from(contentDataMap.entries()).some(([_, content]) => !!(content.dialcodes && content.dialcodes.length))) {
            return '';
        }

        return Array.from(contentDataMap.entries()).reduce<string>((acc, [identifier, content]) => {
            const serializedDialcodes = ContentUtil.getContentAttribute(content.dialcodes);
            return serializedDialcodes ? acc.concat(` WHEN '${identifier}' THEN '${serializedDialcodes}' `) : acc;
        }, ` ${COLUMN_NAME_DIALCODES} = CASE ${COLUMN_NAME_IDENTIFIER} `).concat(' ELSE \'\' END ');
    }

    private buildChildNodesCases(
        contentDataMap: Map<string, ContentData>,
    ) {
        if (!Array.from(contentDataMap.entries()).some(([_, content]) => !!(content.childNodes && content.childNodes.length))) {
            return '';
        }

        return Array.from(contentDataMap.entries()).reduce<string>((acc, [identifier, content]) => {
            const serializedChildNodes = ContentUtil.getContentAttribute(content.childNodes);
            return serializedChildNodes ? acc.concat(` WHEN '${identifier}' THEN '${serializedChildNodes}' `) : acc;
        }, ` ${COLUMN_NAME_CHILD_NODES} = CASE ${COLUMN_NAME_IDENTIFIER} `).concat(' ELSE \'\' END ');
    }
}
