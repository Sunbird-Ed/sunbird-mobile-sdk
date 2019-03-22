import {ContentData, HierarchyInfo} from '../def/content';
import {ContentDisposition, ContentEncoding, ContentStatus, State, Visibility} from './content-constants';
import {ChildContent} from '../def/response';
import {Rollup} from '../../telemetry';
import {AppConfig} from '../../api/config/app-config';
import {ContentEntry} from '../db/schema';
import {NumberUtil} from '../../util/number-util';
import COLUMN_NAME_IDENTIFIER = ContentEntry.COLUMN_NAME_IDENTIFIER;
import COLUMN_NAME_CONTENT_STATE = ContentEntry.COLUMN_NAME_CONTENT_STATE;
import COLUMN_NAME_LOCAL_DATA = ContentEntry.COLUMN_NAME_LOCAL_DATA;
import COLUMN_NAME_VISIBILITY = ContentEntry.COLUMN_NAME_VISIBILITY;

export class ContentUtil {
    private static DEFAULT_PACKAGE_VERSION = -1;
    public static defaultCompatibilityLevel = 1;
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
        const compaitibilityLevel = contentData.compatibilityLevel;
        return compaitibilityLevel ? compaitibilityLevel : this.defaultCompatibilityLevel;
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
     * @param oldContent    Old ContentModel
     * @param newIdentifier New content identifier
     * @return True - if file exists, False- does not exists
     */
    public static doesContentExist(existingContentInDB: ContentEntry.SchemaMap | undefined, newIdentifier: string,
                                   newPkgVersion: number, keepLowerVersion: boolean): boolean {
        if (!existingContentInDB) {
            return false;
        }

        let doestExist = false;
        const oldIdentifier = existingContentInDB[COLUMN_NAME_IDENTIFIER];
        if (oldIdentifier === newIdentifier) {
            let overrideDB = false;
            if (keepLowerVersion) {
                if ((ContentUtil.readPkgVersion(JSON.parse(existingContentInDB[COLUMN_NAME_LOCAL_DATA]) < newPkgVersion))) {
                    overrideDB = false;
                } else {
                    overrideDB = true;
                }
            } else if ((ContentUtil.readPkgVersion(JSON.parse(existingContentInDB[COLUMN_NAME_LOCAL_DATA]) < newPkgVersion))) {
                overrideDB = true;
            }

            if (overrideDB
                // If old content's pkgVersion is less than the new content then return false.
                //                        && ((readPkgVersion(existingContentInDB.getLocalData()) < newPkgVersion)
                //  If content_state is other than artifact available then also return  false.
                || (!keepLowerVersion && existingContentInDB[COLUMN_NAME_CONTENT_STATE] !== State.ARTIFACT_AVAILABLE.valueOf())) {
                doestExist = false;
            } else {
                doestExist = true;
            }
        }


        return doestExist;
    }

    public static getContentRootDir(rootFilePath: string): string {
        return rootFilePath.concat('content');
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
            && ContentEncoding.IDENTITY === contentEncoding;
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

    public static getExportedFileName(contentsInDb: ContentEntry.SchemaMap[]) {
        let fileName = 'blank.ecar';
        let firstContent: ContentEntry.SchemaMap;
        let rootContents = 0;

        if (contentsInDb.length > 0) {
            firstContent = contentsInDb[0];
        }

        const appendName = '';
        contentsInDb.forEach((contentInDb) => {
            if (Visibility.DEFAULT.valueOf() === contentInDb[COLUMN_NAME_VISIBILITY]) {
                rootContents++;
            }
        });

        if (rootContents > 1) {
            appendName.concat((rootContents - 1).toString());
        }

        if (firstContent!) {
            const localData = JSON.parse(firstContent![COLUMN_NAME_LOCAL_DATA]);
            let name = localData.name;
            if (name && name.length > ContentUtil.MAX_CONTENT_NAME) {
                name = name.substring(0, ContentUtil.MAX_CONTENT_NAME - 3) + '...';
            }

            const pkgVersion = localData.pkgVersion;
            fileName = `${name}-v${pkgVersion}${appendName}.ecar`;
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

}
