import { of } from 'rxjs';
import { DeleteProfileDataHandler } from './delete-profile-data.handler';
import { DbService } from '../../db';

// Mocking DbService
const mockDbService: Partial<DbService> = {
  beginTransaction: jest.fn(),
  delete: jest.fn(),
  execute: jest.fn(),
  endTransaction: jest.fn(),
  
};

describe('DeleteProfileDataHandler', () => {
  let deleteProfileDataHandler;

  beforeEach(() => {
    deleteProfileDataHandler = new DeleteProfileDataHandler(
        mockDbService as DbService
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('should be create a instance of deleteProfileDataHandler', () => {
    expect(deleteProfileDataHandler).toBeTruthy();
  });


  it('should delete profile data successfully', (done) => {
    //arrange
    const uid = 'testUid'; 
    mockDbService.beginTransaction = jest.fn();
    mockDbService.delete = jest.fn(() => of(undefined));
    mockDbService.execute = jest.fn(() => of({value: 'sample-data'}))

    //act
    deleteProfileDataHandler.delete(uid).subscribe((data) => {
    expect(mockDbService.beginTransaction).toHaveBeenCalled();
    expect(mockDbService.delete).toHaveBeenCalled();

    //assert
    setTimeout(() => {
        expect(mockDbService.endTransaction).toHaveBeenCalledWith(true);
        expect(mockDbService.execute).toHaveBeenCalled();
        expect(data).toBe(true);
        done();
        }, 10); 
        })
  });

  it('should handle errors during deletion',  (done) => {
    //arrange
    mockDbService.beginTransaction = jest.fn();
    mockDbService.delete = jest.fn(() => of(undefined));
    mockDbService.execute = jest.fn(() => of({value : "sample"}))
    const uid = 'testUid';

    //act
    deleteProfileDataHandler.delete(uid).subscribe((data) => {
        expect(mockDbService.beginTransaction).toHaveBeenCalled();
        expect(mockDbService.delete).toHaveBeenCalled();

        //assert
        setTimeout(() => {
        expect(mockDbService.endTransaction).toHaveBeenCalledWith(false);
        expect(mockDbService.execute).not.toHaveBeenCalled();
        expect(data).toBe(false);
            done();
          }, 10); 
          })   
  });
});
