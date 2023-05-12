import {
    ContentDisposition,
    ContentEncoding,
    ContentEventType,
    ContentStatus,
    FileName,
    ImportContentContext,
    MimeType,
    State,
    Visibility
} from '../..';
import {SharedPreferences} from '../../../util/shared-preferences';
import {UpdateSizeOnDevice} from './update-size-on-device';
import {Response} from '../../../api';
import {FileService} from '../../../util/file/def/file-service';
import {DbService} from '../../../db';
import {ContentUtil} from '../../util/content-util';
import {GetContentDetailsHandler} from '../get-content-details-handler';
import {ContentEntry} from '../../db/schema';
import {ZipService} from '../../../util/zip/def/zip-service';
import {AppConfig} from '../../../api/config/app-config';
import {FileUtil} from '../../../util/file/util/file-util';
import {DeviceInfo} from '../../../util/device';
import {EventNamespace, EventsBusService} from '../../../events-bus';
import dayjs from 'dayjs';
import {ArrayUtil} from '../../../util/array-util';
import COLUMN_NAME_VISIBILITY = ContentEntry.COLUMN_NAME_VISIBILITY;

export class ExtractPayloads {

    constructor(private fileService: FileService,
                private zipService: ZipService,
                private appConfig: AppConfig,
                private dbService: DbService,
                private deviceInfo: DeviceInfo,
                private getContentDetailsHandler: GetContentDetailsHandler,
                private eventsBusService: EventsBusService,
                private sharedPreferences: SharedPreferences) {
    }

