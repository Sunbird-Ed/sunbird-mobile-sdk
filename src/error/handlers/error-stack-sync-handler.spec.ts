import {ErrorStackSyncHandler} from './error-stack-sync-handler';
import { ApiService, DbService, NetworkInfoService } from '../..';
import { ErrorLoggerConfig } from '../config/error-logger-config';
import { ErrorStackSyncRequestDecorator } from './error-stack-sync-request-decorator';
import { of } from 'rxjs';
import { NetworkStatus } from '../../util/network';
import { ErrorStackMapper } from '../util/error-stack-mapper';

describe('ErrorStackSyncHandler', () => {
    let errorStackSyncHandler: ErrorStackSyncHandler;
    const mockApiService: Partial<ApiService> = {};
    const mockDbService: Partial<DbService> = {};
    const mockErrorLoggerConfig: Partial<ErrorLoggerConfig> = {};
    const mockNetworkInfoService: Partial<NetworkInfoService> = {};
    const mockErrorStackSyncRequestDecorator: Partial<ErrorStackSyncRequestDecorator> = {};

    beforeAll(() => {
        errorStackSyncHandler = new ErrorStackSyncHandler(
            mockApiService as ApiService,
            mockDbService as DbService,
            mockErrorLoggerConfig as ErrorLoggerConfig,
            mockNetworkInfoService as NetworkInfoService,
            mockErrorStackSyncRequestDecorator as ErrorStackSyncRequestDecorator
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of ErrorStackSyncHandler', () => {
        expect(ErrorStackSyncHandler).toBeTruthy();
    });

    it('should be handled process batches', (done) => {
        // arrange
        const errorSyncBandwidth = 256;
        mockDbService.execute = jest.fn().mockImplementation(() => of({}));
        // act
        errorStackSyncHandler.handle(errorSyncBandwidth).subscribe(() => {
            // assert
            expect(mockDbService.execute).toHaveBeenCalled();
            done();
        });
    });

    it('should be handled process batches if Off_line', (done) => {
        // arrange
        const errorSyncBandwidth = 256;
        mockDbService.execute = jest.fn().mockImplementation(() => of([{
            _id: 'sample-id',
            app_version: '2.7.0',
            page_id: 'course',
            time_stamp: 5,
            error_log: 'error'
        }]));
        mockNetworkInfoService.networkStatus$ = of(NetworkStatus.OFFLINE);
        // act
        errorStackSyncHandler.handle(errorSyncBandwidth).subscribe(() => {
            // assert
            expect(mockDbService.execute).toHaveBeenCalled();
            expect(mockNetworkInfoService.networkStatus$).toBeTruthy();
            done();
        });
    });

    it('should be handled process batches when OnLine', (done) => {
        // arrange
        const errorSyncBandwidth = 256;
        const data = [{
            _id: 'sample-id',
            app_version: '2.7.0',
            page_id: 'course',
            time_stamp: 5,
            error_log: 'error'
        }];
        mockDbService.execute = jest.fn().mockImplementation(() => of([{
            _id: 'sample-id',
            app_version: '2.7.0',
            page_id: 'course',
            time_stamp: 5,
            error_log: 'error'
        }]));
        const request = {
            pdata: undefined,
            context: undefined,
            logs: data.map(e => ErrorStackMapper.mapErrorSatckDBEntryToErrorStack(e))
        };
        mockNetworkInfoService.networkStatus$ = of(NetworkStatus.ONLINE);
        mockErrorStackSyncRequestDecorator.decorate = jest.fn().mockImplementation(() => of(request));
        // act
        errorStackSyncHandler.handle(errorSyncBandwidth).subscribe(() => {
            // assert
            expect(mockDbService.execute).toHaveBeenCalled();
            expect(mockNetworkInfoService.networkStatus$).toBeTruthy();
            expect(mockErrorStackSyncRequestDecorator.decorate).toHaveBeenCalled();
            done();
        });
    });
});
