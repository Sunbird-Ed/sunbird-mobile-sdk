import {ImportContentContext} from '..';
import {Response} from '../../api';
import {ContentDisposition, ContentEncoding, ContentStatus, ErrorCode, State, Visibility, MimeType} from '../util/content-constants';
import {FileService} from '../../util/file/def/file-service';
import {DbService, InsertQuery} from '../../db';
import {ContentUtil} from '../util/content-util';
import {GetContentDetailsHandler} from './get-content-details-handler';
import {ContentEntry} from '../db/schema';
import COLUMN_NAME_PATH = ContentEntry.COLUMN_NAME_PATH;
import {ZipService} from '../../util/zip/def/zip-service';
import COLUMN_NAME_VISIBILITY = ContentEntry.COLUMN_NAME_VISIBILITY;
import COLUMN_NAME_LOCAL_DATA = ContentEntry.COLUMN_NAME_LOCAL_DATA;
import {DirectoryEntry, Metadata} from '../../util/file';
import {AppConfig} from '../../api/config/app-config';
import COLUMN_NAME_REF_COUNT = ContentEntry.COLUMN_NAME_REF_COUNT;
import COLUMN_NAME_CONTENT_STATE = ContentEntry.COLUMN_NAME_CONTENT_STATE;

export class ExtractPayloads {

    constructor(private fileService: FileService,
                private zipService: ZipService,
                private appConfig: AppConfig,
                private dbService: DbService) {
    }

    // execute(tempLocationPath: string, importContext: ImportContentContext): Promise<Response> {
    //     const response: Response = new Response();
    //     importContext.items.forEach(async (element) => {
    //         const identifier = element.identifier;
    //         // skip the content if already imported on the same version
    //         if (importContext.skippedItemsIdentifier
    //             && importContext.skippedItemsIdentifier.indexOf(identifier) > -1) {
    //             return;
    //         }
    //
    //         const mimeType = element.mimeType;
    //         const contentEncoding = element.contentEncoding;
    //         const contentDisposition = element.contentDisposition;
    //         const contentType = ContentUtil.readContentType(element);
    //         let visibility = ContentUtil.readVisibility(element);
    //         const audience = ContentUtil.readVisibility(element);
    //         const compatibilityLevel = ContentUtil.readCompatibilityLevel(element);
    //         const pkgVersion = element.pkgVersion;
    //         const artifactUrl = element.artifactUrl;
    //         const appIcon = element.appIcon;
    //         const posterImage = element.posterImage;
    //         const grayScaleAppIcon = element.grayScaleAppIcon;
    //         const dialCodes = element.dialcodes;
    //         let contentState = State.ONLY_SPINE.valueOf();
    //         let payloadDestination: DirectoryEntry = undefined;
    //         const existingContentModel: ContentEntry.SchemaMap[] =
    //             await new GetContentDetailsHandler(this.dbService).getContentFromDB(identifier);
    //         let existingContentPath;
    //         if (existingContentModel && existingContentModel[0]) {
    //             existingContentPath = existingContentModel[0][COLUMN_NAME_PATH];
    //         }
    //
    //         let doesContentExist: boolean = ContentUtil.doesContentExist(existingContentModel[0], identifier, pkgVersion, false);
    //         let rootNodeIdentifier;
    //         if (visibility === Visibility.DEFAULT.valueOf()) {
    //             rootNodeIdentifier = identifier;
    //         }
    //         // If the content is exist then copy the old content data and add it into new content.
    //         if (doesContentExist && !(element.status === ContentStatus.DRAFT.valueOf())) {
    //             if (existingContentModel[0][COLUMN_NAME_VISIBILITY] === Visibility.DEFAULT.valueOf()) {
    //                 element = JSON.parse(existingContentModel[0][COLUMN_NAME_LOCAL_DATA]);
    //             }
    //         } else {
    //             doesContentExist = false;
    //             payloadDestination = await this.fileService.createDir(ContentUtil.getContentRootDir(
    //                 importContext.destinationFolder), identifier, false);
    //             this.copyAssets(tempLocationPath, appIcon, payloadDestination.toURL());
    //             if (ContentUtil.isCompatible(this.appConfig, compatibilityLevel)) {
    //                 let isUnzippingSuccessfull = false;
    //                 if (artifactUrl) {
    //                     if (!contentDisposition || !contentEncoding ||
    //                         (contentDisposition === ContentDisposition.INLINE.valueOf()
    //                             && contentEncoding === ContentEncoding.GZIP.valueOf())) { // Content with artifact without zip i.e. pfd, mp4
    //                         const payload = tempLocationPath.concat('/', artifactUrl);
    //                         isUnzippingSuccessfull = !Boolean(await this.zipService.unzip(payload, payloadDestination.toURL()));
    //
    //                     } else if (ContentUtil.isInlineIdentity(contentDisposition, contentEncoding)) {
    //                         try {
    //                             this.copyAssets(tempLocationPath, artifactUrl, payloadDestination.toURL());
    //                             isUnzippingSuccessfull = false;
    //                         } catch (e) {
    //                            isUnzippingSuccessfull = false;
    //                         }
    //                     } else if (ContentDisposition.ONLINE.valueOf === contentDisposition) { // Content with no artifact)
    //                         isUnzippingSuccessfull = true;
    //                     }
    //                 }
    //
    //
    //                 // Add or update the content_state
    //                 if (isUnzippingSuccessfull    // If unzip is success it means artifact is available.
    //                     || MimeType.COLLECTION.valueOf() === mimeType) {
    //                     contentState = State.ARTIFACT_AVAILABLE.valueOf();
    //                 } else {
    //                     contentState = State.ONLY_SPINE.valueOf();
    //                 }
    //             }
    //             this.copyAssets(tempLocationPath, appIcon, payloadDestination.toURL());
    //             this.copyAssets(tempLocationPath, posterImage, payloadDestination.toURL());
    //             this.copyAssets(tempLocationPath, grayScaleAppIcon, payloadDestination.toURL());
    //         }
    //
    //         const referenceCount = this.getReferenceCount(existingContentModel, visibility, importContext.isChildContent);
    //         visibility = this.getContentVisibility(existingContentModel, element['objectType'], importContext.isChildContent);
    //         contentState = this.getContentState(existingContentModel, contentState);
    //         const basePath = this.getBasePath(payloadDestination.toURL(), doesContentExist, existingContentPath)
    //         const sizeMetaData: Metadata = await this.fileService.getMetaData(basePath);
    //         ContentUtil.addOrUpdateViralityMetadata(element, '');
    //
    //        return Promise.resolve(response);
    //
    //     });
    // }

