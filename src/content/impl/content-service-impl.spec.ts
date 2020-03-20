import { GetContentHeirarchyHandler } from '../handlers/get-content-heirarchy-handler';
import { ContentService } from '..';
import { ContentServiceImpl } from './content-service-impl';
import { Container } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { DbService } from '../../db';
import { SdkConfig } from '../../sdk-config';
import { ApiService, Request } from '../../api';
import {
    ProfileService, ContentDelete, ContentDetailRequest, ContentDeleteRequest,
    ContentMarkerRequest, Content, HttpRequestType, ContentData, AppInfo
} from '../..';
import { FileService } from '../../util/file/def/file-service';
import { ZipService } from '../../util/zip/def/zip-service';
import { DeviceInfo } from '../../util/device';
import { TelemetryService, CorrelationData } from '../../telemetry';
import { ContentFeedbackService } from '../def/content-feedback-service';
import { DownloadService } from '../../util/download';
import { SharedPreferences } from '../../util/shared-preferences';
import { EventsBusService } from '../../events-bus';
import { CachedItemStore } from '../../key-value-store';
import { throwError } from 'rxjs';
import { SharedPreferencesSetCollection } from '../../util/shared-preferences/def/shared-preferences-set-collection';
import { ContentServiceConfig } from '../config/content-config';
import { OpenRapConfigurable } from '../../open-rap-configurable';
import {
    MarkerType, ContentSearchCriteria, EcarImportRequest, RelevantContentRequest,
    ContentSpaceUsageSummaryRequest, ContentDownloadRequest, ContentExportRequest,
    ContentRequest, ChildContentRequest, ContentImportRequest, ContentImport
} from '../def/requests';
import { SharedPreferencesSetCollectionImpl } from '../../util/shared-preferences/impl/shared-preferences-set-collection-impl';
import { GenerateInteractTelemetry } from '../handlers/import/generate-interact-telemetry';
import { HierarchyInfo } from '../def/content';
import { CleanTempLoc } from '../handlers/export/clean-temp-loc';
import { AppConfig } from '../../api/config/app-config';
import { SearchContentHandler } from '../handlers/search-content-handler';
import { ContentMapper } from '../util/content-mapper';
import { GetContentDetailsHandler } from '../handlers/get-content-details-handler';
import { FrameworkKeys, ContentKeys } from '../../preference-keys';
import { ChildContentsHandler } from '../handlers/get-child-contents-handler';
import { ImportNExportHandler } from '../handlers/import-n-export-handler';
import { ArrayUtil } from '../../util/array-util';
import { FileUtil } from '../../util/file/util/file-util';
import { of, from } from 'rxjs';


