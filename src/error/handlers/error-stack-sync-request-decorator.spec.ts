import { ErrorStackSyncRequestDecorator } from './error-stack-sync-request-decorator';
import { ApiConfig, DeviceInfo, AppInfo, ProducerData, Context } from '../..';
import { of } from 'rxjs';

describe('ErrorStackSyncRequestDecorator', () => {
    let errorStackSyncRequestDecorator: ErrorStackSyncRequestDecorator;
    const mockApiConfig = {
        api_authentication: {
          channelId: 'SAMPLE_CHANNEL_ID',
          producerId: 'sample-producer-id'
        }
      } as Partial<ApiConfig>;
    const mockDeviceInfo: Partial<DeviceInfo> = {};
    const mockAppInfo: Partial<AppInfo> = {};

    beforeAll(() => {
        errorStackSyncRequestDecorator = new ErrorStackSyncRequestDecorator(
            mockApiConfig as ApiConfig,
            mockDeviceInfo as DeviceInfo,
            mockAppInfo as AppInfo
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of ErrorStackSyncRequestDecorator', () => {
        expect(errorStackSyncRequestDecorator).toBeTruthy();
    });

    it('should decorated patchData and PatchContext', (done) => {
        // arrange
        const pData: ProducerData = {
            id: 'p-id',
            ver: '2.7.0',
            pid: 'sample-pid',
            ProducerData: jest.fn().mockImplementation((a, b, c) => c)
        };
        const request = {
            pdata: pData,
        };
        mockAppInfo.getVersionName = jest.fn().mockImplementation(() => of('2.7.0'));
        mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => of('devices'));
        mockDeviceInfo.getDeviceSpec = jest.fn().mockImplementation(() => of({}));
        // act
        errorStackSyncRequestDecorator.decorate(request).subscribe(() => {
            // assert
            expect(mockAppInfo.getVersionName).toHaveBeenCalled();
            expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
            expect(mockDeviceInfo.getDeviceSpec).toHaveBeenCalled();
            done();
        });
    });
});
