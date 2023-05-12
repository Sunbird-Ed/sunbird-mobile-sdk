import {GetContentHeirarchyHandler} from '../handlers/get-content-heirarchy-handler';
import {
    ChildContentRequest,
    ContentDeleteResponse,
    ContentDeleteStatus,
    ContentDownloadRequest,
    ContentExportRequest,
    ContentFeedbackService,
    ContentImport,
    ContentImportRequest,
    ContentRequest,
    ContentSearchCriteria,
    ContentService,
    ContentServiceConfig,
    ContentSpaceUsageSummaryRequest,
    EcarImportRequest,
    HierarchyInfo,
    MarkerType,
    RelevantContentRequest,
    SearchType,
} from '..';
import {ContentServiceImpl} from './content-service-impl';
import {Container} from 'inversify';
import {InjectionTokens} from '../../injection-tokens';
import {DbService} from '../../db';
import {SdkConfig} from '../../sdk-config';
import {ApiService} from '../../api';
import {
    AppInfo,
    Content,
    ContentDelete,
    ContentDeleteRequest,
    ContentDetailRequest,
    ContentMarkerRequest,
    CourseService,
    FormService,
    NetworkInfoService,
    ProfileService,
    StorageService
} from '../..';
import {FileService} from '../../util/file/def/file-service';
import {ZipService} from '../../util/zip/def/zip-service';
import {DeviceInfo} from '../../util/device';
import {CorrelationData, TelemetryService} from '../../telemetry';
import {DownloadService, DownloadStatus} from '../../util/download';
import {SharedPreferences} from '../../util/shared-preferences';
import {EventsBusService} from '../../events-bus';
import {CachedItemStore} from '../../key-value-store';
import {from, of, throwError} from 'rxjs';
import {SharedPreferencesSetCollection} from '../../util/shared-preferences/def/shared-preferences-set-collection';
import {GenerateInteractTelemetry} from '../handlers/import/generate-interact-telemetry';
import {CleanTempLoc} from '../handlers/export/clean-temp-loc';
import {SearchContentHandler} from '../handlers/search-content-handler';
import {GetContentDetailsHandler} from '../handlers/get-content-details-handler';
import {ContentKeys} from '../../preference-keys';
import {ChildContentsHandler} from '../handlers/get-child-contents-handler';
import {ImportNExportHandler} from '../handlers/import-n-export-handler';
import {ArrayUtil} from '../../util/array-util';
import {FileUtil} from '../../util/file/util/file-util';
import {ContentEntry} from '../db/schema';
import {GetContentsHandler} from '../handlers/get-contents-handler';
import {DeleteContentHandler} from '../handlers/delete-content-handler';
import {ContentUtil} from '../util/content-util';
import {WriteManifest} from '../handlers/export/write-manifest';
import {CompressContent} from '../handlers/export/compress-content';
import {DeviceMemoryCheck} from '../handlers/export/device-memory-check';
import {EcarBundle} from '../handlers/export/ecar-bundle';
import {CopyToDestination} from '../handlers/export/copy-to-destination';
import {DeleteTempDir} from '../handlers/export/deletete-temp-dir';
import {GenerateExportShareTelemetry} from '../handlers/export/generate-export-share-telemetry';
import {UpdateSizeOnDevice} from '../handlers/import/update-size-on-device';
import {ExtractEcar} from '../handlers/import/extract-ecar';
import {ValidateEcar} from '../handlers/import/validate-ecar';
import {ExtractPayloads} from '../handlers/import/extract-payloads';
import {CreateContentImportManifest} from '../handlers/import/create-content-import-manifest';
import {SharedPreferencesLocalStorage} from '../../util/shared-preferences/impl/shared-preferences-local-storage';
import {ContentAggregator} from '../handlers/content-aggregator';
import { QuestionSetFileReadHandler } from '../handlers/question-set-file-read-handler';
import { GetChildQuestionSetHandler } from '../handlers/get-child-question-set-handler';
import { UniqueId } from '../../db/util/unique-id';


jest.mock('../handlers/search-content-handler');
jest.mock('../handlers/get-content-details-handler');
jest.mock('../handlers/get-child-contents-handler');
jest.mock('../handlers/import-n-export-handler');
jest.mock('../handlers/get-content-heirarchy-handler');
jest.mock('../handlers/get-contents-handler');
jest.mock('../handlers/delete-content-handler');
jest.mock('../handlers/export/write-manifest');
jest.mock('../handlers/export/compress-content');
jest.mock('../handlers/export/device-memory-check');
jest.mock('../handlers/export/ecar-bundle');
jest.mock('../handlers/export/copy-to-destination');
jest.mock('../handlers/export/deletete-temp-dir');
jest.mock('../handlers/export/generate-export-share-telemetry');
jest.mock('../handlers/import/update-size-on-device');
jest.mock('../handlers/import/generate-interact-telemetry');
jest.mock('../handlers/import/extract-ecar');
jest.mock('../handlers/import/validate-ecar');
jest.mock('../handlers/import/extract-payloads');
jest.mock('../handlers/import/create-content-import-manifest');
jest.mock('../handlers/content-aggregator');

