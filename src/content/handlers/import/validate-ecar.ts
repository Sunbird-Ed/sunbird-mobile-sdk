import {ImportContentContext} from '../..';
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

    private readonly MANIFEST_FILE_NAME = 'manifest.json';

    constructor(private fileService: FileService,
                private dbService: DbService,
                private appConfig: AppConfig,
                private getContentDetailsHandler: GetContentDetailsHandler) {
    }

    public async execute(importContext: ImportContentContext): Promise<Response> {
        const response: Response = new Response();
        const data = await this.fileService.readAsText(importContext.tmpLocation!, this.MANIFEST_FILE_NAME);

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
            const element = e as any;
            const identifier = element.identifier;
            const visibility = ContentUtil.readVisibility(element);
            // if (ContentUtil.isNotUnit(element.mimeType, visibility)) {
                contentIds.push(identifier);
            // }
        }
        const query = ArrayUtil.joinPreservingQuotes(contentIds);
        const existingContentModels = await this.getContentDetailsHandler.fetchFromDBForAll(query).toPromise();
        console.log(existingContentModels.length);

        const result = existingContentModels.reduce((map, obj) => {
            map[obj.identifier] = obj;
            return map;
        }, {});

        // TODO: Remove the item from items list which does not required any validation.
        //  i.e. if(!this.isNotUnit(element.mimeType, visibility))
        for (const e of items) {
            const element = e as any;
            const identifier = element.identifier;
            const visibility = ContentUtil.readVisibility(element);
            const compatibilityLevel = ContentUtil.readCompatibilityLevel(element);
            if (visibility === Visibility.DEFAULT
                && !ContentUtil.isCompatible(this.appConfig, compatibilityLevel)) {
                this.skipContent(importContext, identifier, visibility, ContentImportStatus.NOT_COMPATIBLE);
                continue;
            }

            const status = element.status;
            const isDraftContent: boolean = ContentUtil.isDraftContent(status);
            // Draft content expiry .To prevent import of draft content if the expires date is lesser than from the current date.
            if (isDraftContent && ContentUtil.isExpired(element.expires)) {
                this.skipContent(importContext, identifier, visibility, ContentImportStatus.CONTENT_EXPIRED);
                continue;
            }

            const existingContentModel = result[identifier];
            let existingContentPath;

            if (existingContentModel) {
                existingContentPath = existingContentModel[COLUMN_NAME_PATH];
            }

            // To check whether the file is already imported or not
            if (existingContentPath     // Check if path of old content is not empty.
                && visibility === Visibility.DEFAULT.valueOf() // If visibility is Parent then invoke ExtractPayloads
                && !ContentUtil.isDuplicateCheckRequired(isDraftContent, element.pkgVersion) // Check if its draft and pkgVersion is 0.
                && ContentUtil.isImportFileExist(existingContentModel, element)// Check whether the file is already imported or not.
            ) {
                this.skipContent(importContext, identifier, visibility, ContentImportStatus.ALREADY_EXIST);
                continue;
            }

            importContext.items!.push(element);
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
