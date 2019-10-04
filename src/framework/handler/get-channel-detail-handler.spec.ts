import {CachedItemStore} from '../../key-value-store';
import {FileService} from '../../util/file/def/file-service';
import {Path} from '../../util/file/util/path';
import {Channel, ChannelDetailsRequest, FrameworkServiceConfig} from '..';
import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Observable} from 'rxjs';
import { ProfileService, DbService, TelemetryService } from '../..';
import { Container } from 'inversify';
import { GetChannelDetailsHandler } from './get-channel-detail-handler';
import { exportDefaultDeclaration } from '@babel/types';

describe('GetChannelDetailHandler', () => {

    let getChannelDetailHandler: GetChannelDetailsHandler;
    const mockApiService: Partial<ApiService> = {};
    const mockFileService: Partial<FileService> = {};
    const mockCacheItemStore: Partial<CachedItemStore> = {};
    const mockFrameworkServiceConfig: Partial<FrameworkServiceConfig> = {};
    beforeAll(() => {
        getChannelDetailHandler = new GetChannelDetailsHandler(
            mockApiService as ApiService,
            mockFrameworkServiceConfig as FrameworkServiceConfig,
            mockFileService as FileService,
            mockCacheItemStore as CachedItemStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return an instance of GetChannelDetailHandler', () => {
        expect(getChannelDetailHandler).toBeTruthy();
    });

    it('should run handle function from the GetChannelDetailHandler', async (done) => {
        // arrange
        const request: ChannelDetailsRequest = {
            channelId: 'SAMPLE_CHANNEL_ID'
        };

        mockApiService.fetch = jest.fn(() => []);
        mockCacheItemStore.getCached = jest.fn(() => []);
        mockFileService.readFileFromAssets = jest.fn(() => []);
        spyOn(mockApiService, 'fetch').and.returnValue(Observable.of({
            body: {
                result: {
                    response: 'SAMPLE_RESPONSE'
                }
            }
        }));
        // act
        getChannelDetailHandler.handle(request);
        expect(mockCacheItemStore.getCached).toHaveBeenCalled();
        // expect(mockApiService.fetch).toHaveBeenCalled();
        // expect(mockFileService.readFileFromAssets).toHaveBeenCalled();
        // expect(mockCacheItemStore.getCached).toHaveBeenCalledWith(request.channelId, 'channel-', 'ttl_channel-', () => {
        //     mockApiService.fetch((new Request.Builder())
        //     .withPath(mockFrameworkServiceConfig.channelApiPath + '/read' + '/' + request.channelId)
        //     .withType(HttpRequestType.GET)
        //     .build())
        //     .subscribe(() => {
        //         done();
        //     });
        //     expect(mockApiService.fetch).toHaveBeenCalled();
        // }, () => {
        //     const dir = Path.ASSETS_PATH + mockFrameworkServiceConfig.channelConfigDirPath;
        //     const file = this.CHANNEL_FILE_KEY_PREFIX + request.channelId + '.json';
        //     expect(mockFileService.readFileFromAssets).toHaveBeenCalledWith(dir.concat('/', file));
        // });
        done();
    });
});

