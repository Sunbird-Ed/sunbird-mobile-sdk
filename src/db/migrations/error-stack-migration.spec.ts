import {DbService} from '..';
import {of} from 'rxjs';
import {ErrorStackEntry} from '../../error/db/schema';
import {ErrorStackMigration} from './error-stack-migration';

describe('ErrorStackMigration', () => {
  let errorStackMigration: ErrorStackMigration;

  beforeAll(() => {
    errorStackMigration = new ErrorStackMigration();
  });

  it('should be able to create an instance', () => {
    expect(errorStackMigration).toBeTruthy();
  });

  describe('apply', () => {
    const mockDbService: Partial<DbService> = {};

    beforeEach(() => {
      mockDbService.execute = jest.fn().mockImplementation(() => of([]));
    });

    it('should create error stack table during apply method', (done) => {
      // arrange
      // act and assert
      errorStackMigration.apply(mockDbService as DbService).then(() => {
        expect(mockDbService.execute).toHaveBeenCalledWith(ErrorStackEntry.getCreateEntry());
        done();
      });

    });
  });
});
