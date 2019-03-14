import {ImportContentContext} from '../..';
import {Response} from '../../../api';
import {ContentDisposition, ContentEncoding, ContentStatus, MimeType, State, Visibility} from '../../util/content-constants';
import {FileService} from '../../../util/file/def/file-service';
import {DbService} from '../../../db';
import {ContentUtil} from '../../util/content-util';
import {GetContentDetailsHandler} from '../get-content-details-handler';
import {ContentEntry} from '../../db/schema';
import {ZipService} from '../../../util/zip/def/zip-service';
import {DirectoryEntry, Metadata} from '../../../util/file';
import {AppConfig} from '../../../api/config/app-config';
import {FileUtil} from '../../../util/file/util/file-util';
import {DeviceInfo} from '../../../util/device/def/device-info';
import COLUMN_NAME_PATH = ContentEntry.COLUMN_NAME_PATH;
import COLUMN_NAME_VISIBILITY = ContentEntry.COLUMN_NAME_VISIBILITY;
import COLUMN_NAME_LOCAL_DATA = ContentEntry.COLUMN_NAME_LOCAL_DATA;
import COLUMN_NAME_REF_COUNT = ContentEntry.COLUMN_NAME_REF_COUNT;
import COLUMN_NAME_CONTENT_STATE = ContentEntry.COLUMN_NAME_CONTENT_STATE;

export class ExtractPayloads {

    constructor(private fileService: FileService,
                private zipService: ZipService,
                private appConfig: AppConfig,
                private dbService: DbService,
                private deviceInfo: DeviceInfo,
                private getContentDetailsHandler: GetContentDetailsHandler) {
    }

    public async execute(importContext: ImportContentContext): Promise<Response> {
        const response: Response = new Response();
        importContext.identifiers = [];
        for (const e of importContext.items!) {
            let element = e as any;
            const identifier = element.identifier;
            // skip the content if already imported on the same version
            if (importContext.skippedItemsIdentifier
                && importContext.skippedItemsIdentifier.indexOf(identifier) > -1) {
                continue;
            }
            const mimeType = element.mimeType;
            const contentEncoding = element.contentEncoding;
            const contentDisposition = element.contentDisposition;
            const contentType = ContentUtil.readContentType(element);
            let visibility = ContentUtil.readVisibility(element);
            const audience = ContentUtil.readAudience(element);
            const pragma = ContentUtil.readPragma(element);
            const compatibilityLevel = ContentUtil.readCompatibilityLevel(element);
            const pkgVersion = element.pkgVersion;
            const artifactUrl = element.artifactUrl;
            const appIcon = element.appIcon;
            const posterImage = element.posterImage;
            const grayScaleAppIcon = element.grayScaleAppIcon;
            const dialCodes = element.dialcodes;
            let contentState = State.ONLY_SPINE.valueOf();
            let payloadDestination: string | undefined;

            const existingContentModel = await this.getContentDetailsHandler.fetchFromDB(identifier).toPromise();
            let existingContentPath;
            if (existingContentModel) {
                existingContentPath = existingContentModel[COLUMN_NAME_PATH];
            }

            let doesContentExist: boolean = ContentUtil.doesContentExist(existingContentModel, identifier, pkgVersion, false);
            let rootNodeIdentifier;
            if (visibility === Visibility.DEFAULT.valueOf()) {
                rootNodeIdentifier = identifier;
            }
            // If the content is exist then copy the old content data and add it into new content.
            if (doesContentExist && !(element.status === ContentStatus.DRAFT.valueOf())) {
                if (existingContentModel![COLUMN_NAME_VISIBILITY] === Visibility.DEFAULT.valueOf()) {
                    element = JSON.parse(existingContentModel![COLUMN_NAME_LOCAL_DATA]);
                }
            } else {
                doesContentExist = false;
                await this.fileService.createDir(ContentUtil.getContentRootDir(importContext.destinationFolder), false);
                const payloadDestinationDirectoryEntry: DirectoryEntry = await this.fileService.createDir(
                    ContentUtil.getContentRootDir(importContext.destinationFolder).concat('/', identifier), false);
                payloadDestination = payloadDestinationDirectoryEntry.nativeURL;
                await this.copyAssets(importContext.tmpLocation!, appIcon, payloadDestination);
                if (ContentUtil.isCompatible(this.appConfig, compatibilityLevel)) {
                    let isUnzippingSuccessfull = false;
                    if (artifactUrl) {
                        if (!contentDisposition || !contentEncoding ||
                            (contentDisposition === ContentDisposition.INLINE.valueOf()
                                && contentEncoding === ContentEncoding.GZIP.valueOf())) { // Content with artifact without zip i.e. pfd, mp4
                            const payload = importContext.tmpLocation!.concat(artifactUrl);
                            await new Promise((resolve, reject) => {
                                this.zipService.unzip(payload, {target: payloadDestination!}, () => {
                                    isUnzippingSuccessfull = true;
                                    resolve();
                                }, () => {
                                    reject();
                                });
                            });
                        } else if (ContentUtil.isInlineIdentity(contentDisposition, contentEncoding)) {
                            try {
                                await this.copyAssets(importContext.tmpLocation!, artifactUrl, payloadDestination);
                                isUnzippingSuccessfull = false;
                            } catch (e) {
                                isUnzippingSuccessfull = false;
                            }
                        } else if (ContentDisposition.ONLINE.valueOf() === contentDisposition) { // Content with no artifact)
                            isUnzippingSuccessfull = true;
                        }
                    }


                    // Add or update the content_state
                    if (isUnzippingSuccessfull    // If unzip is success it means artifact is available.
                        || MimeType.COLLECTION.valueOf() === mimeType) {
                        contentState = State.ARTIFACT_AVAILABLE.valueOf();
                    } else {
                        contentState = State.ONLY_SPINE.valueOf();
                    }
                }
                await this.copyAssets(importContext.tmpLocation!, appIcon, payloadDestination);
                await this.copyAssets(importContext.tmpLocation!, posterImage, payloadDestination);
                await this.copyAssets(importContext.tmpLocation!, grayScaleAppIcon, payloadDestination);
            }

            const referenceCount = this.getReferenceCount(existingContentModel, visibility, importContext.isChildContent);
            visibility = this.getContentVisibility(existingContentModel, element['objectType'], importContext.isChildContent, visibility);
            contentState = this.getContentState(existingContentModel, contentState);
            const basePath = this.getBasePath(payloadDestination, doesContentExist, existingContentPath);
            const sizeMetaData: Metadata = await this.fileService.getMetaData(basePath);
            ContentUtil.addOrUpdateViralityMetadata(element, this.deviceInfo.getDeviceID().toString());
            const sizeOnDevice = await this.fileService.getDirectorySize(payloadDestination!);
            const newContentModel: ContentEntry.SchemaMap = this.constructContentDBModel(identifier, importContext.manifestVersion,
                JSON.stringify(element), mimeType, contentType, visibility, payloadDestination,
                referenceCount, contentState, audience, pragma, sizeOnDevice);
            if (!existingContentModel) {
                await this.dbService.insert({
                    table: ContentEntry.TABLE_NAME,
                    modelJson: newContentModel
                }).toPromise();
            } else {
                this.dbService.update({
                    table: ContentEntry.TABLE_NAME,
                    selection: `${ContentEntry.COLUMN_NAME_IDENTIFIER} = ?`,
                    selectionArgs: [identifier],
                    modelJson: newContentModel
                }).toPromise();
            }
            importContext.identifiers.push(identifier);

        }
        response.body = importContext;
        return Promise.resolve(response);
    }

