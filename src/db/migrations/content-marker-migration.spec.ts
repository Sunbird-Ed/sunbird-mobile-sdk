import {ContentMarkerMigration} from './content-marker-migration';
import {DbService} from '..';
import {of} from 'rxjs';
import {ContentMarkerEntry} from '../../content/db/schema';

describe('ContentMarkerMigration', () => {
  let contentMarkerMigration: ContentMarkerMigration;

  beforeAll(() => {
    contentMarkerMigration = new ContentMarkerMigration();
  });

  it('should be able to create an instance', () => {
    expect(contentMarkerMigration).toBeTruthy();
  });

  describe('apply', () => {
    const mockDbService: Partial<DbService> = {};

    beforeEach(() => {
      mockDbService.execute = jest.fn().mockImplementation(() => of([]));
    });

    it('should create content marker table during apply method', (done) => {
      // arrange
      mockDbService.execute = jest.fn().mockImplementation(() => of([]));
      // act and assert
      contentMarkerMigration.apply(mockDbService as DbService).then(() => {
        expect(mockDbService.execute).toHaveBeenCalledWith(ContentMarkerEntry.getCreateEntry());
        done();
      });

    });
  });
});
