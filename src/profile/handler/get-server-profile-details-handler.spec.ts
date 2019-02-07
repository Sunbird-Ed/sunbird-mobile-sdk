import { GetServerProfileDetailsHandler } from './get-server-profile-details-handler';
import {
    apiServiceMock,
    profileServiceConfigMock,
    cachedItemStoreMock

} from '../../__test__/mocks';
import { Observable } from 'rxjs';

describe.only('GetServerProfileDetailsHandler', () => {
    let getServerProfileDetailsHandler: GetServerProfileDetailsHandler;
    beforeEach(() => {
        getServerProfileDetailsHandler = new GetServerProfileDetailsHandler(apiServiceMock as any,
            profileServiceConfigMock, cachedItemStoreMock as any);
    });
    it('can load instance', () => {
        expect(getServerProfileDetailsHandler).toBeTruthy();
    });
    it(' should be handle server profile details', () => {
        // arrange
        apiServiceMock.fetch.mockReturnValue(Observable.of({}));
        cachedItemStoreMock.getCached.mockImplementation(
            (id: string, noSqlkey: string, timeToLiveKey: string, fromServer: () => Observable<any>) => {
                fromServer();
                return Observable.of({});
        });
        // act
        getServerProfileDetailsHandler.handle({userId: '102', requiredFields: []});
        // assert
       expect(cachedItemStoreMock.getCached)
           .toHaveBeenCalledWith('102', 'serverProfileDetails', 'serverProfileDetails', expect.any(Function));
    });
});