    public async execute(importContext: ImportContentContext): Promise<[Response, NodeJS.Timeout]> {
        const response: Response = new Response();
        importContext.identifiers = [];
        const insertNewContentModels: ContentEntry.SchemaMap[] = [];
        const updateNewContentModels: ContentEntry.SchemaMap[] = [];
        const commonContentModelsMap: Map<string, ContentEntry.SchemaMap> = new Map<string, ContentEntry.SchemaMap>();
        const payloadDestinationPathMap: Map<string, string | undefined> = new Map();
        let rootContentPath;
        // this count is for maintaining how many contents are imported so far
        let currentCount = 0;
        // post event before starting with how many imports are to be done totally
        this.postImportProgressEvent(currentCount, importContext.items!.length);
        const contentIds: string[] = [];
        const nonUnitContentIds: string[] = [];
        const appIcons: string[] = [];
        for (const e of importContext.items!) {
            const element = e as any;
            const identifier = element.identifier;
            const visibility = ContentUtil.readVisibility(element);
            const appIcon = element.appIcon;
            if (ContentUtil.isNotUnit(element.mimeType, visibility)) {
                nonUnitContentIds.push(identifier);
                if (appIcon && !appIcon.startsWith('https:')) {
                    appIcons.push(identifier + '/' + appIcon.substring(0, appIcon.lastIndexOf('/')));
                }
            }
            contentIds.push(identifier);
        }
        // await this.fileService.createDir(ContentUtil.getContentRootDir(importContext.destinationFolder), false);
        // Create all the directories for content.
        const destinationRootDir = ContentUtil.getContentRootDir(importContext.destinationFolder)
        let createdDirectories;
        if(importContext.items![0].mimeType === MimeType.QUESTION_SET){

            createdDirectories = await this.segregateQuestions(
                destinationRootDir, JSON.parse(JSON.stringify(importContext.items))
            );
        } else{
            createdDirectories = await this.createDirectories(destinationRootDir,
                nonUnitContentIds);
        }
        // create subdirectories for the contents which has appIcons
        const createSubDirectories = await this.createDirectories(destinationRootDir, appIcons);
        const query = ArrayUtil.joinPreservingQuotes(contentIds);
        const existingContentModels = await this.getContentDetailsHandler.fetchFromDBForAll(query).toPromise();

        const result = existingContentModels.reduce((map, obj) => {
            map[obj.identifier] = obj;
            return map;
        }, {});
        for (const e of importContext.items!) {
            let item = e as any;
            const identifier = item.identifier;
            // skip the content if already imported on the same version
            if (importContext.skippedItemsIdentifier
                && importContext.skippedItemsIdentifier.indexOf(identifier) > -1) {
                continue;
            }
            const mimeType = item.mimeType;
            const contentEncoding = item.contentEncoding;
            const contentDisposition = item.contentDisposition;
            const contentType = ContentUtil.readContentType(item);
            const primaryCategory = ContentUtil.readPrimaryCategory(item);
            let visibility = ContentUtil.readVisibility(item);
            const audience = ContentUtil.readAudience(item);
            const pragma = ContentUtil.readPragma(item);
            const pkgVersion = item.pkgVersion;
            const artifactUrl = item.artifactUrl;
            const appIcon = item.appIcon;
            const itemSetPreviewUrl = item.itemSetPreviewUrl;
            const board = item.board;
            const medium = item.medium;
            const grade = item.gradeLevel;
            const dialcodes = item.dialcodes;
            const childNodes = item.childNodes;
            let contentState = State.ONLY_SPINE.valueOf();
            let payloadDestination: string | undefined;

            // const existingContentModel = await this.getContentDetailsHandler.fetchFromDB(identifier).toPromise();
            const existingContentModel = result[identifier];
            let existingContentPath;
            if (existingContentModel) {
                existingContentPath = ContentUtil.getBasePath(existingContentModel[ContentEntry.COLUMN_NAME_PATH]!);
            }

            let rootNodeIdentifier;
            if (visibility === Visibility.DEFAULT.valueOf()) {
                rootNodeIdentifier = identifier;
            }
            if (ContentUtil.isNotUnit(mimeType, visibility)) {
                if (createdDirectories[identifier] && createdDirectories[identifier].path) {
                    payloadDestination = (window.device.platform.toLowerCase() === "ios") ? createdDirectories[identifier].path!.concat("/"): createdDirectories[identifier].path;
                } else {
                    let payloadDirectory = (window.device.platform.toLowerCase() === "ios") ? 
                        ContentUtil.getContentRootDir(importContext.destinationFolder).concat(identifier):
                        ContentUtil.getContentRootDir(importContext.destinationFolder).concat('/', identifier);
                    const payloadDestinationDirectoryEntry: any = await this.fileService.createDir(payloadDirectory
                                                , false);
                    payloadDestination = payloadDestinationDirectoryEntry.nativeURL;
                }
            }

            let isUnzippingSuccessful = false;
            let doesContentExist: boolean = ContentUtil.doesContentExist(existingContentModel, identifier, pkgVersion, false);
            // If the content is exist then copy the old content data and add it into new content.
            if (doesContentExist && !(item.status === ContentStatus.DRAFT.valueOf())) {
                if (existingContentModel![COLUMN_NAME_VISIBILITY] === Visibility.DEFAULT.valueOf()) {
                    item = JSON.parse(existingContentModel![ContentEntry.COLUMN_NAME_LOCAL_DATA]);
                }
            } else {
                doesContentExist = false;
                // let isUnzippingSuccessful = false;
                if (artifactUrl) {
                    if (!ContentUtil.isInlineIdentity(contentDisposition, contentEncoding) && mimeType === MimeType.EPUB) {
                        try {
                            await this.copyAssets(importContext.tmpLocation!, artifactUrl, payloadDestination!);
                            isUnzippingSuccessful = true;
                        } catch (e) {
                            isUnzippingSuccessful = false;
                        }
                    }
                    if (!contentDisposition || !contentEncoding ||
                        (contentDisposition === ContentDisposition.INLINE.valueOf()
                            && contentEncoding === ContentEncoding.GZIP.valueOf())) { // Content with artifact without zip i.e. pfd, mp4
                        const payload = importContext.tmpLocation!.concat(artifactUrl);
                        await new Promise<void>((resolve, reject) => {
                            this.zipService.unzip(payload, {target: payloadDestination!}, () => {
                                isUnzippingSuccessful = true;
                                resolve();
                            }, () => {
                                resolve();
                            });
                        });
                    } else if (ContentUtil.isInlineIdentity(contentDisposition, contentEncoding)) {
                        try {
                            await this.copyAssets(importContext.tmpLocation!, artifactUrl, payloadDestination!);
                            isUnzippingSuccessful = true;
                        } catch (e) {
                            isUnzippingSuccessful = false;
                        }
                    } else if (ContentDisposition.ONLINE.valueOf() === contentDisposition) { // Content with no artifact)
                        isUnzippingSuccessful = true;
                    }
                }

                // Add or update the content_state
                if (isUnzippingSuccessful
                || this.shouldDownloadQuestionSet(importContext.items!, item)
                || MimeType.COLLECTION.valueOf() === mimeType) {
                    contentState = State.ARTIFACT_AVAILABLE.valueOf();
                } else {
                    contentState = State.ONLY_SPINE.valueOf();
                }
                if (ContentUtil.isNotUnit(mimeType, visibility)) {
                    try {
                        if (!appIcon.startsWith('https:')) {
                            this.copyAssets(importContext.tmpLocation!, appIcon, payloadDestination!, true);
                        }
                    } catch (e) {
                    }
                }

                try {
                    if (!itemSetPreviewUrl.startsWith('https:')) {
                        this.copyAssets(importContext.tmpLocation!, itemSetPreviewUrl, payloadDestination!, false);
                    }
                } catch (e) {
                }
            }
            const basePath = this.getBasePath(payloadDestination, doesContentExist, existingContentPath);
            if (visibility === Visibility.DEFAULT.valueOf()) {
                rootContentPath = basePath;
                importContext.rootIdentifier = identifier;

            } else {
                if (ContentUtil.isNotUnit(mimeType, visibility)) {
                    importContext.identifiers.push(identifier);
                }
            }
            const referenceCount = this.getReferenceCount(existingContentModel, visibility,
                importContext.isChildContent, importContext.existedContentIdentifiers);
            visibility = this.getContentVisibility(existingContentModel, item['objectType'], importContext.isChildContent, visibility);
            // contentState = this.getContentState(existingContentModel, contentState);
            ContentUtil.addOrUpdateViralityMetadata(item, this.deviceInfo.getDeviceID().toString());

            const sizeOnDevice = 0;
            if (ContentUtil.isNotUnit(mimeType, visibility)) {
                payloadDestinationPathMap.set(identifier, payloadDestination);
                // try {
                //     sizeOnDevice = await this.fileService.getDirectorySize(payloadDestination!);
                // } catch (e) {
                // }
            }
            const newContentModel: ContentEntry.SchemaMap = this.constructContentDBModel(identifier, importContext.manifestVersion,
                JSON.stringify(item), mimeType, contentType, visibility, basePath,
                referenceCount, contentState, audience, pragma, sizeOnDevice, board, medium, grade, dialcodes, childNodes, primaryCategory);
            if (!existingContentModel) {
                insertNewContentModels.push(newContentModel);
            } else {
                const existingContentState = this.getContentState(existingContentModel, contentState);
                if (existingContentState === State.ONLY_SPINE.valueOf()
                    || isUnzippingSuccessful    // If unzip is success it means artifact is available.
                    || MimeType.COLLECTION.valueOf() === mimeType) {
                    updateNewContentModels.push(newContentModel);
                } else {
                    newContentModel[ContentEntry.COLUMN_NAME_CONTENT_STATE] = this.getContentState(existingContentModel, contentState);
                }
            }

            commonContentModelsMap.set(identifier, newContentModel);

            // increase the current count
            currentCount++;
            if (currentCount % 20 === 0 || currentCount === (importContext.items!.length)) {
                this.postImportProgressEvent(currentCount, importContext.items!.length);
            }
        }
        // Update/create contents in DB with size_on_device as 0 initially
        this.updateContentDB(insertNewContentModels, updateNewContentModels);
        const updateContentFileSizeInDBTimeOutRef = setTimeout(() => {
            // Update the contents in DB with actual size
            this.updateContentFileSizeInDB(importContext, commonContentModelsMap, payloadDestinationPathMap, result);
        }, 5000);

        if (rootContentPath) {
            try {
                await this.fileService.copyFile(importContext.tmpLocation!,
                    FileName.MANIFEST.valueOf(),
                    rootContentPath,
                    FileName.MANIFEST.valueOf());
            } catch(e) {
                console.log("Exception Raised During Import");
            }
            
        }

        response.body = importContext;
        return Promise.resolve([response, updateContentFileSizeInDBTimeOutRef] as any);
    }

