import {ContentService} from '../def/content-service';
import {Observable} from 'rxjs';
import {
    ChildContentRequest,
    ContentDeleteRequest,
    ContentDetailRequest,
    ContentExportResponse,
    ContentImportRequest,
    ContentRequest,
    ContentSearchCriteria,
    EcarImportRequest
} from '../def/requests';
import {Content, HierarchyInfo} from '../def/content';
import {ProfileService} from '../../profile';
import {KeyValueStore} from '../../key-value-store';
import {SessionAuthenticator} from '../../auth';
import {GetContentDetailsHandler} from '../handlers/get-content-details-handler';
import {DbService} from '../../db';
import {ContentServiceConfig} from '../config/content-config';
import {ContentDeleteResponse, ContentDeleteStatus, ContentSearchResult} from '../def/response';
import {ChildContentsHandler} from '../handlers/get-child-contents-handler';
import {ContentEntry} from '../db/schema';
import {ContentUtil} from '../util/content-util';
import {DeleteContentHandler} from '../handlers/delete-content-handler';
import {ApiService} from '../../api/def/api-service';
import COLUMN_NAME_LOCAL_DATA = ContentEntry.COLUMN_NAME_LOCAL_DATA;

export class ContentServiceImpl implements ContentService {
    constructor(private contentServiceConfig: ContentServiceConfig,
                private apiService: ApiService,
                private dbService: DbService,
                private profileService: ProfileService,
                private keyValueStore: KeyValueStore,
                private sessionAuthenticator: SessionAuthenticator) {
    }

    getContentDetails(request: ContentDetailRequest): Observable<Content> {
        return new GetContentDetailsHandler(
            this.dbService, this.contentServiceConfig, this.sessionAuthenticator, this.apiService).handle(request);
    }

    cancelImport(contentId: string) {
        // TODO
        throw new Error('Not Implemented yet');
    }

    deleteContent(contentDeleteRequest: ContentDeleteRequest): Observable<ContentDeleteResponse[]> {
        const contentDeleteResponse: ContentDeleteResponse[] = [];
        const getContentsHandler = new GetContentDetailsHandler(this.dbService);
        const deleteContentHandler = new DeleteContentHandler(this.dbService);
        contentDeleteRequest.contentDeleteList.forEach(async (contentDelete) => {
            const contentInDb: ContentEntry.SchemaMap[] = await getContentsHandler.getContentFromDB(contentDelete.contentId);
            if (contentInDb && contentInDb[0]) {
                contentDeleteResponse.push({
                    identifier: contentDelete.contentId,
                    status: ContentDeleteStatus.DELETED_SUCCESSFULLY
                });
                if (ContentUtil.hasPreRequisites(contentInDb[0][COLUMN_NAME_LOCAL_DATA])) {
                }

                if (ContentUtil.hasChildren(contentInDb[0][COLUMN_NAME_LOCAL_DATA])) {
                    await deleteContentHandler.deleteAllChildren(contentInDb[0], contentDelete.isChildContent);
                }

                await deleteContentHandler.deleteOrUpdateContent(contentInDb[0], false, contentDelete.isChildContent);

            } else {
                contentDeleteResponse.push({
                    identifier: contentDelete.contentId,
                    status: ContentDeleteStatus.NOT_FOUND
                });
            }
        });

        return Observable.of(contentDeleteResponse);
    }

    exportContent(contentExportRequest: ContentExportResponse) {
        // TODO
        throw new Error('Not Implemented yet');
    }

    getChildContents(childContentRequest: ChildContentRequest): Observable<any> {
        const childContentHandler = new ChildContentsHandler(this.dbService);
        let hierarchyInfoList: HierarchyInfo[] = childContentRequest.hierarchyInfo;
        if (!hierarchyInfoList) {
            hierarchyInfoList = [];
        } else if (hierarchyInfoList.length > 0) {
            if (hierarchyInfoList[hierarchyInfoList.length - 1].identifier === childContentRequest.contentId) {
                const length = hierarchyInfoList.length;
                hierarchyInfoList.splice((length - 1), 1);
            }
        }

        return this.dbService.read(GetContentDetailsHandler.getReadContentQuery(childContentRequest.contentId))
            .mergeMap((rows: ContentEntry.SchemaMap[]) => {
                return childContentHandler.fetchChildrenOfContent(rows[0], 0, childContentRequest.level, hierarchyInfoList);
            });
    }

    getContents(criteria: ContentRequest): Observable<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }

    getDownloadState(): Promise<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }

    importContent(contentImportRequest: ContentImportRequest): Observable<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }

    importEcar(ecarImportRequest: EcarImportRequest): Observable<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }

    nextContent(hierarchyInfo: HierarchyInfo[], currentContentIdentifier: string): Observable<Content> {
        const childContentHandler = new ChildContentsHandler(this.dbService);
        return this.dbService.read(GetContentDetailsHandler.getReadContentQuery(hierarchyInfo[0].identifier))
            .mergeMap(async (rows: ContentEntry.SchemaMap[]) => {
                const contentKeyList = await childContentHandler.getContentsKeyList(rows[0]);

                return childContentHandler.getNextContentFromDB(hierarchyInfo,
                    currentContentIdentifier,
                    contentKeyList);
            });
    }

    prevContent(hierarchyInfo: HierarchyInfo[], currentContentIdentifier: string): Observable<Content> {
        const childContentHandler = new ChildContentsHandler(this.dbService);

        return this.dbService.read(GetContentDetailsHandler.getReadContentQuery(hierarchyInfo[0].identifier))
            .mergeMap(async (rows: ContentEntry.SchemaMap[]) => {
                const contentKeyList = await childContentHandler.getContentsKeyList(rows[0]);

                return childContentHandler.getNextContentFromDB(hierarchyInfo,
                    currentContentIdentifier,
                    contentKeyList);
            });
    }

    subscribeForImportStatus(contentId: string): Observable<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }

    searchContent(criteria: ContentSearchCriteria): Observable<ContentSearchResult> {
        // TODO
        throw new Error('Not Implemented yet');
    }

    cancelDownload(contentId: string): Observable<undefined> {
        // TODO
        throw new Error('Not Implemented yet');
    }
}
