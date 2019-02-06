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
import {ApiService, Response} from '../../api';
import {ProfileService} from '../../profile';
import {KeyValueStore} from '../../key-value-store';
import {SessionAuthenticator} from '../../auth';
import {GetContentDetailsHandler} from '../handlers/get-content-details-handler';
import {DbService} from '../../db';
import {ContentServiceConfig} from '../config/content-config';
import {ContentDeleteResponse, ContentDeleteStatus, ContentImportResponse, ContentSearchResult, SearchResponse} from '../def/response';
import {ChildContentsHandler} from '../handlers/get-child-contents-handler';
import {ContentEntry} from '../db/schema';
import {ContentUtil} from '../util/content-util';
import {DeleteContentHandler} from '../handlers/delete-content-handler';
import COLUMN_NAME_LOCAL_DATA = ContentEntry.COLUMN_NAME_LOCAL_DATA;
import {SearchContentHandler} from '../handlers/search-content-handler';
import {AppConfig} from '../../api/config/app-config';
import {FileService} from '../../util/file/def/file-service';
import {FileEntry} from '../../util/file';
import {FileUtil} from '../../util/file/util/file-util';
import {ErrorCode, FileExtension} from '../util/content-constants';

export class ContentServiceImpl implements ContentService {
    constructor(private contentServiceConfig: ContentServiceConfig,
                private apiService: ApiService,
                private dbService: DbService,
                private profileService: ProfileService,
                private appConfig: AppConfig,
                private keyValueStore: KeyValueStore,
                private sessionAuthenticator: SessionAuthenticator,
                private fileService: FileService) {
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

    importEcar(ecarImportRequest: EcarImportRequest): Observable<Response<ContentImportResponse>> {

        this.fileService.exists(ecarImportRequest.sourceFilePath).then((fileEntry: FileEntry) => {
            if (FileUtil.getFileExtension(ecarImportRequest.sourceFilePath) !== FileExtension.CONTENT) {
                const  response: Response = new Response();
                response.errorMesg = ErrorCode.ECAR_NOT_FOUND.valueOf();
                return Observable.of(response);
            } else {
                this.fileService.getFreeDiskSpace();
                // TODO Add device memory check before import

            }

        }).catch((error) => {

        });


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


    searchContent(request: ContentSearchCriteria): Observable<ContentSearchResult> {
        const searchHandler: SearchContentHandler = new SearchContentHandler(this.appConfig,
            this.contentServiceConfig,
            this.sessionAuthenticator);
        const searchRequest = searchHandler.getSearchRequest(request);
        const httpRequest = searchHandler.getRequest(searchRequest, request.framework, request.languageCode);
        return this.apiService.fetch<SearchResponse>(httpRequest)
            .mergeMap((response: Response<SearchResponse>) => {
                return Observable.of(searchHandler.mapSearchResponse(response.body));
            });

    }

    cancelDownload(contentId: string): Observable<undefined> {
        // TODO
        throw new Error('Not Implemented yet');
    }
}
