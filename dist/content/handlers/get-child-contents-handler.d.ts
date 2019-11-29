import { Content, HierarchyInfo } from '../def/content';
import { DbService } from '../../db';
import { ContentEntry } from '../db/schema';
import { GetContentDetailsHandler } from './get-content-details-handler';
import { FileService } from '../../util/file/def/file-service';
export declare class ChildContentsHandler {
    private dbService;
    private getContentDetailsHandler;
    private fileService?;
    constructor(dbService: DbService, getContentDetailsHandler: GetContentDetailsHandler, fileService?: FileService | undefined);
    fetchChildrenOfContent(contentInDb: ContentEntry.SchemaMap, childContentsMap: any, currentLevel: number, level: number, sourceInfoList?: HierarchyInfo[]): Promise<Content>;
    getContentsKeyList(contentInDb: ContentEntry.SchemaMap): Promise<string[]>;
    getContentFromDB(hierarchyInfoList: HierarchyInfo[], identifier: string, shouldConvertBasePath?: boolean): Promise<Content>;
    getNextContentIdentifier(hierarchyInfoList: HierarchyInfo[], currentIdentifier: string, contentKeyList: string[]): string;
    getPreviousContentIdentifier(hierarchyInfoList: HierarchyInfo[], currentIdentifier: string, contentKeyList: string[]): string;
    private getSortedChildrenListOld;
    private getSortedChildrenList;
    getChildIdentifiersFromManifest(path: string): Promise<string[]>;
}
