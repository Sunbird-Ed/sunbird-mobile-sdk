import {ContentData, HierarchyInfo, TrackingEnabled} from '../def/content';
import {ContentDisposition, ContentEncoding, ContentStatus, MimeType, State, Visibility} from './content-constants';
import {Rollup} from '../../telemetry';
import {AppConfig} from '../../api/config/app-config';
import {ContentEntry} from '../db/schema';
import {NumberUtil} from '../../util/number-util';
import {ArrayUtil} from '../../util/array-util';
import dayjs from 'dayjs';
import {ChildContent} from '..';
import {CsPrimaryCategoryMapper} from '@project-sunbird/client-services/services/content/utilities/primary-category-mapper';
import { CsContentType } from '@project-sunbird/client-services/services/content';

export class ContentUtil {
    public static defaultCompatibilityLevel = 1;
    private static DEFAULT_PACKAGE_VERSION = -1;
    private static INITIAL_VALUE_FOR_TRANSFER_COUNT = 0;
    private static readonly MAX_CONTENT_NAME = 30;

    public static isAvailableLocally(contentState: number): boolean {
        return contentState === State.ARTIFACT_AVAILABLE;
    }

    public static isUpdateAvailable(serverData: ContentData, localData: ContentData): boolean {
        let lVersion = -1;
        let sVersion = -1;

        if (serverData && serverData.pkgVersion) {
            sVersion = parseFloat(serverData.pkgVersion);
        }

        if (localData && localData.pkgVersion) {
            lVersion = parseFloat(localData.pkgVersion);
        }

        return sVersion > 0 && lVersion > 0 && sVersion > lVersion;
    }

    public static hasChildren(localData): boolean {
        if (!localData) {
            return false;
        }
        if (typeof (localData) === 'string') {
            localData = JSON.parse(localData);
        }
        return localData && localData.children;
    }

    public static getContentRollup(identifier: string, hierarchyInfoList: HierarchyInfo[]): Rollup {
        let l1, l2, l3, l4;
        if (!hierarchyInfoList || hierarchyInfoList.length === 0) {
            l1 = identifier;
        } else {
            for (let i = 0; i < hierarchyInfoList.length; i++) {
                if (i === 0) {
                    l1 = hierarchyInfoList[i].identifier;
                } else if (i === 1) {
                    l2 = hierarchyInfoList[i].identifier;
                } else if (i === 2) {
                    l3 = hierarchyInfoList[i].identifier;
                } else if (i === 3) {
                    l4 = hierarchyInfoList[i].identifier;
                } else {
                    break;
                }
            }
        }

        return {l1: l1, l2: l2, l3: l3, l4: l4};
    }

    public static getChildContentsIdentifiers(localData): string[] {
        const childIdentifiers: string[] = [];
        let contentData;
        if (typeof (localData) === 'string') {
            contentData = JSON.parse(localData);
        } else {
            contentData = localData;
        }
        const children: ChildContent[] = contentData.children;
        if (children && children.length) {
            children.forEach((child) => {
                childIdentifiers.push(child.identifier);
            });
        }
        return childIdentifiers;
    }

    /**
     * This method gets you the first part of the string that is divided after last index of "/"
     *
     * @param contentFolderName
     * @return
     */
    public static getFirstPartOfThePathNameOnLastDelimiter(contentFolderName: string) {
        const lastIndexOfDelimiter: number = contentFolderName.lastIndexOf('/');

        if (lastIndexOfDelimiter > 0 && lastIndexOfDelimiter < contentFolderName.length) {
            return contentFolderName.substring(0, lastIndexOfDelimiter);
        }

        return undefined;
    }

    public static hasPreRequisites(localData: string): boolean {
        return JSON.parse(localData).pre_requisites;
    }

    public static readVisibility(contentData: any): string {
        const visibility = contentData.visibility;
        return visibility ? visibility : Visibility.DEFAULT;
    }

    public static isCompatible(appConfig: AppConfig, compatibilityLevel): boolean {
        return (compatibilityLevel >= appConfig.minCompatibilityLevel)
            && (compatibilityLevel <= appConfig.maxCompatibilityLevel);
    }

    public static readCompatibilityLevel(contentData: any): number {
        const compatibilityLevel = contentData.compatibilityLevel;
        return compatibilityLevel ? compatibilityLevel : this.defaultCompatibilityLevel;
    }

