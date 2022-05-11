import {ContentData, ContentErrorCode, ContentImportStatus, FileName, ImportContentContext, Visibility} from '../..';
import {Response} from '../../../api';
import {FileService} from '../../../util/file/def/file-service';
import {ContentUtil} from '../../util/content-util';
import {AppConfig} from '../../../api/config/app-config';
import {DbService} from '../../../db';
import {GetContentDetailsHandler} from '../get-content-details-handler';
import {ContentEntry} from '../../db/schema';
import {ArrayUtil} from '../../../util/array-util';
import { HierarchyManifestConversion } from './hierarchy-manifest-conversion';

export class ValidateEcar {

    constructor(private fileService: FileService,
                private dbService: DbService,
                private appConfig: AppConfig,
                private getContentDetailsHandler: GetContentDetailsHandler) {
    }

    public async execute(importContext: ImportContentContext): Promise<Response> {
        const response: Response = new Response();
        let data;
        try{
            data = await this.fileService.readAsText(importContext.tmpLocation!, FileName.HIERARCHY.valueOf());

            if(data){
                const newData = JSON.parse(data);
                newData['archive'] = new HierarchyManifestConversion().hierarchyToManifestConversion(newData.content);
                delete newData.content;
                data = JSON.stringify(newData);
            }
        } catch {
            data = await this.fileService.readAsText(importContext.tmpLocation!, FileName.MANIFEST.valueOf());
        }

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
        if (!archive.items) {
            response.errorMesg = ContentErrorCode.IMPORT_FAILED_NO_CONTENT_METADATA.valueOf();
            await this.fileService.removeRecursively(importContext.tmpLocation!);
            throw response;
        }

        importContext.manifestVersion = manifestJson.ver;
        importContext.items = [];

        const items = archive.items;
        const contentIds: string[] = [];
        // TODO: Following loop can be replaced with childNodes of root content.
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
            const status = item.status;
            const isDraftContent: boolean = ContentUtil.isDraftContent(status);
            // Draft content expiry .To prevent import of draft content if the expires date is lesser than from the current date.
            if (isDraftContent && ContentUtil.isExpired(item.expires)) {
                this.skipContent(importContext, identifier, visibility, ContentImportStatus.CONTENT_EXPIRED, items);
                continue;
            }

            // If more than 1 root content is bundled in ecar then initialize the isRootExists to false.
            if (visibility === Visibility.DEFAULT.valueOf()) {
                isRootExists = false;
            }

            const existingContentModel: ContentEntry.SchemaMap = result[identifier];
            let existingContentPath;

            if (existingContentModel) {
                const refCount: number | undefined = existingContentModel[ContentEntry.COLUMN_NAME_REF_COUNT];
                existingContentPath = existingContentModel[ContentEntry.COLUMN_NAME_PATH];

                // If more than 1 root content is bundled in ecar then initialize the isRootExists to false.
                if (existingContentPath
                    && visibility === Visibility.DEFAULT.valueOf()  // Check only for root nodes
                    && refCount && refCount > 0) {  // refCount = 0 means that content was imported and then deleted from the device,
                    // which will consider as not imported if its equals to zero.
                    isRootExists = true;

                    const existingContentData: ContentData = JSON.parse(existingContentModel[ContentEntry.COLUMN_NAME_LOCAL_DATA]);
                    if (existingContentData
                        && item.pkgVersion > existingContentData.pkgVersion
                        && existingContentData.childNodes && existingContentData.childNodes.length > 0) {
                        importContext.contentIdsToDelete = new Set(existingContentData.childNodes);
                    }
                }
            }

            // To check whether the file is already imported or not
            if (existingContentPath     // Check if path of old content is not empty.
                && visibility === Visibility.DEFAULT.valueOf() // If visibility is Parent then invoke ExtractPayloads
                && !ContentUtil.isDuplicateCheckRequired(isDraftContent, item.pkgVersion) // Check if its draft and pkgVersion is 0.
                && ContentUtil.isImportFileExist(existingContentModel, item) // Check whether the file is already imported or not.
            ) {
                importContext.rootIdentifier = identifier;
                this.skipContent(importContext, identifier, visibility, ContentImportStatus.ALREADY_EXIST, items);
                continue;
            }

            if (isRootExists
                // If new content is added in the updated version then do not add in existedContentIdentifiers
                && importContext.contentIdsToDelete.delete(identifier)) {
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
                        contentImportStatus: ContentImportStatus, items) {
        if (visibility === Visibility.DEFAULT) {
            if (contentImportStatus === ContentImportStatus.ALREADY_EXIST) {
                if (items && items.length === 1) {
                    importContext.contentImportResponseList!.push({identifier: identifier, status: contentImportStatus});
                }
            } else {
                importContext.contentImportResponseList!.push({identifier: identifier, status: contentImportStatus});
            }
        }
        importContext.skippedItemsIdentifier!.push(identifier);
    }
}
