import {DbCordovaService} from './db-cordova-service';
import {SdkConfig} from '../../sdk-config';
import {Migration, MigrationFactory} from '..';
import {of} from 'rxjs';
import {CourseAssessmentMigration} from '../migrations/course-assessment-migration';
import {NetworkQueueMigration} from '../migrations/network-queue-migration';
import {NetworkQueue} from '../../api/network-queue';

describe('DbCordovaService', () => {

    const mockNetworkQueue: Partial<NetworkQueue> = {
      enqueue: jest.fn(() => of(undefined))
    };
    const mockSdkConfig: Partial<SdkConfig> = {
      platform: 'cordova',
      apiConfig: {
        api_authentication: {
          channelId: 'SAMPLE_CHANNEL_ID',
          producerId: 'SAMPLE_PRODUCER_ID'
        }
      } as any,
      dbConfig: {
        dbName: 'sunbird'
      } as any
    } as any;
    const mockDBVersion: Number = 1;
    const mockMigration: Partial<Migration | MigrationFactory> = [new CourseAssessmentMigration(),
      () => {
        return new NetworkQueueMigration(mockSdkConfig as SdkConfig, mockNetworkQueue as NetworkQueue);
      }
    ];

    let dbCordovaService: DbCordovaService;

    beforeAll(() => {
      dbCordovaService = new DbCordovaService(
        mockSdkConfig as SdkConfig,
        mockDBVersion as number,
        mockMigration as (Migration | MigrationFactory)[],
      );
    });

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should be able to create an instance', () => {
      expect(dbCordovaService).toBeTruthy();
    });

    describe('update()', () => {
      it('should successfully update if plugin method gives success response', (done) => {
        // arrange
        const mockUpdate = jest.spyOn(db, 'update').mockImplementation((_, __, ___, ____, _____, success, error) => {
          success({});
        });
        const updateQuery = {
          table: '',
          useExternalDb: false,
          selection: '',
          selectionArgs: [],
          modelJson: {}
        };

        // act and assert
        dbCordovaService.update(updateQuery).subscribe(() => {
          expect(mockUpdate.mock.calls[0][0]).toEqual(updateQuery.table);
          expect(mockUpdate.mock.calls[0][1]).toEqual(updateQuery.selection);
          expect(mockUpdate.mock.calls[0][2]).toEqual(updateQuery.selectionArgs);
          expect(mockUpdate.mock.calls[0][3]).toEqual(updateQuery.modelJson);
          expect(mockUpdate.mock.calls[0][4]).toEqual(updateQuery.useExternalDb);
          done();
        });
      });

      it('should fallback to default calues if request has undefined', (done) => {
        // arrange
        const mockUpdate = jest.spyOn(db, 'update').mockImplementation((_, __, ___, ____, _____, success, error) => {
          success({});
        });
        const updateQuery = {
          table: '',
          useExternalDb: false,
          selection: '',
          selectionArgs: undefined,
          modelJson: {}
        };

        // act and assert
        dbCordovaService.update(updateQuery).subscribe(() => {
          expect(mockUpdate.mock.calls[0][0]).toEqual(updateQuery.table);
          expect(mockUpdate.mock.calls[0][1]).toEqual(updateQuery.selection);
          expect(mockUpdate.mock.calls[0][2]).toEqual([]);
          expect(mockUpdate.mock.calls[0][3]).toEqual(updateQuery.modelJson);
          expect(mockUpdate.mock.calls[0][4]).toEqual(updateQuery.useExternalDb);
          done();
        });
      });

      it('should throw error if error is thrown from plugin update method', (done) => {
        // arrange
        db.update = jest.fn((_, __, ___, ____, _____, success, error) => {
          error({});
        });
        // act and assert
        dbCordovaService.update({
          table: '',
          useExternalDb: false,
          selection: '',
          selectionArgs: [],
          modelJson: {}
        }).subscribe(() => {
        }, () => {
          expect(db.update).toHaveBeenCalled();
          done();
        });
      });

    });

    describe('insert()', () => {
      it('should successfully insert if plugin method gives success response', (done) => {
        const insertQuery = {
          table: '',
          useExternalDb: false,
          selection: '',
          selectionArgs: [],
          modelJson: {}
        };
        // arrange
        const mockInsert = jest.spyOn(db, 'insert').mockImplementation((_, __, ___, success, error) => {
          success({});
        });
        // act and assert
        dbCordovaService.insert({
          table: '',
          useExternalDb: false,
          modelJson: {}
        }).subscribe(() => {
          expect(mockInsert.mock.calls[0][0]).toEqual(insertQuery.table);
          expect(mockInsert.mock.calls[0][1]).toEqual(insertQuery.modelJson);
          expect(mockInsert.mock.calls[0][2]).toEqual(insertQuery.useExternalDb);
          done();
        });
      });

      it('should throw error if error is thrown from plugin insert method', (done) => {
        // arrange
        const insertQuery = {
          table: '',
          useExternalDb: false,
          selection: '',
          selectionArgs: [],
          modelJson: {}
        };
        // arrange
        const mockInsert = jest.spyOn(db, 'insert').mockImplementation((_, __, ___, success, error) => {
          error({});
        });
        // act and assert
        dbCordovaService.insert({
          table: '',
          useExternalDb: false,
          modelJson: {}
        }).subscribe(() => {
        }, () => {
          expect(mockInsert.mock.calls[0][0]).toEqual(insertQuery.table);
          expect(mockInsert.mock.calls[0][1]).toEqual(insertQuery.modelJson);
          expect(mockInsert.mock.calls[0][2]).toEqual(insertQuery.useExternalDb);
          done();
        });
      });

    });

    describe('read()', () => {
      it('should successfully read if plugin method gives success response', (done) => {
        // arrange
        const mockRead = jest.spyOn(db, 'read').mockImplementation((_, __, ___, ____, _____
          , ______, _______, ________, _________, __________, success, error) => {
          success({});
        });
        const readQuery = {
          distinct: true,
          table: '',
          columns: [],
          useExternalDb: false,
          selection: '',
          selectionArgs: [],
          groupBy: '',
          orderBy: '',
          having: '',
          limit: '1'
        };
        // act and assert
        dbCordovaService.read(readQuery).subscribe(() => {
          expect(mockRead.mock.calls[0][0]).toEqual(readQuery.distinct);
          expect(mockRead.mock.calls[0][1]).toEqual(readQuery.table);
          expect(mockRead.mock.calls[0][2]).toEqual(readQuery.columns);
          expect(mockRead.mock.calls[0][3]).toEqual(readQuery.selection);
          expect(mockRead.mock.calls[0][4]).toEqual(readQuery.selectionArgs);
          expect(mockRead.mock.calls[0][5]).toEqual(readQuery.groupBy);
          expect(mockRead.mock.calls[0][6]).toEqual(readQuery.having);
          expect(mockRead.mock.calls[0][7]).toEqual(readQuery.orderBy);
          expect(mockRead.mock.calls[0][8]).toEqual(readQuery.limit);
          expect(mockRead.mock.calls[0][9]).toEqual(readQuery.useExternalDb);
          done();
        });
      });

      it('should call read method with default values if request has undefined values', (done) => {
        // arrange
        const mockRead = jest.spyOn(db, 'read').mockImplementation((_, __, ___, ____, _____
          , ______, _______, ________, _________, __________, success, error) => {
          success({});
        });
        const readQuery = {
          distinct: true,
          table: '',
          columns: undefined,
          useExternalDb: false,
          selection: '',
          selectionArgs: undefined,
          groupBy: '',
          orderBy: '',
          having: '',
          limit: undefined
        };
        // act and assert
        dbCordovaService.read(readQuery).subscribe(() => {
          expect(mockRead.mock.calls[0][0]).toEqual(readQuery.distinct);
          expect(mockRead.mock.calls[0][1]).toEqual(readQuery.table);
          expect(mockRead.mock.calls[0][2]).toEqual([]);
          expect(mockRead.mock.calls[0][3]).toEqual(readQuery.selection);
          expect(mockRead.mock.calls[0][4]).toEqual([]);
          expect(mockRead.mock.calls[0][5]).toEqual(readQuery.groupBy);
          expect(mockRead.mock.calls[0][6]).toEqual(readQuery.having);
          expect(mockRead.mock.calls[0][7]).toEqual(readQuery.orderBy);
          expect(mockRead.mock.calls[0][8]).toEqual('');
          expect(mockRead.mock.calls[0][9]).toEqual(readQuery.useExternalDb);
          done();
        });
      });

      it('should throw error if error is thrown from plugin read method', (done) => {
        // arrange
        const mockRead = jest.spyOn(db, 'read').mockImplementation((_, __, ___, ____, _____
          , ______, _______, ________, _________, __________, success, error) => {
          error({});
        });
        const readQuery = {
          distinct: true,
          table: '',
          columns: undefined,
          useExternalDb: false,
          selection: '',
          selectionArgs: undefined,
          groupBy: '',
          orderBy: '',
          having: '',
          limit: undefined
        };
        // act and assert
        dbCordovaService.read(readQuery).subscribe(() => {
        }, () => {
          expect(mockRead.mock.calls[0][0]).toEqual(readQuery.distinct);
          expect(mockRead.mock.calls[0][1]).toEqual(readQuery.table);
          expect(mockRead.mock.calls[0][2]).toEqual([]);
          expect(mockRead.mock.calls[0][3]).toEqual(readQuery.selection);
          expect(mockRead.mock.calls[0][4]).toEqual([]);
          expect(mockRead.mock.calls[0][5]).toEqual(readQuery.groupBy);
          expect(mockRead.mock.calls[0][6]).toEqual(readQuery.having);
          expect(mockRead.mock.calls[0][7]).toEqual(readQuery.orderBy);
          expect(mockRead.mock.calls[0][8]).toEqual('');
          expect(mockRead.mock.calls[0][9]).toEqual(readQuery.useExternalDb);
          done();
        });
      });

    });

    describe('delete()', () => {
      it('should successfully delete if plugin method gives success response', (done) => {
        // arrange
        const mockExecute = jest.spyOn(db, 'execute').mockImplementation((_, __, success, error) => {
          success({});
        });
        const deleteQuery = {
          table: 'sample',
          useExternalDb: false,
          selection: 'id = ?',
          selectionArgs: ['1']
        };
        // act and assert
        dbCordovaService.delete(deleteQuery).subscribe(() => {
          expect(mockExecute.mock.calls[0][0].trim()).toEqual('DELETE FROM sample\n            WHERE id = 1');
          expect(mockExecute.mock.calls[0][1]).toEqual(deleteQuery.useExternalDb);
          done();
        });
      });

      it('should throw error if error is thrown from plugin delete method', (done) => {
        // arrange
        const mockExecute = jest.spyOn(db, 'execute').mockImplementation((_, __, success, error) => {
          error({});
        });
        const deleteQuery = {
          table: 'sample',
          useExternalDb: false,
          selection: 'id = ?',
          selectionArgs: ['1']
        };
        // act and assert
        dbCordovaService.delete(deleteQuery).subscribe(() => {
        }, () => {
          expect(mockExecute.mock.calls[0][0].trim()).toEqual('DELETE FROM sample\n            WHERE id = 1');
          expect(mockExecute.mock.calls[0][1]).toEqual(deleteQuery.useExternalDb);
          done();
        });
      });

    });

    describe('execute()', () => {
      it('should successfully execute if plugin method gives success response', (done) => {
        // arrange
        const mockExecute = jest.spyOn(db, 'execute').mockImplementation((_, __, success, error) => {
          success({});
        });
        // act and assert
        dbCordovaService.execute('SAMPLE_QUERY', false).subscribe(() => {
          expect(mockExecute.mock.calls[0][0].trim()).toEqual('SAMPLE_QUERY');
          expect(mockExecute.mock.calls[0][1]).toEqual(false);
          done();
        });
      });

      it('should throw error if error is thrown from plugin execute method', (done) => {
        // arrange
        const mockExecute = jest.spyOn(db, 'execute').mockImplementation((_, __, success, error) => {
          error({});
        });
        // act and assert
        dbCordovaService.execute('SAMPLE_QUERY', false).subscribe(() => {
        }, () => {
          expect(mockExecute.mock.calls[0][0].trim()).toEqual('SAMPLE_QUERY');
          expect(mockExecute.mock.calls[0][1]).toEqual(false);
          done();
        });
      });

    });

    describe('copyDatabase()', () => {
      it('should successfully invoke copyDatabase if plugin method gives success response', (done) => {
        // arrange
        const mockCopyDatabase = jest.spyOn(db, 'copyDatabase').mockImplementation((_, success, error) => {
          success({});
        });
        // act and assert
        dbCordovaService.copyDatabase('SAMPLE_PATH').subscribe(() => {
          expect(mockCopyDatabase.mock.calls[0][0].trim()).toEqual('SAMPLE_PATH');
          done();
        });
      });

      it('should throw error if error is thrown from plugin execute method', (done) => {
        // arrange
        const mockCopyDatabase = jest.spyOn(db, 'copyDatabase').mockImplementation((_, success, error) => {
          error({});
        });
        // act and assert
        dbCordovaService.copyDatabase('SAMPLE_PATH').subscribe(() => {
        }, () => {
          expect(mockCopyDatabase.mock.calls[0][0].trim()).toEqual('SAMPLE_PATH');
          done();
        });
      });

    });

    describe('open()', () => {
      it('should successfully invoke open if plugin method gives success response', (done) => {
        // arrange
        const mockOpen = jest.spyOn(db, 'open').mockImplementation((_, success, error) => {
          success({});
        });
        // act and assert
        dbCordovaService.open('SAMPLE_PATH').then(() => {
          expect(mockOpen.mock.calls[0][0]).toEqual('SAMPLE_PATH');
          done();
        });
      });

      it('should throw error if error is thrown from plugin execute method', (done) => {
        // arrange
        const mockOpen = jest.spyOn(db, 'open').mockImplementation((_, success, error) => {
          error({});
        });
        // act and assert
        dbCordovaService.open('SAMPLE_PATH').catch(() => {
          expect(mockOpen.mock.calls[0][0]).toEqual('SAMPLE_PATH');
          done();
        });
      });

    });

    describe('beginTransaction()', () => {
      it('should successfully invoke beginTransaction if plugin method gives success response', () => {
        // arrange
        db.beginTransaction = jest.fn();
        // act and assert
        dbCordovaService.beginTransaction();
        expect(db.beginTransaction).toHaveBeenCalled();

      });
    });

    describe('endTransaction()', () => {
      it('should successfully invoke endTransaction if plugin method gives success response', () => {
        // arrange
        db.endTransaction = jest.fn();
        // act and assert
        dbCordovaService.endTransaction(true);
        expect(db.endTransaction).toHaveBeenCalled();

      });
    });

    describe('init()', () => {
      it('should call onCreate method if plugin init method returns onCreate response', (done) => {
        // arrange
        db.init = jest.fn((_, __, ___, success) => {
          success({method: 'onCreate'});
        });
        jest.spyOn(db, 'execute').mockImplementation((_, __, success, error) => {
          success({});
        });
        // act and assert
        dbCordovaService.init().then(() => {
          done();
        });

      });

      it('should call onUpgrade method if plugin init method returns onUpgrade response', (done) => {
        // arrange
        db.init = jest.fn((_, __, ___, success) => {
          success({method: 'onUpgrade', oldVersion: 26, newVersion: 27});
        });
        jest.spyOn(db, 'execute').mockImplementation((_, __, success, error) => {
          success({});
        });
        // act and assert
        dbCordovaService.init().then(() => {
          done();
        });

      });

      it('should call onUpgrade method if plugin init method returns onUpgrade response', (done) => {
        // arrange
        db.init = jest.fn((_, __, ___, success) => {
          success({method: 'onTest', oldVersion: 26, newVersion: 27});
        });
        jest.spyOn(db, 'execute').mockImplementation((_, __, success, error) => {
          success({});
        });
        // act and assert
        dbCordovaService.init().then(() => {
          done();
        });

      });

      it('should call onUpgrade method if plugin init method returns onUpgrade response', (done) => {
        // arrange
        db.init = jest.fn((_, __, ___, success) => {
          success({method: 'onUpgrade', oldVersion: 26, newVersion: 27});
        });
        jest.spyOn(db, 'execute').mockImplementation((_, __, success, error) => {
          success({});
        });
        // act and assert
        dbCordovaService.init().then(() => {
          done();
        });

      });

      it('should call onUpgrade method if plugin init method returns onUpgrade response', (done) => {
        // arrange
        db.init = jest.fn((_, __, ___, success) => {
          success({method: 'onUpgrade', oldVersion: 26, newVersion: 27});
        });
        jest.spyOn(db, 'execute').mockImplementation((_, __, success, error) => {
          success({});
        });
        // act and assert
        dbCordovaService.init().then(() => {
          done();
        });

      });
    });
  }
);
