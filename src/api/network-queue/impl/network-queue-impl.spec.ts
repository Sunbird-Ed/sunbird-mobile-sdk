import {NetworkQueueImpl} from './network-queue-impl';
import {SharedPreferences} from '../../../util/shared-preferences';
import {DbService} from '../../../db';
import {SdkConfig} from '../../../sdk-config';
import {DeviceInfo} from '../../../util/device';
import {NetworkQueue, NetworkQueueRequest, NetworkQueueType} from '..';
import {of} from 'rxjs';
import {ApiKeys} from '../../../preference-keys';
import {Request as NetworkRequest, Request} from '../..';

describe('NetworkQueueImpl', () => {
  const mockDbService: Partial<DbService> = {};
  const mockSharedPreference: Partial<SharedPreferences> = {};
  mockSharedPreference.getString = jest.fn().mockImplementation(() => of(undefined));
  const mockDeviceInfo: Partial<DeviceInfo> = {};
  const mockSdkConfig: Partial<SdkConfig> = {
    apiConfig: {
      api_authentication: {
        channelId: 'SAMPLE_CHANNEL_ID',
        producerId: 'SAMPLE_PRODUCER_ID'
      }
    } as any
  };
  let networkQueue: NetworkQueue;

  beforeAll(() => {
    networkQueue = new NetworkQueueImpl(
      mockDbService as DbService,
      mockSharedPreference as SharedPreferences,
      mockDeviceInfo as DeviceInfo,
      mockSdkConfig as SdkConfig
    );
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be able to create an instance', () => {
    expect(networkQueue).toBeTruthy();
  });

  describe('enqueue()', () => {
    it('should enqueue to the network Queue successfully', (done) => {
      // arrange
      mockSharedPreference.getString = jest.fn((key) => of(key === ApiKeys.KEY_API_TOKEN ? '0123456789' : JSON.stringify({})));
      mockDeviceInfo.getDeviceID = jest.fn((key) => '1234567890') as any;
      sbsync.enqueue = jest.fn((_, __, ___, success) => {
        success({});
      });
      const networkRequest = {
        body: new Uint8Array({} as any),
        headers: {},
        path: 'SAMPLE_HOST',
        type: 'raw'
      } as any;
      const networkQueueRequest: NetworkQueueRequest = {
        msgId: 'SAMPLE_MESSAGE_ID',
        data: {},
        networkRequest: networkRequest,
        priority: 1,
        itemCount: 10,
        type: NetworkQueueType.TELEMETRY,
        config: JSON.stringify({shouldPublishResult: true}),
        ts: Date.now()
      };
      // act and assert
      networkQueue.enqueue(networkQueueRequest, true).subscribe(() => {
        done();
      }, (e) => {
        done();
      });
    });

    it('should throw error if plugin method enqueue gives error response', (done) => {
      // arrange
      mockSharedPreference.getString = jest.fn((key) => of(key === ApiKeys.KEY_API_TOKEN ? '0123456789' : JSON.stringify({})));
      mockDeviceInfo.getDeviceID = jest.fn(() => '1234567890') as any;
      sbsync.enqueue = jest.fn((_, __, ___, _success, error) => {
        error();
      }) as any;
      const networkRequest = {
        body: new Uint8Array({} as any),
        headers: {},
        path: 'SAMPLE_HOST',
        type: 'raw'
      } as any;
      const networkQueueRequest: NetworkQueueRequest = {
        msgId: 'SAMPLE_MESSAGE_ID',
        data: {},
        networkRequest: networkRequest,
        priority: 1,
        itemCount: 10,
        type: NetworkQueueType.TELEMETRY,
        config: JSON.stringify({shouldPublishResult: true}),
        ts: Date.now()
      };
      // act and assert
      networkQueue.enqueue(networkQueueRequest, true).subscribe(() => {
      }, (e) => {
        done();
      });
    });

    it('should enqueue to the network Queue successfully if network request body is not UIntArray', (done) => {
      // arrange
      mockSharedPreference.getString = jest.fn((key) => of(key === ApiKeys.KEY_API_TOKEN ? '0123456789' : JSON.stringify({})));
      mockDeviceInfo.getDeviceID = jest.fn(() => '1234567890') as any;
      sbsync.enqueue = jest.fn((_, __, ___, success, error) => {
        success({});
      });
      const networkRequest = {
        body: {},
        headers: {},
        path: 'SAMPLE_HOST',
        type: 'raw'
      } as any;
      const networkQueueRequest: NetworkQueueRequest = {
        msgId: 'SAMPLE_MESSAGE_ID',
        data: {},
        networkRequest: networkRequest,
        priority: 1,
        itemCount: 10,
        type: NetworkQueueType.TELEMETRY,
        config: JSON.stringify({shouldPublishResult: true}),
        ts: Date.now()
      };
      // act and assert
      networkQueue.enqueue(networkQueueRequest, true).subscribe(() => {
        done();
      }, (e) => {
        done();
      });
    });
  });

  describe('interceptRequest()', () => {
    it('should stamp BEARER TOKEN in the api request', (done) => {
      // arrange
      const networkRequest = {
        body: new Uint8Array({} as any),
        headers: {},
        path: 'SAMPLE_HOST',
        type: 'raw'
      } as any;
      mockDeviceInfo.getDeviceID = jest.fn(() => '1234567890') as any;
      mockSharedPreference.getString = jest.fn((key) => of(key === ApiKeys.KEY_API_TOKEN ? '0123456789' : JSON.stringify({})));
      // act and assert
     networkQueue['interceptRequest'](networkRequest).subscribe((request: NetworkRequest) => {
       expect(request.headers).toEqual(expect.objectContaining({
         Authorization: 'Bearer 0123456789'
       }));
       expect(request.headers).toEqual(expect.objectContaining({
         'X-Device-Id': '1234567890'
       }));
       expect(request.headers).toEqual(expect.objectContaining({
         'X-App-Id': 'SAMPLE_PRODUCER_ID'
       }));
       expect(request.headers).toEqual(expect.objectContaining({
         'X-Channel-Id': 'SAMPLE_CHANNEL_ID'
       }));
       done();
     });
    });

    it('should stamp USER TOKEN for logged in user', (done) => {
      // arrange
      const networkRequest = {
        body: new Uint8Array({} as any),
        headers: {},
        path: 'SAMPLE_HOST',
        type: 'raw'
      } as any;
      mockDeviceInfo.getDeviceID = jest.fn(() => '1234567890') as any;
      mockSharedPreference.getString = jest.fn((key) => of(key === ApiKeys.KEY_API_TOKEN ? '0123456789' : JSON.stringify({
        access_token: 'SAMPLE_ACCESS_TOKEN'
      })));
      // act and assert
      networkQueue['interceptRequest'](networkRequest).subscribe((request: NetworkRequest) => {
        expect(request.headers).toEqual(expect.objectContaining({
          Authorization: 'Bearer 0123456789'
        }));
        expect(request.headers).toEqual(expect.objectContaining({
          'X-Device-Id': '1234567890'
        }));
        expect(request.headers).toEqual(expect.objectContaining({
          'X-App-Id': 'SAMPLE_PRODUCER_ID'
        }));
        expect(request.headers).toEqual(expect.objectContaining({
          'X-Channel-Id': 'SAMPLE_CHANNEL_ID'
        }));
        expect(request.headers).toEqual(expect.objectContaining({
          'X-Authenticated-User-Token': 'SAMPLE_ACCESS_TOKEN'
        }));
        done();
      });
    });
  });
});
