import {DbService} from '..';
import {of} from 'rxjs';
import {OfflineSearchTextbookMigration} from './offline-search-textbook-migration';
import {anyNumber} from 'ts-mockito';
import {RecentlyViewedMigration} from './recently-viewed-migration';
import {ContentMarkerEntry} from '../../content/db/schema';

describe('OfflineSearchTextbookMigration', () => {
  let recentlyViewedMigration: RecentlyViewedMigration;

  beforeAll(() => {
    recentlyViewedMigration = new RecentlyViewedMigration();
  });

  it('should be able to create an instance', () => {
    expect(recentlyViewedMigration).toBeTruthy();
  });

  describe('apply', () => {
    const mockDbService: Partial<DbService> = {
      update: jest.fn()
    };

    beforeEach(() => {
      mockDbService.execute = jest.fn().mockImplementation(() => of([]));
    });

    it('should update content table during apply method', (done) => {
      // arrange
      const modelJSONArray = [
        { local_data: ''}
      ];
      mockDbService.read = jest.fn().mockImplementation(() => of(modelJSONArray));
      // act and assert
      recentlyViewedMigration.apply(mockDbService as DbService).then(() => {
        expect(mockDbService.execute).toHaveBeenCalledWith(ContentMarkerEntry.getAlterEntryForMimeType());
        done();
      });
    });

    it('should execute the update query during migration', (done) => {
      // arrange
      const modelJSONArray = [
        { data: '{\"mimeType\":\"video\/x-youtube\"}'}
      ];
      mockDbService.read = jest.fn().mockImplementation(() => of(modelJSONArray));
      const mockUpdate = jest.spyOn(mockDbService, 'update').mockReturnValue(of(anyNumber()));
      // act and assert
      recentlyViewedMigration.apply(mockDbService as DbService).then(() => {
        expect(mockUpdate.mock.calls[0][0]['modelJson']['mime_type']).toEqual('video/x-youtube');
        done();
      });
    });
  });
});
