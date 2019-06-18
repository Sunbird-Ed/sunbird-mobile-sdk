import { ContentData, HierarchyInfo } from '../def/content';
import { Rollup } from '../../telemetry';
import { AppConfig } from '../../api/config/app-config';
import { ContentEntry } from '../db/schema';
export declare class ContentUtil {
    private static DEFAULT_PACKAGE_VERSION;
    static defaultCompatibilityLevel: number;
    private static INITIAL_VALUE_FOR_TRANSFER_COUNT;
    private static readonly MAX_CONTENT_NAME;
    static isAvailableLocally(contentState: number): boolean;
    static isUpdateAvailable(serverData: ContentData, localData: ContentData): boolean;
    static hasChildren(localData: any): boolean;
    static getContentRollup(identifier: string, hierarchyInfoList: HierarchyInfo[]): Rollup;
    static getChildContentsIdentifiers(localData: any): string[];
    /**
     * This method gets you the first part of the string that is divided after last index of "/"
     *
     * @param contentFolderName
     * @return
     */
    static getFirstPartOfThePathNameOnLastDelimiter(contentFolderName: string): string | undefined;
    static hasPreRequisites(localData: string): boolean;
    static readVisibility(contentData: any): string;
    static isCompatible(appConfig: AppConfig, compatibilityLevel: any): boolean;
    static readCompatibilityLevel(contentData: any): number;
    static isDraftContent(status: any): boolean;
    static isExpired(expiryDate: string): boolean;
    /**
     * If status is DRAFT and pkgVersion == 0 then don't do the duplicate check..
     */
    static isDuplicateCheckRequired(isDraftContent: any, pkgVersion: number): boolean;
    static isImportFileExist(oldContentModel: ContentEntry.SchemaMap | undefined, contentData: any): boolean;
    static readPkgVersion(contentData: any): number;
    static readContentType(contentData: any): string;
    static readAudience(contentData: any): string;
    static readPragma(contentData: any): string;
    /**
     * To Check whether the content is exist or not.
     *
     * @param oldContent    Old ContentModel
     * @param newIdentifier New content identifier
     * @return True - if file exists, False- does not exists
     */
    static doesContentExist(existingContentInDB: ContentEntry.SchemaMap | undefined, newIdentifier: string, newPkgVersion: number, keepLowerVersion: boolean): boolean;
    static getContentRootDir(rootFilePath: string): string;
    private static transferCount;
    private static isContentMetadataAbsent;
    private static isContentMetadataPresentWithoutViralityMetadata;
    static addOrUpdateViralityMetadata(localData: any, origin: string): void;
    static addViralityMetadataIfMissing(localData: any, origin: string): void;
    /**
     * Content with artifact without zip i.e. pfd, mp4
     *
     * @param contentDisposition
     * @param contentEncoding
     * @return
     */
    static isInlineIdentity(contentDisposition: string, contentEncoding: string): boolean | "";
    static isOnlineContent(contentData: any): boolean;
    static addOrUpdateDialcodeMapping(jsonStr: string, identifier: string, rootNodeIdentifier: string): string;
    static deDupe<T>(array: T[], property: any): T[];
    static getExportedFileName(contentsInDb: ContentEntry.SchemaMap[]): string;
    static readOriginFromContentMap(item: any): string;
    static readTransferCountFromContentMap(item: any): number;
    static readSizeFromContentMap(item: any): string;
    static getUidnIdentifierFiler(uid: string, identifier: any): string;
    static getBasePath(basePath: string): string;
    static getRollup(identifier: string, hierachyInfo: HierarchyInfo[]): Rollup;
    static addOrUpdateRefCount(refCount: number): number;
    static isNotUnit(mimeType: any, visibility: any): boolean;
    static getContentAttribute(data: any): string;
    static getFindAllContentsWithIdentifierQuery(identifiers: string[]): string;
    static getFindAllContentsQuery(): string;
}
