import {DbService} from '..';
import {of} from 'rxjs';
import {NetworkQueueMigration} from './network-queue-migration';
import {SdkConfig} from '../../sdk-config';
import {NetworkQueue, NetworkQueueEntry} from '../../api/network-queue';
import {TelemetryProcessedEntry} from '../../telemetry/db/schema';

describe('NetworkQueueMigration', () => {
  let networkQueueMigration: NetworkQueueMigration;
  const mockSdkConfig: Partial<SdkConfig> = {
    telemetryConfig: {
      host: 'SAMPLE_HOST',
      apiPath: '/v1/data/telemetry'
    } as any
  };
  const mockNetworkQueue: Partial<NetworkQueue> = {
    enqueue: jest.fn(() => of(undefined))
  };

  beforeAll(() => {
    networkQueueMigration = new NetworkQueueMigration(
      mockSdkConfig as SdkConfig,
      mockNetworkQueue as NetworkQueue
    );
  });

  it('should be able to create an instance', () => {
    expect(mockNetworkQueue).toBeTruthy();
  });

  describe('apply', () => {
    const mockDbService: Partial<DbService> = {};

    beforeEach(() => {
      mockDbService.execute = jest.fn().mockImplementation(() => of([]));
    });

    it('should create network queue table during apply method', (done) => {
      // arrange
      const now = Date.now();
      mockDbService.read = jest.fn().mockImplementation(() => of([]));
      // act and assert
      networkQueueMigration.apply(mockDbService as DbService).then(() => {
        expect(mockDbService.execute).toHaveBeenCalledWith(NetworkQueueEntry.getCreateEntry());
        done();
      });
    });
    it('should invoke enqueue method if processed entry has value', (done) => {
      // arrange
      const dateNowMockFn = jest.spyOn(Date, 'now').mockImplementation(() => 1479427200000);
      mockDbService.read = jest.fn().mockImplementation(() => of([{
        msg_id: 'SAMPLE_MSG_ID_1',
        data: '',
        event_count: 10
      }]));

      // act and assert
      networkQueueMigration.apply(mockDbService as DbService).then(() => {
        expect(mockDbService.execute).toHaveBeenCalledWith(NetworkQueueEntry.getCreateEntry());
        expect(mockNetworkQueue.enqueue).toHaveBeenCalled();
        expect(mockDbService.execute).toHaveBeenCalledWith(`DELETE FROM ${TelemetryProcessedEntry.TABLE_NAME} WHERE ${TelemetryProcessedEntry.COLUMN_NAME_MSG_ID}='SAMPLE_MSG_ID_1'`);
        dateNowMockFn.mockRestore();
        done();
      });
    });
  });
});
