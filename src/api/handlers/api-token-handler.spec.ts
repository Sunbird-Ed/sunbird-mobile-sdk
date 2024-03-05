import {ApiTokenHandler} from './api-token-handler';
import {ApiConfig, ApiService, Response} from '..';
import {DeviceInfo, ResponseCode} from '../..';
import {of, throwError} from 'rxjs';
import {CsHttpServerError, CsNetworkError} from '@project-sunbird/client-services/core/http-service';
import {catchError} from 'rxjs/operators';
import { JwtUtil } from '../../util/jwt-util';

describe('ApiTokenHandler', () => {
  let apiTokenHandler: ApiTokenHandler;
  const mockApiService: Partial<ApiService> = {};
  const mockConfig: Partial<ApiConfig> = {};
  const mockDeviceInfo: Partial<DeviceInfo> = {};

  beforeAll(() => {
    apiTokenHandler = new ApiTokenHandler(
      mockConfig as ApiConfig,
      mockApiService as ApiService,
      mockDeviceInfo as DeviceInfo
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be instance of apiTokenHandler', () => {
    expect(apiTokenHandler).toBeTruthy();
  });

  describe('refreshAuthToken', () => {
    it('should return MobileDeviceConsumerSecretAPIRequest', (done) => {
      // arrange
      mockApiService.fetch = jest.fn(() => of({
        body: {
          result: {
            secret: 'sample-secret-key'
          }
        }
      })) as any;
      mockConfig.api_authentication = {mobileAppConsumer: 'sample-mobile-app-consumer'} as any;
      jest.spyOn(JwtUtil, 'createJWTToken').mockImplementation(() => Promise.resolve('sample'));
      mockDeviceInfo.getDeviceID = jest.fn(() => 'sample-device-id');
      // act
      apiTokenHandler.refreshAuthToken().subscribe(() => {
        // asert
        expect(mockApiService.fetch).toHaveBeenCalled();
        expect(mockConfig.api_authentication).toBeTruthy();
        expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
        done();
      });
    });

    it('should invoke fallback kong API mention in the API header', (done) => {
      // arrange
      const mockFetch = jest.spyOn(mockApiService, 'fetch');
      mockFetch .mockImplementation((arg) => {
        switch (arg.path) {
          case '/api/api-manager/v2/consumer/sample-mobile-app-consumer/credential/register':
            const response = new Response();
            response.responseCode = 447;
            response.headers = {location: '/api/api-manager/v3/consumer/sample-mobile-app-consumer/credential/register'};
            const error: CsHttpServerError = new CsHttpServerError('SOME_MESSAGE', response);
            return throwError(error);
            break;
          case '/api/api-manager/v3/consumer/sample-mobile-app-consumer/credential/register':
            return of({
              body: {
                result: {
                  secret: 'sample-secret-key'
                }
              }
            });
            break;
          default :
            return of({} as any);
        }
      });
      mockConfig.api_authentication = {mobileAppConsumer: 'sample-mobile-app-consumer'} as any;
      jest.spyOn(JwtUtil, 'createJWTToken').mockImplementation(() => Promise.resolve('sample'));
      mockDeviceInfo.getDeviceID = jest.fn(() => 'sample-device-id');
      // act
      apiTokenHandler.refreshAuthToken().subscribe(() => {
        // assert
        expect( mockFetch.mock.calls[1][0].path).toEqual('/api/api-manager/v3/consumer/sample-mobile-app-consumer/credential/register');
        expect(mockConfig.api_authentication).toBeTruthy();
        expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
        done();
      });
    });

    it('should invoke fallback v1 kong API if location is not available in header', (done) => {
      // arrange
      const mockFetch = jest.spyOn(mockApiService, 'fetch');
      mockFetch .mockImplementation((arg) => {
        const response = new Response();
        response.responseCode = 447;
        response.headers = undefined;
        const error: CsHttpServerError = new CsHttpServerError('SOME_MESSAGE', response);
        switch (arg.path) {
          case '/api/api-manager/v2/consumer/sample-mobile-app-consumer/credential/register':
            return throwError(error);
            break;
          case '/api/api-manager/v1/consumer/sample-mobile-app-consumer/credential/register':
            return throwError(error);
            break;
          default :
            return of({} as any);
        }
      });
      mockConfig.api_authentication = {mobileAppConsumer: 'sample-mobile-app-consumer'} as any;
      jest.spyOn(JwtUtil, 'createJWTToken').mockImplementation(() => Promise.resolve('sample'));
      mockDeviceInfo.getDeviceID = jest.fn(() => 'sample-device-id');
      // act
      apiTokenHandler.refreshAuthToken().subscribe(() => {
        // assert
        expect( mockFetch.mock.calls[1][0].path).toEqual('/api/api-manager/v1/consumer/sample-mobile-app-consumer/credential/register');
        expect(mockConfig.api_authentication).toBeTruthy();
        expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
        done();
      });
    });

    it('should invoke fallback v1 kong API if location is empty in header', (done) => {
      // arrange
      const mockFetch = jest.spyOn(mockApiService, 'fetch');
      mockFetch .mockImplementation((arg) => {
        const response = new Response();
        response.responseCode = 447;
        response.headers = {location: ''};
        const error: CsHttpServerError = new CsHttpServerError('SOME_MESSAGE', response);
        switch (arg.path) {
          case '/api/api-manager/v2/consumer/sample-mobile-app-consumer/credential/register':
            return throwError(error);
            break;
          case '/api/api-manager/v1/consumer/sample-mobile-app-consumer/credential/register':
            return throwError(error);
            break;
          default :
            return of({} as any);
        }
      });
      mockConfig.api_authentication = {mobileAppConsumer: 'sample-mobile-app-consumer'} as any;
      jest.spyOn(JwtUtil, 'createJWTToken').mockImplementation(() => Promise.resolve('sample'));
      mockDeviceInfo.getDeviceID = jest.fn(() => 'sample-device-id');
      // act
      apiTokenHandler.refreshAuthToken().subscribe(() => {
        // assert
        expect( mockFetch.mock.calls[1][0].path).toEqual('/api/api-manager/v1/consumer/sample-mobile-app-consumer/credential/register');
        expect(mockConfig.api_authentication).toBeTruthy();
        expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
        done();
      });
    });

    it('should invoke fallback v1 kong API for any other API failure', (done) => {
      // arrange
      const mockFetch = jest.spyOn(mockApiService, 'fetch');
      mockFetch .mockImplementation((arg) => {
        switch (arg.path) {
          case '/api/api-manager/v2/consumer/sample-mobile-app-consumer/credential/register':
            const response = new Response();
            response.responseCode = 500;
            response.headers = {};
            const error: CsHttpServerError = new CsHttpServerError('SOME_MESSAGE', response);
            return throwError(error);
            break;
          case '/api/api-manager/v1/consumer/sample-mobile-app-consumer/credential/register':
            return of({
              body: {
                result: {
                  secret: 'sample-secret-key',
                  token: 'sample-token'
                }
              }
            });
            break;
          default :
            return of({} as any);
        }
      });
      mockConfig.api_authentication = {mobileAppConsumer: 'sample-mobile-app-consumer'} as any;
      jest.spyOn(JwtUtil, 'createJWTToken').mockImplementation(() => Promise.resolve('sample'));
      mockDeviceInfo.getDeviceID = jest.fn(() => 'sample-device-id');
      // act
      apiTokenHandler.refreshAuthToken().subscribe(() => {
        // assert
        expect( mockFetch.mock.calls[1][0].path).toEqual('/api/api-manager/v1/consumer/sample-mobile-app-consumer/credential/register');
        expect(mockConfig.api_authentication).toBeTruthy();
        expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
        done();
      });
    });

    it('should invoke fallback v1 kong API for any other API failure', (done) => {
      // arrange
      const mockFetch = jest.spyOn(mockApiService, 'fetch');
      mockFetch .mockImplementation((arg) => {
        switch (arg.path) {
          case '/api/api-manager/v2/consumer/sample-mobile-app-consumer/credential/register':
            const error: CsNetworkError = new CsNetworkError('NETWORK_ERROR');
            return throwError(error);
            break;
          default :
            return of({} as any);
        }
      });
      mockConfig.api_authentication = {mobileAppConsumer: 'sample-mobile-app-consumer'} as any;
      jest.spyOn(JwtUtil, 'createJWTToken').mockImplementation(() => Promise.resolve('sample'));
      mockDeviceInfo.getDeviceID = jest.fn(() => 'sample-device-id');
      // act
      apiTokenHandler.refreshAuthToken().pipe(
        catchError(() => {
          done();
          return of({});
        })
      ).subscribe(() => {
        // assert
        expect( mockFetch.mock.calls[1][0].path).toEqual('/api/api-manager/v1/consumer/sample-mobile-app-consumer/credential/register');
        expect(mockConfig.api_authentication).toBeTruthy();
        expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
        done();
      });
    });
  });
});
