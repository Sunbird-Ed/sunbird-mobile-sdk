import {Observable} from 'rxjs';
import {DbService} from '../../db';
import {Manifest, MoveContentResponse, MoveContentStatus, TransferContentContext} from './transfer-content-handler';
import {ContentUtil} from '../../content/util/content-util';
import {ContentEntry} from '../../content/db/schema';
import {FileService} from '../../util/file/def/file-service';
import COLUMN_NAME_IDENTIFIER = ContentEntry.COLUMN_NAME_IDENTIFIER;
import COLUMN_NAME_LOCAL_DATA = ContentEntry.COLUMN_NAME_LOCAL_DATA;

interface MoveContentResponses {
    moveContentDiffPkgList: MoveContentResponse[];
    moveContentDupContentList: MoveContentResponse[];
}

export class DuplicateContentCheck {
    public static readonly MANIFEST_FILE_NAME = 'manifest.json';

    constructor(private dbService: DbService, private fileService: FileService) {
    }

    execute(context: TransferContentContext): Observable<void> {
        return Observable.defer(async () => {
            const contentEntries = await this.getContentsInDb(context);
            const duplicateContents = (await this.generateMoveContentResponses(context, contentEntries)).moveContentDupContentList;

            context.contentsInSource = contentEntries;
            context.duplicateContents = duplicateContents;
        });
    }

    private async getContentsInDb(context: TransferContentContext): Promise<ContentEntry.SchemaMap[]> {
        if (context.contentIds!.length) {
            return this.dbService.execute(ContentUtil.getFindAllContentsWithIdentifierQuery(context.contentIds!)).toPromise();
        }

        return this.dbService.execute(ContentUtil.getFindAllContentsQuery()).toPromise();
    }

    private getPkgVersionFromFile(destinationContentRootDir: string, contentIdentifier: string): Promise<number> {
        return this.fileService.readAsText(
            destinationContentRootDir.concat(contentIdentifier),
            DuplicateContentCheck.MANIFEST_FILE_NAME
        ).then((manifestStringified) => {
            const manifest: Manifest = JSON.parse(manifestStringified);
            const items: any[] = manifest.archive.items;
            if (items) {
                const matchedItem = items.find((item) => item['identifier'] === contentIdentifier);
                return matchedItem['pkgVersion'];
            } else {
                return 0;
            }

        });
    }

    private async generateMoveContentResponses(context: TransferContentContext, contents: ContentEntry.SchemaMap[]): Promise<MoveContentResponses> {
        const moveContentDiffPkgList: MoveContentResponse[] = [];
        const moveContentDupContentList: MoveContentResponse[] = [];

        for (const content of contents) {
            const destPkgVersion = await this.getPkgVersionFromFile(
                ContentUtil.getContentRootDir(context.destinationFolder!), content[COLUMN_NAME_IDENTIFIER]
            );
            const srcPkgVersion = ContentUtil.readPkgVersion(JSON.parse(content[COLUMN_NAME_LOCAL_DATA]));

            if (destPkgVersion > srcPkgVersion) {
                const moveContentResponse: MoveContentResponse = {
                    identifier: content[COLUMN_NAME_IDENTIFIER],
                    status: MoveContentStatus.HIGHER_VERSION_IN_DESTINATION
                };

                moveContentDiffPkgList.push(moveContentResponse);
                moveContentDupContentList.push(moveContentResponse);
            } else if (destPkgVersion < srcPkgVersion) {
                const moveContentResponse: MoveContentResponse = {
                    identifier: content[COLUMN_NAME_IDENTIFIER],
                    status: MoveContentStatus.LOWER_VERSION_IN_DESTINATION
                };

                moveContentDiffPkgList.push(moveContentResponse);
                moveContentDupContentList.push(moveContentResponse);
            } else {
                const moveContentResponse: MoveContentResponse = {
                    identifier: content[COLUMN_NAME_IDENTIFIER],
                    status: MoveContentStatus.SAME_VERSION_IN_BOTH
                };

                moveContentDupContentList.push(moveContentResponse);
            }
        }

        return {
            moveContentDiffPkgList,
            moveContentDupContentList
        };
    }
}