    async copyAssets(tempLocationPath: string, asset: string, payloadDestinationPath: string) {
        try {
            if (asset) {
                const iconSrc = tempLocationPath.concat(asset);
                const iconDestination = payloadDestinationPath.concat(asset);
                const folderContainingFile = asset.substring(0, asset.lastIndexOf('/'));
                await this.fileService.createDir(payloadDestinationPath.concat(folderContainingFile), false);
                // If source icon is not available then copy assets is failing and throwing exception.
                await this.fileService.copyFile(tempLocationPath.concat(folderContainingFile), FileUtil.getFileName(asset),
                    payloadDestinationPath.concat(folderContainingFile), FileUtil.getFileName(asset));
            }

        } catch (e) {
            console.error('cannot Copy asset');
            return Promise.resolve();

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
                if (!(Visibility.DEFAULT.valueOf() === existingContent[COLUMN_NAME_VISIBILITY]
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
    getContentVisibility(existingContentInDb, objectType, isChildContent: boolean, previuosVisibility: string): string {
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
        return visibility ? visibility : previuosVisibility;
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

    private constructContentDBModel(identifier, manifestVersion, localData,
                                    mimeType, contentType, visibility, path,
                                    refCount, contentState, audience, pragma, sizeOnDevice): ContentEntry.SchemaMap {
        return {
            [ContentEntry.COLUMN_NAME_IDENTIFIER]: identifier,
            [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
            [ContentEntry.COLUMN_NAME_PATH]: ContentUtil.getBasePath(path),
            [ContentEntry.COLUMN_NAME_REF_COUNT]: refCount,
            [ContentEntry.COLUMN_NAME_CONTENT_STATE]: contentState,
            [ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE]: sizeOnDevice,
            [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: manifestVersion,
            [ContentEntry.COLUMN_NAME_LOCAL_DATA]: localData,
            [ContentEntry.COLUMN_NAME_MIME_TYPE]: mimeType,
            [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: contentType,
            [ContentEntry.COLUMN_NAME_VISIBILITY]: visibility,
            [ContentEntry.COLUMN_NAME_AUDIENCE]: audience,
            [ContentEntry.COLUMN_NAME_PRAGMA]: pragma,
        };

    }


}
