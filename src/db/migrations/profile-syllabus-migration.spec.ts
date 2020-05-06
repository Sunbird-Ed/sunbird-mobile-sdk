import {DbService} from '..';
import {of} from 'rxjs';
import {ProfileSyllabusMigration} from './profile-syllabus-migration';
import {ProfileEntry} from '../../profile/db/schema';

describe('ProfileSyllabusMigration', () => {
  let profileSyllabusMigration: ProfileSyllabusMigration;

  beforeAll(() => {
    profileSyllabusMigration = new ProfileSyllabusMigration();
  });

  it('should be able to create an instance', () => {
    expect(profileSyllabusMigration).toBeTruthy();
  });

  describe('apply', () => {
    const mockDbService: Partial<DbService> = {};

    beforeEach(() => {
      mockDbService.execute = jest.fn().mockImplementation(() => of([]));
    });

    it('should update profile table during apply method', (done) => {
      // arrange
      // act and assert
      profileSyllabusMigration.apply(mockDbService as DbService).then(() => {
        expect(mockDbService.execute).toHaveBeenCalledWith(ProfileEntry.getAlterEntryForProfileSyllabus());
        done();
      });
    });
  });
});
