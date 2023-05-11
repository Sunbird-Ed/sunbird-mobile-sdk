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
    ContentSpaceUsageSummaryRequest,
    ContentSpaceUsageSummaryResponse,
    EcarImportRequest,
    ExportContentContext,
    FileExtension,
    FilterValue,
    HierarchyInfo,
    ImportContentContext,
    MimeType,
    RelevantContentRequest,
    RelevantContentResponse,
    RelevantContentResponsePlayer,
    SearchResponse,
    SearchType,
} from '..';
import {combineLatest, defer, forkJoin, from, interval, Observable, Observer, of} from 'rxjs';
import {ApiRequestHandler, ApiService, Response} from '../../api';
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
import {CreateContentExportManifest} from '../handlers/export/create-content-export-manifest';
import {WriteManifest} from '../handlers/export/write-manifest';
import {CompressContent} from '../handlers/export/compress-content';
import {ZipService} from '../../util/zip/def/zip-service';
import {DeviceMemoryCheck} from '../handlers/export/device-memory-check';
import {CopyAsset} from '../handlers/export/copy-asset';
import {EcarBundle} from '../handlers/export/ecar-bundle';
import {ExtractEcar} from '../handlers/import/extract-ecar';
import {ValidateEcar} from '../handlers/import/validate-ecar';
import {ExtractPayloads} from '../handlers/import/extract-payloads';
import {CreateContentImportManifest} from '../handlers/import/create-content-import-manifest';
import {EcarCleanup} from '../handlers/import/ecar-cleanup';
import {Rollup, TelemetryService} from '../../telemetry';
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
import {ContentKeys, FrameworkKeys} from '../../preference-keys';
import {ContentStorageHandler} from '../handlers/content-storage-handler';
import {SharedPreferencesSetCollection} from '../../util/shared-preferences/def/shared-preferences-set-collection';
import {SharedPreferencesSetCollectionImpl} from '../../util/shared-preferences/impl/shared-preferences-set-collection-impl';
import {SdkServiceOnInitDelegate} from '../../sdk-service-on-init-delegate';
import {Container, inject, injectable} from 'inversify';
import {CsInjectionTokens, InjectionTokens} from '../../injection-tokens';
import {SdkConfig} from '../../sdk-config';
import {DeviceInfo} from '../../util/device';
import {catchError, filter, map, mapTo, mergeMap, switchMap, take, tap} from 'rxjs/operators';
import {CopyToDestination} from '../handlers/export/copy-to-destination';
import {AppInfo} from '../../util/app';
import {GetContentHeirarchyHandler} from '../handlers/get-content-heirarchy-handler';
import {DeleteTempDir} from '../handlers/export/deletete-temp-dir';
import {ContentAggregator} from '../handlers/content-aggregator';
import {FormService} from '../../form';
import {CsMimeTypeFacetToMimeTypeCategoryAggregator} from '@project-sunbird/client-services/services/content/utilities/mime-type-facet-to-mime-type-category-aggregator';
import {MimeTypeCategory} from '@project-sunbird/client-services/models/content/index';
import {CourseService} from '../../course';
import {NetworkInfoService} from '../../util/network';
import { CsContentService } from '@project-sunbird/client-services/services/content';
import { StorageService } from '../../storage/def/storage-service';
import { QuestionSetFileReadHandler } from '../handlers/question-set-file-read-handler';
import { GetChildQuestionSetHandler } from '../handlers/get-child-question-set-handler'

@injectable()
export class ContentServiceImpl implements ContentService, DownloadCompleteDelegate, SdkServiceOnInitDelegate {
    private static readonly DOWNLOAD_DIR_NAME = 'transcript';
    private static readonly KEY_IS_UPDATE_SIZE_ON_DEVICE_SUCCESSFUL = ContentKeys.KEY_IS_UPDATE_SIZE_ON_DEVICE_SUCCESSFUL;
    private static readonly KEY_CONTENT_DELETE_REQUEST_LIST = ContentKeys.KEY_CONTENT_DELETE_REQUEST_LIST;
    private readonly getContentDetailsHandler: GetContentDetailsHandler;
    private readonly getContentHeirarchyHandler: GetContentHeirarchyHandler;
    private readonly contentServiceConfig: ContentServiceConfig;
    private readonly appConfig: AppConfig;
    private readonly questionSetFileReadHandler: QuestionSetFileReadHandler;
    private readonly getChildQuestionSetHandler: GetChildQuestionSetHandler;

