import {FileName, ImportContentContext} from '../..';
import {Response} from '../../../api';
import {ContentErrorCode, ContentImportStatus, Visibility} from '../../util/content-constants';
import {FileService} from '../../../util/file/def/file-service';
import {ContentUtil} from '../../util/content-util';
import {AppConfig} from '../../../api/config/app-config';
import {DbService} from '../../../db';
import {GetContentDetailsHandler} from '../get-content-details-handler';
import {ContentEntry} from '../../db/schema';
import {ArrayUtil} from '../../../util/array-util';
import COLUMN_NAME_PATH = ContentEntry.COLUMN_NAME_PATH;

export class ValidateEcar {

    constructor(private fileService: FileService,
                private dbService: DbService,
                private appConfig: AppConfig,
                private getContentDetailsHandler: GetContentDetailsHandler) {
    }

    public async execute(importContext: ImportContentContext): Promise<Response> {
        const response: Response = new Response();
        const data = await this.fileService.readAsText(importContext.tmpLocation!, FileName.MANIFEST.valueOf());

        if (!data) {
            response.errorMesg = ContentErrorCode.IMPORT_FAILED_MANIFEST_FILE_NOT_FOUND.valueOf();
            await this.fileService.removeRecursively(importContext.tmpLocation!);
            throw response;
        }

        const manifestJson = JSON.parse(data);

        if (manifestJson.ver === 1.0) {
            response.errorMesg = ContentErrorCode.IMPORT_FAILED_UNSUPPORTED_MANIFEST.valueOf();
            await this.fileService.removeRecursively(importContext.tmpLocation!);
            throw response;
        }
        const archive = manifestJson.archive;
        const items = archive.items;
        if (!archive.items) {
            response.errorMesg = ContentErrorCode.IMPORT_FAILED_NO_CONTENT_METADATA.valueOf();
            await this.fileService.removeRecursively(importContext.tmpLocation!);
            throw response;
        }

        importContext.manifestVersion = manifestJson.ver;
        importContext.items = [];

        const contentIds: string[] = [];
        for (const e of items) {
            const item = e as any;
            const identifier = item.identifier;
            contentIds.push(identifier);
        }
        const query = ArrayUtil.joinPreservingQuotes(contentIds);
        const existingContentModels = await this.getContentDetailsHandler.fetchFromDBForAll(query).toPromise();

        const result = existingContentModels.reduce((map, obj) => {
            map[obj.identifier] = obj;
            return map;
        }, {});

        let isRootExists = false;
        importContext.existedContentIdentifiers = {};

        for (const e of items) {
            const item = e as any;
            const identifier = item.identifier;
            const visibility = ContentUtil.readVisibility(item);
            const compatibilityLevel = ContentUtil.readCompatibilityLevel(item);
            if (visibility === Visibility.DEFAULT
                && !ContentUtil.isCompatible(this.appConfig, compatibilityLevel)) {
                this.skipContent(importContext, identifier, visibility, ContentImportStatus.NOT_COMPATIBLE);
                continue;
            }

            const status = item.status;
            const isDraftContent: boolean = ContentUtil.isDraftContent(status);
            // Draft content expiry .To prevent import of draft content if the expires date is lesser than from the current date.
            if (isDraftContent && ContentUtil.isExpired(item.expires)) {
                this.skipContent(importContext, identifier, visibility, ContentImportStatus.CONTENT_EXPIRED);
                continue;
            }

            // If more than 1 root content is bundled in ecar then initialize the isRootExists to false.
            if (visibility === Visibility.DEFAULT.valueOf()) {
                isRootExists = false;
            }

            const existingContentModel = result[identifier];
            let existingContentPath;

            if (existingContentModel) {
                existingContentPath = existingContentModel[COLUMN_NAME_PATH];
            }

            // To check whether the file is already imported or not
            if (existingContentPath     // Check if path of old content is not empty.
                && visibility === Visibility.DEFAULT.valueOf() // If visibility is Parent then invoke ExtractPayloads
                && !ContentUtil.isDuplicateCheckRequired(isDraftContent, item.pkgVersion) // Check if its draft and pkgVersion is 0.
                && ContentUtil.isImportFileExist(existingContentModel, item) // Check whether the file is already imported or not.
            ) {
                isRootExists = true;
                this.skipContent(importContext, identifier, visibility, ContentImportStatus.ALREADY_EXIST);
                continue;
            }

            if (isRootExists && visibility === Visibility.PARENT.valueOf()) {
                importContext.existedContentIdentifiers[identifier] = true;
            }

            importContext.items!.push(item);
        }

        response.body = importContext;
        return response;
    }

    /**
     * Skip the content.
     */
    private skipContent(importContext: ImportContentContext, identifier: string, visibility: string,
                        contentImportStatus: ContentImportStatus) {
        if (visibility === Visibility.DEFAULT) {
            importContext.contentImportResponseList!.push({identifier: identifier, status: contentImportStatus});
        }
        importContext.skippedItemsIdentifier!.push(identifier);
    }
}
