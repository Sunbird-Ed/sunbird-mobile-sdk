import {
    ChildContentRequest,
    Content,
    ContentData,
    ContentDelete,
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
    ContentSpaceUsageSummaryRequest,
    ContentSpaceUsageSummaryResponse,
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
import {ContentKeys, FrameworkKeys} from '../../preference-keys';
import {CreateHierarchy} from '../handlers/import/create-hierarchy';
import {ContentStorageHandler} from '../handlers/content-storage-handler';
import {SharedPreferencesSetCollection} from '../../util/shared-preferences/def/shared-preferences-set-collection';
import {SharedPreferencesSetCollectionImpl} from '../../util/shared-preferences/impl/shared-preferences-set-collection-impl';
import {SdkServiceOnInitDelegate} from '../../sdk-service-on-init-delegate';
import {inject, injectable} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';
import { FileName } from './../util/content-constants';

@injectable()
export class ContentServiceImpl implements ContentService, DownloadCompleteDelegate, SdkServiceOnInitDelegate {
    private static readonly KEY_IS_UPDATE_SIZE_ON_DEVICE_SUCCESSFUL = ContentKeys.KEY_IS_UPDATE_SIZE_ON_DEVICE_SUCCESSFUL;
    private static readonly KEY_CONTENT_DELETE_REQUEST_LIST = ContentKeys.KEY_CONTENT_DELETE_REQUEST_LIST;
    private readonly SEARCH_CONTENT_GROUPED_BY_PAGE_SECTION_KEY = 'group_by_page';
    private readonly getContentDetailsHandler: GetContentDetailsHandler;
    private readonly contentServiceConfig: ContentServiceConfig;
    private readonly appConfig: AppConfig;

    private contentDeleteRequestSet: SharedPreferencesSetCollection<ContentDelete>;

    constructor(
        @inject(InjectionTokens.SDK_CONFIG) private sdkConfig: SdkConfig,
        @inject(InjectionTokens.API_SERVICE) private apiService: ApiService,
        @inject(InjectionTokens.DB_SERVICE) private dbService: DbService,
        @inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService,
        @inject(InjectionTokens.FILE_SERVICE) private fileService: FileService,
        @inject(InjectionTokens.ZIP_SERVICE) private zipService: ZipService,
        @inject(InjectionTokens.DEVICE_INFO) private deviceInfo: DeviceInfo,
        @inject(InjectionTokens.TELEMETRY_SERVICE) private telemetryService: TelemetryService,
        @inject(InjectionTokens.CONTENT_FEEDBACK_SERVICE) private contentFeedbackService: ContentFeedbackService,
        @inject(InjectionTokens.DOWNLOAD_SERVICE) private downloadService: DownloadService,
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
        @inject(InjectionTokens.EVENTS_BUS_SERVICE) private eventsBusService: EventsBusService,
        @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedItemStore: CachedItemStore) {

        this.contentServiceConfig = this.sdkConfig.contentServiceConfig;
        this.appConfig = this.sdkConfig.appConfig;
        this.getContentDetailsHandler = new GetContentDetailsHandler(
            this.contentFeedbackService, this.profileService,
            this.apiService, this.contentServiceConfig, this.dbService, this.eventsBusService);

        this.contentDeleteRequestSet = new SharedPreferencesSetCollectionImpl(
            this.sharedPreferences,
            ContentServiceImpl.KEY_CONTENT_DELETE_REQUEST_LIST,
            (item) => item.contentId
        );
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

    onInit(): Observable<undefined> {
        this.downloadService.registerOnDownloadCompleteDelegate(this);

        return Observable.combineLatest(
            this.handleContentDeleteRequestSetChanges(),
            this.handleUpdateSizeOnDeviceFail(),
        ).mapTo(undefined);
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
                                contentData: entry[ContentMarkerEntry.COLUMN_NAME_DATA] &&
                                    JSON.parse(entry[ContentMarkerEntry.COLUMN_NAME_DATA]),
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
            new UpdateSizeOnDevice(this.dbService, this.sharedPreferences, this.fileService).execute();
            return contentDeleteResponse;
        });
    }

    enqueueContentDelete(contentDeleteRequest: ContentDeleteRequest): Observable<void> {
        return this.contentDeleteRequestSet.addAll(contentDeleteRequest.contentDeleteList);
    }

    clearContentDeleteQueue(): Observable<void> {
        return this.contentDeleteRequestSet.clear();
    }

    getContentDeleteQueue(): Observable<ContentDelete[]> {
        return this.contentDeleteRequestSet.asListChanges();
    }

    exportContent(contentExportRequest: ContentExportRequest): Observable<ContentExportResponse> {
        const exportHandler = new ImportNExportHandler(this.deviceInfo, this.dbService);
        return Observable.fromPromise(exportHandler.getContentExportDBModelToExport(contentExportRequest.contentIds)
            .then((contentsInDb: ContentEntry.SchemaMap[]) => {
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
                        return new WriteManifest(this.fileService, this.deviceInfo).execute(exportResponse.body);
                    }).then((exportResponse: Response) => {
                        return new CompressContent(this.zipService).execute(exportResponse.body);
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
        const childContentHandler = new ChildContentsHandler(this.dbService, this.getContentDetailsHandler, this.fileService);
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
            .mergeMap(async (rows: ContentEntry.SchemaMap[]) => {
                const childContentsMap: Map<string, ContentEntry.SchemaMap> = new Map<string, ContentEntry.SchemaMap>();
                // const parentContent = ContentMapper.mapContentDBEntryToContent(rows[0]);
                // const data = JSON.parse(rows[0][ContentEntry.COLUMN_NAME_LOCAL_DATA]);

                // const childIdentifiers = await this.getChildIdentifiersFromManifest(rows[0][ContentEntry.COLUMN_NAME_PATH]!);
                const childIdentifiers = await childContentHandler.getChildIdentifiersFromManifest(rows[0][ContentEntry.COLUMN_NAME_PATH]!);

                console.log('childIdentifiers', childIdentifiers);

                const query = `SELECT * FROM ${ContentEntry.TABLE_NAME}
                                WHERE ${ContentEntry.COLUMN_NAME_IDENTIFIER}
                                IN (${ArrayUtil.joinPreservingQuotes(childIdentifiers)})`;

                const childContents = await this.dbService.execute(query).toPromise();
                console.log('childContents', childContents);
                childContents.forEach(element => {
                    childContentsMap.set(element.identifier, element);
                });
                return childContentHandler
                .fetchChildrenOfContent(
                    rows[0],
                    childContentsMap,
                    0,
                    childContentRequest.level!,
                    hierarchyInfoList
                );
            });
    }

    getDownloadState(): Promise<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }

    importContent(contentImportRequest: ContentImportRequest): Observable<ContentImportResponse[]> {
        const searchContentHandler = new SearchContentHandler(this.appConfig, this.contentServiceConfig, this.telemetryService);
        const contentIds: string[] = ArrayUtil.deDupe(contentImportRequest.contentImportArray.map((i) => i.contentId));
        const filter: SearchRequest =
            searchContentHandler.getContentSearchFilter(contentIds, contentImportRequest.contentStatusArray, contentImportRequest.fields);
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
                                    correlationData: contentImport.correlationData,
                                    contentMeta: contentData
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
                contentImportResponseList: [],
                correlationData: ecarImportRequest.correlationData || [],
                contentIdsToDelete: new Set()
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
                        this.dbService, this.deviceInfo, this.getContentDetailsHandler, this.eventsBusService, this.sharedPreferences)
                        .execute(importResponse.body);
                }).then((importResponse: Response) => {
                    this.eventsBusService.emit({
                        namespace: EventNamespace.CONTENT,
                        event: {
                            type: ContentEventType.CONTENT_EXTRACT_COMPLETED,
                            payload: {
                                contentId: importContentContext.rootIdentifier ?
                                    importContentContext.rootIdentifier : importContentContext.identifiers![0]
                            }
                        }
                    });
                    const response: Response = new Response();
                    return new CreateContentImportManifest(this.dbService, this.deviceInfo, this.fileService).execute(importResponse.body);
                // }).then((importResponse: Response) => {
                //     return new CreateHierarchy(this.dbService, this.fileService).execute(importResponse.body);
                }).then((importResponse: Response) => {
                    return new EcarCleanup(this.fileService).execute(importResponse.body);
                }).then((importResponse: Response) => {
                    const response: Response = new Response();
                    return this.cleanupContent(importContentContext).toPromise()
                        .then(() => {
                            response.body = importContentContext;
                            return Promise.resolve(response);
                        }).catch(() => {
                            return Promise.reject(response);
                        });
                // }).then((importResponse: Response) => {
                //     new UpdateSizeOnDevice(this.dbService, this.sharedPreferences).execute();
                //     return importResponse;
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
        const childContentHandler = new ChildContentsHandler(this.dbService, this.getContentDetailsHandler, this.fileService);
        return this.dbService.read(GetContentDetailsHandler.getReadContentQuery(hierarchyInfo[0].identifier))
            .mergeMap(async (rows: ContentEntry.SchemaMap[]) => {
                const contentKeyList = await childContentHandler.getContentsKeyList(rows[0]);
                const nextContentIdentifier = childContentHandler.getNextContentIdentifier(hierarchyInfo,
                    currentContentIdentifier, contentKeyList);
                return childContentHandler.getContentFromDB(hierarchyInfo, nextContentIdentifier);
            });
    }

    prevContent(hierarchyInfo: HierarchyInfo[], currentContentIdentifier: string): Observable<Content> {
        const childContentHandler = new ChildContentsHandler(this.dbService, this.getContentDetailsHandler, this.fileService);
        return this.dbService.read(GetContentDetailsHandler.getReadContentQuery(hierarchyInfo[0].identifier))
            .mergeMap(async (rows: ContentEntry.SchemaMap[]) => {
                const contentKeyList = await childContentHandler.getContentsKeyList(rows[0]);
                const previousContentIdentifier = childContentHandler.getPreviousContentIdentifier(hierarchyInfo,
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
                marker: contentMarkerRequest.marker.valueOf(),
                mime_type: this.getMimeType(contentMarkerRequest.data)
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
        }).map((contents: Content[]) => contents.map((content) => {
            if (content.contentData.appIcon && !content.contentData.appIcon.startsWith('https://')) {
                content.contentData.appIcon = content.basePath + content.contentData.appIcon;
            }
            return content.contentData;
        }));

        const onlineTextbookContents$: Observable<ContentSearchResult> = this.cachedItemStore.getCached(
            ContentServiceImpl.getIdForDb(request),
            this.SEARCH_CONTENT_GROUPED_BY_PAGE_SECTION_KEY,
            'ttl_' + this.SEARCH_CONTENT_GROUPED_BY_PAGE_SECTION_KEY,
            () => this.searchContent(request),
            undefined,
            undefined,
            (contentSearchResult: ContentSearchResult) =>
                !contentSearchResult ||
                !contentSearchResult.contentDataList ||
                contentSearchResult.contentDataList.length === 0
        ).catch((e) => {
            console.error(e);

            return Observable.of({
                id: 'OFFLINE_RESPONSE_ID',
                responseMessageId: 'OFFLINE_RESPONSE_ID',
                filterCriteria: request,
                contentDataList: []
            });
        });

        return this.searchContentAndGroupByPageSection(
            offlineTextbookContents$.take(1),
            onlineTextbookContents$.take(1)
        );
    }

    onDownloadCompletion(request: ContentDownloadRequest): Observable<undefined> {
        const importEcarRequest: EcarImportRequest = {
            isChildContent: request.isChildContent!,
            sourceFilePath: request.downloadedFilePath!,
            destinationFolder: request.destinationFolder!,
            correlationData: request.correlationData!
        };
        return this.importEcar(importEcarRequest)
            .mergeMap(() =>
                // TODO
                // @ts-ignore
                this.downloadService.cancel({identifier: request.identifier!}, false)
            )
            .catch(() =>
                // TODO
                // @ts-ignore
                this.downloadService.cancel({identifier: request.identifier!}, false)
            )
            .mapTo(undefined);
    }

    getContentSpaceUsageSummary(contentSpaceUsageSummaryRequest: ContentSpaceUsageSummaryRequest):
        Observable<ContentSpaceUsageSummaryResponse[]> {
        const contentSpaceUsageSummaryList: ContentSpaceUsageSummaryResponse[] = [];
        const storageHandler = new ContentStorageHandler(this.dbService);
        return Observable.fromPromise(storageHandler.getContentUsageSummary(contentSpaceUsageSummaryRequest.paths));
    }

    private cleanupContent(importContentContext: ImportContentContext): Observable<undefined> {
        const contentDeleteList: ContentDelete[] = [];
        for (const contentId of Array.from(importContentContext.contentIdsToDelete.values())) {
            const contentDeleteRequest: ContentDelete = {
                contentId: contentId,
                isChildContent: false
            };
            contentDeleteList.push(contentDeleteRequest);
        }
        return this.deleteContent({contentDeleteList: contentDeleteList})
            .mapTo(undefined);
    }

    private getMimeType(data: string): string {
        let mimeType = '';
        if (data) {
            const localData = JSON.parse(data);
            mimeType = localData['mimeType'];
        }
        return mimeType;
    }

    private searchContentAndGroupByPageSection(
        offlineTextbookContents$: Observable<ContentData[]>,
        onlineTextbookContents$: Observable<ContentSearchResult>
    ): Observable<ContentsGroupedByPageSection> {
        return Observable.zip(
            offlineTextbookContents$,
            onlineTextbookContents$
        ).map<any, ContentSearchResult>((results: [ContentData[], ContentSearchResult]) => {
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
        }).map<ContentSearchResult, ContentsGroupedByPageSection>((result: ContentSearchResult) => {
            const contentsGroupedBySubject = result.contentDataList.reduce<{[key: string]: ContentData[]}>((acc, contentData) => {
                if (Array.isArray(contentData.subject)) {
                    contentData.subject.forEach((sub) => {
                        sub = sub.toLowerCase().trim();

                        if (acc[sub]) {
                            (acc[sub] as Array<ContentData>).push(contentData);
                        } else {
                            acc[sub] = [contentData];
                        }
                    });
                } else {
                    const sub = contentData.subject.toLowerCase().trim();
                    if (acc[sub]) {
                        (acc[sub] as Array<ContentData>).push(contentData);
                    } else {
                        acc[sub] = [contentData];
                    }
                }

                return acc;
            }, {});

            return {
                name: 'Resource',
                sections: Object.keys(contentsGroupedBySubject).map((sub) => {
                    return {
                        contents: contentsGroupedBySubject[sub],
                        name: sub.charAt(0).toUpperCase() + sub.slice(1),
                        display: {name: {en: sub}} // TODO : need to handle localization
                    }
                })
            };
        });
    }

    private handleContentDeleteRequestSetChanges(): Observable<undefined> {
        return this.contentDeleteRequestSet.asListChanges()
            .mergeMap((requests: ContentDelete[]) => {
                const currentRequest = requests[0];

                if (!currentRequest) {
                    return Observable.of(undefined);
                }

                return this.deleteContent({contentDeleteList: [currentRequest]})
                    .mergeMap(() => this.contentDeleteRequestSet.remove(currentRequest))
                    .mapTo(undefined);
            });
    }

    private handleUpdateSizeOnDeviceFail(): Observable<undefined> {
        return this.sharedPreferences.getBoolean(ContentServiceImpl.KEY_IS_UPDATE_SIZE_ON_DEVICE_SUCCESSFUL)
            .mergeMap((hasUpdated) => {
                if (!hasUpdated) {
                    return Observable.fromPromise(
                        new UpdateSizeOnDevice(this.dbService, this.sharedPreferences, this.fileService).execute()
                    ).mapTo(undefined);
                }

                return Observable.of(undefined);
            });
    }

}
