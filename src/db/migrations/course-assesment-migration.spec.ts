import {DbService} from '..';
import {of} from 'rxjs';
import {CourseAssessmentMigration} from './course-assessment-migration';
import {CourseAssessmentEntry} from '../../summarizer/db/schema';

describe('CourseAssessmentMigration', () => {
  let courseAssessmentMigration: CourseAssessmentMigration;

  beforeAll(() => {
    courseAssessmentMigration = new CourseAssessmentMigration();
  });

  it('should be able to create an instance', () => {
    expect(courseAssessmentMigration).toBeTruthy();
  });

  describe('apply', () => {
    const mockDbService: Partial<DbService> = {};

    beforeEach(() => {
      mockDbService.execute = jest.fn().mockImplementation(() => of([]));
    });

    it('should create course assesment table during apply method', (done) => {
      // arrange
      // act and assert
      courseAssessmentMigration.apply(mockDbService as DbService).then(() => {
        expect(mockDbService.execute).toHaveBeenCalledWith(CourseAssessmentEntry.getCreateEntry());
        done();
      });

    });
  });
});
