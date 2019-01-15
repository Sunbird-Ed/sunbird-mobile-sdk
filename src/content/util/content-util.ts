import {ContentData, HierarchyInfo, Rollup} from '../def/content';
import {State} from './content-constats';
import {ChildContent} from '../def/response';

export class ContentUtil {
    private static DEFAULT_PACKAGE_VERSION = -1;


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

    public static hasChildren(localData: string): boolean {
        return JSON.parse(localData).children;
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

    public static getChildContentsIdentifiers(localData: string): string[] {
        const childIdentifiers: string[] = [];
        const contentData = JSON.parse(localData);
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



}
