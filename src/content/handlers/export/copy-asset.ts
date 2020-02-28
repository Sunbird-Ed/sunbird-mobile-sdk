import {FileService} from '../../../util/file/def/file-service';
import {ExportContentContext} from '../..';
import {Entry} from '../../../util/file';
import {ContentEntry} from '../../db/schema';
import {ContentUtil} from '../../util/content-util';
import {Response} from '../../../api';
import {ContentErrorCode} from '../../util/content-constants';

export class CopyAsset {

    constructor(private fileService: FileService) {
    }

    public async execute(exportContentContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        try {
            let i = 0;
            for (const element of exportContentContext.contentModelsToExport) {
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

    private async copyFile(sourcePath: string, destinationPath: string, fileName: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            buildconfigreader.copyFile(sourcePath, destinationPath, fileName,
                () => {
                    resolve();
                }, err => {
                    console.error(err);
                    resolve(err);
                });
        });
    }
}