    public static isDraftContent(status): boolean {
        return (status && status === ContentStatus.DRAFT.valueOf());
    }

    public static isExpired(expiryDate: string) {
        if (expiryDate) {
            const millis: number = new Date(expiryDate).getTime();
            if (new Date().getTime() > millis) {
                return true;
            }
        }
        return false;
    }

    /**
     * If status is DRAFT and pkgVersion == 0 then don't do the duplicate check..
     */
    public static isDuplicateCheckRequired(isDraftContent, pkgVersion: number): boolean {
        return isDraftContent && pkgVersion === 0;
    }

    public static isImportFileExist(oldContentModel: ContentEntry.SchemaMap | undefined, contentData: any): boolean {
        if (!oldContentModel || !contentData) {
            return false;
        }

        let isExist = false;
        const oldIdentifier = oldContentModel[ContentEntry.COLUMN_NAME_IDENTIFIER];
        const newIdentifier = contentData.identifier;
        const oldVisibility = oldContentModel[ContentEntry.COLUMN_NAME_VISIBILITY];
        const newVisibility = ContentUtil.readVisibility(contentData);

        if (oldIdentifier === newIdentifier && oldVisibility === newVisibility) {
            isExist = this.readPkgVersion(JSON.parse(oldContentModel[ContentEntry.COLUMN_NAME_LOCAL_DATA])) >=
                this.readPkgVersion(contentData);
        }

        return isExist;
    }

    public static readPkgVersion(contentData): number {
        return contentData.pkgVersion;
    }

    public static readContentType(contentData): string {
        let contentType: string = contentData.contentType;
        if (contentType) {
            contentType = contentType.toLowerCase();
        }
        return contentType;
    }

    public static readPrimaryCategory(contentData): string {
        let primaryCategory: string = contentData.primaryCategory;
        if (primaryCategory) {
            primaryCategory = primaryCategory.toLowerCase();
        } else {
            primaryCategory = CsPrimaryCategoryMapper.getPrimaryCategory(
              contentData.contentType.toLowerCase(), contentData.mimeType, contentData.resourceType).toLowerCase();
        }
        return primaryCategory;
    }

    public static readPrimaryCategoryServer(contentData): string {
        let primaryCategory: string = contentData.primaryCategory;
        if (primaryCategory) {
            primaryCategory = primaryCategory;
        } else {
            primaryCategory = CsPrimaryCategoryMapper.getPrimaryCategory(
              contentData.contentType.toLowerCase(), contentData.mimeType, contentData.resourceType);
        }
        return primaryCategory;
    }


    public static readAudience(contentData): string {
        const audience = contentData.audience;
        const audienceList: string[] = [];
        if (typeof audience === 'string') {
            audienceList.push(audience);
        }
        if (!audienceList || !audienceList.length) {
            audienceList.push('Learner');
        }
        audienceList.sort();
        return audienceList.join(',');
    }


    public static readPragma(contentData): string {
        let pragmaList: string[] = contentData.pragma;
        if (!pragmaList) {
            pragmaList = [];
        }

        return pragmaList.join(',');
    }

    /**
     * To Check whether the content is exist or not.
     *
     * @param existingContentInDB    Old ContentModel
     * @param newIdentifier New content identifier
     * @param newPkgVersion
     * @param keepLowerVersion
     * @return True - if file exists, False- does not exists
     */
    public static doesContentExist(existingContentInDB: ContentEntry.SchemaMap | undefined, newIdentifier: string,
                                   newPkgVersion: number, keepLowerVersion: boolean): boolean {
        if (!existingContentInDB) {
            return false;
        }

        let doestExist = false;
        const oldIdentifier = existingContentInDB[ContentEntry.COLUMN_NAME_IDENTIFIER];
        const contentData = JSON.parse(existingContentInDB[ContentEntry.COLUMN_NAME_LOCAL_DATA]);
        if (oldIdentifier === newIdentifier) {
            let overrideDB = false;
            if (keepLowerVersion) {
                if (ContentUtil.readPkgVersion(contentData) < newPkgVersion) {
                    overrideDB = false;
                } else {
                    overrideDB = true;
                }
            } else if (ContentUtil.readPkgVersion(contentData) < newPkgVersion) {
                overrideDB = true;
            }

            if (overrideDB
                // If old content's pkgVersion is less than the new content then return false.
                //                        && ((readPkgVersion(existingContentInDB.getLocalData()) < newPkgVersion)
                //  If content_state is other than artifact available then also return  false.
                || (!keepLowerVersion
                    && existingContentInDB[ContentEntry.COLUMN_NAME_CONTENT_STATE] !== State.ARTIFACT_AVAILABLE.valueOf())) {
                doestExist = false;
            } else {
                doestExist = true;
            }
        }

        return doestExist;
    }

