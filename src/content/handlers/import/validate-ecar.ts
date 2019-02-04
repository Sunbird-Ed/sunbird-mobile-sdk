import {ImportContentContext} from '../..';
import {Response} from '../../../api';
import {ContentImportStatus, ErrorCode, Visibility} from '../../util/content-constants';
import {FileService} from '../../../util/file/def/file-service';
import {ContentUtil} from '../../util/content-util';
import {AppConfig} from '../../../api/config/app-config';
import {DbService} from '../../../db';
import {GetContentDetailsHandler} from '../get-content-details-handler';
import {ContentEntry} from '../../db/schema';
import COLUMN_NAME_PATH = ContentEntry.COLUMN_NAME_PATH;

export class ValidateEcar {
    private readonly MANIFEST_FILE_NAME = 'manifest.json';

    constructor(private fileService: FileService,
                private dbService: DbService) {
    }

    execute(tempLocationPath: string, importContext: ImportContentContext, appConfig: AppConfig): Promise<Response> {
        const response: Response = new Response();
        return this.fileService.readAsText(tempLocationPath, this.MANIFEST_FILE_NAME).then((data) => {
            if (!data) {
                response.errorMesg = ErrorCode.IMPORT_FAILED_MANIFEST_FILE_NOT_FOUND.valueOf();
                return Promise.reject(response);
            }
            const manifestJson = JSON.parse(data);
            if (manifestJson.ver === 1.0) {
                response.errorMesg = ErrorCode.IMPORT_FAILED_UNSUPPORTED_MANIFEST.valueOf();
                return Promise.reject(response);
            }
            const archive = manifestJson.archive;
            const items = [];
            if (!archive.items) {
                response.errorMesg = ErrorCode.IMPORT_FAILED_NO_CONTENT_METADATA.valueOf();
                return Promise.reject(response);
            }
            importContext.manifestVersion = manifestJson.ver;

            items.forEach(async (element: any) => {
                const identifier = element.identifier;
                const visibility = ContentUtil.readVisibility(element);
                const compatibilityLevel = ContentUtil.readCompatibilityLevel(element);
                if (visibility === Visibility.DEFAULT
                    && !ContentUtil.isCompatible(appConfig, compatibilityLevel)) {
                    this.skipContent(importContext, identifier, visibility, ContentImportStatus.NOT_COMPATIBLE);
                    return;
                }

                const status = element.status;
                const isDraftContent: boolean = ContentUtil.isDraftContent(status);
                // Draft content expiry .To prevent import of draft content if the expires date is lesser than from the current date.
                if (isDraftContent && ContentUtil.isExpired(element.expires)) {
                    this.skipContent(importContext, identifier, visibility, ContentImportStatus.CONTENT_EXPIRED);
                    return;
                }

                const contentDetailsHandler = new GetContentDetailsHandler(this.dbService);
                const existingContentModel: ContentEntry.SchemaMap[] = await contentDetailsHandler.getContentFromDB(identifier);
                let existingContentPath;
                if (existingContentModel && existingContentModel[0]) {
                    existingContentPath = existingContentModel[0][COLUMN_NAME_PATH];
                }

                // To check whether the file is already imported or not
                if (existingContentPath     // Check if path of old content is not empty.
                    && visibility === Visibility.DEFAULT.valueOf() // If visibility is Parent then invoke ExtractPayloads
                    && !ContentUtil.isDuplicateCheckRequired(isDraftContent, element.pkgVersion) // Check if its draft and pkgVersion is 0.
                    && ContentUtil.isImportFileExist(existingContentModel[0], element)// Check whether the file is already imported or not.
                ) {
                    this.skipContent(importContext, identifier, visibility, ContentImportStatus.ALREADY_EXIST);
                    return;
                }

                importContext.items.push(element);

            });
            response.body = importContext;
            return Promise.resolve(response);

        });
    }

    /**
     * Skip the content.
     */
    private skipContent(importContext: ImportContentContext, identifier: string, visibility: string,
                        contentImportStatus: ContentImportStatus) {
        if (visibility === Visibility.DEFAULT) {
            importContext.contentImportResponseList.push({identifier: identifier, status: contentImportStatus});
        }
        importContext.skippedItemsIdentifier.push(identifier);
    }
}
