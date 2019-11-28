import {HttpClientAxios} from './http-client-axios';
import {HttpSerializer, NetworkError, ResponseCode, HttpServerError} from '..';
import * as axios from 'axios';
import {AxiosError, AxiosInstance, AxiosResponse} from 'axios';

jest.mock('axios');

describe('HttpClientAxios', () => {
  let httpClientAxios: HttpClientAxios;
  const mockAxiosInstance: AxiosInstance = axios.default;

  beforeAll(() => {
    jest.mock('axios', () => {
      return {
        default: mockAxiosInstance
      };
    });
    httpClientAxios = new HttpClientAxios();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be able to create an instance', () => {
    // arrange
    expect(httpClientAxios).toBeTruthy();
    expect(httpClientAxios['axios']).toEqual(mockAxiosInstance);
  });

  it('should be able to set a serializer', () => {
    // arrange
    httpClientAxios.setSerializer(HttpSerializer.JSON);
  });

  it('should be able to add a header', () => {
    // arrange
    httpClientAxios.addHeader('SAMPLE_KEY', 'SAMPLE_VALUE');
  });

  it('should be able to add headers', () => {
    // arrange
    httpClientAxios.addHeaders({
      'SAMPLE_KEY': 'SAMPLE_VALUE'
    });
  });

  it('should delegate get request to axios\' get', (done) => {
    // arrange
    const mockResponse: AxiosResponse = {
      data: {},
      status: 200,
      statusText: 'SUCCESS',
      headers: {},
      config: {}
    };
    (mockAxiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);

    // act
    httpClientAxios.get('/', '/', {}, {})
      .subscribe(() => {
        // assert
        expect(mockAxiosInstance.get).toHaveBeenCalled();
        done();
      });
  });

  it('should delegate post request to axios\' post', (done) => {
    // arrange
    const mockResponse: AxiosResponse = {
      data: {},
      status: 200,
      statusText: 'SUCCESS',
      headers: {},
      config: {}
    };
    (mockAxiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

    // act
    httpClientAxios.post('/', '/', {}, {})
      .subscribe(() => {
        // assert
        expect(mockAxiosInstance.post).toHaveBeenCalled();
        done();
      });
  });

  it('should delegate post request to axios\' post with appropriate headers', (done) => {
    // arrange
    const mockResponse: AxiosResponse = {
      data: {},
      status: 200,
      statusText: 'SUCCESS',
      headers: {},
      config: {}
    };
    (mockAxiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

    // act
    httpClientAxios.setSerializer(HttpSerializer.URLENCODED);
    httpClientAxios.post('/', '/', {}, {})
      .subscribe(() => {
        // assert
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            headers: expect.objectContaining({
              'content-type': 'application/x-www-form-urlencoded'
            })
          }),
        );
        done();
      });
  });

  it('should delegate patch request to axios\' patch', (done) => {
    // arrange
    const mockResponse: AxiosResponse = {
      data: {},
      status: 200,
      statusText: 'SUCCESS',
      headers: {},
      config: {}
    };
    (mockAxiosInstance.patch as jest.Mock).mockResolvedValue(mockResponse);

    // act
    httpClientAxios.patch('/', '/', {}, {})
      .subscribe(() => {
        // assert
        expect(mockAxiosInstance.patch).toHaveBeenCalled();
        done();
      });
  });

  it('should delegate patch request to axios\' patch with appropriate headers', (done) => {
    // arrange
    const mockResponse: AxiosResponse = {
      data: {},
      status: 200,
      statusText: 'SUCCESS',
      headers: {},
      config: {}
    };
    (mockAxiosInstance.patch as jest.Mock).mockResolvedValue(mockResponse);

    // act
    httpClientAxios.setSerializer(HttpSerializer.URLENCODED);
    httpClientAxios.patch('/', '/', {}, {})
      .subscribe(() => {
        // assert
        expect(mockAxiosInstance.patch).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            headers: expect.objectContaining({
              'content-type': 'application/x-www-form-urlencoded'
            })
          }),
        );
        done();
      });
  });

  it('should handle any response throwing NetworkError for no response body or non JSON response', (done) => {
    // arrange
    const mockError: AxiosError = {
      name: 'SAMPLE_NAME',
      message: 'SAMPLE_MESSAGE',
      isAxiosError: true,
      config: {}
    };
    (mockAxiosInstance.get as jest.Mock).mockRejectedValue(mockError);

    // act
    httpClientAxios.get('/', '/', {}, {})
      .subscribe(() => {}, (e) => {
        // assert
        expect(e instanceof NetworkError).toBeTruthy();
        done();
      });

    // arrange
    const mockError2: AxiosError = {
      name: 'SAMPLE_NAME',
      message: 'SAMPLE_MESSAGE',
      isAxiosError: true,
      config: {},
      response: {
        data: '',
        status: 200,
        statusText: 'SUCCESS',
        headers: {},
        config: {}
      }
    };
    (mockAxiosInstance.get as jest.Mock).mockRejectedValue(mockError2);

    // act
    httpClientAxios.get('/', '/', {}, {})
      .subscribe(() => {}, (e) => {
        // assert
        expect(e instanceof NetworkError).toBeTruthy();
        done();
      });
  });

  it('should handle any response throwing ServerError for response body with ErrorCode', (done) => {
    // arrange
    const mockError: AxiosError = {
      response: {
        data: {
          'SAMPLE_DATA_KEY': 'SAMPLE_DATA_VALUE'
        },
        status: ResponseCode.HTTP_BAD_REQUEST,
        statusText: 'SUCCESS',
        headers: {},
        config: {}
      },
      request: {
        url: 'SAMPLE_URL'
      },
      name: 'SAMPLE_NAME',
      message: 'SAMPLE_MESSAGE',
      isAxiosError: true,
      config: {}
    };
    (mockAxiosInstance.get as jest.Mock).mockRejectedValue(mockError);

    // act
    httpClientAxios.get('/', '/', {}, {})
      .subscribe(() => {}, (e) => {
        // assert
        expect(e instanceof HttpServerError).toBeTruthy();
        done();
      });
  });

  it('should handle any response resolving ServerError for response body with ErrorCode of type HTTP_UNAUTHORISED, HTTP_FORBIDDEN', (done) => {
    // arrange
    const mockError: AxiosError = {
      response: {
        data: {
          'SAMPLE_DATA_KEY': 'SAMPLE_DATA_VALUE'
        },
        status: ResponseCode.HTTP_UNAUTHORISED,
        statusText: 'SUCCESS',
        headers: {},
        config: {}
      },
      request: {
        url: 'SAMPLE_URL'
      },
      name: 'SAMPLE_NAME',
      message: 'SAMPLE_MESSAGE',
      isAxiosError: true,
      config: {}
    };
    (mockAxiosInstance.get as jest.Mock).mockRejectedValue(mockError);

    // act
    httpClientAxios.get('/', '/', {}, {})
      .subscribe((r) => {
        // assert
        expect(r).toBeTruthy();
        done();
      });
  });
});