describe('ContentServiceImpl', () => {
    let contentService: ContentService;

    const container = new Container();
    const mockSdkConfig: Partial<SdkConfig> = {
        contentServiceConfig: {
            host: 'SAMPLE_HOST',
            searchApiPath: 'SAMPLE_PATH'
        } as Partial<ContentServiceConfig> as ContentServiceConfig,
        appConfig: {
            maxCompatibilityLevel: 2,
            minCompatibilityLevel: 1
        }
    };
    const mockApiService: Partial<ApiService> = {
        fetch: jest.fn().mockImplementation(() => { })
    };
    const mockDbService: Partial<DbService> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockFileService: Partial<FileService> = {
        exists: jest.fn().mockImplementation(() => { }),
        getTempLocation: jest.fn().mockImplementation(() => { })
    };
    const mockZipService: Partial<ZipService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockTelemetryService: Partial<TelemetryService> = {
    };
    const mockContentFeedback: Partial<ContentFeedbackService> = {};
    const mockDownloadService: Partial<DownloadService> = {
        onContentDelete: jest.fn().mockImplementation(),
        registerOnDownloadCompleteDelegate: jest.fn().mockImplementation(() => { })
    };
    // const mockSharedPreferences: Partial<SharedPreferences> = {
    //     getString: jest.fn().mockImplementation(() => of('[{"identifiers": "sample-id"}]'))
    // };
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {
        getCached: jest.fn().mockImplementation(() => { })
    };
    const mockAppInfo: Partial<AppInfo> = {
        getAppName: () => 'MOCK_APP_NAME'
    };
    const mockNetworkInfoService: Partial<NetworkInfoService> = {};
    const mockStorageService: Partial<StorageService> = {};
    const mockSharedPreferences = new SharedPreferencesLocalStorage();
    const contentUpdateSizeOnDeviceTimeoutRef: Map<string, NodeJS.Timeout> = new Map();
    const mockContainerService: Partial<Container> = {};

    beforeAll(() => {
        container.bind<ContentService>(InjectionTokens.CONTENT_SERVICE).to(ContentServiceImpl).inTransientScope();
        container.bind<SdkConfig>(InjectionTokens.SDK_CONFIG).toConstantValue(mockSdkConfig as SdkConfig);
        container.bind<ApiService>(InjectionTokens.API_SERVICE).toConstantValue(mockApiService as ApiService);
        container.bind<DbService>(InjectionTokens.DB_SERVICE).toConstantValue(mockDbService as DbService);
        container.bind<ProfileService>(InjectionTokens.PROFILE_SERVICE).toConstantValue(mockProfileService as ProfileService);
        container.bind<FileService>(InjectionTokens.FILE_SERVICE).toConstantValue(mockFileService as FileService);
        container.bind<ZipService>(InjectionTokens.ZIP_SERVICE).toConstantValue(mockZipService as ZipService);
        container.bind<DeviceInfo>(InjectionTokens.DEVICE_INFO).toConstantValue(mockDeviceInfo as DeviceInfo);
        container.bind<TelemetryService>(InjectionTokens.TELEMETRY_SERVICE).toConstantValue(mockTelemetryService as TelemetryService);
        container.bind<ContentFeedbackService>(InjectionTokens.CONTENT_FEEDBACK_SERVICE)
            .toConstantValue(mockContentFeedback as ContentFeedbackService);
        container.bind<DownloadService>(InjectionTokens.DOWNLOAD_SERVICE).toConstantValue(mockDownloadService as DownloadService);
        container.bind<SharedPreferences>(InjectionTokens.SHARED_PREFERENCES).toConstantValue(mockSharedPreferences as SharedPreferences);
        container.bind<EventsBusService>(InjectionTokens.EVENTS_BUS_SERVICE).toConstantValue(mockEventsBusService as EventsBusService);
        container.bind<CachedItemStore>(InjectionTokens.CACHED_ITEM_STORE).toConstantValue(mockCachedItemStore as CachedItemStore);
        container.bind<AppInfo>(InjectionTokens.APP_INFO).toConstantValue(mockAppInfo as AppInfo);
        container.bind<NetworkInfoService>(InjectionTokens.NETWORKINFO_SERVICE).toConstantValue(mockNetworkInfoService as NetworkInfoService);
        container.bind<StorageService>(InjectionTokens.STORAGE_SERVICE).toConstantValue(mockStorageService as StorageService);
        container.bind<Container>(InjectionTokens.CONTAINER).toConstantValue(mockContainerService as Container);



        contentService = container.get(InjectionTokens.CONTENT_SERVICE);
    });

    beforeEach(() => {
        window['device'] = { uuid: 'some_uuid', platform:'android' };
        jest.clearAllMocks();
        (SearchContentHandler as jest.Mock<SearchContentHandler>).mockClear();
        (GetContentDetailsHandler as any as jest.Mock<GetContentDetailsHandler>).mockClear();
        (ChildContentsHandler as jest.Mock<ChildContentsHandler>).mockClear();
        (ImportNExportHandler as any as jest.Mock<ImportNExportHandler>).mockClear();
        (GetContentsHandler as jest.Mock<GetContentsHandler>).mockClear();
        (DeleteContentHandler as jest.Mock<DeleteContentHandler>).mockClear();
        (WriteManifest as jest.Mock<WriteManifest>).mockClear();
        (CompressContent as jest.Mock<CompressContent>).mockClear();
        (DeviceMemoryCheck as jest.Mock<DeviceMemoryCheck>).mockClear();
        (EcarBundle as any as jest.Mock<EcarBundle>).mockClear();
        (CopyToDestination as jest.Mock<CopyToDestination>).mockClear();
        (DeleteTempDir as jest.Mock<DeleteTempDir>).mockClear();
        (GenerateExportShareTelemetry as jest.Mock<GenerateExportShareTelemetry>).mockClear();
        (UpdateSizeOnDevice as jest.Mock<UpdateSizeOnDevice>).mockClear();
        (GenerateInteractTelemetry as jest.Mock<GenerateInteractTelemetry>).mockClear();
        (ExtractEcar as jest.Mock<ExtractEcar>).mockClear();
        (ValidateEcar as jest.Mock<ValidateEcar>).mockClear();
        (ExtractPayloads as jest.Mock<ExtractPayloads>).mockClear();
        (CreateContentImportManifest as jest.Mock<CreateContentImportManifest>).mockClear();
    });

    it('should return an instance of ContentServiceImpl from container', () => {
        // assert
        expect(contentService).toBeTruthy();
    });

    describe('onInit', () => {
        it('should register as download service observe onInit() for updated and current request null', (done) => {
            mockSharedPreferences.getString = jest.fn(() => of('[]'));
            mockSharedPreferences.getBoolean = jest.fn(() => of(true));
            mockDownloadService.registerOnDownloadCompleteDelegate = jest.fn();
            const deleteData: ContentDeleteResponse[] = [{
                identifier: 'id',
                status: ContentDeleteStatus.DELETED_SUCCESSFULLY
            }];
           // jest.spyOn(contentService, 'onDownloadCompletion').mockImplementation(() => of(undefined));
            jest.spyOn(contentService, 'deleteContent').mockImplementation(() => {
                return of(deleteData);
            });
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            // act
            contentService.onInit().subscribe((val) => {
                // assert
                console.log('value :', val);
                expect(mockSharedPreferences.getBoolean).toHaveBeenCalled();
                expect(mockDownloadService.registerOnDownloadCompleteDelegate).toHaveBeenCalled();
                expect(mockSharedPreferences.getString).toHaveBeenCalled();
                done();
            });
        });

        it('should register as download service observe onInit() for not updated conetnt', (done) => {
            mockSharedPreferences.getString = jest.fn(() => of('[]'));
            mockSharedPreferences.getBoolean = jest.fn(() => of(false));
            mockDownloadService.registerOnDownloadCompleteDelegate = jest.fn();
            const deleteData: ContentDeleteResponse[] = [{
                identifier: 'id',
                status: ContentDeleteStatus.DELETED_SUCCESSFULLY
            }];
           // jest.spyOn(contentService, 'onDownloadCompletion').mockImplementation(() => of(undefined));
           (UpdateSizeOnDevice as jest.Mock<UpdateSizeOnDevice>).mockImplementation(() => {
            return {
                execute: jest.fn(() => Promise.resolve({}))
            } as any as UpdateSizeOnDevice;
        });
            jest.spyOn(contentService, 'deleteContent').mockImplementation(() => {
                return of(deleteData);
            });
            mockSharedPreferences.putString = jest.fn(() => of(undefined));
            // act
            contentService.onInit().subscribe((val) => {
                // assert
                console.log('value :', val);
                expect(mockSharedPreferences.getBoolean).toHaveBeenCalled();
                expect(mockDownloadService.registerOnDownloadCompleteDelegate).toHaveBeenCalled();
                expect(mockSharedPreferences.getString).toHaveBeenCalled();
                done();
            });
        });
    });

    it('should return content details', (done) => {
        // arrange
        const request: ContentDetailRequest = {
            contentId: 'SAMPLE_CONTENT_ID'
        };
        const handleMethod = jest.fn().mockImplementation(() => of('request'));
        (GetContentDetailsHandler as any as jest.Mock<GetContentDetailsHandler>).mockImplementation(() => {
            return {
                handle: handleMethod
            } as Partial<GetContentDetailsHandler> as GetContentDetailsHandler;
        });
        contentService = container.get(InjectionTokens.CONTENT_SERVICE);
        // act
        contentService.getContentDetails(request).subscribe(() => {
            // assert
            expect(handleMethod).toBeCalled();
            done();
        });
    });

    it('should return heirarchy details', (done) => {
        // arrange
        const request: ContentDetailRequest = {
            contentId: 'SAMPLE_CONTENT_ID'
        };
        const handleMethod = jest.fn().mockImplementation(() => of('request'));
        (GetContentHeirarchyHandler as any as jest.Mock<GetContentHeirarchyHandler>).mockImplementation(() => {
            return {
                handle: handleMethod
            } as Partial<GetContentHeirarchyHandler> as GetContentHeirarchyHandler;
        });
        contentService = container.get(InjectionTokens.CONTENT_SERVICE);
        // act
        contentService.getContentHeirarchy(request).subscribe(() => {
            // assert
            expect(handleMethod).toBeCalled();
            done();
        });
    });

    it('should cancel the downloading content cancelImport()', (done) => {
        // arrange
        mockDownloadService.cancel = jest.fn().mockImplementation(() => of([]));
        const contentId = 'SAMPLE_CONTENT_ID';
        // act
        contentService.cancelImport(contentId).subscribe(() => {
            // assert
            expect(mockDownloadService.cancel).toHaveBeenCalled();
            done();
        });
    });

    describe('searchContent', () => {
        it('should used for search content', (done) => {
            // arrange
            const getSearchContentRequestData = jest.fn().mockImplementation(() => ({filters: {contentType: []}}));
            const mapSearchResponseData = jest.fn().mockImplementation(() =>
                ({
                    id: 'sid', filterCriteria: {
                        facetFilters: [{
                            name: 'mimeType',
                            values: [
                                {
                                    name: 'ALL',
                                    count: 10,
                                    values: [{
                                        name: 'video/mp4',
                                        count: 1,
                                        apply: false
                                    }, {
                                        name: 'video/webm',
                                        count: 9,
                                        apply: false
                                    }],
                                    apply: false
                                }
                            ],

                        }]
                    }
                }));
            (SearchContentHandler as jest.Mock<SearchContentHandler>).mockImplementation(() => {
                return {
                    getSearchContentRequest: getSearchContentRequestData,
                    mapSearchResponse: mapSearchResponseData
                } as Partial<SearchContentHandler> as SearchContentHandler;
            });
            const request: ContentSearchCriteria = {
                limit: 1,
                offset: 2,
                facetFilters: [{
                    name: 'mimeType',
                    values: [
                        {
                            name: 'ALL',
                            count: 10,
                            values: [{
                                name: 'video/mp4',
                                count: 1,
                                apply: true
                            }, {
                                name: 'video/webm',
                                count: 9,
                                apply: true
                            }],
                            apply: false
                        }
                    ],

                }],
                searchType: SearchType.SEARCH
            };
            contentService = container.get(InjectionTokens.CONTENT_SERVICE);
            mockSharedPreferences.getString = jest.fn().mockImplementation(() => of('[{"identifiers": "sample-id"}]'));
            spyOn(mockApiService, 'fetch').and.returnValue(of({
                body: {
                    result: {
                        response: 'SAMPLE_RESPONSE'
                    }
                }
            }));
            // act
            contentService.searchContent(request).subscribe(() => {
                // assert
                expect(mockSharedPreferences.getString).toHaveBeenCalled();
                expect(mockApiService.fetch).toHaveBeenCalled();
                expect(getSearchContentRequestData).toHaveBeenCalled();
                expect(mapSearchResponseData).toHaveBeenCalled();
                done();
            });
        });

        it('should used for search content if request', (done) => {
            // arrange
            const getSearchContentRequestData = jest.fn().mockImplementation(() => ({filters: {contentType: []}}));
            const mapSearchResponseData = jest.fn().mockImplementation(() => ({
                id: 'sid', filterCriteria: {}}));
            (SearchContentHandler as jest.Mock<SearchContentHandler>).mockImplementation(() => {
                return {
                    getSearchContentRequest: getSearchContentRequestData,
                    mapSearchResponse: mapSearchResponseData,
                    getSearchCriteria: jest.fn(() => ({languageCode: 'bn'}))
                } as Partial<SearchContentHandler> as SearchContentHandler;
            });
            const request: ContentSearchCriteria = {
                limit: 1,
                offset: 2,
                languageCode: 'en',
                facetFilters: []
            };
            contentService = container.get(InjectionTokens.CONTENT_SERVICE);
            mockSharedPreferences.getString = jest.fn().mockImplementation(() => of('[{"identifiers": "sample-id"}]'));
            spyOn(mockApiService, 'fetch').and.returnValue(of({
                body: {
                    result: {
                        response: 'SAMPLE_RESPONSE'
                    }
                }
            }));
            // act
            contentService.searchContent(request, {limit: 5}).subscribe(() => {
                // assert
                expect(mockSharedPreferences.getString).toHaveBeenCalled();
                expect(mockApiService.fetch).toHaveBeenCalled();
                expect(getSearchContentRequestData).toHaveBeenCalled();
                expect(mapSearchResponseData).toHaveBeenCalled();
                done();
            });
        });
    });


    describe('deleteContent', () => {
        it('should delete downloaded content from local', async (done) => {
            // arrange
            const contentDelete: ContentDelete[] = [{
                contentId: 'SAMPLE_CONTENT_ID',
                isChildContent: true
            }];
            const request: ContentDeleteRequest = {
                contentDeleteList: contentDelete
            };
            const data = mockDbService.read = jest.fn().mockImplementation(() => of([{
                identifier: 'SAMPLE_IDENTIFIER',
                serverData: 'SERVER_DATA'
            }]));

            const contents: ContentEntry.SchemaMap = {
                [ContentEntry.COLUMN_NAME_IDENTIFIER]: 'SOME_IDENTIFIER',
                [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
                [ContentEntry.COLUMN_NAME_LOCAL_DATA]: '',
                [ContentEntry.COLUMN_NAME_MIME_TYPE]: '',
                [ContentEntry.COLUMN_NAME_VISIBILITY]: '',
                [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: '',
                [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: '',
                [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: ''
            };
            const val = new Map();
            const n: NodeJS.Timeout  = setTimeout( () =>  { /* snip */  }, 500);
            val.set('SAMPLE_CONTENT_ID', n);
            contentUpdateSizeOnDeviceTimeoutRef.get = jest.fn(() => n) as any;
            const fetchData = jest.fn().mockImplementation(() => of(contents));
            (GetContentDetailsHandler as any as jest.Mock<GetContentDetailsHandler>).mockImplementation(() => {
                return {
                    fetchFromDB: fetchData
                } as Partial<GetContentDetailsHandler> as GetContentDetailsHandler;
            });
            const childrenData = jest.fn().mockImplementation(() => Promise.resolve());
            (DeleteContentHandler as jest.Mock<DeleteContentHandler>).mockImplementation(() => {
                return {
                    deleteAllChildren: childrenData,
                    deleteOrUpdateContent: childrenData
                } as Partial<DeleteContentHandler> as DeleteContentHandler;
            });
            (UpdateSizeOnDevice as jest.Mock<UpdateSizeOnDevice>).mockImplementation(() => {
                return {
                    execute: jest.fn(() => Promise.resolve({}))
                } as any as UpdateSizeOnDevice;
            });
            contentService = container.get(InjectionTokens.CONTENT_SERVICE);
            mockDbService.execute = jest.fn().mockImplementation(() => of({}));

            // act
            contentService.deleteContent(request).subscribe(() => {
                // assert
                expect(fetchData).toHaveBeenCalled();
                expect(childrenData).toHaveBeenCalled();
                done();
            });
        });


        it('should be deleteAllChildren for local data', async (done) => {
            // arrange
            const contentDelete: ContentDelete[] = [{
                contentId: 'SAMPLE_CONTENT_ID',
                isChildContent: true
            }];
            const request: ContentDeleteRequest = {
                contentDeleteList: contentDelete
            };
            const data = mockDbService.read = jest.fn().mockImplementation(() => of([{
                identifier: 'SAMPLE_IDENTIFIER',
                serverData: 'SERVER_DATA'
            }]));

            const contents: ContentEntry.SchemaMap = {
                [ContentEntry.COLUMN_NAME_IDENTIFIER]: 'SOME_IDENTIFIER',
                [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
                [ContentEntry.COLUMN_NAME_LOCAL_DATA]: JSON.stringify({ name: 'SOME_NAME', pkgVersion: 'SOME_VERSION' }),
                [ContentEntry.COLUMN_NAME_MIME_TYPE]: '',
                [ContentEntry.COLUMN_NAME_VISIBILITY]: '',
                [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: '',
                [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: '',
                [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: ''
            };

            const fetchData = jest.fn().mockImplementation(() => of(contents));
            (GetContentDetailsHandler as any as jest.Mock<GetContentDetailsHandler>).mockImplementation(() => {
                return {
                    fetchFromDB: fetchData
                } as Partial<GetContentDetailsHandler> as GetContentDetailsHandler;
            });
            (DeleteContentHandler as jest.Mock<DeleteContentHandler>).mockImplementation(() => {
                return {
                    deleteAllChildren: jest.fn().mockImplementation(() => Promise.resolve()),
                    deleteOrUpdateContent: jest.fn().mockImplementation(() => Promise.resolve())
                } as Partial<DeleteContentHandler> as DeleteContentHandler;
            });
            (UpdateSizeOnDevice as jest.Mock<UpdateSizeOnDevice>).mockImplementation(() => {
                return {
                    execute: jest.fn(() => Promise.resolve({}))
                } as any as UpdateSizeOnDevice;
            });
            jest.spyOn(ContentUtil, 'hasChildren').mockReturnValue(true);
            contentService = container.get(InjectionTokens.CONTENT_SERVICE);
            // act
            contentService.deleteContent(request).subscribe(() => {
                // assert
                expect(fetchData).toHaveBeenCalled();
                expect(ContentUtil.hasChildren).toHaveBeenCalled();
                done();
            });
        });

        it('should delete content but content is not available', async (done) => {
            // arrange
            const contentDelete: ContentDelete[] = [{
                contentId: 'SAMPLE_CONTENT_ID',
                isChildContent: true
            }];
            const request: ContentDeleteRequest = {
                contentDeleteList: contentDelete
            };
            const data = mockDbService.read = jest.fn().mockImplementation(() => of([{
                identifier: 'SAMPLE_IDENTIFIER',
                serverData: 'SERVER_DATA'
            }]));
            const fetchData = jest.fn().mockImplementation(() => of(undefined));
            (GetContentDetailsHandler as any as jest.Mock<GetContentDetailsHandler>).mockImplementation(() => {
                return {
                    fetchFromDB: fetchData
                } as Partial<GetContentDetailsHandler> as GetContentDetailsHandler;
            });
            (UpdateSizeOnDevice as jest.Mock<UpdateSizeOnDevice>).mockImplementation(() => {
                return {
                    execute: jest.fn(() => Promise.resolve({}))
                } as any as UpdateSizeOnDevice;
            });
            // act
            contentService.deleteContent(request).subscribe((val) => {
                // assert
                expect(val[0].identifier).toBe('SAMPLE_CONTENT_ID');
                done();
            });
        });
    });

    it('should delete downloading content cancelDownload()', (done) => {
        // arrange
        const contentId = 'SAMPLE_CONTENT_ID';
        mockDownloadService.cancel = jest.fn().mockImplementation(() => of([]));
        // act
        contentService.cancelDownload(contentId).subscribe(() => {
            // assert
            expect(mockDownloadService.cancel).toHaveBeenCalled();
            done();
        });
    });

    describe('getChildContents', () => {
        const contents: ContentEntry.SchemaMap[] = [
            {
                [ContentEntry.COLUMN_NAME_IDENTIFIER]: 'SOME_IDENTIFIER',
                [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
                [ContentEntry.COLUMN_NAME_LOCAL_DATA]: '{ "name": "SOME_NAME", "pkgVersion": "SOME_VERSION", "childNodes": {"identifier": "d0_123"} }',
                [ContentEntry.COLUMN_NAME_MIME_TYPE]: '',
                [ContentEntry.COLUMN_NAME_VISIBILITY]: '',
                [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: '',
                [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: '',
                [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: ''
            }
        ];
        it('should be find child content if hierarchiInfoList is empty', (done) => {
            // arrange
            (ChildContentsHandler as jest.Mock<ChildContentsHandler>).mockImplementation(() => {
                return {
                    fetchChildrenOfContent: jest.fn().mockImplementation(() => Promise.resolve({ 'identifier': 'd0_123' }))
                } as Partial<ChildContentsHandler> as ChildContentsHandler;
            });
            const request: Partial<ChildContentRequest> = {
                contentId: 'd0_123',
            };
            (GetContentDetailsHandler as any as jest.Mock<GetContentDetailsHandler>).mockImplementation(() => {
                return {
                    getReadContentQuery: jest.fn(() => '')
                } as Partial<GetContentDetailsHandler> as GetContentDetailsHandler;
            });
            mockDbService.read = jest.fn(() => of(contents));
            let count = 0;
            jest.spyOn(ArrayUtil, 'joinPreservingQuotes').mockReturnValue('sample-u-id');
            if (count === 0) {
                mockDbService.execute = jest.fn(() => of([]));
                count++;
            } else {
                mockDbService.execute = jest.fn(() => of([{ identifier: 'do_123' }]));
            }
            // act
            contentService.getChildContents(request as any).subscribe((val) => {
                // assert
                expect(val.identifier).toBe('d0_123');
                expect(mockDbService.read).toHaveBeenCalled();
                expect(mockDbService.execute).toHaveBeenCalled();
                expect(ArrayUtil.joinPreservingQuotes).toHaveBeenCalled();
                done();
            });
        });
        it('should be find child content if hierarchiInfoList is empty', (done) => {
            // arrange
            (ChildContentsHandler as jest.Mock<ChildContentsHandler>).mockImplementation(() => {
                return {
                    fetchChildrenOfContent: jest.fn().mockImplementation(() => Promise.resolve({ 'identifier': 'd0_123' }))
                } as Partial<ChildContentsHandler> as ChildContentsHandler;
            });
            contentService = container.get(InjectionTokens.CONTENT_SERVICE);
            const hierarInfoData: HierarchyInfo[] = [];
            const request: ChildContentRequest = {
                contentId: 'd0_123',
                hierarchyInfo: hierarInfoData
            };
            mockDbService.read = jest.fn(() => of(contents));
            jest.spyOn(ArrayUtil, 'joinPreservingQuotes').mockReturnValue('sample-u-id');

            mockDbService.execute = jest.fn(() => of([{ identifier: 'do_123' }]));

            // act
            contentService.getChildContents(request).subscribe((val) => {
                // assert
                expect(val.identifier).toBe('d0_123');
                expect(mockDbService.read).toHaveBeenCalled();
                expect(ArrayUtil.joinPreservingQuotes).toHaveBeenCalled();
                expect(mockDbService.execute).toHaveBeenCalled();
                done();
            });
        });

        it('should be find child content if hierarchiInfoList id is equal tochild id', (done) => {
            // arrange
            (ChildContentsHandler as jest.Mock<ChildContentsHandler>).mockImplementation(() => {
                return {
                    fetchChildrenOfContent: jest.fn().mockImplementation(() => Promise.resolve({ 'identifier': 'd0_123' }))
                } as Partial<ChildContentsHandler> as ChildContentsHandler;
            });
            contentService = container.get(InjectionTokens.CONTENT_SERVICE);
            const hierarInfoData: HierarchyInfo[] = [{
                identifier: 'd0_123',
                contentType: 'content_type'
            }];
            const request: ChildContentRequest = {
                contentId: 'd0_123',
                hierarchyInfo: hierarInfoData
            };
            mockDbService.read = jest.fn(() => of(contents));
            jest.spyOn(ArrayUtil, 'joinPreservingQuotes').mockReturnValue('sample-u-id');
            mockDbService.execute = jest.fn(() => of([{ identifier: 'do_123' }]));

            // act
            contentService.getChildContents(request).subscribe((val) => {
                // assert
                expect(val.identifier).toBe('d0_123');
                expect(mockDbService.read).toHaveBeenCalled();
                expect(ArrayUtil.joinPreservingQuotes).toHaveBeenCalled();
                expect(mockDbService.execute).toHaveBeenCalled();
                done();
            });
        });

        it('should be find child content if identifier is not matched', (done) => {
            // arrange
            (ChildContentsHandler as jest.Mock<ChildContentsHandler>).mockImplementation(() => {
                return {
                    fetchChildrenOfContent: jest.fn().mockImplementation(() => Promise.resolve({}))
                } as Partial<ChildContentsHandler> as ChildContentsHandler;
            });
            contentService = container.get(InjectionTokens.CONTENT_SERVICE);
            const hierarInfoData: HierarchyInfo[] = [{
                identifier: 'd0_123',
                contentType: 'content_type'
            }];
            const request: ChildContentRequest = {
                contentId: 'child_id',
                hierarchyInfo: hierarInfoData
            };
            contents[0].local_data = '{ "name": "SOME_NAME", "pkgVersion": "SOME_VERSION" }';
            mockDbService.read = jest.fn(() => of(contents));
            // act
            contentService.getChildContents(request).subscribe((val) => {
                // assert
                expect(mockDbService.read).toHaveBeenCalled();
                done();
            });
        });

        it('should be find child content for level', (done) => {
            // arrange
            (ChildContentsHandler as jest.Mock<ChildContentsHandler>).mockImplementation(() => {
                return {
                    fetchChildrenOfContent: jest.fn().mockImplementation(() => Promise.resolve({}))
                } as Partial<ChildContentsHandler> as ChildContentsHandler;
            });
            contentService = container.get(InjectionTokens.CONTENT_SERVICE);
            const hierarInfoData: HierarchyInfo[] = [{
                identifier: 'd0_123',
                contentType: 'content_type'
            }];
            const request: ChildContentRequest = {
                contentId: 'child_id',
                hierarchyInfo: hierarInfoData,
                level: 2
            };
            contents[0].local_data = '{ "name": "SOME_NAME", "pkgVersion": "SOME_VERSION" }';
            mockDbService.read = jest.fn(() => of(contents));
            // act
            contentService.getChildContents(request).subscribe(() => {
                // assert
                expect(mockDbService.read).toHaveBeenCalled();
                done();
            });
        });
    });

    it('should clear content from delete queue', (done) => {
        // arrange
        const contentDeleteRequestSet: Partial<SharedPreferencesSetCollection<ContentDelete>> = {
            clear: jest.fn().mockImplementation(() => of())
        };
        contentService = container.get(InjectionTokens.CONTENT_SERVICE);
        mockSharedPreferences.putString = jest.fn(() => of(undefined));
        // act
        contentService.clearContentDeleteQueue().subscribe(() => {
            // assert
            expect(mockSharedPreferences.putString).toHaveBeenCalledWith(ContentKeys.KEY_CONTENT_DELETE_REQUEST_LIST, expect.any(String));
            done();
        });
    });

    it('should get content from delete queue', (done) => {
        // arrange
        const contentDeleteRequestSet: Partial<SharedPreferencesSetCollection<ContentDelete>> = {
            clear: jest.fn().mockImplementation(() => of([]))
        };
        (mockSharedPreferences.getString as jest.Mock).mockReturnValue(of('[{"identifiers": "sample-id"}]'));
        // act
        contentService.getContentDeleteQueue().subscribe(() => {
            // assert
            expect(mockSharedPreferences.getString).toHaveBeenCalledWith(ContentKeys.KEY_CONTENT_DELETE_REQUEST_LIST);
            done();
        });
    });

    it('should delete content from queue', () => {
        // arrange
        const contentDelete: ContentDelete[] = [{
            contentId: 'SAMPLE_CONTENT',
            isChildContent: true
        }];
        const request: ContentDeleteRequest = {
            contentDeleteList: contentDelete
        };
        const data = jest.fn().mockImplementation(() => from([
            {
                contentId: 'SAMPLE_CONTENT_ID',
                isChildContent: true,
            }
        ]));
        const mockSharedPreferencesSetCollection: Partial<SharedPreferencesSetCollection<ContentDelete>> = {
            addAll: jest.fn().mockImplementation(() => of([{id: 'id'}])),
        };
        (mockSharedPreferences.getString as jest.Mock).mockReturnValue(of('[{"identifiers": "sample-id"}]'));
        mockSharedPreferences.putString = jest.fn().mockImplementation(() => of(undefined));
        (mockSharedPreferences.putString as jest.Mock).mockReturnValue(of(undefined));
        contentService = container.get(InjectionTokens.CONTENT_SERVICE);
        // act
        contentService.enqueueContentDelete(request).subscribe(() => {
            // assert
            expect(mockSharedPreferences.getString).toHaveBeenCalledWith(ContentKeys.KEY_CONTENT_DELETE_REQUEST_LIST);
            expect(mockSharedPreferences.putString).toHaveBeenCalledWith(ContentKeys.KEY_CONTENT_DELETE_REQUEST_LIST, expect.any(String));
            //   done();
        });
    });

    describe('importEcar', () => {
        it('should import ecar file', (done) => {
            // arrange
            const corr = [{
                id: 'SAMPLE_ID',
                type: 'SAMPLE_TYPE'
            }];
            const request: EcarImportRequest = {
                isChildContent: true,
                destinationFolder: 'SAMPLE_DETINATION_FOLDER',
                sourceFilePath: 'SAMPLE_SOURCE_FILE_PATH',
                correlationData: corr[0],
            } as any;
            const response = {
                body:
                {
                    metadata: { content_count: 1 },
                    ecarFilePath: 'native_urlcontent_count',
                    destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                    contentModelsToExport: [[Object]],
                    tmpLocationPath: undefined,
                    items: [{contentType: 'sample-content'}],
                    manifest:
                    {
                        id: 'ekstep.content.archive',
                        ver: '1.1',
                        ts: '2020-03-10T18:02:44+05:30',
                        archive: [Object]
                    },
                    FILE_SIZE: '34KB',
                    rootIdentifier: 'sample-root-id',
                    identifiers: ['ids']
                }
            };
            mockFileService.exists = jest.fn(() => Promise.resolve(response)) as any;
            const generateInteractTelemetryData = jest.fn(() => Promise.resolve(response) as any);
            (GenerateInteractTelemetry as jest.Mock<GenerateInteractTelemetry>).mockImplementation(() => {
                return {
                    execute: generateInteractTelemetryData
                } as Partial<GenerateInteractTelemetry> as GenerateInteractTelemetry;
            });
            mockFileService.getTempLocation = jest.fn(() => Promise.resolve({nativeURL: 'sample-native-url'})) as any;
            const extractEcarData = jest.fn(() => Promise.resolve(response)) as any;
            (ExtractEcar as jest.Mock<ExtractEcar> as any).mockImplementation(() => {
                return {
                    execute: extractEcarData
                } as Partial<GenerateInteractTelemetry> as GenerateInteractTelemetry;
            });
            const validateEcarData = jest.fn(() => Promise.resolve(response)) as any;
            (ValidateEcar as jest.Mock<ValidateEcar> as any).mockImplementation(() => {
                return {
                    execute: validateEcarData
                } as Partial<ValidateEcar> as ValidateEcar;
            });
            const extractPayloadsData = jest.fn(() => Promise.resolve(response)) as any;
            (ExtractPayloads as jest.Mock<ExtractPayloads> as any).mockImplementation(() => {
                return {
                    execute: extractPayloadsData
                } as Partial<ExtractPayloads> as ExtractPayloads;
            });
            response.body.items[0]['contenttype'] = 'content';
            mockEventsBusService.emit = jest.fn(() => {});

            const createContentImportManifestData = jest.fn(() => Promise.resolve(response)) as any;
            (CreateContentImportManifest as jest.Mock<CreateContentImportManifest> as any).mockImplementation(() => {
                return {
                    execute: createContentImportManifestData
                } as Partial<CreateContentImportManifest> as CreateContentImportManifest;
            });
            // act
            contentService.importEcar(request).subscribe(() => {
                // assert
                expect(mockFileService.exists).toBeCalled();
                expect(generateInteractTelemetryData).toHaveBeenCalled();
                expect(mockFileService.getTempLocation).toHaveBeenCalledWith(request.destinationFolder);
                expect(extractEcarData).toHaveBeenCalled();
                expect(validateEcarData).toHaveBeenCalled();
                expect(extractPayloadsData).toHaveBeenCalled();
                done();
            });
        });
    });

    it('should return relevant content', (done) => {
        // arrange
        const data: HierarchyInfo[] = [{
            identifier: 'SAMPLE_IDENTIFIER',
            contentType: 'YOUTUBE'
        }];
        const request: RelevantContentRequest = {
            identifier: 'SAMPLE_IDENTIFIER',
            downloadUrl: 'SAMPLE_DOWNLOAD_URL',
            mimeType: 'SAMPLE_MIME_TYPE',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            filename: 'SAMPLE_FILE_NAME',
            next: true,
            prev: true,
            hierarchyInfo: data,
        };
        (GetContentDetailsHandler as any as jest.Mock<GetContentDetailsHandler>).mockImplementation(() => {
            return {
                getReadContentQuery: jest.fn().mockImplementation(() => { })
            } as Partial<GetContentDetailsHandler> as GetContentDetailsHandler;
        });
        mockDbService.read = jest.fn().mockImplementation(() => of({}));
        const response = 'SAMPLE_STRING';
        (ChildContentsHandler as jest.Mock<ChildContentsHandler>).mockImplementation(() => {
            return {
                getContentsKeyList: jest.fn().mockImplementation(() => '[]'),
                getNextContentIdentifier: jest.fn().mockImplementation(() => of(response)),
                getContentFromDB: jest.fn().mockImplementation(() => of({})),
                getPreviousContentIdentifier: jest.fn().mockImplementation(() => response)
            } as Partial<ChildContentsHandler> as ChildContentsHandler;
        });
        contentService = container.get(InjectionTokens.CONTENT_SERVICE);
        // act
        contentService.getRelevantContent(request).subscribe((res) => {
            // assert
            expect(mockDbService.read).toBeCalled();
            expect(ChildContentsHandler).toHaveBeenCalled();
            done();
        });
    });

    it('should be next content', (done) => {
        // arrange
        const hierarchyInfo: HierarchyInfo[] = [{
            identifier: 'd0_123',
            contentType: 'content_type'
        }];
        const currentContentIdentifier = 'CONTENT_IDENTIFIER';
        mockDbService.read = jest.fn().mockImplementation(() => of([]));
        // act
        contentService.nextContent(hierarchyInfo, currentContentIdentifier).subscribe(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            done();
        });
    });
    it('should be return previous content', (done) => {
        // arrange
        const hierarchyInfo: HierarchyInfo[] = [{
            identifier: 'd0_123',
            contentType: 'content_type'
        }];
        const currentContentIdentifier = 'CONTENT_IDENTIFIER';
        mockDbService.read = jest.fn().mockImplementation(() => of([]));
        // act
        contentService.prevContent(hierarchyInfo, currentContentIdentifier).subscribe(() => {
            // arrange
            expect(mockDbService.read).toHaveBeenCalled();
            done();
        });
    });
    it('should space useage for content', (done) => {
        // arrange
        const request: ContentSpaceUsageSummaryRequest = {
            paths: ['SAMPLE_PATHS_1', 'SAMPLE_PATHS_2']
        };
        mockDbService.execute = jest.fn().mockImplementation(() => of([{
            total_Size: ''
        }]));
        // (mockDbService.execute as jest.Mock).mockReturnValue(of({}))
        // act
        contentService.getContentSpaceUsageSummary(request).subscribe(() => {
            // assert
            expect(mockDbService.execute).toBeCalled();
            done();
        });
    });
    it('should complete download', (done) => {
        // arrange
        const content: Partial<Content> = {
            identifier: 'Sample_identifier'
        };
        const request: ContentDownloadRequest = {
            identifier: 'Sample_identifier',
            downloadUrl: '',
            mimeType: '',
            destinationFolder: '',
            filename: '',
            contentMeta: content
        };
        const correlationRequest: CorrelationData[] = [{
            id: 'SAMPLE_ID',
            type: 'SAMPLE_TYPE'
        }];
        const importRequest: EcarImportRequest = {
            isChildContent: true,
            destinationFolder: 'DESTINATION_FOLDER',
            sourceFilePath: 'SOURCE_FILE_PATH',
            correlationData: correlationRequest
        };
        mockDownloadService.cancel = jest.fn().mockImplementation(() => of(undefined));
        mockFileService.exists = jest.fn().mockImplementation(() => of(undefined));
        (mockFileService.exists as jest.Mock).mockResolvedValue('');
        // act
        contentService.onDownloadCompletion(request).subscribe(() => {
            // assert
            expect(mockDownloadService.cancel).toHaveBeenCalled();
            done();
        });
    });

    describe('getContents', () => {
        it('should get all content by invoked getContents()', (done) => {
            // arrange
            const request: ContentRequest = {
                uid: 'sample-u-id',
                primaryCategories: ['textbook', 'course'],
                attachContentAccess: true,
                attachFeedback: true,
                resourcesOnly: true
            };
            const contents: ContentEntry.SchemaMap[] = [
                {
                    [ContentEntry.COLUMN_NAME_IDENTIFIER]: 'SOME_IDENTIFIER',
                    [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
                    [ContentEntry.COLUMN_NAME_LOCAL_DATA]: JSON.stringify({ name: 'SOME_NAME', pkgVersion: 'SOME_VERSION' }),
                    [ContentEntry.COLUMN_NAME_MIME_TYPE]: '',
                    [ContentEntry.COLUMN_NAME_VISIBILITY]: '',
                    [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: '',
                    [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: '',
                    [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: ''
                }
            ];
            const content: Partial<Content> = {
                identifier: 'Sample_identifier',
            };
            mockDbService.execute = jest.fn(() => of(contents));
            jest.spyOn(ArrayUtil, 'joinPreservingQuotes').mockReturnValue('sample-u-id');

            (GetContentsHandler as jest.Mock<GetContentsHandler>).mockImplementation(() => {
                return {
                    getAllLocalContentQuery: jest.fn().mockImplementation(() => 'select * from content')
                } as Partial<GetContentsHandler> as GetContentsHandler;
            });

            (GetContentDetailsHandler as any as jest.Mock<GetContentDetailsHandler>).mockImplementation(() => {
                return {
                    decorateContent: jest.fn(() => of(content))
                } as Partial<GetContentDetailsHandler> as GetContentDetailsHandler;
            });
            contentService = container.get(InjectionTokens.CONTENT_SERVICE);
            // act
            contentService.getContents(request).subscribe(() => {
                // assert
                expect(mockDbService.execute).toHaveBeenCalled();
                expect(ArrayUtil.joinPreservingQuotes).toHaveBeenCalled();
                done();
            });
            // assert
        });
    });
    describe('exportContent', () => {
        it('should export content for delete content', (done) => {
            // arrange
            jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
            const request: ContentExportRequest = {
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                contentIds: ['SAMPLE_CONTENT_ID_1', 'SAMPLE_CONTENT_ID_2']
            };
            mockFileService.getTempLocation = jest.fn().mockImplementation(() => Promise.resolve({ nativeURL: 'native_url' }));
            (mockFileService.exists as jest.Mock).mockResolvedValue('');
            const cleanTempSession: Partial<CleanTempLoc> = {
                execute: jest.fn().mockImplementation(() => { })
            };
            (cleanTempSession.execute as jest.Mock).mockResolvedValue('');
            mockDbService.execute = jest.fn().mockImplementation(() => of({}));
            const contents: ContentEntry.SchemaMap[] = [
                {
                    [ContentEntry.COLUMN_NAME_IDENTIFIER]: 'SOME_IDENTIFIER',
                    [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
                    [ContentEntry.COLUMN_NAME_LOCAL_DATA]: '{ "name": "SOME_NAME", "pkgVersion": "SOME_VERSION, "childNodes": {} }',
                    [ContentEntry.COLUMN_NAME_MIME_TYPE]: '',
                    [ContentEntry.COLUMN_NAME_VISIBILITY]: '',
                    [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: '',
                    [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: '',
                    [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: ''
                }
            ];
            JSON.parse = jest.fn().mockImplementation().mockImplementationOnce(() => {
                return contents[0].local_data;
            });
            const importNExportData = jest.fn().mockImplementation(() => Promise.resolve(contents));
            const populateItemsData = jest.fn().mockImplementation(() => [{ 'key': 'do_id' }]);
            (ImportNExportHandler as any as jest.Mock<ImportNExportHandler>).mockImplementation(() => {
                return {
                    getContentExportDBModelToExport: importNExportData,
                    populateItems: populateItemsData
                } as Partial<ImportNExportHandler> as ImportNExportHandler;
            });
            mockFileService.listDir = jest.fn().mockImplementation(() => Promise.resolve([{
                name: 'ENTRY_NAME'
            }]));
            spyOn(FileUtil, 'getFileExtension').and.returnValue('');
            mockFileService.createDir = jest.fn().mockImplementation(() => Promise.resolve([{
                name: 'sunbird'
            }]));
            mockDeviceInfo.getAvailableInternalMemorySize = jest.fn(() => of('400kb'));
            const response = {
                body:
                {
                    metadata: { content_count: 1 },
                    ecarFilePath: 'native_urlcontent_count',
                    destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                    contentModelsToExport: [[Object]],
                    tmpLocationPath: undefined,
                    items: [[Object]],
                    manifest:
                    {
                        id: 'ekstep.content.archive',
                        ver: '1.1',
                        ts: '2020-03-10T18:02:44+05:30',
                        archive: [Object]
                    }
                }
            };
            const writeManifestData = jest.fn(() => Promise.resolve(response) as any);
            (mockDeviceInfo.getAvailableInternalMemorySize as jest.Mock).mockReturnValue(throwError(undefined));
            (WriteManifest as jest.Mock<WriteManifest>).mockImplementation(() => {
                return {
                    execute: writeManifestData
                } as Partial<WriteManifest> as WriteManifest;
            });
            const compressContentData = jest.fn(() => Promise.resolve(response) as any);
            (CompressContent as jest.Mock<CompressContent>).mockImplementation(() => {
                return {
                    execute: compressContentData
                } as Partial<CompressContent> as CompressContent;
            });
            const deviceMemoryCheckData = jest.fn(() => Promise.resolve(response) as any);
            (DeviceMemoryCheck as jest.Mock<DeviceMemoryCheck>).mockImplementation(() => {
                return {
                    execute: deviceMemoryCheckData
                } as Partial<DeviceMemoryCheck> as DeviceMemoryCheck;
            });
            const ecarBundleData = jest.fn(() => Promise.resolve(response) as any);
            (EcarBundle as any as jest.Mock<EcarBundle>).mockImplementation(() => {
                return {
                    execute: ecarBundleData
                } as Partial<EcarBundle> as EcarBundle;
            });
            const copyToDestinationData = jest.fn(() => Promise.resolve(response) as any);
            (CopyToDestination as any as jest.Mock<CopyToDestination>).mockImplementation(() => {
                return {
                    execute: copyToDestinationData
                } as Partial<CopyToDestination> as CopyToDestination;
            });
            const deleteTempDirData = jest.fn(() => Promise.resolve(response) as any);
            (DeleteTempDir as any as jest.Mock<DeleteTempDir>).mockImplementation(() => {
                return {
                    execute: deleteTempDirData
                } as Partial<DeleteTempDir> as DeleteTempDir;
            });
            const generateExportShareTelemetryData = jest.fn(() => Promise.resolve(response) as any);
            (GenerateExportShareTelemetry as any as jest.Mock<GenerateExportShareTelemetry>).mockImplementation(() => {
                return {
                    execute: generateExportShareTelemetryData
                } as Partial<GenerateExportShareTelemetry> as GenerateExportShareTelemetry;
            });
            mockAppInfo.getAppName = jest.fn(() => 'sunbird');
            jest.spyOn(ContentUtil, 'getExportedFileName').mockReturnValue('content_count');
            jest.spyOn(ArrayUtil, 'joinPreservingQuotes').mockReturnValue('');
            // act
            contentService.exportContent(request).subscribe(() => {
                expect(mockFileService.getTempLocation).toBeCalled();
                expect(mockDbService.execute).not.toHaveBeenCalledWith(expect.any(String));
                expect(mockAppInfo.getAppName).toHaveBeenCalled();
                expect(importNExportData).toHaveBeenCalled();
                expect(populateItemsData).toHaveBeenCalled();
                expect(writeManifestData).toHaveBeenCalled();
                expect(compressContentData).toHaveBeenCalled();
                expect(deviceMemoryCheckData).toHaveBeenCalled();
                expect(ecarBundleData).toHaveBeenCalled();
                expect(copyToDestinationData).toHaveBeenCalled();
                expect(deleteTempDirData).toHaveBeenCalled();
                expect(generateExportShareTelemetryData).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('importContent', () => {
        it('should import content using file path', (done) => {
            // arrange
            const contentImport: ContentImport[] = [{
                isChildContent: true,
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                contentId: 'd0_123'
            }];
            const request: ContentImportRequest = {
                contentImportArray: contentImport,
                contentStatusArray: ['SAMPLE_1', 'SAMPLE_2']
            };
            spyOn(mockApiService, 'fetch').and.returnValue(of({
                body: {
                    result: {
                        response: 'SAMPLE_RESPONSE',
                        content: [{
                            identifier: 'd0_123',
                            contentName: 'sample_name'
                        }]
                    }
                }
            }));
            const getDownloadUrlData = jest.fn(() => Promise.resolve('ecar'));
            const getContentSearchFilterData = jest.fn(() => Promise.resolve({}));
            (SearchContentHandler as jest.Mock<SearchContentHandler>).mockImplementation(() => {
                return {
                    getDownloadUrl: getDownloadUrlData,
                    getContentSearchFilter: getContentSearchFilterData
                } as any;
            });
            jest.spyOn(FileUtil, 'getFileExtension').mockReturnValue('ecar');
            mockDownloadService.download = jest.fn(() => of(undefined));
            // act
            contentService.importContent(request).subscribe((val) => {
                // assert
                expect(val[0].identifier).toBe(contentImport[0].contentId);
                expect(FileUtil.getFileExtension).toHaveBeenCalled();
                expect(mockApiService.fetch).toHaveBeenCalled();
                expect(mockDownloadService.download).toHaveBeenCalled();
                expect(getDownloadUrlData).toHaveBeenCalled();
                expect(getContentSearchFilterData).toHaveBeenCalled();
                done();
            });
        });

        it('should import content if downloadUrl is not matched', (done) => {
            // arrange
            const contentImport: ContentImport[] = [{
                isChildContent: true,
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                contentId: 'd0_123'
            }];
            const request: ContentImportRequest = {
                contentImportArray: contentImport,
                contentStatusArray: ['SAMPLE_1', 'SAMPLE_2']
            };
            spyOn(mockApiService, 'fetch').and.returnValue(of({
                body: {
                    result: {
                        response: 'SAMPLE_RESPONSE',
                        content: [{
                            identifier: 'd0_123',
                            contentName: 'sample_name'
                        }]
                    }
                }
            }));
            const getDownloadUrlData = jest.fn(() => Promise.resolve('ecar'));
            const getContentSearchFilterData = jest.fn(() => Promise.resolve({}));
            (SearchContentHandler as jest.Mock<SearchContentHandler>).mockImplementation(() => {
                return {
                    getDownloadUrl: getDownloadUrlData,
                    getContentSearchFilter: getContentSearchFilterData
                } as any;
            });
            jest.spyOn(FileUtil, 'getFileExtension').mockReturnValue('epar');
            mockDownloadService.download = jest.fn(() => of(undefined));
            // act
            contentService.importContent(request).subscribe((val) => {
                // assert
                expect(val[0].identifier).toBe(contentImport[0].contentId);
                expect(FileUtil.getFileExtension).toHaveBeenCalled();
                expect(mockApiService.fetch).toHaveBeenCalled();
                expect(mockDownloadService.download).toHaveBeenCalled();
                expect(getDownloadUrlData).toHaveBeenCalled();
                expect(getContentSearchFilterData).toHaveBeenCalled();
                done();
            });
        });

        it('should import content if contentData is undefined', (done) => {
            // arrange
            const contentImport: ContentImport[] = [{
                isChildContent: true,
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                contentId: 'd0_12345'
            }];
            const request: ContentImportRequest = {
                contentImportArray: contentImport,
                contentStatusArray: ['SAMPLE_1', 'SAMPLE_2']
            };
            spyOn(mockApiService, 'fetch').and.returnValue(of({
                body: {
                    result: {
                        response: 'SAMPLE_RESPONSE',
                        content: [{
                            identifier: 'd0_123',
                            contentName: 'sample_name'
                        }]
                    }
                }
            }));
            (SearchContentHandler as jest.Mock<SearchContentHandler>).mockImplementation(() => {
                return {
                    getDownloadUrl: jest.fn(() => Promise.resolve('ecar')),
                    getContentSearchFilter: jest.fn(() => Promise.resolve({}))
                } as any;
            });
            jest.spyOn(FileUtil, 'getFileExtension').mockReturnValue('epar');
            mockDownloadService.download = jest.fn(() => of(undefined));
            // act
            contentService.importContent(request).subscribe(() => {
                // assert
                expect(mockApiService.fetch).toHaveBeenCalled();
                expect(mockDownloadService.download).toHaveBeenCalled();
                done();
            });
        });

        it('should import content if content is undefined', (done) => {
            // arrange
            const contentImport: ContentImport[] = [{
                isChildContent: true,
                destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
                contentId: 'd0_12345'
            }];
            const request: ContentImportRequest = {
                contentImportArray: contentImport,
                contentStatusArray: ['SAMPLE_1', 'SAMPLE_2']
            };
            spyOn(mockApiService, 'fetch').and.returnValue(of({
                body: {
                    result: {
                        response: 'SAMPLE_RESPONSE'
                    }
                }
            }));
            const getDownloadUrlData = jest.fn(() => Promise.resolve('ecar'));
            const getContentSearchFilterData = jest.fn(() => Promise.resolve({}));
            (SearchContentHandler as jest.Mock<SearchContentHandler>).mockImplementation(() => {
                return {
                    getDownloadUrl: getDownloadUrlData,
                    getContentSearchFilter: getContentSearchFilterData
                } as any;
            });
            mockDownloadService.download = jest.fn(() => of(undefined));
            // act
            contentService.importContent(request).subscribe(() => {
                // assert
                expect(mockApiService.fetch).toHaveBeenCalled();
                expect(getContentSearchFilterData).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('buildContentAggregator()', () => {
        const mockFormService: Partial<FormService> = {};
        const mockCourseService: Partial<CourseService> = {};
        const mockContentAggregator = {
            handle: jest.fn().mockImplementation(() => of({
                result: []
            }))
        } as Partial<ContentAggregator> as ContentAggregator;

        beforeAll(() => {
            (ContentAggregator as any as jest.Mock<ContentAggregator>).mockImplementation(() => {
                return mockContentAggregator;
            });
            contentService = container.get(InjectionTokens.CONTENT_SERVICE);
        });

        it('should be able to build a ContentAggregator instance', (done) => {
            // act
            expect(contentService.buildContentAggregator(
                mockFormService as FormService,
                mockCourseService as CourseService,
                mockProfileService as ProfileService
            )).toBeTruthy();
            done();
        });
    });

    describe('setContentMarker', () => {
        it('should set marker in content', (done) => {
            // arrange
            const markerType: MarkerType = MarkerType.BOOKMARKED;
            const request: ContentMarkerRequest = {
                contentId: 'SAMPLE_CONTENT_ID',
                uid: 'SAMPLE_UID',
                data: 'SAMPLE_DATA',
                extraInfo: { 'key': 'SAMPLE_KEY' },
                marker: markerType,
                isMarked: false
            };
            mockDbService.execute = jest.fn().mockImplementation(() => of([]));
            mockDbService.insert = jest.fn(() => of(1));
            JSON.parse = jest.fn().mockImplementation().mockImplementationOnce(() => {
                return request.data;
            });
            // act
            contentService.setContentMarker(request).subscribe(() => {
                // assert
                expect(mockDbService.insert).toHaveBeenCalled();
                expect(mockDbService.execute).toHaveBeenCalled();
                done();
            });
        });
        it('should update db if content marker is not empty', (done) => {
            // arrange
            const markerType: MarkerType = MarkerType.BOOKMARKED;
            const request: ContentMarkerRequest = {
                contentId: 'SAMPLE_CONTENT_ID',
                uid: 'SAMPLE_UID',
                data: 'SAMPLE_DATA',
                extraInfo: { 'key': 'SAMPLE_KEY' },
                marker: markerType,
                isMarked: true
            };
            const contents: ContentEntry.SchemaMap[] = [
                {
                    [ContentEntry.COLUMN_NAME_IDENTIFIER]: 'SOME_IDENTIFIER',
                    [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
                    [ContentEntry.COLUMN_NAME_LOCAL_DATA]: JSON.stringify({ name: 'SOME_NAME', pkgVersion: 'SOME_VERSION' }),
                    [ContentEntry.COLUMN_NAME_MIME_TYPE]: '',
                    [ContentEntry.COLUMN_NAME_VISIBILITY]: '',
                    [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: '',
                    [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: '',
                    [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: ''
                }
            ];
            mockDbService.execute = jest.fn(() => of(contents));
            mockDbService.update = jest.fn(() => of(1));
            JSON.parse = jest.fn().mockImplementation().mockImplementationOnce(() => {
                return request.data;
            });
            // act
            contentService.setContentMarker(request).subscribe(() => {
                // assert
                expect(mockDbService.execute).toHaveBeenCalled();
                expect(mockDbService.update).toHaveBeenCalled();
                done();
            });
        });
        it('should delete db if content marker is not empty and isMarked is false', (done) => {
            // arrange
            const markerType: MarkerType = MarkerType.BOOKMARKED;
            const request: ContentMarkerRequest = {
                contentId: 'SAMPLE_CONTENT_ID',
                uid: 'SAMPLE_UID',
                data: 'SAMPLE_DATA',
                extraInfo: { 'key': 'SAMPLE_KEY' },
                marker: markerType,
                isMarked: false
            };
            const contents: ContentEntry.SchemaMap[] = [
                {
                    [ContentEntry.COLUMN_NAME_IDENTIFIER]: 'SOME_IDENTIFIER',
                    [ContentEntry.COLUMN_NAME_SERVER_DATA]: '',
                    [ContentEntry.COLUMN_NAME_LOCAL_DATA]: JSON.stringify({ name: 'SOME_NAME', pkgVersion: 'SOME_VERSION' }),
                    [ContentEntry.COLUMN_NAME_MIME_TYPE]: '',
                    [ContentEntry.COLUMN_NAME_VISIBILITY]: '',
                    [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: '',
                    [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: '',
                    [ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY]: ''
                }
            ];
            mockDbService.execute = jest.fn().mockImplementation(() => of(contents));
            mockDbService.delete = jest.fn(() => of(undefined));
            JSON.parse = jest.fn().mockImplementation().mockImplementationOnce(() => {
                return request.data;
            });
            // act
            contentService.setContentMarker(request).subscribe(() => {
                // assert
                expect(mockDbService.execute).toHaveBeenCalled();
                expect(mockDbService.delete).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('getQuestionList', () => {
        it('should fetch locally available question list', (done) => {
            // arrange
            const questionIds = ['do_id1', 'do_id2'];
            const parentId = 'do_parent_id1';

            contentService.getContentDetails = jest.fn(()=>of({identifier: 'do_parent_id1', isAvailableLocally: true} as Content));
            contentService['questionSetFileReadHandler'].getLocallyAvailableQuestion = jest.fn(()=>of([{identifier: 'some Id'}]));
            // act
            contentService.getQuestionList(questionIds, parentId).subscribe(() => {
                // assert
                expect(contentService['questionSetFileReadHandler'].getLocallyAvailableQuestion).toBeCalled();
                done();
            })
        });

        it('should fetch question list from server', (done) => {
            // arrange
            const questionIds = ['do_id1', 'do_id2'];
            const parentId = 'do_parent_id1';

            contentService.getContentDetails = jest.fn(()=>of({identifier: 'do_parent_id1', isAvailableLocally: false} as Content));
            contentService['questionSetFileReadHandler'].getLocallyAvailableQuestion = jest.fn(()=>of([{identifier: 'some Id'}]));
            
            mockContainerService.get = jest.fn(() => ({
                getQuestionList: jest.fn(() => of([{
                    id: 'sampleid'
                }])) as any
            }))as any;
            
            // act
            contentService.getQuestionList(questionIds, parentId).subscribe(() => {
                // assert
                expect(mockContainerService.get).toHaveBeenCalled();
                done();
            })
        });

        it('should fetch question list from server if question set throws error', (done) => {
            // arrange
            const questionIds = ['do_id1', 'do_id2'];
            const parentId = 'do_parent_id1';

            contentService.getContentDetails = jest.fn(()=>throwError('error'));
            contentService['questionSetFileReadHandler'].getLocallyAvailableQuestion = jest.fn(()=>of([{identifier: 'some Id'}]));
            
            mockContainerService.get = jest.fn(() => ({
                getQuestionList: jest.fn(() => of([{
                    id: 'sampleid'
                }])) as any
            }))as any;
            
            // act
            contentService.getQuestionList(questionIds, parentId).subscribe(() => {
                // assert
                expect(mockContainerService.get).toHaveBeenCalled();
                done();
            })
        });

        it('should return question set hierarchy', (done) =>{
            mockContainerService.get = jest.fn(() => ({
                getQuestionSetHierarchy: jest.fn(() => of({
                    id: 'sampleid'
                })) as any
            }))as any;
            contentService.getQuestionSetHierarchy('1234').subscribe(() => {
                expect(mockContainerService.get).toHaveBeenCalled();
                done();
            })
        })

        it('should return question set read', (done) =>{
            mockContainerService.get = jest.fn(() => ({
                getQuestionSetRead: jest.fn(() => of({})) as any
            }))as any;
            contentService.getQuestionSetRead('1234' , {}).subscribe(() => {
                expect(mockContainerService.get).toHaveBeenCalled();
                done();
            })
        })
    })

    describe('getQuestionSetChildren()', ()=>{
        it('should return questionSet children', (done) =>{
            // arrange
            contentService['getChildQuestionSetHandler'].handle = jest.fn(()=>Promise.resolve([{identifier: 'do_id'}]));
            // act
            contentService.getQuestionSetChildren('1234').then(() => {
                // assert
                expect(contentService['getChildQuestionSetHandler'].handle).toHaveBeenCalled();
                done();
            })
        })

        it('should return questionSet children as empty array if it throws error', (done) =>{
            // arrange
            contentService['getChildQuestionSetHandler'].handle = jest.fn(()=>Promise.reject('some error'));
            // act
            contentService.getQuestionSetChildren('1234').then(() => {
                // assert
                expect(contentService['getChildQuestionSetHandler'].handle).toHaveBeenCalled();
                done();
            })
        })
    })

    describe('formatSearchCriteria', ()=>{
        it('should convert search filter object to contant search criteria.', (done) =>{
            // arrange
            const request = {
                request: {
                    query: 'Sample_query',
                    mode: 'mode',
                    filters: 'filters'
                }
            };
            (SearchContentHandler as jest.Mock<SearchContentHandler>).mockImplementation(() => {
                return {
                    getSearchCriteria: jest.fn(() => ({languageCode: 'bn'}))
                } as Partial<SearchContentHandler> as SearchContentHandler;
            });
            //act
            
            contentService.formatSearchCriteria(request);
            // assert
            expect(request.request.query).toBe('Sample_query');
            done();
        });
    });

    describe('downloadTranscriptFile', () => {
        it('should be download file and copy inside internal space If folder is exists', (done) => {
            // arrange
            const transcriptReq = {
                downloadUrl: 'http//:sample-download-url',
                fileName: 'Transcript-file',
                destinationUrl: 'sample/files/fileName',
                identifier: 'sample-id'
            };
            mockFileService.exists = jest.fn(() => Promise.resolve({
                nativeURL: 'sample-native-URL'
            })) as any;
            const data = undefined;
            window['downloadManager'] = {
                enqueue: jest.fn(({ }, fn) => fn(data, { id: 'sample-id' }as any)),
                query: jest.fn((_, fn) => fn(data, [{
                    status: DownloadStatus.STATUS_SUCCESSFUL,
                    localUri: 'http//:sample-path/do_id/fileName'
                }]))as any
            } as any;
            sbutility.copyFile = jest.fn(((_, __, ___, cb) => { cb(); }));
            sbutility.rm = jest.fn((_, __, cb, err) => cb(true));
            // act
            contentService.downloadTranscriptFile(transcriptReq).then(() => {
                // assert
                expect(mockFileService.exists).toHaveBeenCalled();
                expect(window['downloadManager'].enqueue).toHaveBeenCalled();
                expect(window['downloadManager'].query).toHaveBeenCalled();
                expect(sbutility.copyFile).toHaveBeenCalled();
                done();
            });
        });

        it('should be download file and copy inside internal space If folder is not exists', (done) => {
            // arrange
            const transcriptReq = {
                downloadUrl: 'http//:sample-download-url',
                fileName: 'Transcript-file',
                destinationUrl: 'sample/files/fileName',
                identifier: 'sample-id'
            };
            mockFileService.exists = jest.fn(() => Promise.reject({
                nativeURL: 'sample-native-URL'
            })) as any;
            mockFileService.createDir = jest.fn(() => Promise.resolve({
                nativeURL: 'sample-native-URL'
            })) as any;
            const data = undefined;
            window['downloadManager'] = {
                enqueue: jest.fn(({ }, fn) => fn(data, { id: 'sample-id' } as any)),
                query: jest.fn((_, fn) => fn(data, [{
                    status: DownloadStatus.STATUS_SUCCESSFUL,
                    localUri: 'http//:sample-path/do_id/fileName'
                }])) as any
            }as any;
            sbutility.copyFile = jest.fn(((_, __, ___, cb) => { cb(); }));
            sbutility.rm = jest.fn((_, __, cb, err) => cb(true));
            // act
            contentService.downloadTranscriptFile(transcriptReq).then(() => {
                // assert
                expect(mockFileService.exists).toHaveBeenCalled();
                expect(mockFileService.createDir).toHaveBeenNthCalledWith(1, 'undefinedtranscript', false);
                expect(mockFileService.createDir).toHaveBeenNthCalledWith(2, 'undefinedtranscript/sample-id', false);
                expect(window['downloadManager'].enqueue).toHaveBeenCalled();
                expect(window['downloadManager'].query).toHaveBeenCalled();
                expect(sbutility.copyFile).toHaveBeenCalled();
                done();
            });
        });

        it('should not download for catch part', (done) => {
            // arrange
            const transcriptReq = {
                downloadUrl: 'http//:sample-download-url',
                fileName: 'Transcript-file',
                destinationUrl: 'sample/files/fileName',
                identifier: 'sample-id'
            };
            mockFileService.exists = jest.fn(() => Promise.reject({
                nativeURL: 'sample-native-URL'
            })) as any;
            const data = undefined;
            window['downloadManager'] = {
                enqueue: jest.fn(({}, fn) => fn({err: 'error'}))
            } as any;
            // act
            contentService.downloadTranscriptFile(transcriptReq).catch(() => {
                // assert
                expect(mockFileService.exists).toHaveBeenCalled();
                done();
            });
        });

        it('should be download but not copied copy for catch part', (done) => {
            // arrange
            const transcriptReq = {
                downloadUrl: 'http//:sample-download-url',
                fileName: 'Transcript-file',
                destinationUrl: 'sample/files/fileName',
                identifier: 'sample-id'
            };
            mockFileService.exists = jest.fn(() => Promise.reject({
                nativeURL: 'sample-native-URL'
            })) as any;
            mockFileService.createDir = jest.fn(() => Promise.resolve({
                nativeURL: 'sample-native-URL'
            })) as any;
            const data = undefined;
            window['downloadManager'] = {
                enqueue: jest.fn(({ }, fn) => fn(data, { id: 'sample-id' })),
                query: jest.fn((_, fn) => fn(data, [{
                    status: DownloadStatus.STATUS_SUCCESSFUL,
                    localUri: 'http//:sample-path/do_id/fileName'
                }]))
            } as any;
            sbutility.copyFile = jest.fn(((_, __, ___, ____, err) => { err(true); }));
            // act
            contentService.downloadTranscriptFile(transcriptReq).then(() => {
                // assert
                expect(mockFileService.exists).toHaveBeenCalled();
                expect(mockFileService.createDir).toHaveBeenNthCalledWith(1, 'undefinedtranscript', false);
                expect(mockFileService.createDir).toHaveBeenNthCalledWith(2, 'undefinedtranscript/sample-id', false);
                expect(window['downloadManager'].enqueue).toHaveBeenCalled();
                expect(window['downloadManager'].query).toHaveBeenCalled();
                expect(sbutility.copyFile).toHaveBeenCalled();
                done();
            });
        });

        it('should be download and copied but not delete from storage for delete catch part', (done) => {
            // arrange
            const transcriptReq = {
                downloadUrl: 'http//:sample-download-url',
                fileName: 'Transcript-file',
                destinationUrl: 'sample/files/fileName',
                identifier: 'sample-id'
            };
            mockFileService.exists = jest.fn(() => Promise.reject({
                nativeURL: 'sample-native-URL'
            })) as any;
            mockFileService.createDir = jest.fn(() => Promise.resolve({
                nativeURL: 'sample-native-URL'
            })) as any;
            const data = undefined;
            window['downloadManager'] = {
                enqueue: jest.fn(({ }, fn) => fn(data, { id: 'sample-id' })),
                query: jest.fn((_, fn) => fn(data, [{
                    status: DownloadStatus.STATUS_SUCCESSFUL,
                    localUri: 'http//:sample-path/do_id/fileName'
                }]))
            } as any;
            sbutility.copyFile = jest.fn(((_, __, ___, cb, err) => { cb(); }));
            sbutility.rm = jest.fn((_, __, cb, err) => err(true));
            // act
            contentService.downloadTranscriptFile(transcriptReq).then(() => {
                // assert
                expect(mockFileService.exists).toHaveBeenCalled();
                expect(mockFileService.createDir).toHaveBeenNthCalledWith(1, 'undefinedtranscript', false);
                expect(mockFileService.createDir).toHaveBeenNthCalledWith(2, 'undefinedtranscript/sample-id', false);
                expect(window['downloadManager'].enqueue).toHaveBeenCalled();
                expect(window['downloadManager'].query).toHaveBeenCalled();
                expect(sbutility.copyFile).toHaveBeenCalled();
                done();
            });
        });
    });
});
