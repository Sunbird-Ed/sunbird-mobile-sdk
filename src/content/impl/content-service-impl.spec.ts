import { ContentService } from '..';
import { ContentServiceImpl } from './content-service-impl';
import { Container } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { DbService } from '../../db';
import { SdkConfig } from '../../sdk-config';
import { ApiService, Request } from '../../api';
import {
    ProfileService, ContentDelete, ContentDetailRequest, ContentDeleteRequest,
    ContentMarkerRequest, Content, HttpRequestType, ContentData
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
import { Observable } from 'rxjs';
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
import {GetContentDetailsHandler} from '../handlers/get-content-details-handler';


jest.mock('../handlers/search-content-handler');
 jest.mock('../handlers/get-content-details-handler');

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
        fetch: jest.fn(() => { })
    };
    const mockDbService: Partial<DbService> = {};
    const mockProfileService: Partial<ProfileService> = {};
    const mockFileService: Partial<FileService> = {
        exists: jest.fn(() => { }),
        getTempLocation: jest.fn(() => { })
    };
    const mockZipService: Partial<ZipService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockTelemetryService: Partial<TelemetryService> = {
    };
    const mockContentFeedback: Partial<ContentFeedbackService> = {};
    const mockDownloadService: Partial<DownloadService> = {
        registerOnDownloadCompleteDelegate: jest.fn(() => { })
    };
    const mockSharedPreferences: Partial<SharedPreferences> = {
        getBoolean: jest.fn(() => { }),
        putString: jest.fn(() => { }),
        getString: jest.fn(() => { })
    };
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockCachedItemStore: Partial<CachedItemStore> = {
        getCached: jest.fn(() => { })
    };

    beforeAll(() => {
        container.bind<ContentService>(InjectionTokens.CONTENT_SERVICE).to(ContentServiceImpl);
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

        contentService = container.get(InjectionTokens.CONTENT_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (SearchContentHandler as any as jest.Mock<SearchContentHandler>).mockClear();
        (GetContentDetailsHandler as any as jest.Mock<GetContentDetailsHandler>).mockClear();
    });

    it('should return an instance of ContentServiceImpl from container', () => {
        // assert
        expect(contentService).toBeTruthy();
    });

    it('should register as download service observe onInit()', (done) => {
        mockSharedPreferences.getBoolean = jest.fn(() => Observable.of([]));
        mockSharedPreferences.getString = jest.fn(() => Observable.of([]));
        (mockDownloadService.registerOnDownloadCompleteDelegate as jest.Mock).mockReturnValue(Observable.of(''));
        (mockSharedPreferences.getBoolean as jest.Mock).mockReturnValue(Observable.of([]));
        (mockSharedPreferences.getString as jest.Mock).mockReturnValue(Observable.of(''));
        spyOn(contentService, 'deleteContent').and.returnValue('');
        // act
        contentService.onInit().subscribe(() => {
            // assert
            done();
        });
    });

   it('should return content details', () => {
        // arrange
        const request: ContentDetailRequest = {
            contentId: 'SAMPLE_CONTENT_ID'
        };
        (GetContentDetailsHandler as any as jest.Mock<GetContentDetailsHandler>).mockImplementation(() => {
            return {
                handle: jest.fn(() => Observable.of(request))
            };
        });
        contentService.getContentDetails(request);
    });
    it('should cancel the downloading content cancelImport()', (done) => {
        // arrange
        mockDownloadService.cancel = jest.fn(() => Observable.of([]));
        const contentId = 'SAMPLE_CONTENT_ID';
        // act
        contentService.cancelImport(contentId).subscribe(() => {
            // assert
            expect(mockDownloadService.cancel).toHaveBeenCalled();
            done();
        });
    });
    it('should delete downloaded content from local', (done) => {
        // arrange
        const contentDelete: ContentDelete[] = [{
            contentId: 'SAMPLE_CONTENT_ID',
            isChildContent: true
        }];
        const request: ContentDeleteRequest = {
            contentDeleteList: contentDelete
        };
         mockDbService.read = jest.fn(() => Observable.of([]));
        (GetContentDetailsHandler as any as jest.Mock<GetContentDetailsHandler>).mockImplementation(() => {
            return {
                fetchFromDB: jest.fn(() => Observable.of(contentDelete[0].contentId))
            };
        });
        // act
        contentService.deleteContent(request);
            done();
    });
    it('should delete downloading content cancelDownload()', (done) => {
        // arrange
        const contentId = 'SAMPLE_CONTENT_ID';
        mockDownloadService.cancel = jest.fn(() => Observable.of([]));
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
        mockDbService.execute = jest.fn(() => Observable.of([]));
        mockDbService.insert = jest.fn(() => Observable.of([]));
        mockDbService.update = jest.fn(() => Observable.of([]));
        JSON.parse = jest.fn().mockImplementationOnce(() => {
            return request.data;
        });
        // act
        contentService.setContentMarker(request).subscribe(() => {
            // assert
            expect(mockDbService.execute).toHaveBeenCalled();
            done();
        });
    });

    it('should offline textbook contents with online textbook contents group by section', async (done) => {
        // arrange
        const request: ContentSearchCriteria = {
        };
       // spyOn(contentService, 'getContents').and.returnValues(Observable.of([{}]));
      //  mockDownloadService.cancel = jest.fn(() => Observable.of([]));
        mockDbService.execute = jest.fn(() => Observable.of([]));
        (mockCachedItemStore.getCached as jest.Mock).mockResolvedValue('');
        // act
        return await contentService.searchContentGroupedByPageSection(request).toPromise().then(() => {
            // assert
            expect(mockDbService.execute).toHaveBeenCalled();
            done();
        });
    });

    it('should clear content from delete queue', (done) => {
        // arrange
        const contentDeleteRequestSet: Partial<SharedPreferencesSetCollection<ContentDelete>> = {
            clear: jest.fn(() => Observable.of([]))
        };
        (mockSharedPreferences.putString as jest.Mock).mockReturnValue(Observable.of(''));
        // act
        contentService.clearContentDeleteQueue().subscribe(() => {
            // assert
            done();
        });
    });

    it('should get content from delete queue', (done) => {
        // arrange
        const contentDeleteRequestSet: Partial<SharedPreferencesSetCollection<ContentDelete>> = {
            clear: jest.fn(() => Observable.of([]))
        };
        (mockSharedPreferences.getString as jest.Mock).mockReturnValue(Observable.of(''));
        // act
        contentService.getContentDeleteQueue().subscribe(() => { done(); });
        // arrange
    });

    it('should delete content from queue', (done) => {
        // arrange
        const contentDelete: ContentDelete[] = [{
            contentId: 'SAMPLE_CONTENT_ID',
            isChildContent: true
        }];
        const request: ContentDeleteRequest = {
            contentDeleteList: contentDelete
        };
        const mockSharedPreferencesSetCollection: Partial<SharedPreferencesSetCollection<ContentDelete>> = {
            asSet: jest.fn(() => { })
        };
        (mockSharedPreferencesSetCollection.asSet as jest.Mock).mockReturnValue(Observable.of([]));
        //  (mockSharedPreferences.getString as jest.Mock).mockReturnValue(Observable.of(''));
        // act
        contentService.enqueueContentDelete(request).subscribe(() => {
            //    expect(contentDeleteRequestSet.addAll).toHaveBeenCalled();
            done();
        });
        // assert
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
            execute: jest.fn(() => { })
        };
        //  mockFileService.exists = jest.fn(() => Observable.of([]));
        (mockFileService.exists as jest.Mock).mockResolvedValue((''));
        (mockGenerateTelemetry.execute as jest.Mock).mockResolvedValue('');
        (mockFileService.getTempLocation as jest.Mock).mockReturnValue(Observable.of([]));
        // act
        contentService.importEcar(request).subscribe(() => {
            // assert
            expect(mockFileService.exists).toHaveBeenCalled();
            done();
        });
    });

    it('should return relevant content', () => {
        // arrange
        const request: RelevantContentRequest = {
            identifier: 'SAMPLE_IDENTIFIER',
            downloadUrl: 'SAMPLE_DOWNLOAD_URL',
            mimeType: 'SAMPLE_MIME_TYPE',
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            filename: 'SAMPLE_FILE_NAME',
        };
        // act
        contentService.getRelevantContent(request).subscribe(() => {
            // assert
        });
    });

    it('should be next content', () => {
        // arrange
        const hierarchyInfo: HierarchyInfo[] = [{
            identifier: 'd0_123',
            contentType: 'content_type'
        }];
        const currentContentIdentifier = 'CONTENT_IDENTIFIER';
        mockDbService.read = jest.fn(() => Observable.of([]));
        console.log('data', hierarchyInfo[0].identifier);
        // act
        contentService.nextContent(hierarchyInfo, currentContentIdentifier).subscribe(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
        });
    });
    it('should be return previous content', () => {
        // arrange
        const hierarchyInfo: HierarchyInfo[] = [{
            identifier: 'd0_123',
            contentType: 'content_type'
        }];
        const currentContentIdentifier = 'CONTENT_IDENTIFIER';
        mockDbService.read = jest.fn(() => Observable.of([]));
        // act
        contentService.prevContent(hierarchyInfo, currentContentIdentifier).subscribe(() => {
            // arrange
            expect(mockDbService.read).toHaveBeenCalled();
        });
    });
    it('should space useage for content', () => {
        // arrange
        const request: ContentSpaceUsageSummaryRequest = {
            paths: ['SAMPLE_PATHS_1', 'SAMPLE_PATHS_2']
        };
        // act
        contentService.getContentSpaceUsageSummary(request).subscribe(() => {
            // assert
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
        mockDownloadService.cancel = jest.fn(() => Observable.of(undefined));
        mockFileService.exists = jest.fn(() => Observable.of(undefined));
        (mockFileService.exists as jest.Mock).mockResolvedValue('');
        // act
        contentService.onDownloadCompletion(request).subscribe(() => {
            // assert
            expect(mockDownloadService.cancel).toHaveBeenCalled();
            done();
        });
    });
    it('should export content', () => {
        // arrange
        const request: ContentExportRequest = {
            destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
            contentIds: ['SAMPLE_CONTENT_ID_1', 'SAMPLE_CONTENT_ID_2']
        };
        mockFileService.getTempLocation = jest.fn(() => Observable.of(undefined));
        (mockFileService.getTempLocation as jest.Mock).mockResolvedValue('');
        mockFileService.exists = jest.fn(() => Observable.of(undefined));
        (mockFileService.exists as jest.Mock).mockResolvedValue('');
        const cleanTempSession: Partial<CleanTempLoc> = {
            execute: jest.fn(() => { })
        };
        (cleanTempSession.execute as jest.Mock).mockResolvedValue('');
        // act
        contentService.exportContent(request).subscribe(() => {
            // assert
            expect(cleanTempSession.execute).toHaveBeenCalled();
        });
    });
    it('should be find child content', () => {
        // arrange
        const hierarInfoData: HierarchyInfo[] = [{
            identifier: 'd0_123',
            contentType: 'content_type'
        }];
        const request: ChildContentRequest = {
            contentId: 'SAMPLE_CONTENT_ID',
            hierarchyInfo: hierarInfoData
        };
        mockDbService.read = jest.fn(() => Observable.of([]));
        // act
        contentService.getChildContents(request).subscribe(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
        });
        // assert
    });
    it('should import content', () => {
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
        spyOn(mockApiService, 'fetch').and.returnValue(Observable.of({
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
        });
    });
    it('should used for search content', (done) => {
        // arrange
        const request: ContentSearchCriteria = {
            limit: 1,
            offset: 2
        };
        (SearchContentHandler as any as jest.Mock<SearchContentHandler>).mockImplementation(() => {
            return {
                getSearchContentRequest: jest.fn(() => Observable.of('')),
                mapSearchResponse: jest.fn(() => Observable.of(''))
            };
        });

        mockSharedPreferences.getString = jest.fn(() => Observable.of([]));
        spyOn(mockApiService, 'fetch').and.returnValue(Observable.of({
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
