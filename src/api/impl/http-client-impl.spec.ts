import {HttpClientImpl} from './http-client-impl';
import {HttpSerializer, NetworkError, Response, ResponseCode, HttpServerError} from '..';
import {AxiosError, AxiosResponse} from 'axios';

describe('HttpClientImpl', () => {
  let httpClientImpl: HttpClientImpl;

  beforeAll(() => {
    httpClientImpl = new HttpClientImpl();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be able to create an instance', () => {
    // arrange
    expect(httpClientImpl).toBeTruthy();
  });

  it('should be able to set a serializer', () => {
    // arrange
    httpClientImpl.setSerializer(HttpSerializer.JSON);
  });

  it('should be able to add a header', () => {
    // arrange
    httpClientImpl.addHeader('SAMPLE_KEY', 'SAMPLE_VALUE');
  });

  it('should be able to add headers', () => {
    // arrange
    httpClientImpl.addHeaders({
      'SAMPLE_KEY': 'SAMPLE_VALUE'
    });
  });

  it('should delegate get request to cordova\'s get', (done) => {
    // arrange
    spyOn(window['cordova'].plugin.http, 'get').and.callFake((url, paramsOrData, header, cb) => {
      const response = {
        data: {
          'SAMPLE_KEY': 'SAMPLE_VALUE'
        },
        status: ResponseCode.HTTP_SUCCESS
      };

      setTimeout(() => {
        cb.call(httpClientImpl, response);
      });
    });

    // act
    httpClientImpl.get('/', '/', {}, {})
      .subscribe(() => {
        // assert
        expect(window['cordova'].plugin.http.get).toHaveBeenCalled();
        done();
      }, (e) => {
        console.log(e);
        done();
      });
  }, 1000);

  it('should delegate post request to cordova\'s post', (done) => {
    // arrange
    spyOn(window['cordova'].plugin.http, 'post').and.callFake((url, paramsOrData, header, cb) => {
      const response = {
        data: {
          'SAMPLE_KEY': 'SAMPLE_VALUE'
        },
        status: ResponseCode.HTTP_SUCCESS
      };

      setTimeout(() => {
        cb.call(httpClientImpl, response);
      });
    });

    // act
    httpClientImpl.post('/', '/', {}, {})
      .subscribe(() => {
        // assert
        expect(window['cordova'].plugin.http.post).toHaveBeenCalled();
        done();
      });
  });

  it('should delegate patch request to cordova\'s patch', (done) => {
    // arrange
    spyOn(window['cordova'].plugin.http, 'patch').and.callFake((url, paramsOrData, header, cb) => {
      const response = {
        data: {
          'SAMPLE_KEY': 'SAMPLE_VALUE'
        },
        status: ResponseCode.HTTP_SUCCESS
      };

      setTimeout(() => {
        cb.call(httpClientImpl, response);
      });
    });

    // act
    httpClientImpl.patch('/', '/', {}, {})
      .subscribe(() => {
        // assert
        expect(window['cordova'].plugin.http.patch).toHaveBeenCalled();
        done();
      });
  });

  it('should throw NetworkError on request with status 0 response', (done) => {
    // arrange
    spyOn(window['cordova'].plugin.http, 'patch').and.callFake((url, paramsOrData, header, cb, ecb) => {
      const response = {
        data: {
          'SAMPLE_KEY': 'SAMPLE_VALUE'
        },
        status: 0
      };

      setTimeout(() => {
        ecb.call(httpClientImpl, response);
      });
    });

    // act
    httpClientImpl.patch('/', '/', {}, {})
      .subscribe(() => {}, (e) => {
        // assert
        expect(e instanceof NetworkError).toBeTruthy();
        done();
      });
  });

  it('should throw NetworkError on non-parseable response', (done) => {
    // arrange
    spyOn(window['cordova'].plugin.http, 'patch').and.callFake((url, paramsOrData, header, cb, ecb) => {
      const response = {
        data: {
          'SAMPLE_KEY': 'SAMPLE_VALUE'
        },
        status: ResponseCode.HTTP_BAD_REQUEST
      };

      setTimeout(() => {
        ecb.call(httpClientImpl, response);
      });
    });

    // act
    httpClientImpl.patch('/', '/', {}, {})
      .subscribe(() => {}, (e) => {
        // assert
        expect(e instanceof NetworkError).toBeTruthy();
        done();
      });
  });

  it('should handle any response throwing ServerError for response body with ErrorCode', (done) => {
    // arrange
    spyOn(window['cordova'].plugin.http, 'patch').and.callFake((url, paramsOrData, header, cb, ecb) => {
      const response = {
        error: JSON.stringify({'SAMPLE_KEY': 'SAMPLE_VALUE'}),
        status: ResponseCode.HTTP_BAD_REQUEST
      };

      setTimeout(() => {
        ecb.call(httpClientImpl, response);
      });
    });

    // act
    httpClientImpl.patch('/', '/', {}, {})
      .subscribe(() => {}, (e) => {
        // assert
        expect(e instanceof HttpServerError).toBeFalsy();
        done();
      });
  });

  it('should handle any response resolving ServerError for response body with ErrorCode of type HTTP_UNAUTHORISED, HTTP_FORBIDDEN', (done) => {
    // arrange
    spyOn(window['cordova'].plugin.http, 'patch').and.callFake((url, paramsOrData, header, cb, ecb) => {
      const response = {
        error: JSON.stringify({'SAMPLE_KEY': 'SAMPLE_VALUE'}),
        status: ResponseCode.HTTP_UNAUTHORISED
      };

      setTimeout(() => {
        ecb.call(httpClientImpl, response);
      });
    });

    // act
    httpClientImpl.patch('/', '/', {}, {})
      .subscribe((r) => {
        // assert
        expect(r instanceof Response).toBeTruthy();
        done();
      }, (e) => {
        console.error(e);
      });
  });
});
