import {
    ChildContentRequest,
    Content,
    ContentData,
    ContentDeleteRequest,
    ContentDeleteResponse,
    ContentDeleteStatus,
    ContentDetailRequest,
    ContentDownloadRequest,
    ContentEventType,
    ContentExportRequest,
    ContentExportResponse,
    ContentFeedbackService,
    ContentImport,
    ContentImportRequest,
    ContentImportResponse,
    ContentImportStatus,
    ContentMarkerRequest,
    ContentRequest,
    ContentSearchCriteria,
    ContentSearchResult,
    ContentService,
    ContentServiceConfig,
    ContentsGroupedByPageSection,
    EcarImportRequest,
    ExportContentContext,
    FileExtension,
    HierarchyInfo,
    ImportContentContext,
    MimeType,
    PageSection,
    RelevantContentRequest,
    RelevantContentResponse,
    RelevantContentResponsePlayer,
    SearchResponse
} from '..';
import {Observable} from 'rxjs';
import {ApiService, Response} from '../../api';
import {ProfileService} from '../../profile';
import {GetContentDetailsHandler} from '../handlers/get-content-details-handler';
import {DbService} from '../../db';
import {ChildContentsHandler} from '../handlers/get-child-contents-handler';
import {ContentEntry, ContentMarkerEntry} from '../db/schema';
import {ContentUtil} from '../util/content-util';
import {DeleteContentHandler} from '../handlers/delete-content-handler';
import {SearchContentHandler} from '../handlers/search-content-handler';
import {AppConfig} from '../../api/config/app-config';
import {FileService} from '../../util/file/def/file-service';
import {DirectoryEntry, Entry} from '../../util/file';
import {GetContentsHandler} from '../handlers/get-contents-handler';
import {ContentMapper} from '../util/content-mapper';
import {ImportNExportHandler} from '../handlers/import-n-export-handler';
import {DeviceInfo} from '../../util/device/def/device-info';
import {CleanTempLoc} from '../handlers/export/clean-temp-loc';
import {CreateContentExportManifest} from '../handlers/export/create-content-export-manifest';
import {WriteManifest} from '../handlers/export/write-manifest';
import {CompressContent} from '../handlers/export/compress-content';
import {ZipService} from '../../util/zip/def/zip-service';
import {DeviceMemoryCheck} from '../handlers/export/device-memory-check';
import {CopyAsset} from '../handlers/export/copy-asset';
import {EcarBundle} from '../handlers/export/ecar-bundle';
import {DeleteTempEcar} from '../handlers/export/delete-temp-ecar';
import {ExtractEcar} from '../handlers/import/extract-ecar';
import {ValidateEcar} from '../handlers/import/validate-ecar';
import {ExtractPayloads} from '../handlers/import/extract-payloads';
import {CreateContentImportManifest} from '../handlers/import/create-content-import-manifest';
import {EcarCleanup} from '../handlers/import/ecar-cleanup';
import {TelemetryService} from '../../telemetry';
import {UpdateSizeOnDevice} from '../handlers/import/update-size-on-device';
import {CreateTempLoc} from '../handlers/export/create-temp-loc';
import {SearchRequest} from '../def/search-request';
import {ContentSearchApiHandler} from '../handlers/import/content-search-api-handler';
import {ArrayUtil} from '../../util/array-util';
import {FileUtil} from '../../util/file/util/file-util';
import {DownloadRequest, DownloadService} from '../../util/download';
import {DownloadCompleteDelegate} from '../../util/download/def/download-complete-delegate';
import {EventNamespace, EventsBusService} from '../../events-bus';
import {GenerateImportShareTelemetry} from '../handlers/import/generate-import-share-telemetry';
import {GenerateExportShareTelemetry} from '../handlers/export/generate-export-share-telemetry';
import {SharedPreferences} from '../../util/shared-preferences';
import {GenerateInteractTelemetry} from '../handlers/import/generate-interact-telemetry';
import {CachedItemStore} from '../../key-value-store';
import * as SHA1 from 'crypto-js/sha1';
import {FrameworkKeys} from '../../preference-keys';
import {CreateHierarchy} from '../handlers/import/create-hierarchy';

export class ContentServiceImpl implements ContentService, DownloadCompleteDelegate {
    private readonly SEARCH_CONTENT_GROUPED_BY_PAGE_SECTION_KEY = 'group_by_page';
    private readonly getContentDetailsHandler: GetContentDetailsHandler;

