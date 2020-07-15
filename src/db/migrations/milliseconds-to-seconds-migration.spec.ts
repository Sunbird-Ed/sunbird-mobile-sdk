import {DbService} from '..';
import {of} from 'rxjs';
import {MillisecondsToSecondsMigration} from './milliseconds-to-seconds-migration';
import {LearnerSummaryEntry} from '../../profile/db/schema';

describe('MillisecondsToSecondsMigration', () => {
  let millisecondsToSecondsMigration: MillisecondsToSecondsMigration;

  beforeAll(() => {
    millisecondsToSecondsMigration = new MillisecondsToSecondsMigration();
  });

  it('should be able to create an instance', () => {
    expect(millisecondsToSecondsMigration).toBeTruthy();
  });

  describe('apply', () => {
    const mockDbService: Partial<DbService> = {};

    beforeEach(() => {
      mockDbService.execute = jest.fn().mockImplementation(() => of([]));
    });

    it('should execute the update query during migration', (done) => {
      // arrange
      const modelJSONArray = [
        { total_ts: 1000}
      ];
      mockDbService.read = jest.fn().mockImplementation(() => of(modelJSONArray));
      mockDbService.update = jest.fn().mockImplementation(() => of());
      // act and assert
      millisecondsToSecondsMigration.apply(mockDbService as DbService).then(() => {
        expect(millisecondsToSecondsMigration.queries()).toEqual([]);
        expect(mockDbService.update).toHaveBeenCalledWith({
          table: LearnerSummaryEntry.TABLE_NAME,
          modelJson: modelJSONArray[0]
        });
        done();
      });
    });
  });
});
