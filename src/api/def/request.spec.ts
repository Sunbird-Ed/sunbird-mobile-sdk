import {HttpRequestType, HttpSerializer, Request} from './request';
import {Authenticator} from './authenticator';
import {instance, mock} from 'ts-mockito';
import {RequestInterceptor} from './request-interceptor';
import {ResponseInterceptor} from './response-interceptor';
import {RequestBuildError} from '../errors/request-build-error';

describe('Request', () => {
  it('should create a request object with possible attributes', () => {
    // arrange
    const mockAuthenticator = instance(mock<Authenticator>());
    const mockRequestInterceptor = instance(mock<RequestInterceptor>());
    const mockResponseInterceptor = instance(mock<ResponseInterceptor>());

    // act
    const request = new Request.Builder()
      .withType(HttpRequestType.GET)
      .withHost('http://sample.com')
      .withPath('/api')
      .withRequestInterceptor(mockRequestInterceptor)
      .withResponseInterceptor(mockResponseInterceptor)
      .withAuthenticator(mockAuthenticator)
      .withHeaders({
        'Content-Type': 'application/text'
      })
      .withBody({
        'SAMPLE_BODY_KEY': 'SAMPLE_BODY_VALUE'
      })
      .withParameters({
        'SAMPLE_PARAM_KEY': 'SAMPLE_PARAM_VALUE'
      })
      .withApiToken(true)
      .withSessionToken(true)
      .withSerializer(HttpSerializer.JSON)
      .build();

    // assert
    expect(request).toBeTruthy();
  });

  it('should require a minimum of type and path to be built', () => {
    expect(() => {
      const request = new Request.Builder().build();
    }).toThrow(RequestBuildError);
  });
});