    constructor(private contentServiceConfig: ContentServiceConfig,
                private apiService: ApiService,
                private dbService: DbService,
                private profileService: ProfileService,
                private appConfig: AppConfig,
                private fileService: FileService,
                private zipService: ZipService,
                private deviceInfo: DeviceInfo,
                private telemetryService: TelemetryService,
                private contentFeedbackService: ContentFeedbackService,
                private downloadService: DownloadService,
                private sharedPreferences: SharedPreferences,
                private eventsBusService: EventsBusService,
                private cachedItemStore: CachedItemStore<ContentSearchResult>) {
        this.getContentDetailsHandler = new GetContentDetailsHandler(
            this.contentFeedbackService, this.profileService,
            this.apiService, this.contentServiceConfig, this.dbService, this.eventsBusService);
    }

    private static getIdForDb(request: ContentSearchCriteria): string {
        const key = {
            framework: request.framework || '',
            board: request.board || '',
            medium: request.medium || '',
            grade: request.grade || '',
        };
        return SHA1(JSON.stringify(key)).toString();
    }

    getContentDetails(request: ContentDetailRequest): Observable<Content> {
        return this.getContentDetailsHandler.handle(request);
    }

    getContents(request: ContentRequest): Observable<Content[]> {
        const query = new GetContentsHandler().getAllLocalContentQuery(request);
        return this.dbService.execute(query)
            .mergeMap((contentsInDb: ContentEntry.SchemaMap[]) => {
                return Observable.defer(async () => {
                    const contents: Content[] = [];

                    for (const contentInDb of contentsInDb) {
                        let content = ContentMapper.mapContentDBEntryToContent(contentInDb);

                        content = await this.getContentDetailsHandler.decorateContent({
                            content,
                            attachContentAccess: request.attachContentAccess,
                            attachContentMarker: request.attachContentAccess,
                            attachFeedback: request.attachFeedback
                        }).toPromise();

                        contents.push(content);
                    }
                    if (request.resourcesOnly) {
                        const uids = request.uid as string[];
                        const contentMarkerQuery = `SELECT * FROM ${ContentMarkerEntry.TABLE_NAME}
                                                    WHERE UID IN (${ArrayUtil.joinPreservingQuotes(uids)})`;
                        const entries: ContentMarkerEntry.SchemaMap[] = await this.dbService.execute(contentMarkerQuery).toPromise();
                        entries.forEach((entry: ContentMarkerEntry.SchemaMap) => {
                            const content: Content = {
                                identifier: entry[ContentMarkerEntry.COLUMN_NAME_CONTENT_IDENTIFIER],
                                contentData: JSON.parse(entry[ContentMarkerEntry.COLUMN_NAME_DATA]),
                                isUpdateAvailable: false,
                                mimeType: '',
                                basePath: '',
                                contentType: '',
                                isAvailableLocally: false,
                                referenceCount: 0,
                                sizeOnDevice: 0,
                                lastUsedTime: 0,
                                lastUpdatedTime: 0,
                            };
                            contents.push(content);
                        });
                    }

                    return contents;
                });
            });
    }

    cancelImport(contentId: string): Observable<any> {
        return this.downloadService.cancel({identifier: contentId});
    }

    deleteContent(contentDeleteRequest: ContentDeleteRequest): Observable<ContentDeleteResponse[]> {
        return Observable.defer(async () => {
            const contentDeleteResponse: ContentDeleteResponse[] = [];
            const deleteContentHandler = new DeleteContentHandler(this.dbService, this.fileService, this.sharedPreferences);

            for (const contentDelete of contentDeleteRequest.contentDeleteList) {
                const contentInDb = await this.getContentDetailsHandler.fetchFromDB(contentDelete.contentId).toPromise();
                if (contentInDb) {
                    contentDeleteResponse.push({
                        identifier: contentDelete.contentId,
                        status: ContentDeleteStatus.DELETED_SUCCESSFULLY
                    });

                    if (ContentUtil.hasChildren(contentInDb[ContentEntry.COLUMN_NAME_LOCAL_DATA])) {
                        await deleteContentHandler.deleteAllChildren(contentInDb, contentDelete.isChildContent);
                    }

                    await deleteContentHandler.deleteOrUpdateContent(contentInDb, false, contentDelete.isChildContent);
                } else {
                    contentDeleteResponse.push({
                        identifier: contentDelete.contentId,
                        status: ContentDeleteStatus.NOT_FOUND
                    });
                }
            }

            return contentDeleteResponse;
        });
    }

