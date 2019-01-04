import {
    ChildContentRequest,
    ContentDeleteRequest,
    ContentDetailRequest,
    ContentExportResponse,
    ContentImportRequest,
    ContentRequest, DownloadAction,
    EcarImportRequest
} from './requests';
import {Response} from '../../api';
import {Observable} from 'rxjs';


export interface ContentService {

    /**
     * This api is used to get the content details about a specific content.
     * <p>
     * <p>
     * On successful fetching the content details, the response will return status as TRUE and with {@link Content} in the result.
     * <p>
     * <p>
     * On failing to fetch the content details, the response will return status as FALSE with the following error code
     * <p>NO_DATA_FOUND
     *
     * @param contentDetailsRequest - {@link ContentDetailsRequest}
     * @return {@link GenieResponse<Content>}
     */
    getContentDetails(request: ContentDetailRequest): Observable<Response>;


    /**
     * This api is used to get all the contents.
     * <p>
     * <p>
     * Response status will always be TRUE with {@link List<Content>} set in the result.
     *
     * @param criteria - {@link ContentFilterCriteria}
     * @return {@link GenieResponse<List<Content>>}
     */
    getAllLocalContent(criteria: ContentRequest): Promise<Response>;

    /**
     * This api is used to get the child contents of a particular content, this is used in the case of COLLECTION/TEXTBOOK.
     * <p>
     * <p>
     * On successful fetching the content details, the response will return status as TRUE and with {@link List<Content>} in the result.
     * <p>
     * <p>
     * On failing to fetch the child content details, the response will return status as FALSE with the following error code
     * <p>NO_DATA_FOUND
     *
     * @param childContentRequest - {@link ChildContentRequest}
     * @return {@link GenieResponse<Content>}
     */
    getChildContents(childContentRequest: ChildContentRequest): Promise<Response>;


    /**
     * This api is used to delete a particular content.
     * <p>
     * <p>
     * On successful deleting the content, the response will return status as TRUE.
     * <p>
     * <p>
     * On failing to delete a content, the response will return status as FALSE with the following error code
     * <p>NO_DATA_FOUND
     *
     * @param contentDeleteRequest - {@link ContentDeleteRequest}
     * @return - {@link GenieResponse<List<ContentDeleteResponse>>}
     */
    deleteContent(contentDeleteRequest: ContentDeleteRequest): Promise<Response>;

    /**
     * This api is used to get all the previous {@link List<Content>} based on the hierarchy of {@link List<String>} identifiers passed
     * <p>
     * <p>
     * On successful finding the previous list of contents, the response will return status as TRUE and the result
     * will be set with {@link List<Content>}
     * @param contentHierarchy         - {@link List<HierarchyInfo>}
     * @param currentContentIdentifier The current content identifier
     * @return - {@link GenieResponse<Content>}
     */
    prevContent(request: ChildContentRequest): Promise<Response>;

    /**
     * This api is used to get all the next {@link List<Content>} based on the hierarchy of {@link List<String>} identifiers passed
     * <p>
     * <p>
     * On successful finding the next list of contents, the response will return
     * status as TRUE and the result will be set with {@link List<Content>}
     *
     * @param contentHierarchy         - {@link List<HierarchyInfo>}
     * @param currentContentIdentifier The current content identifier
     * @return - {@link GenieResponse<Content>}
     */
    nextContent(request: ChildContentRequest): Promise<Response>;

    /**
     * This api is used to import the ecar.
     * <p>
     * <p>
     * On successful importing the content, the response will return status as TRUE
     * <p>
     * <p>
     * On failing to import the content, the response will be with return status as FALSE and wih the following error
     * <p>INVALID_FILE
     *
     * @param ecarImportRequest - {@link ContentImportRequest}
     * @return - {@link GenieResponse<List<ContentImportResponse>>}
     */
    importEcar(ecarImportRequest: EcarImportRequest): Promise<Response>;

    /**
     * This api is used to import the content of specified contentId's from server.
     * <p>
     * <p>
     * On successful importing the content, the response will return status as TRUE
     *
     * @param contentImportRequest - {@link ContentImportRequest}
     * @return - {@link GenieResponse<List<ContentImportResponse>>}
     */
    importContent(contentImportRequest: ContentImportRequest): Promise<Response>;

    /**
     * This api is used to get the status of when importing a content
     * <p>
     * <p>
     * Response will always be status set TRUE, with {@link ContentImportResponse} set in result.
     *
     * @param contentId Content id.
     * @return {@link GenieResponse<ContentImportResponse>}
     */
    getImportStatus(contentId: string): Promise<Response>;


    /**
     * This api is used to cancel the on-going download
     * <p>
     * <p>
     * Response will always be status set TRUE.
     *
     * @param contentId Content id.
     * @return {@link GenieResponse<Void>}
     */
    cancelDownload(contentId: string);

    /**
     * This api is used to export the list of contentId's needed.
     * <p>
     * <p>
     * On successful exporting the content, the response will return status as TRUE, with response set in result
     * <p>
     * <p>
     * On failing to export the content, the response will be with return status as FALSE and with the following error
     * <p>EXPORT_FAILED
     *
     * @param contentExportRequest {@link ContentExportRequest}
     * @return {@link GenieResponse<ContentExportResponse>}
     */
    exportContent(contentExportRequest: ContentExportResponse);

    /**
     * This api is used to pause / resume the  download queue.
     * <p>
     * <p>
     * On successful setting the status, the response will return status as TRUE, with response set in result
     * <p>
     * <p>
     * On failing tosetting the status, the response will be with return status as FALSE
     */
    setDownloadAction(action: DownloadAction);

    /**
     * This api is used get Download queue state.
     * <p>
     * <p>
     * Response will always be status set TRUE, with {@link DownloadAction} set in result.
     * <p>
     */
    getDownloadState(): Promise<Response>;

}
