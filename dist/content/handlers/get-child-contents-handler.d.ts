import { Content, HierarchyInfo } from '../def/content';
import { DbService } from '../../db';
import { ContentEntry } from '../db/schema';
import { GetContentDetailsHandler } from './get-content-details-handler';
export declare class ChildContentsHandler {
    private dbService;
    private getContentDetailsHandler;
    constructor(dbService: DbService, getContentDetailsHandler: GetContentDetailsHandler);
    fetchChildrenOfContent(contentInDb: ContentEntry.SchemaMap, currentLevel: number, level: number, hierarchyInfoList?: HierarchyInfo[]): Promise<Content>;
    private getSortedChildrenList;
    getContentsKeyList(contentInDb: ContentEntry.SchemaMap): Promise<string[]>;
    getContentFromDB(hierarchyInfoList: HierarchyInfo[], identifier: string): Promise<Content>;
    getNextContentIdentifier(hierarchyInfoList: HierarchyInfo[], currentIdentifier: string, contentKeyList: string[]): string;
    getPreviuosContentIdentifier(hierarchyInfoList: HierarchyInfo[], currentIdentifier: string, contentKeyList: string[]): string;
}