    exportContent(contentExportRequest: ContentExportRequest): Observable<ContentExportResponse> {
        const response: Response = new Response();
        const exportHandler = new ImportNExportHandler(this.deviceInfo, this.dbService);
        return Observable.fromPromise(exportHandler.getContentExportDBModeltoExport(
            contentExportRequest.contentIds).then((contentsInDb: ContentEntry.SchemaMap[]) => {
            return this.fileService.getTempLocation(contentExportRequest.destinationFolder)
                .then((tempLocationPath: DirectoryEntry) => {
                    const metaData: { [key: string]: any } = {};
                    const fileName = ContentUtil.getExportedFileName(contentsInDb);
                    metaData['content_count'] = contentsInDb.length;
                    const exportContentContext: ExportContentContext = {
                        metadata: metaData,
                        ecarFilePath: tempLocationPath.nativeURL.concat(fileName),
                        destinationFolder: contentExportRequest.destinationFolder,
                        contentModelsToExport: contentsInDb,
                        tmpLocationPath: tempLocationPath.nativeURL
                    };
                    return new CleanTempLoc(this.fileService).execute(exportContentContext);
                }).then((exportResponse: Response) => {
                    return new CreateTempLoc(this.fileService).execute(exportResponse.body);
                }).then((exportResponse: Response) => {
                    return new CreateContentExportManifest(this.dbService, exportHandler).execute(exportResponse.body);
                }).then((exportResponse: Response) => {
                    return new WriteManifest(this.fileService).execute(exportResponse.body);
                }).then((exportResponse: Response) => {
                    return new CompressContent(this.zipService, this.fileService).execute(exportResponse.body);
                }).then((exportResponse: Response) => {
                    return new DeviceMemoryCheck(this.fileService).execute(exportResponse.body);
                }).then((exportResponse: Response) => {
                    return new CopyAsset(this.fileService).execute(exportResponse.body);
                }).then((exportResponse: Response) => {
                    return new EcarBundle(this.fileService, this.zipService).execute(exportResponse.body);
                }).then((exportResponse: Response) => {
                    return new DeleteTempEcar(this.fileService).execute(exportResponse.body);
                }).then((exportResponse: Response) => {
                    return new GenerateExportShareTelemetry(this.telemetryService).execute(exportResponse.body);
                }).then((exportResponse: Response<ContentExportResponse>) => {
                    return exportResponse.body;
                });
        }));
    }

