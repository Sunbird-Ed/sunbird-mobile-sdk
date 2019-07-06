import {FileService} from '../../../../native/file/def/file-service';
import {ScanContentContext} from '../../def/scan-requests';
import {DbService} from '../../../../native/db';
import {ContentEntry} from '../../../content/db/schema';
import {ContentUtil} from '../../../content/util/content-util';
import {Observable} from 'rxjs';
import {ArrayUtil} from '../../../../util/array-util';

export class GetModifiedContentHandler {
    constructor(private fileService: FileService,
                private dbService: DbService) {

    }

    public execute(context: ScanContentContext): Observable<ScanContentContext> {
        return Observable.defer(async () => {
            const dbContentIdentifiers = await this.getContentsInDb();
            if (context.currentStoragePath) {
                const destination = ContentUtil.getContentRootDir(context.currentStoragePath).concat('/');
                const folderList = await this.getFolderList(destination);
                context.newlyAddedIdentifiers = await this.getNewlyAddedContents(folderList, dbContentIdentifiers);
                context.deletedIdentifiers = await this.getDeletedContents(folderList, dbContentIdentifiers);
            } else {
                context.newlyAddedIdentifiers = [];
                context.deletedIdentifiers = dbContentIdentifiers;
            }
        }).mapTo(context);
    }

    private doesDestinationStorageExist(destination: string): Promise<boolean> {
        return this.fileService.exists(destination).then((entry: Entry) => {
            return true;
        }).catch(() => {
            return false;
        });
    }

    private async getContentsInDb(): Promise<string[]> {

        return this.dbService.execute(ContentUtil.getFindAllContentsQuery()).map((contentsInDb: ContentEntry.SchemaMap[]) => {
            const dbContentIdentifiers: string[] = contentsInDb
                .filter((contentInDb) => {
                    return contentInDb[ContentEntry.COLUMN_NAME_CONTENT_TYPE].toLowerCase() !== 'textbookunit';
                }).map((contentInDb) => {
                    return contentInDb[ContentEntry.COLUMN_NAME_IDENTIFIER];
                });
            return dbContentIdentifiers;
        }).toPromise();
    }

    private getNewlyAddedContents(folderList: string[], contentIdentifiers: string[]): string[] {
        return folderList.filter(element => !ArrayUtil.contains(contentIdentifiers, element));
    }

    private getDeletedContents(folderList: string[], contentIdentifiers: string[]): string[] {
        return contentIdentifiers.filter(element => !ArrayUtil.contains(folderList, element));
    }

    private getFolderList(destination: string): Promise<string[]> {
        return this.fileService.listDir(destination.replace(/\/$/, ''))
            .then((entries: Entry[]) => {
                const folderList: string[] = entries.map((entry) => {
                    return entry.name;
                });
                return folderList;
            }).catch(() => {
                return [];
            });
    }
}
