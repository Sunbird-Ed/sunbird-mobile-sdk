import {AppConfig} from '../../api/config/app-config';
import {ContentServiceConfig} from '../config/content-config';
import {SessionAuthenticator} from '../../auth';
import {Content, HierarchyInfo} from '../def/content';
import {ChildContent} from '../def/response';
import {QueryBuilder} from '../../db/util/query-builder';
import {DbService} from '../../db';
import {ContentUtil} from '../util/content-util';
import {CotentMapper} from '../def/cotent-mapper';
import {Observable} from 'rxjs';
import {ContentEntry} from '../db/schema';
import COLUMN_NAME_LOCAL_DATA = ContentEntry.COLUMN_NAME_LOCAL_DATA;
import {Queue} from '../../util/queue/queue';
import {ChildContents, State, MimeType} from '../util/content-constats';
import COLUMN_NAME_MIME_TYPE = ContentEntry.COLUMN_NAME_MIME_TYPE;
import {GetContentDetailsHandler} from './get-content-details-handler';

export class ChildContentsHandler {

    constructor(private dbService: DbService) {
    }

    public async fetchChildrenOfContent(contentInDb: ContentEntry.SchemaMap,
                                        currentLevel: number,
                                        level: number,
                                        hierarchyInfoList?: HierarchyInfo[]): Promise<Content> {
        const content: Content = CotentMapper.mapContentDBEntryToContent(contentInDb);
        const rows: ContentEntry.SchemaMap[] =
            await this.getSortedChildrenList(contentInDb[ContentEntry.COLUMN_NAME_LOCAL_DATA], ChildContents.ALL);

        if (rows && rows.length > 0) {
            if (!hierarchyInfoList) {
                content.hierarchyInfo = [
                    {
                        identifier: contentInDb[ContentEntry.COLUMN_NAME_IDENTIFIER],
                        contentType: contentInDb[ContentEntry.COLUMN_NAME_CONTENT_TYPE]
                    }
                ];
            }

            if (level === -1 || currentLevel <= level) {
                content.children = await Promise.all(rows.map((row) =>
                    this.fetchChildrenOfContent(
                        row,
                        currentLevel + 1,
                        level,
                        hierarchyInfoList
                    )
                ));
            }
        } else {
            content.hierarchyInfo = hierarchyInfoList;
        }

        return content;
    }

    private async getSortedChildrenList(localData: string, level: number): Promise<ContentEntry.SchemaMap[]> {
        const data = JSON.parse(localData);
        let childContents: ChildContent[] = Array.of(data.children);
        if (!childContents || !childContents.length) {
            return [];
        }

        childContents = childContents.sort((childContent1, childContent2) => {
            return (childContent1.index - childContent2.index);
        });

        const childIdentifiers: string[] = [];
        const whennAndThen = '';
        let i = 0;
        childContents.forEach(childContent => {
            childIdentifiers.push(childContent.identifier);
            whennAndThen.concat(' WHEN ' + '\'' + childContent.identifier + '\'' + ' THEN ' + i);
            i = i + 1;
        });

        const orderBy = '';
        if (i > 0) {
            orderBy.concat(' ORDER BY CASE ' + ContentEntry.COLUMN_NAME_IDENTIFIER + ' ' + whennAndThen + ' END');
        }

        let filter = '';
        switch (level) {
            case ChildContents.DOWNLOADED.valueOf():
                filter = ' AND ' + ContentEntry.COLUMN_NAME_CONTENT_STATE + '=\'' + State.ARTIFACT_AVAILABLE + '\'';
                break;
            case ChildContents.SPINE.valueOf():
                filter = ' AND ' + ContentEntry.COLUMN_NAME_CONTENT_STATE + '=\'' + State.ONLY_SPINE + '\'';
                break;
            case ChildContents.ALL.valueOf():
            default:
                filter = '';
                break;
        }

        const query = `select * from ${ContentEntry.TABLE_NAME}
                        where ${ContentEntry.COLUMN_NAME_IDENTIFIER}
                        in ('${childIdentifiers.join(',')}') ${filter} ${orderBy}`;
        return this.dbService.execute(query).toPromise();
    }

