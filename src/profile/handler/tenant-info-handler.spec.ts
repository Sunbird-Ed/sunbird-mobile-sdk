import { TenantInfoHandler } from './tenant-info-handler';
import {
    apiServiceMock,
    profileServiceConfigMock,
    sessionAuthenticatorMock
} from '../../__test__/mocks';
import { Observable } from 'rxjs';

describe.only('TenantInfoHandler', () => {
    let tenentInfoHandler: TenantInfoHandler;
    beforeEach(() => {
        tenentInfoHandler = new TenantInfoHandler(apiServiceMock as any, profileServiceConfigMock, sessionAuthenticatorMock);
    });
    it('can load instance', () => {
        // arrange

        // act
        // assert
        expect(tenentInfoHandler).toBeTruthy();
    });
    it('should be handle tenantInfo Api', () => {
        // arrange
        apiServiceMock.fetch.mockReturnValue(Observable.of({ result: {} }));
        // const slug = 'data';
        // act
        tenentInfoHandler.handle({slug: 'sample_data'});
        // assert
        expect(apiServiceMock.fetch).toHaveBeenCalledWith({'_authenticators': [], '_body': undefined, '_headers': undefined,
         '_parameters': undefined, '_path': 'undefinedtenant/infosample_data', '_requiredApiToken': true, '_responseInterceptors': [{}],
         '_type': 'GET'});
    });
});
