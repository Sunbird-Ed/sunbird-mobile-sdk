import { doesNotReject } from 'assert';
import { of, throwError } from 'rxjs';
import { ProfileEntry } from '../../profile/db/schema';
import { DbService } from '../def/db-service';
import { FrameworkMigration } from './framework-migration';

describe('FrameworkMigration', () => {
    let frameworkMigration: FrameworkMigration;

    beforeAll(() => {
        frameworkMigration = new FrameworkMigration();
    });
    beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    });

    it('sheould be create a instance of FrameworkMigration', () => {
        expect(frameworkMigration).toBeTruthy();
    });

    describe('updateProfileDB', () => {
        const mockDbService: Partial<DbService> = {};
        it('should be update profile table', (done) => {
            //
            mockDbService.read = jest.fn(() => of([
                {
                    uid: 'sample-uid',
                    board: ['sample-board'],
                    medium: ['sample-medium'],
                    grade: ['class-1'],
                    subject: ['sample-subject']
                }
            ]));

            mockDbService.update = jest.fn(() => of(1));
            frameworkMigration.updateProfileDB(mockDbService as DbService).then(() => {
                setTimeout(() => {
                    expect(mockDbService.read).toHaveBeenCalled();
                    expect(mockDbService.update).toHaveBeenCalled();
                    done();
                }, 0);
            });
        });

        it('should update new categories in profile table', (done) => {
            // arrange
            mockDbService.execute = jest.fn(() => of({board: ['sample-board'], medium: ['sample-medium']}));
            // act and assert
            frameworkMigration.apply(mockDbService as DbService).then(() => {
                setTimeout(() => {
                    expect(mockDbService.execute).toHaveBeenCalledWith(ProfileEntry.getAlterEntryForProfileCategories());
                    done();
                }, 0);
            });
          });
    });
});
