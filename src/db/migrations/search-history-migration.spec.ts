import {DbService} from '..';
import {of} from 'rxjs';
import {SearchHistoryEntry} from '../../util/search-history/db/schema';
import {SearchHistoryMigration} from './search-history-migration';

describe('SearchHistoryMigration', () => {
  let searchHistoryMigration: SearchHistoryMigration;

  beforeAll(() => {
    searchHistoryMigration = new SearchHistoryMigration();
  });

  it('should be able to create an instance', () => {
    expect(searchHistoryMigration).toBeTruthy();
  });

  describe('apply', () => {
    const mockDbService: Partial<DbService> = {};

    beforeEach(() => {
      mockDbService.execute = jest.fn().mockImplementation(() => of([]));
    });

    it('should create search_history table during apply method', (done) => {
      // arrange
      // act and assert
      searchHistoryMigration.apply(mockDbService as DbService).then(() => {
        expect(mockDbService.execute).toHaveBeenCalledWith(SearchHistoryEntry.getCreateEntry());
        done();
      });

    });
  });
});
