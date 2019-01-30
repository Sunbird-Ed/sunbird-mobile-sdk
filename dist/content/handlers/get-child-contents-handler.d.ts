import { Content, HierarchyInfo } from '../def/content';
import { DbService } from '../../db';
import { ContentEntry } from '../db/schema';
export declare class ChildContentsHandler {
    private dbService;
    constructor(dbService: DbService);
    fetchChildrenOfContent(contentInDb: ContentEntry.SchemaMap, currentLevel: number, level: number, hierarchyInfoList?: HierarchyInfo[]): Promise<Content>;
    private getSortedChildrenList;
    getContentsKeyList(contentInDb: ContentEntry.SchemaMap): Promise<string[]>;
    getNextContentFromDB(hierarchyInfoList: HierarchyInfo[], currentIdentifier: string, contentKeyList: string[]): Promise<Content>;
    getNextContentIdentifier(hierarchyInfoList: HierarchyInfo[], currentIdentifier: string, contentKeyList: string[]): string;
}