    async updateContentFileSizeInDB(importContext: ImportContentContext, commonContentModelsMap, payloadDestinationPathMap, result) {
        const updateNewContentModels: ContentEntry.SchemaMap[] = [];
        for (const e of importContext.items!) {
            const item = e as any;
            const identifier = item.identifier;
            const mimeType = commonContentModelsMap.get(identifier).mimeType;
            const visibility = commonContentModelsMap.get(identifier).visibility;
            const payloadDestination = payloadDestinationPathMap.get(identifier);
            let sizeOnDevice = 0;
            const existingContentModel = result[identifier];
            if (ContentUtil.isNotUnit(mimeType, visibility)) {
                try {
                    sizeOnDevice = await this.fileService.getDirectorySize(payloadDestination!);
                    commonContentModelsMap.get(identifier).size_on_device = sizeOnDevice;
                    if (!existingContentModel) {
                        updateNewContentModels.push(commonContentModelsMap.get(identifier));
                    } else {
                        updateNewContentModels.push(commonContentModelsMap.get(identifier));
                    }
                } catch (e) {
                }
            }
        }
        this.updateContentDB([], updateNewContentModels, true);
    }

    async updateContentDB(insertNewContentModels, updateNewContentModels, updateSize?: boolean) {
        insertNewContentModels = (insertNewContentModels && insertNewContentModels.length) ? this.filterQuestionSetContent(insertNewContentModels): insertNewContentModels;
        updateNewContentModels = (updateNewContentModels && updateNewContentModels.length) ? this.filterQuestionSetContent(updateNewContentModels): updateNewContentModels;
        if (insertNewContentModels.length || updateNewContentModels.length) {
            this.dbService.beginTransaction();
            // Insert into DB
            for (const e of insertNewContentModels) {
                const newContentModel = e as ContentEntry.SchemaMap;
                await this.dbService.insert({
                    table: ContentEntry.TABLE_NAME,
                    modelJson: newContentModel
                }).toPromise();
            }

            // Update existing content in DB
            for (const e of updateNewContentModels) {
                const newContentModel = e as ContentEntry.SchemaMap;
                await this.dbService.update({
                    table: ContentEntry.TABLE_NAME,
                    selection: `${ContentEntry.COLUMN_NAME_IDENTIFIER} = ?`,
                    selectionArgs: [newContentModel[ContentEntry.COLUMN_NAME_IDENTIFIER]],
                    modelJson: newContentModel
                }).toPromise();
            }
            this.dbService.endTransaction(true);
        }
        if (updateSize) {
            new UpdateSizeOnDevice(this.dbService, this.sharedPreferences, this.fileService).execute();
        }
    }

