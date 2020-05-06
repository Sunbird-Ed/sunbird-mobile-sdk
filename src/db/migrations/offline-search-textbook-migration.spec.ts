import {DbService} from '..';
import {of} from 'rxjs';
import {MillisecondsToSecondsMigration} from './milliseconds-to-seconds-migration';
import {LearnerSummaryEntry, ProfileEntry} from '../../profile/db/schema';
import {OfflineSearchTextbookMigration} from './offline-search-textbook-migration';
import {ContentEntry} from '../../content/db/schema';
import {anyNumber} from 'ts-mockito';

describe('OfflineSearchTextbookMigration', () => {
  let offlineSearchTextbookMigration: OfflineSearchTextbookMigration;

  beforeAll(() => {
    offlineSearchTextbookMigration = new OfflineSearchTextbookMigration();
  });

  it('should be able to create an instance', () => {
    expect(offlineSearchTextbookMigration).toBeTruthy();
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
      offlineSearchTextbookMigration.apply(mockDbService as DbService).then(() => {
        expect(mockDbService.execute).toHaveBeenCalledWith(ContentEntry.getAlterEntryForBoard());
        expect(mockDbService.execute).toHaveBeenCalledWith(ContentEntry.getAlterEntryForMedium());
        expect(mockDbService.execute).toHaveBeenCalledWith(ContentEntry.getAlterEntryForGrade());
        done();
      });
    });

    it('should execute the update query during migration', (done) => {
      // arrange
      const modelJSONArray = [
        { local_data: '{\"board\":[\"AP\"],\"medium\":[\"English\"],\"gradeLevel\":[\"Class1\"]}'}
      ];
      mockDbService.read = jest.fn().mockImplementation(() => of(modelJSONArray));
      const mockUpdate = jest.spyOn(mockDbService, 'update').mockReturnValue(of(anyNumber()));
      // act and assert
      offlineSearchTextbookMigration.apply(mockDbService as DbService).then(() => {
        expect(mockUpdate.mock.calls[0][0]['modelJson']['board']).toEqual('~ap~');
        expect(mockUpdate.mock.calls[0][0]['modelJson']['medium']).toEqual('~english~');
        expect(mockUpdate.mock.calls[0][0]['modelJson']['grade']).toEqual('~class1~');
        done();
      });
    });
  });
});