    private createInserQuery(identifier, manifestVersion, localData,
                             mimeType, contentType, visibility, path, refCount, contentState, audience, pragma, sizeOnDevice) {
        const modelJson = {};
        modelJson[ContentEntry.COLUMN_NAME_IDENTIFIER] = identifier;
        modelJson[ContentEntry.COLUMN_NAME_MANIFEST_VERSION] = manifestVersion;
        modelJson[ContentEntry.COLUMN_NAME_SERVER_DATA] = '';
        modelJson[ContentEntry.COLUMN_NAME_LOCAL_DATA] = localData;
        modelJson[ContentEntry.COLUMN_NAME_MIME_TYPE] = mimeType;
        modelJson[ContentEntry.COLUMN_NAME_PATH] = path;
        modelJson[ContentEntry.COLUMN_NAME_VISIBILITY] = visibility;
        modelJson[ContentEntry.COLUMN_NAME_CONTENT_TYPE] = contentType;

    }

    async copyAssets(tempLocationPath: string, asset: string, payloadDestinationPath: string) {
        if (asset) {
            const iconSrc = tempLocationPath.concat('/', asset);
            const iconDestination = payloadDestinationPath.concat(asset);
            const folderContainingFile = asset.substring(0, asset.lastIndexOf('/'));
            await this.fileService.createDir(payloadDestinationPath, folderContainingFile, false);
            // If source icon is not available then copy assets is failing and throwing exception.
            await this.fileService.copyFile(iconSrc, folderContainingFile, iconDestination, folderContainingFile);
        }
    }

    /**
     * add or update the reference count for the content
     *
     */
    getReferenceCount(existingContent, visibility: string, isChildContent: boolean): number {
        let refCount: number;
        if (existingContent) {
            refCount = existingContent[COLUMN_NAME_REF_COUNT];

            if (!isChildContent) {    // If import started from child content then do not update the refCount.
                // if the content has a 'Default' visibility and update the same content then don't increase the reference count...
                if (!(Visibility.DEFAULT.valueOf() === (existingContent[COLUMN_NAME_VISIBILITY].getVisibility())
                    && Visibility.DEFAULT.valueOf() === visibility)) {
                    refCount = refCount + 1;
                }
            }
        } else {
            refCount = 1;
        }
        return refCount;
    }

    /**
     * add or update the reference count for the content
     *
     */
    getContentVisibility(existingContentInDb, objectType, isChildContent: boolean): string {
        let visibility;
        if ('Library' === objectType) {
            visibility = Visibility.PARENT.valueOf();
        } else if (existingContentInDb) {
            if (isChildContent     // If import started from child content then do not update the visibility.
                || !Visibility.PARENT.valueOf() ===
                existingContentInDb[COLUMN_NAME_VISIBILITY]) {  // If not started from child content then do not shrink visibility.
                visibility = existingContentInDb[COLUMN_NAME_VISIBILITY];
            }
        }
        return visibility;
    }

    /**
     * Add or update the content_state. contentState should not update the spine_only when importing the spine content
     * after importing content with artifacts.
     *
     */
    getContentState(existingContentInDb, contentState: number): number {
        if (existingContentInDb && existingContentInDb[COLUMN_NAME_CONTENT_STATE] > contentState) {
            contentState = existingContentInDb[COLUMN_NAME_CONTENT_STATE];
        }
        return contentState;
    }

    getBasePath(payLoadDestinationPath, doesContentExist: boolean, existingContentPath: string): string {
        let path;
        if (payLoadDestinationPath && !doesContentExist) {
            path = payLoadDestinationPath;
        } else {
            path = existingContentPath;
        }
        return path;
    }


}