    async getContentsKeyList(contentInDb: ContentEntry.SchemaMap): Promise<string[]> {
        const contentKeyList: string[] = [];
        const contentStack = new Stack<ContentEntry.SchemaMap>();
        const parentChildRelation: string[] = [];
        let key = '';
        contentStack.push(contentInDb);
        let node: ContentEntry.SchemaMap;
        while (!contentStack.isEmpty()) {
            node = contentStack.pop();
            if (ContentUtil.hasChildren(node[ContentEntry.COLUMN_NAME_LOCAL_DATA])) {
                const childContentsInDb: ContentEntry.SchemaMap[] = await this.getSortedChildrenList(
                    node[ContentEntry.COLUMN_NAME_LOCAL_DATA],
                    ChildContents.ALL);
                contentStack.addAll(childContentsInDb);
                childContentsInDb.forEach(() => {
                    parentChildRelation.push(node[ContentEntry.COLUMN_NAME_IDENTIFIER].concat('/',
                        childContentsInDb[ContentEntry.COLUMN_NAME_IDENTIFIER]));
                });

            }

            if (!key) {
                key = node[ContentEntry.COLUMN_NAME_IDENTIFIER];
            } else {
                let tempKey: string;
                for (let i: number = key.split('/').length - 1; i >= 0; i--) {
                    const immediateParent: string = key.split('/')[i];
                    if (parentChildRelation.indexOf(immediateParent + '/' + node[ContentEntry.COLUMN_NAME_IDENTIFIER])) {
                        break;
                    } else {
                        key = key.substring(0, key.lastIndexOf('/'));
                    }
                }
                if (MimeType.COLLECTION.valueOf() === node[COLUMN_NAME_MIME_TYPE]) {
                    key = key + '/' + node[ContentEntry.COLUMN_NAME_IDENTIFIER];
                } else {
                    tempKey = key + '/' + node[ContentEntry.COLUMN_NAME_IDENTIFIER];
                    contentKeyList.push(tempKey);
                }
            }


        }
        return contentKeyList;
    }

    async getNextContentFromDB(hierarchyInfoList: HierarchyInfo[],
                               currentIdentifier: string,
                               contentKeyList: string[]): Promise<Content> {
        const nextContentHierarchyList: HierarchyInfo[] = [];
        let nextContent;
        const nextContentIdentifier = this.getNextContentIdentifier(hierarchyInfoList, currentIdentifier, contentKeyList);
        if (nextContentIdentifier) {
            const nextContentIdentifierList: string[] = nextContentIdentifier.split('/');
            const idCount: number = nextContentIdentifierList.length;
            let isAllHierarchyContentFound = true;
            for (let i = 0; i < (idCount - 1); i++) {
                const contentInDb: ContentEntry.SchemaMap[] = await new GetContentDetailsHandler(this.dbService)
                    .getContentFromDB(nextContentIdentifierList[i]);
                if (contentInDb[0]) {
                    nextContentHierarchyList.push({
                        'identifier': contentInDb[0][ContentEntry.COLUMN_NAME_IDENTIFIER],
                        'contentType': contentInDb[0][ContentEntry.COLUMN_NAME_CONTENT_TYPE]
                    });
                } else {
                    isAllHierarchyContentFound = false;
                    break;
                }
            }
            if (Boolean(isAllHierarchyContentFound)) {
                const nextContentInDb: ContentEntry.SchemaMap[] = await new GetContentDetailsHandler(this.dbService).getContentFromDB(
                    nextContentIdentifierList[idCount - 1]);
                if (nextContentInDb && nextContentInDb[0]) {
                    nextContent = CotentMapper.mapContentDBEntryToContent(nextContentInDb[0]);
                    nextContent.hierarchyInfo = hierarchyInfoList;
                    nextContent.rollup = ContentUtil.getContentRollup(nextContent.identifier, nextContent.hierarchyInfo);
                }
            }
        }
        return nextContent;
    }

    getNextContentIdentifier(hierarchyInfoList: HierarchyInfo[],
                             currentIdentifier: string,
                             contentKeyList: string[]): string {
        let currentIdentifiers;
        let nextContentIdentifier;
        hierarchyInfoList.forEach((hierarchyItem) => {
            if (!currentIdentifiers) {
                currentIdentifiers = hierarchyItem.identifier;
            } else {
                currentIdentifiers = currentIdentifiers.concat('/', hierarchyItem.identifier);
            }
        });
        currentIdentifiers = currentIdentifiers.concat('/', currentIdentifier);
        const indexOfCurrentContentIdentifier: number = contentKeyList.indexOf(currentIdentifiers);
        if (indexOfCurrentContentIdentifier > 0) {
            nextContentIdentifier = contentKeyList[indexOfCurrentContentIdentifier - 1];
        }
        return nextContentIdentifier;
    }

}