    private contentDeleteRequestSet: SharedPreferencesSetCollection<ContentDelete>;

    private contentUpdateSizeOnDeviceTimeoutRef: Map<string, NodeJS.Timeout> = new Map();

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
        @inject(InjectionTokens.CACHED_ITEM_STORE) private cachedItemStore: CachedItemStore,
        @inject(InjectionTokens.APP_INFO) private appInfo: AppInfo,
        @inject(InjectionTokens.NETWORKINFO_SERVICE) private networkInfoService: NetworkInfoService,
        @inject(InjectionTokens.CONTAINER) private container: Container,
        @inject(InjectionTokens.STORAGE_SERVICE) private storageService: StorageService
    ) {
        this.contentServiceConfig = this.sdkConfig.contentServiceConfig;
        this.appConfig = this.sdkConfig.appConfig;
        this.getContentDetailsHandler = new GetContentDetailsHandler(
            this.contentFeedbackService, this.profileService,
            this.apiService, this.contentServiceConfig, this.dbService, this.eventsBusService);

        this.getContentHeirarchyHandler = new GetContentHeirarchyHandler(this.apiService, this.contentServiceConfig);

        this.questionSetFileReadHandler = new QuestionSetFileReadHandler(this.storageService, this.fileService);

        this.getChildQuestionSetHandler = new GetChildQuestionSetHandler(this, this.dbService, this.storageService, this.fileService);

        this.contentDeleteRequestSet = new SharedPreferencesSetCollectionImpl(
            this.sharedPreferences,
            ContentServiceImpl.KEY_CONTENT_DELETE_REQUEST_LIST,
            (item) => item.contentId
        );
    }

    onInit(): Observable<undefined> {
        this.downloadService.registerOnDownloadCompleteDelegate(this);

        return combineLatest([
            this.handleContentDeleteRequestSetChanges(),
            this.handleUpdateSizeOnDeviceFail()
        ]).pipe(
            mapTo(undefined)
        );
    }

    getContentDetails(request: ContentDetailRequest): Observable<Content> {
        return this.getContentDetailsHandler.handle(request);
    }

    getContentHeirarchy(request: ContentDetailRequest): Observable<Content> {
        return this.getContentHeirarchyHandler.handle(request);
    }

    getContents(request: ContentRequest): Observable<Content[]> {
        const query = new GetContentsHandler().getAllLocalContentQuery(request);
        return this.dbService.execute(query).pipe(
            mergeMap((contentsInDb: ContentEntry.SchemaMap[]) => {
                return defer(async () => {
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
                                name: '',
                                contentData: entry[ContentMarkerEntry.COLUMN_NAME_DATA] &&
                                    JSON.parse(entry[ContentMarkerEntry.COLUMN_NAME_DATA]),
                                isUpdateAvailable: false,
                                mimeType: '',
                                basePath: '',
                                contentType: '',
                                primaryCategory: '',
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
            })
        );
    }

    cancelImport(contentId: string): Observable<any> {
        return this.downloadService.cancel({identifier: contentId});
    }

    deleteContent(contentDeleteRequest: ContentDeleteRequest): Observable<ContentDeleteResponse[]> {
        return defer(async () => {
            contentDeleteRequest.contentDeleteList.forEach((contentDelete) => {
                const ref = this.contentUpdateSizeOnDeviceTimeoutRef.get(contentDelete.contentId);
                if (ref) {
                    clearTimeout(ref);
                    this.contentUpdateSizeOnDeviceTimeoutRef.delete(contentDelete.contentId);
                }
            });
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
        }).pipe(
            tap(() => contentDeleteRequest.contentDeleteList.forEach((c) => {
                this.downloadService.onContentDelete(c.contentId);
            }))
        );
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
        const exportHandler = new ImportNExportHandler(this.deviceInfo, this.dbService, this.fileService);
        return from(exportHandler.getContentExportDBModelToExport(contentExportRequest.contentIds)
            .then((contentsInDb: ContentEntry.SchemaMap[]) => {
                return this.fileService.getTempLocation(contentExportRequest.destinationFolder)
                    .then((tempLocationPath: DirectoryEntry) => {
                        const metaData: { [key: string]: any } = {};
                        const fileName = ContentUtil.getExportedFileName(contentsInDb, this.appInfo.getAppName());
                        metaData['content_count'] = contentsInDb.length;
                        const exportContentContext: ExportContentContext = {
                            metadata: metaData,
                            ecarFilePath: tempLocationPath.nativeURL.concat(fileName),
                            destinationFolder: contentExportRequest.destinationFolder,
                            contentModelsToExport: contentsInDb,
                            tmpLocationPath: tempLocationPath.nativeURL,
                            subContentIds: contentExportRequest.subContentIds
                        };
                        //     return new CleanTempLoc(this.fileService).execute(exportContentContext);
                        // }).then((exportResponse: Response) => {
                        return new CreateTempLoc(this.fileService).execute(exportContentContext);
                    }).then((exportResponse: Response) => {
                        return new CreateContentExportManifest(this.dbService, exportHandler).execute(exportResponse.body);
                    }).then((exportResponse: Response) => {
                        return new WriteManifest(this.fileService, this.deviceInfo).execute(exportResponse.body);
                    }).then((exportResponse: Response) => {
                        return new CompressContent(this.zipService).execute(exportResponse.body);
                    }).then((exportResponse: Response) => {
                        return new DeviceMemoryCheck(this.fileService).execute(exportResponse.body);
                    }).then((exportResponse: Response) => {
                        return new CopyAsset().execute(exportResponse.body);
                    }).then((exportResponse: Response) => {
                        return new EcarBundle(this.fileService, this.zipService).execute(exportResponse.body);
                    }).then((exportResponse: Response) => {
                        return new CopyToDestination().execute(exportResponse, contentExportRequest);
                        // }).then((exportResponse: Response) => {
                        //     return new DeleteTempEcar(this.fileService).execute(exportResponse.body);
                    }).then((exportResponse: Response) => {
                        return new DeleteTempDir().execute(exportResponse.body);
                    }).then((exportResponse: Response) => {
                        const fileName = ContentUtil.getExportedFileName(contentsInDb, this.appInfo.getAppName());
                        return new GenerateExportShareTelemetry(
                            this.telemetryService).execute(exportResponse.body, fileName, contentExportRequest
                        );
                    }).then((exportResponse: Response<ContentExportResponse>) => {
                        return exportResponse.body;
                    });
            }));
    }

    getChildContents(childContentRequest: ChildContentRequest): Observable<Content> {
        if (!childContentRequest.level) {
            childContentRequest.level = -1;
        }
        const childContentHandler = new ChildContentsHandler(this.dbService, this.getContentDetailsHandler, this.appConfig);
        let hierarchyInfoList: HierarchyInfo[] = childContentRequest.hierarchyInfo;
        if (!hierarchyInfoList) {
            hierarchyInfoList = [];
        } else if (hierarchyInfoList.length > 0) {
            if (hierarchyInfoList[hierarchyInfoList.length - 1].identifier === childContentRequest.contentId) {
                const length = hierarchyInfoList.length;
                hierarchyInfoList.splice((length - 1), 1);
            }
        }

        return this.dbService.read(GetContentDetailsHandler.getReadContentQuery(childContentRequest.contentId)).pipe(
            mergeMap(async (rows: ContentEntry.SchemaMap[]) => {
                const childContentsMap: Map<string, ContentEntry.SchemaMap> = new Map<string, ContentEntry.SchemaMap>();
                // const parentContent = ContentMapper.mapContentDBEntryToContent(rows[0]);
                const data = JSON.parse(rows[0][ContentEntry.COLUMN_NAME_LOCAL_DATA]);
                const childIdentifiers = data.childNodes;

                // const childIdentifiers = await childContentHandler
                // .getChildIdentifiersFromManifest(rows[0][ContentEntry.COLUMN_NAME_PATH]!);
                console.log('childIdentifiers', childIdentifiers);
                if (childIdentifiers) {
                    const query = `SELECT * FROM ${ContentEntry.TABLE_NAME}
                                WHERE ${ContentEntry.COLUMN_NAME_IDENTIFIER}
                                IN (${ArrayUtil.joinPreservingQuotes(childIdentifiers)})`;

                    const childContents = await this.dbService.execute(query).toPromise();
                    // console.log('childContents', childContents);
                    childContents.forEach(element => {
                        childContentsMap.set(element.identifier, element);
                    });
                }

                return childContentHandler.fetchChildrenOfContent(
                    rows[0],
                    childContentsMap,
                    0,
                    childContentRequest.level!,
                    hierarchyInfoList
                );
            })
        );
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
        return new ContentSearchApiHandler(this.apiService, this.contentServiceConfig).handle(filter).pipe(
            map((searchResponse: SearchResponse) => {
                return (searchResponse.result.content && searchResponse.result.content.length &&
                     searchResponse.result.QuestionSet && searchResponse.result.QuestionSet.length) ?
                  searchResponse.result.content.concat(searchResponse.result.QuestionSet) :
                   searchResponse.result.content || searchResponse.result.QuestionSet;
            }),
            mergeMap((contents: ContentData[]) => defer(async () => {
                const contentImportResponses: ContentImportResponse[] = [];

                if (contents && contents.length) {
                    const downloadRequestList: DownloadRequest[] = [];
                    for (const contentId of contentIds) {
                        const contentData: ContentData | undefined = contents.find(x => x.identifier === contentId);
                        if (contentData) {
                            const contentImport: ContentImport =
                                contentImportRequest.contentImportArray.find((i) => i.contentId === contentId)!;
                            const downloadUrl = await searchContentHandler.getDownloadUrl(contentData, contentImport);
                            let status: ContentImportStatus = ContentImportStatus.NOT_FOUND;
                            if (downloadUrl && FileUtil.getFileExtension(downloadUrl) === FileExtension.CONTENT.valueOf()) {
                                status = ContentImportStatus.ENQUEUED_FOR_DOWNLOAD;
                                const downloadRequest: ContentDownloadRequest = {
                                    identifier: contentId,
                                    downloadUrl: downloadUrl,
                                    mimeType: MimeType.ECAR,
                                    destinationFolder: contentImport.destinationFolder,
                                    isChildContent: contentImport.isChildContent,
                                    filename: contentId.concat('.', FileExtension.CONTENT),
                                    correlationData: contentImport.correlationData,
                                    rollUp: contentImport.rollUp,
                                    contentMeta: contentData,
                                    withPriority: contentImportRequest.withPriority ||
                                        (contentData.mimeType === MimeType.COLLECTION.valueOf() ? 1 : 0),
                                    title: contentData.name ?
                                      contentData.name.concat('.', FileExtension.CONTENT) : contentId.concat('.', FileExtension.CONTENT)
                                };
                                downloadRequestList.push(downloadRequest);
                            }
                            contentImportResponses.push({identifier: contentId, status: status});
                        }
                    }
                    this.downloadService.download(downloadRequestList).toPromise().then();
                }

                return contentImportResponses;
            }))
        );
    }

    importEcar(ecarImportRequest: EcarImportRequest): Observable<ContentImportResponse[]> {
        return from(this.fileService.exists(ecarImportRequest.sourceFilePath).then((entry: Entry) => {
            const importContentContext: ImportContentContext = {
                isChildContent: ecarImportRequest.isChildContent,
                ecarFilePath: ecarImportRequest.sourceFilePath,
                destinationFolder: ecarImportRequest.destinationFolder,
                skippedItemsIdentifier: [],
                items: [],
                contentImportResponseList: [],
                correlationData: ecarImportRequest.correlationData || [],
                rollUp: ecarImportRequest.rollUp || new Rollup(),
                contentIdsToDelete: new Set(),
                identifier: ecarImportRequest.identifier
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
                }).then(([importResponse, ref]: [Response, NodeJS.Timeout]) => {
                    this.contentUpdateSizeOnDeviceTimeoutRef.set(importContentContext.rootIdentifier ?
                        importContentContext.rootIdentifier : importContentContext.identifiers![0], ref);
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

    nextContent(hierarchyInfo: HierarchyInfo[], currentContentIdentifier: string, shouldConvertBasePath?: boolean): Observable<Content> {
        const childContentHandler = new ChildContentsHandler(this.dbService, this.getContentDetailsHandler, this.appConfig);
        return this.dbService.read(GetContentDetailsHandler.getReadContentQuery(hierarchyInfo[0].identifier)).pipe(
            mergeMap(async (rows: ContentEntry.SchemaMap[]) => {
                const contentKeyList = await childContentHandler.getContentsKeyList(rows[0]);
                const nextContentIdentifier = childContentHandler.getNextContentIdentifier(hierarchyInfo,
                    currentContentIdentifier, contentKeyList);
                return childContentHandler.getContentFromDB(hierarchyInfo, nextContentIdentifier, shouldConvertBasePath);
            })
        );
    }

    prevContent(hierarchyInfo: HierarchyInfo[], currentContentIdentifier: string, shouldConvertBasePath?: boolean): Observable<Content> {
        const childContentHandler = new ChildContentsHandler(this.dbService, this.getContentDetailsHandler, this.appConfig);
        return this.dbService.read(GetContentDetailsHandler.getReadContentQuery(hierarchyInfo[0].identifier)).pipe(
            mergeMap(async (rows: ContentEntry.SchemaMap[]) => {
                const contentKeyList = await childContentHandler.getContentsKeyList(rows[0]);
                const previousContentIdentifier = childContentHandler.getPreviousContentIdentifier(hierarchyInfo,
                    currentContentIdentifier, contentKeyList);
                return childContentHandler.getContentFromDB(hierarchyInfo, previousContentIdentifier, shouldConvertBasePath);
            })
        );
    }

    getRelevantContent(request: RelevantContentRequest): Observable<RelevantContentResponsePlayer> {
        const relevantContentResponse: RelevantContentResponse = {};
        return of(relevantContentResponse).pipe(
            mergeMap((content) => {
                if (request.next) {
                    return this.nextContent(request.hierarchyInfo!, request.contentIdentifier!, request.shouldConvertBasePath).pipe(
                        map((nextContet: Content) => {
                            relevantContentResponse.nextContent = nextContet;
                            return relevantContentResponse;
                        })
                    );
                }

                return of(relevantContentResponse);
            }),
            mergeMap((content) => {
                if (request.prev) {
                    return this.prevContent(request.hierarchyInfo!, request.contentIdentifier!, request.shouldConvertBasePath).pipe(
                        map((prevContent: Content) => {
                            relevantContentResponse.previousContent = prevContent;
                            return relevantContentResponse;
                        })
                    );
                }

                return of(relevantContentResponse);
            }),
            map((contentResponse: RelevantContentResponse) => {
                const response: RelevantContentResponsePlayer = {};
                response.next = contentResponse.nextContent ? {content: contentResponse.nextContent!} : undefined;
                response.prev = contentResponse.previousContent! ? {content: contentResponse.previousContent!} : undefined;
                return response;
            })
        );
    }

    subscribeForImportStatus(contentId: string): Observable<any> {
        // TODO
        throw new Error('Not Implemented yet');
    }

    searchContent(
        contentSearchCriteria: ContentSearchCriteria,
        request?: { [key: string]: any },
        apiHandler?: ApiRequestHandler<SearchRequest, SearchResponse>,
        isFromContentAggregator?: boolean,
    ): Observable<ContentSearchResult> {
        contentSearchCriteria = JSON.parse(JSON.stringify(contentSearchCriteria));
        if (contentSearchCriteria.facetFilters) {
            const mimeTypeFacetFilters = contentSearchCriteria.facetFilters.find(f => (f.name === 'mimeType'));
            if (mimeTypeFacetFilters) {
                mimeTypeFacetFilters.values = mimeTypeFacetFilters.values
                  .filter(v => v.apply)
                  .reduce<FilterValue[]>((acc, v) => {
                      acc = acc.concat((v['values'] as FilterValue[]).map(f => ({...f, apply: true})));
                      return acc;
                  }, []);
            }
        }

        const searchHandler: SearchContentHandler = new SearchContentHandler(this.appConfig,
            this.contentServiceConfig, this.telemetryService);
        const languageCode = contentSearchCriteria.languageCode;
        if (request) {
            contentSearchCriteria = searchHandler.getSearchCriteria(request);
            if (languageCode) {
                contentSearchCriteria.languageCode = languageCode;
            }
        } else {
            contentSearchCriteria.limit = contentSearchCriteria.limit ? contentSearchCriteria.limit : 100;
            contentSearchCriteria.offset = contentSearchCriteria.offset ? contentSearchCriteria.offset : 0;
        }

        const searchRequest = searchHandler.getSearchContentRequest(contentSearchCriteria);

        return this.sharedPreferences.getString(FrameworkKeys.KEY_ACTIVE_CHANNEL_ACTIVE_FRAMEWORK_ID).pipe(
            mergeMap((frameworkId?: string) => {
                if (!apiHandler) {
                    apiHandler = new ContentSearchApiHandler(this.apiService, this.contentServiceConfig, frameworkId!,
                        contentSearchCriteria.languageCode);
                }

                return apiHandler.handle(searchRequest).pipe(
                    map((searchResponse: SearchResponse) => {
                        if (!contentSearchCriteria.facetFilters && contentSearchCriteria.searchType === SearchType.SEARCH) {
                            if (!isFromContentAggregator) {
                                searchRequest.filters.contentType = [];
                                searchRequest.filters.primaryCategory = [];
                            }
                            searchRequest.filters.audience = [];
                        }
                        return searchHandler.mapSearchResponse(contentSearchCriteria, searchResponse, searchRequest);
                    }),
                    map((contentSearchResponse) => {
                        if (!contentSearchResponse.filterCriteria.facetFilters) {
                            return contentSearchResponse;
                        }

                        const mimeTypeFacetFilters = contentSearchResponse.filterCriteria.facetFilters.find(f => f.name === 'mimeType');

                        if (mimeTypeFacetFilters) {
                            mimeTypeFacetFilters.values =
                                CsMimeTypeFacetToMimeTypeCategoryAggregator.aggregate(mimeTypeFacetFilters.values as any,
                                    contentSearchCriteria.searchType === 'filter' ? [MimeTypeCategory.ALL] : []) as any;
                        }
                        return contentSearchResponse;
                    })
                );
            })
        );
    }

    cancelDownload(contentId: string): Observable<undefined> {
        return this.downloadService.cancel({identifier: contentId});
    }

    setContentMarker(contentMarkerRequest: ContentMarkerRequest): Observable<boolean> {
        const query = `SELECT * FROM ${ContentMarkerEntry.TABLE_NAME}
                       WHERE ${ContentMarkerEntry.COLUMN_NAME_UID} = '${contentMarkerRequest.uid}'
                       AND ${ContentMarkerEntry.COLUMN_NAME_CONTENT_IDENTIFIER}='${contentMarkerRequest.contentId}'
                       AND ${ContentMarkerEntry.COLUMN_NAME_MARKER} = ${contentMarkerRequest.marker}`;
        return this.dbService.execute(query).pipe(
            mergeMap((contentMarker: ContentMarkerEntry.SchemaMap[]) => {

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
                    }).pipe(
                        map(v => v > 0)
                    );
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
                        }).pipe(
                            map(v => v > 0)
                        );
                    } else {
                        return this.dbService.delete({
                            table: ContentMarkerEntry.TABLE_NAME,
                            selection: `${ContentMarkerEntry.COLUMN_NAME_UID} = ? AND ${ContentMarkerEntry.COLUMN_NAME_CONTENT_IDENTIFIER
                            } = ? AND ${ContentMarkerEntry.COLUMN_NAME_MARKER} = ?`,
                            selectionArgs: [contentMarkerRequest.uid, contentMarkerRequest.contentId, '' + contentMarkerRequest.marker]
                        }).pipe(
                            map(v => v!)
                        );
                    }
                }
            })
        );
    }

    onDownloadCompletion(request: ContentDownloadRequest): Observable<undefined> {
        const importEcarRequest: EcarImportRequest = {
            isChildContent: request.isChildContent!,
            sourceFilePath: request.downloadedFilePath!,
            destinationFolder: request.destinationFolder!,
            correlationData: request.correlationData!,
            rollUp: request.rollUp!,
            identifier: request.identifier
        };
        return this.importEcar(importEcarRequest).pipe(
            mergeMap(() =>
                // TODO
                // @ts-ignore
                this.downloadService.cancel({identifier: request.identifier!}, false)
            ),
            catchError(() =>
                // TODO
                // @ts-ignore
                this.downloadService.cancel({identifier: request.identifier!}, false)
            ),
            mapTo(undefined)
        );
    }

    getContentSpaceUsageSummary(contentSpaceUsageSummaryRequest: ContentSpaceUsageSummaryRequest):
        Observable<ContentSpaceUsageSummaryResponse[]> {
        const contentSpaceUsageSummaryList: ContentSpaceUsageSummaryResponse[] = [];
        const storageHandler = new ContentStorageHandler(this.dbService);
        return from(storageHandler.getContentUsageSummary(contentSpaceUsageSummaryRequest.paths));
    }

    buildContentAggregator(
        formService: FormService,
        courseService: CourseService,
        profileService: ProfileService,
    ): ContentAggregator {
        return new ContentAggregator(
            new SearchContentHandler(this.appConfig, this.contentServiceConfig, this.telemetryService),
            formService,
            this,
            this.cachedItemStore,
            courseService,
            profileService,
            this.apiService,
            this.networkInfoService
        );
    }

    getQuestionList(questionIds: string[], parentId?): Observable<any> {
        return this.getContentDetails({ 
            contentId: parentId,
            objectType: 'QuestionSet'
         }).pipe(
            switchMap((content: Content) => {
                if (content.isAvailableLocally && parentId) {
                    return this.questionSetFileReadHandler.getLocallyAvailableQuestion(questionIds, parentId);
                } else {
                    return this.contentServiceDelegate.getQuestionList(questionIds);
                }
            }),
            catchError((e) => {
                return this.contentServiceDelegate.getQuestionList(questionIds);
            })
        );
    }

    getQuestionSetHierarchy(data) {
        return this.contentServiceDelegate.getQuestionSetHierarchy(data);
    }

    getQuestionSetRead(contentId:string, params?:any) {
        return this.contentServiceDelegate.getQuestionSetRead(contentId,params);
    }

    async getQuestionSetChildren(questionSetId: string) {
        try{
            return await this.getChildQuestionSetHandler.handle(questionSetId);
        } catch(e){
            return [];
        }
    }

    formatSearchCriteria(requestMap: { [key: string]: any }): ContentSearchCriteria {
        const searchHandler: SearchContentHandler = new SearchContentHandler(this.appConfig,
            this.contentServiceConfig, this.telemetryService);
        return searchHandler.getSearchCriteria(requestMap);
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
            .pipe(
                mapTo(undefined)
            );
    }

    private getMimeType(data: string): string {
        let mimeType = '';
        if (data) {
            const localData = JSON.parse(data);
            mimeType = localData['mimeType'];
        }
        return mimeType;
    }

    private handleContentDeleteRequestSetChanges(): Observable<undefined> {
        return this.contentDeleteRequestSet.asListChanges().pipe(
            mergeMap((requests: ContentDelete[]) => {
                const currentRequest = requests[0];

                if (!currentRequest) {
                    return of(undefined);
                }

                return this.deleteContent({contentDeleteList: [currentRequest]}).pipe(
                    mergeMap(() => this.contentDeleteRequestSet.remove(currentRequest)),
                    mapTo(undefined)
                );
            })
        );
    }

    private handleUpdateSizeOnDeviceFail(): Observable<undefined> {
        return this.sharedPreferences.getBoolean(ContentServiceImpl.KEY_IS_UPDATE_SIZE_ON_DEVICE_SUCCESSFUL).pipe(
            mergeMap((hasUpdated) => {
                if (!hasUpdated) {
                    return from(
                        new UpdateSizeOnDevice(this.dbService, this.sharedPreferences, this.fileService).execute()
                    ).pipe(
                        mapTo(undefined)
                    );
                }
                return of(undefined);
            })
        );
    }

    private get contentServiceDelegate(): CsContentService {
        return this.container.get(CsInjectionTokens.CONTENT_SERVICE);
    }

    downloadTranscriptFile(transcriptReq) {
        const dataDirectory = window.device.platform.toLowerCase() === 'ios' ?
         cordova.file.documentsDirectory : cordova.file.externalDataDirectory + ContentServiceImpl.DOWNLOAD_DIR_NAME;
        return this.createTranscriptDir(transcriptReq, dataDirectory).then(() => {
            const downloadRequest: EnqueueRequest = {
                uri: transcriptReq.downloadUrl,
                title: transcriptReq.fileName,
                description: '',
                mimeType: '',
                visibleInDownloadsUi: true,
                notificationVisibility: 1,
                destinationInExternalPublicDir: {
                    dirType: 'Download',
                    subPath: transcriptReq.fileName
                },
                headers: [],
                destinationUri: transcriptReq.destinationUrl
            };
            return this.downloadTranscript(downloadRequest).toPromise()
            .then((sourceUrl) => {
                if (sourceUrl && sourceUrl.path) {
                    this.copyFile(sourceUrl.path.split(/\/(?=[^\/]+$)/)[0], dataDirectory.concat('/' + transcriptReq.identifier),
                    transcriptReq.fileName).then(() => {
                        this.deleteFolder(sourceUrl.path);
                    });
                    return sourceUrl.path;
                }
            });
        });
    }

    createTranscriptDir(req, dataDirectory) {
        return this.fileService.exists(dataDirectory.concat('/' + req.identifier)).then((entry: Entry) => {
            return entry.nativeURL;
            }).catch(() => {
                 return this.fileService.createDir(dataDirectory, false).then((directoryEntry: DirectoryEntry) => {
                    this.fileService.createDir(dataDirectory.concat('/' + req.identifier), false).then((directory) => {
                        return directory.nativeURL;
                    });
                });
            });
    }

    downloadTranscript(downloadRequest) {
        return new Observable<string>((observer: Observer<string>) => {
            downloadManager.enqueue(downloadRequest, (err, id: string) => {
                if (err) {
                    return observer.error(err);
                }

                observer.next(id);
                observer.complete();
            });
        }).pipe(
            mergeMap((downloadId: string) => {
                return interval(1000)
                    .pipe(
                        mergeMap(() => {
                            return new Observable((observer: Observer<EnqueuedEntry>) => {
                                downloadManager.query({ids: [downloadId]}, (err, entries) => {
                                    if (err || (entries[0].status === 16)) {
                                        return observer.error(err || new Error('Unknown Error'));
                                    }
                                    return observer.next(entries[0]! as EnqueuedEntry);
                                });
                            });
                        }),
                        filter((entry: EnqueuedEntry) => entry.status === 8),
                        take(1)
                    );
            }),
            map((entry) => ({path: entry.localUri}))
        );
    }

    private async copyFile(sourcePath: string, destinationPath: string, fileName: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            sbutility.copyFile(sourcePath, destinationPath, fileName,
                () => {
                    resolve(true);
                }, err => {
                    console.error(err);
                    resolve(err);
                });
        });
    }

    private async deleteFolder(deletedirectory: string): Promise<undefined> {
        if (!deletedirectory) {
            return;
        }
        let res;
        return new Promise<undefined>((resolve, reject) => {
            sbutility.rm(deletedirectory, '', () => {
                resolve(res);
            }, (e) => {
                reject(e);
            });
        });
    }
}
