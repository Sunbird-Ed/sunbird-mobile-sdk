import {ZipService} from '../../../util/zip/def/zip-service';
import {ExportContentContext} from '../..';
import {Response} from '../../../api';
import {ContentEntry} from '../../db/schema';
import COLUMN_NAME_LOCAL_DATA = ContentEntry.COLUMN_NAME_LOCAL_DATA;
import {ContentUtil} from '../../util/content-util';
import COLUMN_NAME_CONTENT_STATE = ContentEntry.COLUMN_NAME_CONTENT_STATE;
import {FileService} from '../../../util/file/def/file-service';
import COLUMN_NAME_IDENTIFIER = ContentEntry.COLUMN_NAME_IDENTIFIER;
import COLUMN_NAME_PATH = ContentEntry.COLUMN_NAME_PATH;

export class CompressContent {
    constructor(private zipService: ZipService,
                private fileService: FileService) {
    }

    execute(exportContentContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        exportContentContext.contentModelsToExport.forEach(async (contentInDb) => {
            const contentData = JSON.parse(contentInDb[COLUMN_NAME_LOCAL_DATA]);
            if (!ContentUtil.isAvailableLocally(contentInDb[COLUMN_NAME_CONTENT_STATE])
                || ContentUtil.isOnlineContent(contentData)
                || ContentUtil.isInlineIdentity(contentData.contentDisposition, contentData.contentEncoding)) {
                return;
            }
            const artifactUrl = contentData.artifactUrl;
            if (artifactUrl) {
                const payload = exportContentContext.tmpLocationPath!.concat(artifactUrl);
                const path = contentInDb[COLUMN_NAME_PATH];
                const skipDirectoriesName: string[] = [];
                const skipFilesName: string[] = [];
                skipDirectoriesName.push(contentInDb[COLUMN_NAME_IDENTIFIER]);
                skipFilesName.push(contentInDb[COLUMN_NAME_IDENTIFIER].concat('/', 'manifest.json'));
                await this.fileService.createFile(exportContentContext.tmpLocationPath!, artifactUrl, true);
                await this.zipService.zip(path, payload, skipDirectoriesName, skipFilesName);
            }

        });
        response.body = exportContentContext;
        return Promise.resolve(response);
    }

}