    async copyAssets(tempLocationPath: string, asset: string, payloadDestinationPath: string, useSubDirectories?: boolean) {
        try {
            if (asset) {
                // const iconSrc = tempLocationPath.concat(asset);
                // const iconDestination = payloadDestinationPath.concat(asset);
                const folderContainingFile = asset.substring(0, asset.lastIndexOf('/'));
                // TODO: Can optimize folder creation
                if (!useSubDirectories) {
                    await this.fileService.createDir(payloadDestinationPath.concat(folderContainingFile), false);
                }

                // * only in case of iOS ****
                if(window.device.platform.toLowerCase() === "ios") {
                    // * checking if file exist, then delete the file
                    await this.fileService.exists(payloadDestinationPath.concat('/', asset))
                    .then(entry => {
                        if (entry) {
                            this.fileService.removeFile(payloadDestinationPath.concat('/', asset)).then();
                        }
                    })
                    .catch(error => {
                        console.log('Error =>', error);
                    });
                }
                // If source icon is not available then copy assets is failing and throwing exception.
                await this.fileService.copyFile(tempLocationPath.concat(folderContainingFile), FileUtil.getFileName(asset),
                    payloadDestinationPath.concat(folderContainingFile), FileUtil.getFileName(asset));
            }
        } catch (e) {
            console.error('Cannot Copy Asset');
            throw e;
        }
    }

    /**
     * add or update the reference count for the content
     *
     */
    getContentVisibility(existingContentInDb, objectType, isChildContent: boolean, previousVisibility: string): string {
        let visibility;
        if ('Library' === objectType) {
            visibility = Visibility.PARENT.valueOf();
        } else if (existingContentInDb) {
            if (isChildContent     // If import started from child content then do not update the visibility.
                // If not started from child content then do not shrink visibility.
                || !(Visibility.PARENT.valueOf() === existingContentInDb[COLUMN_NAME_VISIBILITY])) {
                visibility = existingContentInDb[COLUMN_NAME_VISIBILITY];
            }
        }
        return visibility ? visibility : previousVisibility;
    }

