import {DbService} from '..';
import {of} from 'rxjs';
import {GroupProfileMigration} from './group-profile-migration';
import {GroupProfileEntry, ProfileEntry} from '../../profile/db/schema';
import {GroupEntry} from '../../group-deprecated/db/schema';

describe('GroupProfileMigration', () => {
  let groupProfileMigration: GroupProfileMigration;

  beforeAll(() => {
    groupProfileMigration = new GroupProfileMigration();
  });

  it('should be able to create an instance', () => {
    expect(groupProfileMigration).toBeTruthy();
  });

  describe('apply', () => {
    const mockDbService: Partial<DbService> = {};

    beforeEach(() => {
      mockDbService.execute = jest.fn().mockImplementation(() => of([]));
    });

    it('should create group_profile and group table during apply method', (done) => {
      // arrange
      mockDbService.read = jest.fn().mockImplementation(() => of([]));
      // act and assert
      groupProfileMigration.apply(mockDbService as DbService).then(() => {
        expect(mockDbService.execute).toHaveBeenCalledWith(GroupProfileEntry.getCreateEntry());
        expect(mockDbService.execute).toHaveBeenCalledWith(GroupEntry.getCreateEntry());
        done();
      });
    });

    it('should execute the update query during migration', (done) => {
      // arrange
      const modelJSONArray = [
        { uid: 'SAMPLE', handle: 'SAMPLE'},
        { uid: 'SAMPLE', handle: 'SAMPLE_1'}
      ];
      mockDbService.read = jest.fn().mockImplementation(() => of(modelJSONArray));
      mockDbService.update = jest.fn().mockImplementation(() => of());
      // act and assert
      groupProfileMigration.apply(mockDbService as DbService).then(() => {
        expect(mockDbService.update).toHaveBeenCalledWith({
          table: ProfileEntry.TABLE_NAME,
          modelJson: modelJSONArray[0]
        });
        expect(mockDbService.update).toHaveBeenCalledWith({
          table: ProfileEntry.TABLE_NAME,
          modelJson: modelJSONArray[1]
        });
        done();
      });
    });
  });
});