jest.mock('../handlers/search-content-handler');
jest.mock('../handlers/get-content-details-handler');
jest.mock('../handlers/get-child-contents-handler');
jest.mock('../handlers/import-n-export-handler');
jest.mock('../handlers/get-content-heirarchy-handler');

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
        registerOnDownloadCompleteDelegate: jest.fn().mockImplementation(() => { })
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        getBoolean: jest.fn().mockImplementation(() => { }),
        putString: jest.fn().mockImplementation(() => { }),
        getString: jest.fn().mockImplementation(() => { })
    };
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {
        getCached: jest.fn().mockImplementation(() => { })
    };
    const mockAppInfo: Partial<AppInfo> = {
        getAppName: () => 'MOCK_APP_NAME'
    };

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

        contentService = container.get(InjectionTokens.CONTENT_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (SearchContentHandler as any as jest.Mock<SearchContentHandler>).mockClear();
        (GetContentDetailsHandler as any as jest.Mock<GetContentDetailsHandler>).mockClear();
        (ChildContentsHandler as any as jest.Mock<ChildContentsHandler>).mockClear();
        (ImportNExportHandler as any as jest.Mock<ImportNExportHandler>).mockClear();
    });

    it('should return an instance of ContentServiceImpl from container', () => {
        // assert
        expect(contentService).toBeTruthy();
    });

    it('should register as download service observe onInit()', (done) => {
        mockSharedPreferences.getBoolean = jest.fn().mockImplementation(() => of([]));
        mockSharedPreferences.getString = jest.fn().mockImplementation(() => of([]));
        (mockDownloadService.registerOnDownloadCompleteDelegate as jest.Mock).mockReturnValue(of(''));
        (mockSharedPreferences.getBoolean as jest.Mock).mockReturnValue(of([]));
        (mockSharedPreferences.getString as jest.Mock).mockReturnValue(of('[]'));
        spyOn(contentService, 'deleteContent').and.returnValue('');
        // act
        contentService.onInit().subscribe(() => {
            // assert
            expect(mockSharedPreferences.getBoolean).toHaveBeenCalled();
            expect(mockDownloadService.registerOnDownloadCompleteDelegate).toHaveBeenCalled();
            expect(mockSharedPreferences.getString).toHaveBeenCalled();
            done();
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
        const fetchData = jest.fn().mockImplementation(() => of(data));
        (GetContentDetailsHandler as any as jest.Mock<GetContentDetailsHandler>).mockImplementation(() => {
            return {
                fetchFromDB: fetchData
            } as Partial<GetContentDetailsHandler> as GetContentDetailsHandler;
        });

        contentService = container.get(InjectionTokens.CONTENT_SERVICE);
        mockDbService.execute = jest.fn().mockImplementation(() => of({}));

        // act
        contentService.deleteContent(request).subscribe(() => {
            // assert
            expect(mockDbService.execute).toBeCalled();
            expect(fetchData).toHaveBeenCalled();
            done();
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
        mockDbService.insert = jest.fn().mockImplementation(() => of([]));
        mockDbService.update = jest.fn().mockImplementation(() => of([]));
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

    it('should offline textbook contents with online textbook contents group by section', (done) => {
        // arrange
        const request: ContentSearchCriteria = {
        };
        mockDbService.execute = jest.fn().mockImplementation(() => of([]));
        (mockCachedItemStore.getCached as jest.Mock).mockReturnValue(of({ id: 'd0_id' }));
        // act
        contentService.searchContentGroupedByPageSection(request).toPromise().catch(() => {
            // assert
            expect(mockDbService.execute).toHaveBeenCalled();
            done();
        });
    });

    it('should offline textbook contents with online textbook contents group by section for catch part', (done) => {
        // arrange
        const request: ContentSearchCriteria = {
        };
        mockDbService.execute = jest.fn().mockImplementation(() => of([]));
        (mockCachedItemStore.getCached as jest.Mock).mockReturnValue(throwError({ err: 'err' }));
        // act
        contentService.searchContentGroupedByPageSection(request).subscribe(() => {
            // assert
            expect(mockDbService.execute).toHaveBeenCalled();
            expect(mockCachedItemStore.getCached).toHaveBeenCalled();
            done();
        });
    });

    it('should clear content from delete queue', (done) => {
        // arrange
        const contentDeleteRequestSet: Partial<SharedPreferencesSetCollection<ContentDelete>> = {
            clear: jest.fn().mockImplementation(() => of())
        };
        contentService = container.get(InjectionTokens.CONTENT_SERVICE);
        (mockSharedPreferences.putString as jest.Mock).mockReturnValue(of(''));
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
        (mockSharedPreferences.getString as jest.Mock).mockReturnValue(of('[]'));
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
            addAll: jest.fn().mockImplementation(() => of(undefined)),
        };
        (mockSharedPreferences.getString as jest.Mock).mockReturnValue(of('[]'));
        mockSharedPreferences.putString = jest.fn().mockImplementation(() => { });
        (mockSharedPreferences.putString as jest.Mock).mockReturnValue(of(undefined));
        contentService = container.get(InjectionTokens.CONTENT_SERVICE);
        // act
        contentService.enqueueContentDelete(request).subscribe(() => {
            // assert
            // expect(mockSharedPreferencesSetCollection.addAll).toBe('');
            expect(mockSharedPreferences.getString).toHaveBeenCalledWith(ContentKeys.KEY_CONTENT_DELETE_REQUEST_LIST);
            expect(mockSharedPreferences.putString).toHaveBeenCalledWith(ContentKeys.KEY_CONTENT_DELETE_REQUEST_LIST, expect.any(String));
         //   done();
        });
    });

    it('should import ecar file', (done) => {
        // arrange
        const corr = {
            id: 'SAMPLE_ID',
            type: 'SAMPLE_TYPE'
        };
        const request: EcarImportRequest = {
            isChildContent: true,
            destinationFolder: 'SAMPLE_DETINATION_FOLDER',
            sourceFilePath: 'SAMPLE_SOURCE_FILE_PATH',
            correlationData: corr[0]
        };
        const mockGenerateTelemetry: Partial<GenerateInteractTelemetry> = {
            execute: jest.fn().mockImplementation(() => { })
        };
        //  mockFileService.exists = jest.fn().mockImplementation(() => of([]));
        (mockFileService.exists as jest.Mock).mockResolvedValue((''));
        (mockGenerateTelemetry.execute as jest.Mock).mockResolvedValue('');
        (mockFileService.getTempLocation as jest.Mock).mockReturnValue(of([]));
        // act
        contentService.importEcar(request).subscribe(() => {
            // assert
            expect(mockFileService.exists).toBeCalled();
            done();
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
        (ChildContentsHandler as any as jest.Mock<ChildContentsHandler>).mockImplementation(() => {
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
    it('should export content for delete content', () => {
        // arrange
        contentService = container.get(InjectionTokens.CONTENT_SERVICE);
        const request: ContentExportRequest = {
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentIds: ['SAMPLE_CONTENT_ID_1', 'SAMPLE_CONTENT_ID_2']
        };
        mockFileService.getTempLocation = jest.fn().mockImplementation(() => Promise.resolve({nativeURL: 'native_url'}));
        // (mockFileService.getTempLocation as jest.Mock).mockResolvedValue(jest.fn().mockImplementation(() => Promise.resolve({
        //     nativeURL: 'NATIVE_URL'
        // })));
        mockFileService.exists = jest.fn().mockImplementation(() => of(undefined));
        (mockFileService.exists as jest.Mock).mockResolvedValue('');
        const cleanTempSession: Partial<CleanTempLoc> = {
            execute: jest.fn().mockImplementation(() => { })
        };
        (cleanTempSession.execute as jest.Mock).mockResolvedValue('');
        mockDbService.execute = jest.fn().mockImplementation(() => of({}));
        (ImportNExportHandler as any as jest.Mock<ImportNExportHandler>).mockImplementation(() => {
            return {
                getContentExportDBModelToExport: jest.fn().mockImplementation(() => Promise.resolve(
                    [{
                        identifier: 'IDENTIFIER',
                        server_data: 'SERVER_DATA',
                        local_data: '{"children": [{"DOWNLOAD": 1}, "do_234", "do_345"], "name": "SAMPLE_NAME"}',
                        mime_type: 'MIME_TYPE',
                        manifest_version: 'MAINFEST_VERSION',
                        content_type: 'CONTENT_TYPE',
                        path: 'sample_path',
                    }]
                )),
                populateItems: jest.fn().mockImplementation(() => [{'key': 'do_id'}])
            } as Partial<ImportNExportHandler> as ImportNExportHandler;
        });
        mockFileService.listDir = jest.fn().mockImplementation(() => Promise.resolve([{
            name: 'ENTRY_NAME'
        }]));
        spyOn(FileUtil, 'getFileExtension').and.returnValue('');
        mockFileService.createDir = jest.fn().mockImplementation(() => Promise.resolve([{
            name: 'sunbird'
        }]));
        mockDeviceInfo.getAvailableInternalMemorySize = jest.fn().mockImplementation(() => {});
        (mockDeviceInfo.getAvailableInternalMemorySize as jest.Mock).mockReturnValue(throwError(undefined));
        // act
        contentService.exportContent(request).subscribe(null, (e) => {
                expect(e.errorMesg).toBe('EXPORT_FAILED_WRITE_MANIFEST');
                expect(mockFileService.getTempLocation).toBeCalled();
                expect(mockFileService.listDir).toHaveBeenCalled();
                expect(mockDbService.execute).not.toHaveBeenCalledWith(expect.any(String));
                expect(mockDeviceInfo.getAvailableInternalMemorySize).toHaveBeenCalled();
               // expect(cleanTempSession.execute).toHaveBeenCalled();
        });
    });
    it('should be find child content', (done) => {
        // arrange
        (ChildContentsHandler as any as jest.Mock<ChildContentsHandler>).mockImplementation(() => {
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
            contentId: 'SAMPLE_CONTENT_ID',
            hierarchyInfo: hierarInfoData
        };
        mockDbService.read = jest.fn().mockImplementation(() => of([{
            local_data: ''
        }]));
        JSON.parse = jest.fn().mockImplementation().mockImplementationOnce(() => {
            return mockDbService.read;
        });
     
        ArrayUtil.joinPreservingQuotes = jest.fn().mockImplementation(() => of([]));
        mockDbService.execute = jest.fn().mockImplementation(() => of([]));
        // act
        contentService.getChildContents(request).subscribe(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
          //  expect(ArrayUtil.joinPreservingQuotes).toHaveBeenCalled();
          //  expect(mockDbService.execute).toBeCalled();
            done();
        });
        // assert
    });
    it('should import content', (done) => {
        // arrange
        const contentImport: ContentImport[] = [{
            isChildContent: true,
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentId: 'SAMPLE_CONTENT_ID'
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
        // act
        contentService.importContent(request).subscribe(() => {
            // assert
            expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
    });
    it('should used for search content', (done) => {
        // arrange
        (SearchContentHandler as any as jest.Mock<SearchContentHandler>).mockImplementation(() => {
            return {
                getSearchContentRequest: jest.fn().mockImplementation(() => ({filter: {}})),
                mapSearchResponse: jest.fn().mockImplementation(() => ({id: 'sid'}))
            } as Partial<SearchContentHandler> as SearchContentHandler;
        });
        const request: ContentSearchCriteria = {
            limit: 1,
            offset: 2
        };
        contentService = container.get(InjectionTokens.CONTENT_SERVICE);

        mockSharedPreferences.getString = jest.fn().mockImplementation(() => of([]));
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
            done();
        });
    });
});
