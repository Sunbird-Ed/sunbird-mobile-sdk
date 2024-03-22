import {ContentErrorCode, ExportContentContext} from '../..';
import {ContentEntry} from '../../db/schema';
import {ContentUtil} from '../../util/content-util';
import {Response} from '../../../api';

export class CopyAsset {

    constructor() {
    }

    public async execute(exportContentContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        try {
            let i = 0;
            let subContentsInDb: ContentEntry.SchemaMap[] = [];
            if (exportContentContext.subContentIds != null && exportContentContext.subContentIds.length > 0) {
                subContentsInDb = this.excludeContentForSubModule(exportContentContext.contentModelsToExport,
                    exportContentContext.subContentIds);
            }

            let contentModelsToExport: ContentEntry.SchemaMap[] = exportContentContext.contentModelsToExport;
            if (subContentsInDb && subContentsInDb.length > 0) {
                contentModelsToExport = subContentsInDb;
            }

            for (const element of contentModelsToExport) {
                const contentInDb = element as ContentEntry.SchemaMap;
                const contentData = exportContentContext.items![i];
                const appIcon = contentData['appIcon'];
                const setPreviewUrl = contentData['itemSetPreviewUrl'];

                for (const item of [appIcon, setPreviewUrl]) {
                    if (item && !item.startsWith('https:')) {
                        try {
                            await this.copyFile(
                                contentInDb[ContentEntry.COLUMN_NAME_PATH]!,
                                exportContentContext.tmpLocationPath!,
                                item
                            );
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }

                const contentDisposition: string = contentData['contentDisposition'];
                const contentEncoding: string = contentData['contentEncoding'];
                if (ContentUtil.isInlineIdentity(contentDisposition, contentEncoding)) {
                    const artifactUrl: string = contentData['artifactUrl'];
                    if (artifactUrl) {
                        try {
                            await this.copyFile(contentInDb[ContentEntry.COLUMN_NAME_PATH]!,
                                exportContentContext.tmpLocationPath!, artifactUrl);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
                i++;
            }
            response.body = exportContentContext;
            return response;
        } catch (e) {
            response.errorMesg = ContentErrorCode.EXPORT_FAILED_COPY_ASSET;
            throw response;
        }
    }

    private excludeContentForSubModule(contentsInDb: ContentEntry.SchemaMap[], subCollectionIds?: string[]) {
        const subCollectionContents: ContentEntry.SchemaMap[] = [];
        contentsInDb.forEach(contentInDb => {
            const identifier = contentInDb['identifier'];
            if (subCollectionIds && subCollectionIds.indexOf(identifier) > -1) {
                subCollectionContents.push(contentInDb);
            }
        });
        return subCollectionContents;
    }

    private async copyFile(sourcePath: string, destinationPath: string, fileName: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            sbutility.copyFile(sourcePath, destinationPath, fileName,
                () => {
                    resolve(true);
                }, err => {
                    console.error(err);
                    resolve(err);
                });
        });
    }
}
