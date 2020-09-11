import {DbService} from '..';
import {of, throwError} from 'rxjs';
import { ContentAccessEntry, ContentEntry} from '../../content/db/schema';
import {ContentGeneralizationMigration} from './content-generalization-migration';
import {mockContents} from './content-generaliztion-migration.spec.data';

describe('ContentGeneralizationMigration', () => {
  let contentGeneralizationMigration: ContentGeneralizationMigration;

  beforeAll(() => {
    contentGeneralizationMigration = new ContentGeneralizationMigration();
  });

  it('should be able to create an instance', () => {
    expect(contentGeneralizationMigration).toBeTruthy();
  });

  describe('apply', () => {
    const mockDbService: Partial<DbService> = {};

    beforeEach(() => {
      mockDbService.beginTransaction = jest.fn().mockImplementation();
      mockDbService.endTransaction = jest.fn().mockImplementation();
      mockDbService.execute = jest.fn().mockImplementation(() => of([]));
    });

    it('should alter content and contentaccess table', (done) => {
      // arrange
      mockDbService.read = jest.fn().mockImplementation(() => of([]));

      contentGeneralizationMigration.apply(mockDbService as DbService).then(() => {
        expect(mockDbService.execute).toHaveBeenCalledWith(`ALTER TABLE ${ContentEntry.TABLE_NAME} ADD COLUMN ${ContentEntry.COLUMN_NAME_PRIMARY_CATEGORY} TEXT DEFAULT ''`);
        done();
      });
    });

    it('should update the primaryCategory coloumn if content table has entries', (done) => {
      // arrange
      mockDbService.read = jest.fn().mockImplementation(() => of(mockContents));

      contentGeneralizationMigration.apply(mockDbService as DbService).then(() => {
        expect(mockDbService.execute).toHaveBeenNthCalledWith(2, `UPDATE content SET  primary_category = CASE identifier  WHEN 'do_31265486640564633624236' THEN 'digital textbook'  WHEN 'do_31265547281583308824491' THEN 'course'  ELSE '' END ;`);
        done();
      });
    });

    it('should end the transaction incase of any error', (done) => {
      // arrange
      mockDbService.read = jest.fn().mockImplementation(() => throwError({}));

      contentGeneralizationMigration.apply(mockDbService as DbService).then(() => {
      }).catch(() => {
        expect(mockDbService.endTransaction).toHaveBeenCalled();
        done();
      });
    });
  });
});
