import {Container} from 'inversify';
import {InjectionTokens} from '../../../injection-tokens';
import {SearchHistoryServiceImpl} from './search-history-service-impl';
import {SearchHistoryService} from '..';
import {DbService} from '../../../db';
import {ProfileService, ProfileSession} from '../../../profile';
import {Observable, of} from 'rxjs';
import {SearchHistoryEntry} from '../db/schema';
import { UniqueId } from '../../../db/util/unique-id';

describe('SearchHistoryServiceImpl', () => {
    let searchHistoryService: SearchHistoryService;

    const container = new Container();
    const dbServiceMock: Partial<DbService> = {};
    const profileServiceMock: Partial<ProfileService> = {};
    jest.spyOn(UniqueId, 'generateUniqueId')
        .mockImplementation(() => 'SECRET')
    beforeAll(() => {
        container.bind<SearchHistoryService>(InjectionTokens.SEARCH_HISTORY_SERVICE).to(SearchHistoryServiceImpl);
        container.bind<ProfileService>(InjectionTokens.PROFILE_SERVICE).toConstantValue(profileServiceMock as ProfileService);
        container.bind<DbService>(InjectionTokens.DB_SERVICE).toConstantValue(dbServiceMock as DbService);

        searchHistoryService = container.get<SearchHistoryService>(InjectionTokens.SEARCH_HISTORY_SERVICE);
    });

    it('should return an instance of SearchHistoryServiceImpl from container', () => {
        // assert
        expect(searchHistoryService).toBeTruthy();
    });

    it('should add entry to db for current profile on addEntry()', (done) => {
        // arrange
        jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
        const mockSession: ProfileSession = new ProfileSession('SAMPLE_UID');
        profileServiceMock.getActiveProfileSession = jest.fn().mockImplementation(() => of(mockSession));
        dbServiceMock.insert = jest.fn().mockImplementation(() => of(undefined));
        dbServiceMock.execute = jest.fn().mockImplementation(() => of(undefined));

        // act
        searchHistoryService.addEntry({query: 'SAMPLE_QUERY', namespace: 'SAMPLE_NAMESPACE'})
            .subscribe(() => {
                // assert
                expect(profileServiceMock.getActiveProfileSession).toBeCalled();
                expect(dbServiceMock.insert).toBeCalledWith(expect.objectContaining({
                    modelJson: expect.objectContaining({
                        [SearchHistoryEntry.COLUMN_NAME_QUERY]: 'SAMPLE_QUERY',
                        [SearchHistoryEntry.COLUMN_NAME_NAMESPACE]: 'SAMPLE_NAMESPACE',
                        [SearchHistoryEntry.COLUMN_NAME_USER_ID]: 'SAMPLE_UID'
                    })
                }));
                expect(dbServiceMock.execute).toBeCalled();
                done();
            });
    });

    it('should return entries for current Profile on getEntries()', (done) => {
        // arrange
        jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
        const mockSession: ProfileSession = new ProfileSession('SAMPLE_UID');
        profileServiceMock.getActiveProfileSession = jest.fn().mockImplementation(() => of(mockSession));
        dbServiceMock.execute = jest.fn().mockImplementation(() => of(<SearchHistoryEntry.SchemaMap[]>[
            {
                [SearchHistoryEntry._ID]: '1',
                [SearchHistoryEntry.COLUMN_NAME_USER_ID]: 'SAMPLE_UID',
                [SearchHistoryEntry.COLUMN_NAME_QUERY]: 'SAMPLE_QUERY',
                [SearchHistoryEntry.COLUMN_NAME_TIME_STAMP]: 1,
                [SearchHistoryEntry.COLUMN_NAME_NAMESPACE]: 'SAMPLE_NAMESPACE'
            },
            {
                [SearchHistoryEntry._ID]: '2',
                [SearchHistoryEntry.COLUMN_NAME_USER_ID]: 'SAMPLE_UID_2',
                [SearchHistoryEntry.COLUMN_NAME_QUERY]: 'SAMPLE_QUERY_2',
                [SearchHistoryEntry.COLUMN_NAME_TIME_STAMP]: 2,
                [SearchHistoryEntry.COLUMN_NAME_NAMESPACE]: 'SAMPLE_NAMESPACE_2'
            }
        ]));

        // act
        searchHistoryService.getEntries({namespace: 'SAMPLE_NAMESPACE', limit: 10})
            .subscribe((results) => {
                // assert
                expect(results).toMatchSnapshot();
                expect(profileServiceMock.getActiveProfileSession).toBeCalled();
                expect(dbServiceMock.execute).toBeCalled();

                done();
            });
    });
});
