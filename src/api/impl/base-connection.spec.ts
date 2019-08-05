import {BaseConnection} from './base-connection';
import {ApiConfig, HttpClient, HttpRequestType, HttpSerializer, Request, Response, ResponseCode} from '..';
import {DeviceInfo} from '../../util/device';
import {SharedPreferences} from '../../util/shared-preferences';
import {ApiAuthenticator} from '../../util/authenticators/impl/api-authenticator';
import {SessionAuthenticator} from '../../util/authenticators/impl/session-authenticator';
import {Observable} from 'rxjs';

describe('BaseConnection', () => {
  let baseConnection: BaseConnection;
  const mockHttpClient = {
    setSerializer(httpSerializer: HttpSerializer) {
    },
    addHeaders(headers: { [p: string]: string }) {
    }
  } as Partial<HttpClient>;
  const mockApiConfig = {
    api_authentication: {
      channelId: 'SAMPLE_CHANNEL_ID'
    }
  } as Partial<ApiConfig>;
  const mockDeviceInfo = {
    getDeviceID(): string {
      return 'SAMPLE_DEVICE_ID'
    }
  } as Partial<DeviceInfo>;
  const mockSharedPreferences = {} as Partial<SharedPreferences>;
  const defaultApiAuthenticators: ApiAuthenticator[] = [];
  const defaultSessionAuthenticators: SessionAuthenticator[] = [];

  beforeAll(() => {
    baseConnection = new BaseConnection(
      mockHttpClient as HttpClient,
      mockApiConfig as ApiConfig,
      mockDeviceInfo as DeviceInfo,
      mockSharedPreferences as SharedPreferences,
      defaultApiAuthenticators,
      defaultSessionAuthenticators
    );
  });

  it('should invoke httpClient.get on invoke() with GET request', (done) => {
    // arrange
    mockHttpClient.get = jest.fn((baseUrl: string, path: string, headers: any, parameters: any) => {
      const res = new Response();
      res.responseCode = ResponseCode.HTTP_SUCCESS;
      res.body = {};
      return Observable.of(res);
    });

    const req = new Request.Builder()
      .withPath('/')
      .withType(HttpRequestType.GET)
      .build();

    // act
    baseConnection.invoke(req).subscribe(() => {
      // assert
      // TODO: remaining assertions
      expect(mockHttpClient.get).toHaveBeenCalled();
      done();
    });
  });

  it('should invoke httpClient.post on invoke() with POST request', (done) => {
    // arrange
    mockHttpClient.post = jest.fn((baseUrl: string, path: string, headers: any, parameters: any) => {
      const res = new Response();
      res.responseCode = ResponseCode.HTTP_SUCCESS;
      res.body = {};
      return Observable.of(res);
    });

    const req = new Request.Builder()
      .withPath('/')
      .withType(HttpRequestType.POST)
      .build();

    // act
    baseConnection.invoke(req).subscribe(() => {
      // assert
      // TODO: remaining assertions
      expect(mockHttpClient.post).toHaveBeenCalled();
      done();
    });
  });

  it('should invoke httpClient.patch on invoke() with PATCH request', (done) => {
    // arrange
    mockHttpClient.patch = jest.fn((baseUrl: string, path: string, headers: any, parameters: any) => {
      const res = new Response();
      res.responseCode = ResponseCode.HTTP_SUCCESS;
      res.body = {};
      return Observable.of(res);
    });

    const req = new Request.Builder()
      .withPath('/')
      .withType(HttpRequestType.GET)
      .build();

    // act
    baseConnection.invoke(req).subscribe(() => {
      // assert
      // TODO: remaining assertions
      expect(mockHttpClient.get).toHaveBeenCalled();
      done();
    });
  });
});