    getChildContents(childContentRequest: ChildContentRequest): Observable<Content> {
        if (!childContentRequest.level) {
            childContentRequest.level = -1;
        }
        const childContentHandler = new ChildContentsHandler(this.dbService, this.getContentDetailsHandler);
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
                return childContentHandler.fetchChildrenOfContent(rows[0], 0, childContentRequest.level!, hierarchyInfoList);
            });
    }

    getDownloadState(): Promise<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }

    importContent(contentImportRequest: ContentImportRequest): Observable<ContentImportResponse[]> {
        const searchContentHandler = new SearchContentHandler(this.appConfig, this.contentServiceConfig, this.telemetryService);
        const contentIds: string[] = ArrayUtil.deDupe(contentImportRequest.contentImportArray.map((i) => i.contentId));
        const filter: SearchRequest = searchContentHandler.getContentSearchFilter(
            contentIds, contentImportRequest.contentStatusArray);
        return new ContentSearchApiHandler(this.apiService, this.contentServiceConfig).handle(filter)
            .map((searchResponse: SearchResponse) => {
                return searchResponse.result.content;
            }).mergeMap((contents: ContentData[]) => Observable.defer(async () => {
                const contentImportResponses: ContentImportResponse[] = [];

                if (contents && contents.length) {
                    const downloadRequestList: DownloadRequest[] = [];
                    for (const contentId of contentIds) {
                        const contentData: ContentData | undefined = contents.find(x => x.identifier === contentId);
                        if (contentData) {
                            const downloadUrl = await searchContentHandler.getDownloadUrl(contentData);
                            let status: ContentImportStatus = ContentImportStatus.NOT_FOUND;
                            if (downloadUrl && FileUtil.getFileExtension(downloadUrl) === FileExtension.CONTENT.valueOf()) {
                                status = ContentImportStatus.ENQUEUED_FOR_DOWNLOAD;
                                const contentImport: ContentImport =
                                    contentImportRequest.contentImportArray.find((i) => i.contentId === contentId)!;
                                const downloadRequest: ContentDownloadRequest = {
                                    identifier: contentId,
                                    downloadUrl: downloadUrl,
                                    mimeType: MimeType.ECAR,
                                    destinationFolder: contentImport.destinationFolder,
                                    isChildContent: contentImport.isChildContent,
                                    filename: contentId.concat('.', FileExtension.CONTENT),
                                    correlationData: contentImport.correlationData
                                };
                                downloadRequestList.push(downloadRequest);
                            }
                            contentImportResponses.push({identifier: contentId, status: status});
                        }
                    }
                    this.downloadService.download(downloadRequestList).toPromise().then();
                }

                return contentImportResponses;
            }));

    }

    importEcar(ecarImportRequest: EcarImportRequest): Observable<ContentImportResponse[]> {

        return Observable.fromPromise(this.fileService.exists(ecarImportRequest.sourceFilePath).then((entry: Entry) => {
            const importContentContext: ImportContentContext = {
                isChildContent: ecarImportRequest.isChildContent,
                ecarFilePath: ecarImportRequest.sourceFilePath,
                destinationFolder: ecarImportRequest.destinationFolder,
                skippedItemsIdentifier: [],
                items: [],
                contentImportResponseList: []
            };
            return new GenerateInteractTelemetry(this.telemetryService).execute(importContentContext, 'ContentImport-Initiated')
                .then(() => {
                    return this.fileService.getTempLocation(ecarImportRequest.destinationFolder);
                }).then((tempLocation: DirectoryEntry) => {
                    importContentContext.tmpLocation = tempLocation.nativeURL;
                    return new ExtractEcar(this.fileService, this.zipService).execute(importContentContext);
                }).then((importResponse: Response) => {
                    return new ValidateEcar(this.fileService, this.dbService, this.appConfig,
                        this.getContentDetailsHandler).execute(importResponse.body);
                }).then((importResponse: Response) => {
                    return new ExtractPayloads(this.fileService, this.zipService, this.appConfig,
                        this.dbService, this.deviceInfo, this.getContentDetailsHandler, this.eventsBusService).execute(importResponse.body);
                }).then((importResponse: Response) => {
                    const response: Response = new Response();
                    return new CreateContentImportManifest(this.dbService, this.deviceInfo, this.fileService).execute(importResponse.body);
                }).then((importResponse: Response) => {
                    return new CreateHierarchy(this.dbService, this.fileService).execute(importResponse.body);
                }).then((importResponse: Response) => {
                    return new EcarCleanup(this.fileService).execute(importResponse.body);
                }).then((importResponse: Response) => {
                    return new UpdateSizeOnDevice(this.dbService).execute(importResponse.body);
                }).then((importResponse: Response) => {
                    return new GenerateImportShareTelemetry(this.telemetryService).execute(importResponse.body);
                }).then((importResponse: Response) => {
                    return new GenerateInteractTelemetry(this.telemetryService).execute(importResponse.body, 'ContentImport-Success');
                }).then((importResponse: Response<ImportContentContext>) => {
                    this.eventsBusService.emit({
                        namespace: EventNamespace.CONTENT,
                        event: {
                            type: ContentEventType.IMPORT_COMPLETED,
                            payload: {
                                contentId: importContentContext.rootIdentifier ?
                                    importContentContext.rootIdentifier : importContentContext.identifiers![0]
                            }
                        }
                    });
                    return importResponse.body.contentImportResponseList;
                });
        }).catch((error) => {
            console.log('error', error);
            return [{identifier: '', status: ContentImportStatus.NOT_FOUND}];
        }));
    }

    nextContent(hierarchyInfo: HierarchyInfo[], currentContentIdentifier: string): Observable<Content> {
        const childContentHandler = new ChildContentsHandler(this.dbService, this.getContentDetailsHandler);
        return this.dbService.read(GetContentDetailsHandler.getReadContentQuery(hierarchyInfo[0].identifier))
            .mergeMap(async (rows: ContentEntry.SchemaMap[]) => {
                const contentKeyList = await childContentHandler.getContentsKeyList(rows[0]);
                const nextContentIdentifier = childContentHandler.getNextContentIdentifier(hierarchyInfo,
                    currentContentIdentifier, contentKeyList);
                return childContentHandler.getContentFromDB(hierarchyInfo, nextContentIdentifier);
            });
    }

    prevContent(hierarchyInfo: HierarchyInfo[], currentContentIdentifier: string): Observable<Content> {
        const childContentHandler = new ChildContentsHandler(this.dbService, this.getContentDetailsHandler);
        return this.dbService.read(GetContentDetailsHandler.getReadContentQuery(hierarchyInfo[0].identifier))
            .mergeMap(async (rows: ContentEntry.SchemaMap[]) => {
                const contentKeyList = await childContentHandler.getContentsKeyList(rows[0]);
                const previousContentIdentifier = childContentHandler.getPreviuosContentIdentifier(hierarchyInfo,
                    currentContentIdentifier, contentKeyList);
                return childContentHandler.getContentFromDB(hierarchyInfo, previousContentIdentifier);
            });
    }

    getRelevantContent(request: RelevantContentRequest): Observable<RelevantContentResponsePlayer> {
        const relevantContentResponse: RelevantContentResponse = {};
        return Observable.of(relevantContentResponse)
            .mergeMap((content) => {
                if (request.next) {
                    return this.nextContent(request.hierarchyInfo!, request.contentIdentifier!).map((nextContet: Content) => {
                        relevantContentResponse.nextContent = nextContet;
                        return relevantContentResponse;
                    });
                }

                return Observable.of(relevantContentResponse);
            })
            .mergeMap((content) => {
                if (request.prev) {
                    return this.prevContent(request.hierarchyInfo!, request.contentIdentifier!).map((prevContent: Content) => {
                        relevantContentResponse.previousContent = prevContent;
                        return relevantContentResponse;
                    });
                }

                return Observable.of(relevantContentResponse);
            }).map((contentResponse: RelevantContentResponse) => {
                const response: RelevantContentResponsePlayer = {};
                response.next = contentResponse.nextContent ? {content: contentResponse.nextContent!} : undefined;
                response.prev = contentResponse.previousContent! ? {content: contentResponse.previousContent!} : undefined;
                return response;
            });
    }

    subscribeForImportStatus(contentId: string): Observable<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }


    searchContent(contentSearchCriteria: ContentSearchCriteria, request?: { [key: string]: any }): Observable<ContentSearchResult> {
        const searchHandler: SearchContentHandler = new SearchContentHandler(this.appConfig,
            this.contentServiceConfig, this.telemetryService);
        if (request) {
            contentSearchCriteria = searchHandler.getSearchCriteria(request);
        } else {
            contentSearchCriteria.limit = contentSearchCriteria.limit ? contentSearchCriteria.limit : 100;
            contentSearchCriteria.offset = contentSearchCriteria.offset ? contentSearchCriteria.offset : 0;
        }

        const searchRequest = searchHandler.getSearchContentRequest(contentSearchCriteria);

        return this.sharedPreferences.getString(FrameworkKeys.KEY_ACTIVE_CHANNEL_ACTIVE_FRAMEWORK_ID)
            .mergeMap((frameworkId?: string) => {
                return new ContentSearchApiHandler(this.apiService, this.contentServiceConfig, frameworkId!,
                    contentSearchCriteria.languageCode)
                    .handle(searchRequest)
                    .map((searchResponse: SearchResponse) => {
                        return searchHandler.mapSearchResponse(contentSearchCriteria, searchResponse, searchRequest);
                    });
            });
    }

    cancelDownload(contentId: string): Observable<undefined> {
        return this.downloadService.cancel({identifier: contentId});
    }

    setContentMarker(contentMarkerRequest: ContentMarkerRequest): Observable<boolean> {
        const query = `SELECT * FROM ${ContentMarkerEntry.TABLE_NAME}
                       WHERE ${ContentMarkerEntry.COLUMN_NAME_UID} = '${contentMarkerRequest.uid}'
                       AND ${ContentMarkerEntry.COLUMN_NAME_CONTENT_IDENTIFIER}='${contentMarkerRequest.contentId}'
                       AND ${ContentMarkerEntry.COLUMN_NAME_MARKER} = ${contentMarkerRequest.marker}`;
        return this.dbService.execute(query).mergeMap((contentMarker: ContentMarkerEntry.SchemaMap[]) => {

            const markerModel: ContentMarkerEntry.SchemaMap = {
                uid: contentMarkerRequest.uid,
                identifier: contentMarkerRequest.contentId,
                epoch_timestamp: Date.now(),
                data: contentMarkerRequest.data,
                extra_info: JSON.stringify(contentMarkerRequest.extraInfo),
                marker: contentMarkerRequest.marker.valueOf()
            };
            if (ArrayUtil.isEmpty(contentMarker)) {
                return this.dbService.insert({
                    table: ContentMarkerEntry.TABLE_NAME,
                    modelJson: markerModel
                }).map(v => v > 0);
            } else {
                if (contentMarkerRequest.isMarked) {
                    return this.dbService.update({
                        table: ContentMarkerEntry.TABLE_NAME,
                        selection:
                            `${ContentMarkerEntry.COLUMN_NAME_UID}= ? AND ${ContentMarkerEntry
                                .COLUMN_NAME_CONTENT_IDENTIFIER}= ? AND ${ContentMarkerEntry.COLUMN_NAME_MARKER}= ?`,
                        selectionArgs: [contentMarkerRequest.uid, contentMarkerRequest.contentId,
                            contentMarkerRequest.marker.valueOf().toString()],
                        modelJson: markerModel
                    }).map(v => v > 0);
                } else {
                    return this.dbService.delete({
                        table: ContentMarkerEntry.TABLE_NAME,
                        selection: `${ContentMarkerEntry.COLUMN_NAME_UID} = ? AND ${ContentMarkerEntry.COLUMN_NAME_CONTENT_IDENTIFIER
                            } = ? AND ${ContentMarkerEntry.COLUMN_NAME_MARKER} = ?`,
                        selectionArgs: [contentMarkerRequest.uid, contentMarkerRequest.contentId, '' + contentMarkerRequest.marker]
                    }).map(v => v!);
                }
            }
        });
    }

    searchContentGroupedByPageSection(request: ContentSearchCriteria): Observable<ContentsGroupedByPageSection> {
        const offlineTextbookContents$: Observable<ContentData[]> = this.getContents({
            contentTypes: ['TextBook'],
            board: request.board,
            medium: request.medium,
            grade: request.grade
        }).map((contents: Content[]) => contents.map((content) => content.contentData));

        const onlineTextbookContents$: Observable<ContentSearchResult> = this.cachedItemStore.getCached(
            ContentServiceImpl.getIdForDb(request),
            this.SEARCH_CONTENT_GROUPED_BY_PAGE_SECTION_KEY,
            'ttl_' + this.SEARCH_CONTENT_GROUPED_BY_PAGE_SECTION_KEY,
            () => this.searchContent(request),
            undefined,
            undefined,
            (contentSearchResult: ContentSearchResult) => contentSearchResult.contentDataList.length === 0
        );

        return this.searchContentAndGroupByPageSection(
            offlineTextbookContents$,
            onlineTextbookContents$
        );
    }

    onDownloadCompletion(request: ContentDownloadRequest): Observable<undefined> {
        const importEcarRequest: EcarImportRequest = {
            isChildContent: request.isChildContent!,
            sourceFilePath: request.downloadedFilePath!,
            destinationFolder: request.destinationFolder!,
            correlationData: request.correlationData!
        };
        return this.importEcar(importEcarRequest).mapTo(undefined).catch(() => {
            return Observable.of(undefined);
        });
    }

    private searchContentAndGroupByPageSection(
        offlineTextbookContents$: Observable<ContentData[]>,
        onlineTextbookContents$: Observable<ContentSearchResult>
    ): Observable<ContentsGroupedByPageSection> {
        return Observable.zip(
            offlineTextbookContents$,
            onlineTextbookContents$
        ).map((results: [ContentData[], ContentSearchResult]) => {
            const localTextBooksContentDataList = results[0];

            const searchContentDataList = results[1].contentDataList.filter((contentData) => {
                return !localTextBooksContentDataList.find((localContentData) => localContentData.identifier === contentData.identifier);
            });

            return {
                ...results[1],
                contentDataList: [
                    ...localTextBooksContentDataList,
                    ...searchContentDataList,
                ]
            } as ContentSearchResult;
        }).map((result: ContentSearchResult) => {
            const filterValues = result.filterCriteria.facetFilters![0].values;
            const allContent = result.contentDataList;

            const pageSectionList: PageSection[] = filterValues.map((filterValue) => {
                const contents = allContent.filter((content) => {
                    if (Array.isArray(content.subject)) {
                        return content.subject.find((sub) => {
                            return sub.toLowerCase().trim() === filterValue.name.toLowerCase().trim();
                        });
                    } else {
                        return content.subject.toLowerCase().trim() === filterValue.name.toLowerCase().trim();
                    }
                });

                return {
                    contents,
                    name: filterValue.name.charAt(0).toUpperCase() + filterValue.name.slice(1),
                    display: {name: {en: filterValue.name}} // TODO : need to handle localization
                };
            });

            return {
                name: 'Resource',
                sections: pageSectionList
            };
        });
    }
}