    public static getContentRootDir(rootFilePath: string): string {
        let url = (window.device.platform.toLowerCase() === "ios") ? rootFilePath.concat("content/") : rootFilePath.concat('content')
        return url;
    }

    public static addOrUpdateViralityMetadata(localData, origin: string) {
        if (ContentUtil.isContentMetadataAbsent(localData)) {
            const viralityMetadata = {};
            viralityMetadata['origin'] = origin;
            viralityMetadata['transferCount'] = ContentUtil.INITIAL_VALUE_FOR_TRANSFER_COUNT;

            const contentMetadata = {};
            contentMetadata['virality'] = viralityMetadata;

            localData['contentMetadata'] = contentMetadata;
        } else if (ContentUtil.isContentMetadataPresentWithoutViralityMetadata(localData)) {
            const viralityMetadata = {};
            viralityMetadata['origin'] = origin;
            viralityMetadata['transferCount'] = ContentUtil.INITIAL_VALUE_FOR_TRANSFER_COUNT;

            (localData['contentMetaData'])['virality'] = viralityMetadata;
        } else {
            const viralityMetadata = (localData['contentMetaData'])['virality'];
            viralityMetadata['transferCount'] = ContentUtil.transferCount(viralityMetadata) + 1;
        }
    }

    public static addViralityMetadataIfMissing(localData, origin: string) {
        if (!localData['contentMetaData']) {
            localData['contentMetaData'] = {};
        }

        const contentMetaData = localData['contentMetaData'];

        if (!contentMetaData['virality']) {
            contentMetaData.virality = {};
        }
        let viralityMetadata = localData['virality'];
        if (!viralityMetadata) {
            viralityMetadata = {};
        }

        if (!viralityMetadata['origin']) {
            viralityMetadata['origin'] = origin;
        }
        if (!viralityMetadata['transferCount']) {
            viralityMetadata['transferCount'] = ContentUtil.INITIAL_VALUE_FOR_TRANSFER_COUNT;
        }
    }

    /**
     * Content with artifact without zip i.e. pfd, mp4
     *
     * @param contentDisposition
     * @param contentEncoding
     * @return
     */
    public static isInlineIdentity(contentDisposition: string, contentEncoding: string) {
        return contentDisposition
            && contentEncoding
            && ContentDisposition.INLINE.valueOf() === contentDisposition
            && ContentEncoding.IDENTITY.valueOf() === contentEncoding;
    }

    public static isOnlineContent(contentData): boolean {
        const contentDisposition = contentData.contentDisposition;
        return contentDisposition && ContentDisposition.ONLINE.valueOf() === contentDisposition;
    }

    public static addOrUpdateDialcodeMapping(jsonStr: string, identifier: string, rootNodeIdentifier: string) {
        let dialcodeMapping;
        if (jsonStr) {
            dialcodeMapping = JSON.parse(jsonStr);
        } else {
            dialcodeMapping = {};
        }

        if (!dialcodeMapping.hasOwnProperty('identifier')) {
            dialcodeMapping['identifier'] = identifier;
        }

        const rootNodes = new Set();
        if (dialcodeMapping.hasOwnProperty('rootNodes')) {
            dialcodeMapping.forEach((dialcode) => {
                rootNodes.add(dialcode);
            });
        }
        rootNodes.add(rootNodeIdentifier);
        dialcodeMapping['rootNodes'] = rootNodes;
        return JSON.stringify(dialcodeMapping);
    }

