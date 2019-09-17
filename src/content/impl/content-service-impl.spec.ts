import { ContentService } from '..';
import { ContentServiceImpl } from './content-service-impl';
import { Container } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { DbService } from '../../db';
import { SdkConfig } from '../../sdk-config';
import { ApiService, Request } from '../../api';
import { ProfileService, ContentDelete, ContentDetailRequest, ContentDeleteRequest, ContentMarkerRequest } from '../..';
import { FileService } from '../../util/file/def/file-service';
import { ZipService } from '../../util/zip/def/zip-service';
import { DeviceInfo } from '../../util/device';
import { TelemetryService } from '../../telemetry';
import { ContentFeedbackService } from '../def/content-feedback-service';
import { DownloadService } from '../../util/download';
import { SharedPreferences } from '../../util/shared-preferences';
import { EventsBusService } from '../../events-bus';
import { CachedItemStore } from '../../key-value-store';
import { Observable } from 'rxjs';
import { SharedPreferencesSetCollection } from '../../util/shared-preferences/def/shared-preferences-set-collection';
import { ContentServiceConfig } from '../config/content-config';
import { OpenRapConfigurable } from '../../open-rap-configurable';
import { MarkerType, ContentSearchCriteria, EcarImportRequest, RelevantContentRequest } from '../def/requests';
import { SharedPreferencesSetCollectionImpl } from '../../util/shared-preferences/impl/shared-preferences-set-collection-impl';
import { GenerateInteractTelemetry } from '../handlers/import/generate-interact-telemetry';
import { HierarchyInfo } from '../def/content';
describe('ContentServiceImpl', () => {
    let contentService: ContentService;

    const container = new Container();
    const mockSdkConfig: Partial<SdkConfig> = {};
    const mockApiService: Partial<ApiService> = {};
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
    });

    it('should return an instance of ContentServiceImpl from container', () => {
        // assert
        expect(contentService).toBeTruthy();
    });

    it('should register as download service observe onInit()', (done) => {
        // arrange
        (mockDownloadService.registerOnDownloadCompleteDelegate as jest.Mock).mockReturnValue(Observable.of(''));
        const contentDelete: ContentDelete = {
            contentId: 'SAMPLE_CONTENT_ID',
            isChildContent: true
        };
        const mockSharedPreferencesSetCollection: Partial<SharedPreferencesSetCollection<ContentDelete>> = {
            asListChanges: jest.fn(() => { })
        };

        // (mockSharedPreferences.getBoolean as jest.Mock).mockReturnValue(Observable.of(''));
        // spyOn(contentService, 'deleteContent').and.returnValue(Observable.of(''));
        // act
        contentService.onInit().subscribe(() => {
            // assert
            expect(mockSharedPreferencesSetCollection.asListChanges).toHaveBeenCalledWith('');
            done();
        });
    });

    it('should return content details', (done) => {
        // arrange
        const request: ContentDetailRequest = {
            contentId: 'SAMPLE_CONTENT_ID'
        };
        mockDbService.read = jest.fn(() => Observable.of([]));
        mockApiService.fetch = jest.fn(() => Observable.of([]));
        spyOn(mockApiService, 'fetch').and.stub();
        // spyOn(contentService, 'getConte')
        // act
        contentService.getContentDetails(request).subscribe(() => {
            // assert
            //   expect(mockDbService.read).toHaveBeenCalledWith();
            // expect(mockApiService.fetch).toHaveBeenCalled();
            done();
        });
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
        mockDbService.execute = jest.fn(() => Observable.of([]));
        console.log('length is', contentDelete[0].contentId);
        // act
        contentService.deleteContent(request).subscribe(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            expect(mockDbService.execute).toHaveBeenCalled();
            done();
        });
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

    it('should search content group by page for online and offline', (done) => {
        // arrange
        const request: ContentSearchCriteria = {
        };
        spyOn(contentService, 'searchContent').and.stub();
        mockDownloadService.cancel = jest.fn(() => Observable.of([]));
        mockDbService.execute = jest.fn(() => Observable.of([]));
        (mockCachedItemStore.getCached as jest.Mock).mockReturnValue(Observable.of(''));
        // act
        contentService.searchContentGroupedByPageSection(request).subscribe(() => {
            // assert

            expect(mockDownloadService.cancel).toHaveBeenCalled();
            expect(mockDbService.execute).toHaveBeenCalled();
            // expect(mockCachedItemStore.getCached).toHaveBeenCalled();
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
});
