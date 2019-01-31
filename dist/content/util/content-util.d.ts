import { ContentData, HierarchyInfo } from '../def/content';
import { Rollup } from '../../telemetry';
export declare class ContentUtil {
    private static DEFAULT_PACKAGE_VERSION;
    static isAvailableLocally(contentState: number): boolean;
    static isUpdateAvailable(serverData: ContentData, localData: ContentData): boolean;
    static hasChildren(localData: string): boolean;
    static getContentRollup(identifier: string, hierarchyInfoList: HierarchyInfo[]): Rollup;
    static getChildContentsIdentifiers(localData: string): string[];
    /**
     * This method gets you the first part of the string that is divided after last index of "/"
     *
     * @param contentFolderName
     * @return
     */
    static getFirstPartOfThePathNameOnLastDelimiter(contentFolderName: string): string | undefined;
    static hasPreRequisites(localData: string): boolean;
}