    public static deDupe<T>(array: T[], property): T[] {
        return array.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[property]).indexOf(obj[property]) === pos;
        });
    }

    public static getExportedFileName(contentsInDb: ContentEntry.SchemaMap[], appName: string) {
        let fileName = 'blank.ecar';
        let firstContent: ContentEntry.SchemaMap;
        let rootContents = 0;

        if (contentsInDb.length > 0) {
            firstContent = contentsInDb[0];
        }

        const appendName = '';
        contentsInDb.forEach((contentInDb) => {
            if (Visibility.DEFAULT.valueOf() === contentInDb[ContentEntry.COLUMN_NAME_VISIBILITY]) {
                rootContents++;
            }
        });

        if (rootContents > 1) {
            appendName.concat((rootContents - 1).toString());
        }

        if (firstContent!) {
            const localData = JSON.parse(firstContent![ContentEntry.COLUMN_NAME_LOCAL_DATA]);
            let name = localData.name;
            if (name && name.length > ContentUtil.MAX_CONTENT_NAME) {
                name = name.substring(0, ContentUtil.MAX_CONTENT_NAME - 3) + '...';
            }

            const pkgVersion = localData.pkgVersion;
            fileName = `${appName.toLowerCase()}_${name}-v${pkgVersion}${appendName}.ecar`;
        }

        return fileName;
    }

    public static readOriginFromContentMap(item: any): string {
        const metaData: any = item['contentMetadata'];
        const virality: any = metaData && metaData['virality'];
        return virality ? virality['origin'] : '';
    }

    public static readTransferCountFromContentMap(item: any): number {
        const metaData: any = item['contentMetadata'];
        const virality: any = metaData && metaData['virality'];
        return virality ? NumberUtil.parseInt(virality['transferCount']) : 0;
    }

    public static readSizeFromContentMap(item: any): string {
        return item.size ? item.size : '';
    }

    public static getUidnIdentifierFiler(uid: string, identifier): string {
        const uidFilter = uid && `uid = '${uid}'`;
        const identifierFilter = identifier && `identifier = '${identifier}'`;

        let filter = '';
        if (uidFilter && identifierFilter) {
            filter = `WHERE (${identifierFilter} AND ${uidFilter})`;
        } else if (identifierFilter) {
            filter = `WHERE (${identifierFilter})`;
        } else if (uidFilter) {
            filter = `WHERE (${uidFilter})`;
        }
        return filter;
    }

    public static getBasePath(basePath: string): string {
        if (!basePath) {
            return '';
        }
        if (basePath.indexOf('file://') !== -1) {
            basePath = basePath.replace('file://', '');
        } else {
            basePath = 'file://'.concat(basePath);
        }
        return basePath;
    }

    public static getRollup(identifier: string, hierachyInfo: HierarchyInfo[]): Rollup {
        let l1, l2, l3, l4;
        if (!hierachyInfo) {
            l1 = identifier;
        } else {
            let i;
            for (i = 0; i < hierachyInfo.length; i++) {
                switch (i) {
                    case 0:
                        l1 = hierachyInfo[i].identifier;
                        break;
                    case 1:
                        l2 = hierachyInfo[i].identifier;
                        break;
                    case 2:
                        l3 = hierachyInfo[i].identifier;
                        break;
                    case 3:
                        l4 = hierachyInfo[i].identifier;
                        break;
                }

            }

        }
        const rollup: Rollup = {l1: l1, l2: l2, l3: l3, l4: l4};
        return rollup;
    }

    public static addOrUpdateRefCount(refCount: number): number {
        if (refCount < 0) {
            refCount = 0;
        }
        return refCount;
    }

    public static isNotUnit(mimeType, visibility): boolean {
        return !(MimeType.COLLECTION.valueOf() === mimeType && Visibility.PARENT.valueOf() === visibility);
    }

    public static getContentAttribute(data): string {
        let value: string[] = [];
        if (data) {
            if (typeof data === 'string') {
                value.push(data);
            } else {
                value = data;
            }
            if (value && value.length) {
                value.sort();
                let attribute = '';
                for (let i = 0; i < value.length; i++) {
                    if (i < value.length - 1) {
                        attribute = attribute.concat('~', value[i]);
                    } else {
                        attribute = attribute.concat('~', value[i], '~');
                    }
                }
                return attribute.toLowerCase().trim();
            }
        }
        return '';
    }

    public static getFindAllContentsWithIdentifierQuery(identifiers: string[]): string {
        const identifiersStr = ArrayUtil.joinPreservingQuotes(identifiers);
        const orderBy = ` order by ${ContentEntry.COLUMN_NAME_LOCAL_LAST_UPDATED_ON} desc, ${ContentEntry.COLUMN_NAME_SERVER_LAST_UPDATED_ON} desc`;
        const filter = ` where ${ContentEntry.COLUMN_NAME_IDENTIFIER} in (${identifiersStr}) AND ${ContentEntry.COLUMN_NAME_REF_COUNT} > 0`;
        return `select * from ${ContentEntry.TABLE_NAME} ${filter} ${orderBy}`;
    }

    public static getFindAllContentsQuery(): string {
        return `select * from ${ContentEntry.TABLE_NAME} where ${ContentEntry.COLUMN_NAME_REF_COUNT} > 0`;
    }

    public static constructContentDBModel(identifier, manifestVersion, localData, mimeType, contentType, visibility, path, refCount,
        contentState, audience, pragma, sizeOnDevice, board, medium, grade, primaryCategory): ContentEntry.SchemaMap {
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
            [ContentEntry.COLUMN_NAME_LOCAL_LAST_UPDATED_ON]: dayjs().format(),
            [ContentEntry.COLUMN_NAME_BOARD]: ContentUtil.getContentAttribute(board),
            [ContentEntry.COLUMN_NAME_MEDIUM]: ContentUtil.getContentAttribute(medium),
            [ContentEntry.COLUMN_NAME_GRADE]: ContentUtil.getContentAttribute(grade),
            [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: primaryCategory
        };
    }

    public static getReferenceCount(existingContent, visibility: string): number {
        let refCount: number;
        if (existingContent) {
            refCount = existingContent[ContentEntry.COLUMN_NAME_REF_COUNT];

            // if the content has a 'Default' visibility and update the same content then don't increase the reference count...
            if (!(Visibility.DEFAULT.valueOf() === existingContent[ContentEntry.COLUMN_NAME_VISIBILITY]
                && Visibility.DEFAULT.valueOf() === visibility)) {
                refCount = refCount + 1;
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
    public static getContentVisibility(existingContentInDb, objectType, previuosVisibility: string): string {
        let visibility;
        if ('Library' === objectType) {
            visibility = Visibility.PARENT.valueOf();
        } else if (existingContentInDb) {
            if (!Visibility.PARENT.valueOf() === existingContentInDb[ContentEntry.COLUMN_NAME_VISIBILITY]) {
                // If not started from child content then do not shrink visibility.
                visibility = existingContentInDb[ContentEntry.COLUMN_NAME_VISIBILITY];
            }
        }
        return visibility ? visibility : previuosVisibility;
    }

    /**
     * Add or update the content_state. contentState should not update the spine_only when importing the spine content
     * after importing content with artifacts.
     *
     */
    public static getContentState(existingContentInDb, contentState: number): number {
        if (existingContentInDb && existingContentInDb[ContentEntry.COLUMN_NAME_CONTENT_STATE] > contentState) {
            contentState = existingContentInDb[ContentEntry.COLUMN_NAME_CONTENT_STATE];
        }
        return contentState;
    }

    public static isFreeSpaceAvailable(deviceAvailableFreeSpace: number, fileSpace: number, bufferSize: number) {
        let BUFFER_SIZE = 1024 * 10;
        if (bufferSize > 0) {
            BUFFER_SIZE = bufferSize;
        }
        return deviceAvailableFreeSpace > 0 && deviceAvailableFreeSpace > (fileSpace + BUFFER_SIZE);
    }

    private static transferCount(viralityMetadata): number {
        const transferCount = viralityMetadata['transferCount'];
        return parseInt(transferCount, 0);

    }

    private static isContentMetadataAbsent(localDataMap): boolean {
        return !Boolean(localDataMap['contentMetaData']);
    }

    private static isContentMetadataPresentWithoutViralityMetadata(localData): boolean {
        return !Boolean((localData['contentMetaData'])['virality']);
    }

    public static isTrackable(content): number {
        if (content.trackable && typeof (content.trackable) === 'string') {
            content.trackable = JSON.parse(content.trackable);
        }
        if (content.trackable && content.trackable.enabled) {
            if (content.trackable.enabled === TrackingEnabled.YES) {
                return 1;
            } else if (content.mimeType === MimeType.COLLECTION) {
                return 0;
            } else {
                return -1;
            }
        } else {
            if (content.contentType.toLowerCase() === CsContentType.COURSE.toLowerCase()) {
                return 1;
            } else if (content.mimeType === MimeType.COLLECTION) {
                return 0;
            } else {
                return -1;
            }
        }
    }

    public static getParseErrorObject(data): any {
        try {
            return JSON.parse(data);
        } catch {
            return undefined;
        }
    }

}