    /**
     * Add or update the content_state. contentState should not update the spine_only when importing the spine content
     * after importing content with artifacts.
     *
     */
    getContentState(existingContentInDb, contentState: number): number {
        if (existingContentInDb && existingContentInDb[ContentEntry.COLUMN_NAME_CONTENT_STATE] > contentState) {
            contentState = existingContentInDb[ContentEntry.COLUMN_NAME_CONTENT_STATE];
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

    /**
     * add or update the reference count for the content
     *
     */
    private getReferenceCount(existingContent, visibility: string, isChildContent: boolean,
                              updateIdentifiers?: { [identifier: string]: boolean }): number {
        let refCount: number;
        if (existingContent) {
            refCount = existingContent[ContentEntry.COLUMN_NAME_REF_COUNT];

            const found = updateIdentifiers ? updateIdentifiers[existingContent[ContentEntry.COLUMN_NAME_IDENTIFIER]] : undefined;
            if (found) {
                // Do not increase the refCount.
            } else if (!isChildContent) {    // If import started from child content then do not update the refCount.
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

    private postImportProgressEvent(currentCount, totalCount) {
        this.eventsBusService.emit({
            namespace: EventNamespace.CONTENT,
            event: {
                type: ContentEventType.IMPORT_PROGRESS,
                payload: {
                    totalCount: totalCount,
                    currentCount: currentCount
                }
            }
        });
    }

    private constructContentDBModel(identifier, manifestVersion, localData,
                                    mimeType, contentType, visibility, path,
                                    refCount, contentState, audience, pragma, sizeOnDevice,
                                    board, medium, grade,
                                    dialcodes, childNodes, primaryCategory): ContentEntry.SchemaMap {
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
            [ContentEntry.COLUMN_NAME_LOCAL_LAST_UPDATED_ON]: dayjs(Date.now()).format(),
            [ContentEntry.COLUMN_NAME_BOARD]: ContentUtil.getContentAttribute(board),
            [ContentEntry.COLUMN_NAME_MEDIUM]: ContentUtil.getContentAttribute(medium),
            [ContentEntry.COLUMN_NAME_GRADE]: ContentUtil.getContentAttribute(grade),
            [ContentEntry.COLUMN_NAME_DIALCODES]: ContentUtil.getContentAttribute(dialcodes),
            [ContentEntry.COLUMN_NAME_CHILD_NODES]: ContentUtil.getContentAttribute(childNodes),
            [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: primaryCategory
        };
    }

    // TODO: move this method to file-service
    private async createDirectories(parentDirectoryPath: string,
                                    listOfFolder: string[]): Promise<{ [key: string]: { path: string | undefined } }> {
        return new Promise<{ [key: string]: { path: string | undefined } }>((resolve, reject) => {
            parentDirectoryPath = (window.device.platform.toLowerCase() === "ios") ? parentDirectoryPath.concat('/') : parentDirectoryPath;
            sbutility.createDirectories(ContentUtil.getBasePath(parentDirectoryPath), listOfFolder,
                (entry) => {
                    resolve(entry);
                }, err => {
                    console.error(err);
                    reject(err);
                });
        });
    }

    filterQuestionSetContent(items){
        const filterdItems = items.filter(i => (i.mimeType !==MimeType.QUESTION && i.mime_type !==MimeType.QUESTION));
        return filterdItems
    }

    async segregateQuestions(destinationRootDir, flattenedList) {
        let segregatedQuestions = {};
        for (let count = 0; count < flattenedList.length; count++) {
            if (flattenedList[count].mimeType === MimeType.QUESTION_SET &&
                !segregatedQuestions[flattenedList[count].identifier]) {
                segregatedQuestions[flattenedList[count].identifier] = [];
            } else if (flattenedList[count].mimeType === MimeType.QUESTION) {
                if (segregatedQuestions[flattenedList[count].parent]) {
                    segregatedQuestions[flattenedList[count].parent].push(flattenedList[count].identifier);
                } else {
                    segregatedQuestions[flattenedList[count].identifier] = [flattenedList[count].identifier];
                }
            }
        }
        const dirArr = Object.keys(segregatedQuestions);
        let createdDir = await this.createDirectories(destinationRootDir, dirArr);
        const segregatedArr: any = [];

        for (const key in segregatedQuestions) {
            segregatedArr.push(
                {
                    idArr: segregatedQuestions[key],
                    dir: `${destinationRootDir}/${key}`
                }
            );
        }

        for await (const iterator of segregatedArr) {
            const childDir = await this.createDirectories(iterator.dir, iterator.idArr);
            createdDir = { ...createdDir, ...childDir };
        }

        return createdDir;
    }

    private shouldDownloadQuestionSet(contentItems, item){
        if(item.mimeType === MimeType.QUESTION_SET && ContentUtil.readVisibility(item) === Visibility.DEFAULT.valueOf()){
            return true;
        }
        return this.checkParentQustionSet(contentItems, item)
    }

    // recursive function
    private checkParentQustionSet(contentItems, content) {
        if(!content || !content.parent){
            return false;
        }
        const parentContent = contentItems.find(i => (i.identifier === content.parent));
        if(!parentContent || parentContent.mimeType !== MimeType.QUESTION_SET){
            return false;
        } else if(parentContent.mimeType === MimeType.QUESTION_SET && 
            ContentUtil.readVisibility(parentContent) === Visibility.DEFAULT.valueOf()){
                return true;
        }
        return this.checkParentQustionSet(contentItems, parentContent)
    }

}
