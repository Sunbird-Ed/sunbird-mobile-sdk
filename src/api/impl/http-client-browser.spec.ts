import {HttpClientBrowser} from './http-client-browser';
import {HttpSerializer, HttpServerError, NetworkError, Response as SunbirdApiResponse, ResponseCode} from '..';
import * as qs from 'qs';

describe('HttpClientBrowser', () => {
    let httpClientBrowser: HttpClientBrowser;

    beforeAll(() => {
        httpClientBrowser = new HttpClientBrowser();
    });

    beforeEach(() => {
        httpClientBrowser.setSerializer(HttpSerializer.JSON);
        jest.clearAllMocks();
    });

    it('should be able to create an instance', () => {
        // arrange
        expect(httpClientBrowser).toBeTruthy();
    });

    it('should be able to set a serializer', () => {
        // arrange
        httpClientBrowser.setSerializer(HttpSerializer.JSON);
    });

    it('should be able to add a header', () => {
        // arrange
        httpClientBrowser.addHeader('SAMPLE_KEY', 'SAMPLE_VALUE');
    });

    it('should be able to add headers', () => {
        // arrange
        httpClientBrowser.addHeaders({
            'SAMPLE_KEY': 'SAMPLE_VALUE'
        });
    });

    it('should delegate get request to fetch\'s get', (done) => {
        // arrange
        const mockResponse: Partial<Response> = {
            ok: true,
            status: 200,
            statusText: 'SUCCESS',
            json: () => Promise.resolve({})
        };

        spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockResponse));

        // act
        httpClientBrowser.get('http://sample.com/', '/', {}, {})
            .subscribe(() => {
                // assert
                expect(window.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                    method: 'GET'
                }));
                done();
            });
    });

    it('should delegate post request to fetch\'s post', (done) => {
        // arrange
        const mockResponse: Partial<Response> = {
            ok: true,
            status: 200,
            statusText: 'SUCCESS',
            json: () => Promise.resolve({})
        };

        spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockResponse));

        // act
        httpClientBrowser.post('http://sample.com/', '/', {}, {})
            .subscribe(() => {
                // assert
                expect(window.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                    method: 'POST',
                    body: '{}'
                }));
                done();
            });
    });

    it('should delegate post request to fetch\'s post with appropriate headers', (done) => {
        // arrange
        const mockResponse: Partial<Response> = {
            ok: true,
            status: 200,
            statusText: 'SUCCESS',
            json: () => Promise.resolve({})
        };

        spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockResponse));

        // act
        httpClientBrowser.setSerializer(HttpSerializer.URLENCODED);
        httpClientBrowser.post('http://sample.com/', '/', {}, {test: 'body'})
            .subscribe(() => {
                // assert
                expect(window.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                    method: 'POST',
                    body: qs.stringify({test: 'body'})
                }));
                done();
            });
    });

    it('should delegate patch request to fetch\'s patch', (done) => {
        // arrange
        const mockResponse: Partial<Response> = {
            ok: true,
            status: 200,
            statusText: 'SUCCESS',
            json: () => Promise.resolve({})
        };

        spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockResponse));

        // act
        httpClientBrowser.patch('http://sample.com/', '/', {}, {test: 'body'})
            .subscribe(() => {
                // assert
                expect(window.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                    method: 'PATCH',
                    body: '{"test":"body"}'
                }));
                done();
            });
    });

    it('should delegate patch request to axios\' patch with appropriate headers', (done) => {
        // arrange
        const mockResponse: Partial<Response> = {
            ok: true,
            status: 200,
            statusText: 'SUCCESS',
            json: () => Promise.resolve({})
        };

        spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockResponse));

        // act
        httpClientBrowser.setSerializer(HttpSerializer.URLENCODED);
        httpClientBrowser.patch('http://sample.com/', '/', {}, {test: 'body'})
            .subscribe(() => {
                // assert
                expect(window.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
                    method: 'PATCH',
                    body: qs.stringify({test: 'body'})
                }));
                done();
            });
    });

    it('should handle any response throwing NetworkError for no response body or non JSON response', (done) => {
        // arrange
        const mockError: Partial<Response> = {
            status: ResponseCode.HTTP_SUCCESS,
            json: () => Promise.resolve('{corrupted_data}')
        };

        spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockError));

        // act
        httpClientBrowser.get('http://sample.com/', '/', {}, {})
            .subscribe((r) => {
            }, (e) => {
                console.error(e);
                // assert
                expect(e instanceof NetworkError).toBeTruthy();
                done();
            });
    });

    it('should handle unexpected errors', (done) => {
        // arrange
        spyOn(window, 'fetch').and.returnValue(Promise.reject(new Error('Uncaught Error')));

        // act
        httpClientBrowser.get('http://sample.com/', '/', {}, {})
            .subscribe(() => {
            }, (e) => {
                // assert
                expect(e instanceof NetworkError).toBeTruthy();
                done();
            });
    });

    it('should handle any response throwing ServerError for response body with ErrorCode', (done) => {
        // arrange
        const mockError: Partial<Response> = {
            status: ResponseCode.HTTP_BAD_REQUEST,
            json: () => Promise.resolve({test: 'response'})
        };

        spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockError));

        // act
        httpClientBrowser.get('http://sample.com/', '/', {}, {})
            .subscribe(() => {
            }, (e) => {
                console.log(e);
                // assert
                expect(e instanceof HttpServerError).toBeTruthy();
                done();
            });
    });

    it('should handle any response resolving SunbirdApiResponse for response body with ErrorCode of type HTTP_UNAUTHORISED, HTTP_FORBIDDEN', (done) => {
        // arrange
        const mockError: Partial<Response> = {
            status: ResponseCode.HTTP_UNAUTHORISED,
            json: () => Promise.resolve({'test': 'response'})
        };

        spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockError));

        // act
        httpClientBrowser.get('http://sample.com/', '/', {}, {})
            .subscribe((r) => {
                // assert
                expect(r).toBeTruthy();
                expect(r instanceof SunbirdApiResponse).toBeTruthy();
                expect(r.errorMesg === 'SERVER_ERROR').toBeTruthy();
                done();
            });
    });
});
