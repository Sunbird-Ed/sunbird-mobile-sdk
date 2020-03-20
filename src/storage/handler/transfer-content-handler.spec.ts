import {TransferContentHandler} from './transfer-content-handler';
import {SdkConfig} from '../../sdk-config';
import {FileService} from '../../util/file/def/file-service';
import {DbService} from '../../db';
import {EventsBusService} from '../../events-bus';
import {DeviceInfo} from '../../util/device';
import {ExistingContentAction} from '..';
import {of} from 'rxjs';
import {ValidateDestinationFolder} from './transfer/validate-destination-folder';
import {DeleteDestinationFolder} from './transfer/delete-destination-folder';
import {DeviceMemoryCheck} from './transfer/device-memory-check';
import {ValidateDestinationContent} from './transfer/validate-destination-content';
import {DuplicateContentCheck} from './transfer/duplicate-content-check';
import {CopyContentFromSourceToDestination} from './transfer/copy-content-from-source-to-destination';
import {DeleteSourceFolder} from './transfer/delete-source-folder';
import {UpdateSourceContentPathInDb} from './transfer/update-source-content-path-in-db';
import {StoreDestinationContentInDb} from './transfer/store-destination-content-in-db';
import {instance, mock} from 'ts-mockito';

jest.mock('./transfer/validate-destination-folder');
jest.mock('./transfer/delete-destination-folder');
jest.mock('./transfer/device-memory-check');
jest.mock('./transfer/validate-destination-content');
jest.mock('./transfer/duplicate-content-check');
jest.mock('./transfer/copy-content-from-source-to-destination');
jest.mock('./transfer/delete-source-folder');
jest.mock('./transfer/update-source-content-path-in-db');
jest.mock('./transfer/store-destination-content-in-db');

describe('TransferContentHandler', () => {
  let transferContentHandler: TransferContentHandler;
  const mockSdkConfig: SdkConfig = {} as Partial<SdkConfig> as SdkConfig;
  const mockFileService: FileService = instance<FileService>(mock<FileService>());
  const mockDbService: DbService = instance<DbService>(mock<DbService>());
  const mockEventsBusService: EventsBusService = instance<EventsBusService>(mock<EventsBusService>());
  const mockDeviceInfo: DeviceInfo = instance<DeviceInfo>(mock<DeviceInfo>());

  beforeAll(() => {
    transferContentHandler = new TransferContentHandler(
      mockSdkConfig,
      mockFileService,
      mockDbService,
      mockEventsBusService,
      mockDeviceInfo
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be able to create an instance of TransferContentHandler', () => {
    expect(transferContentHandler).toBeTruthy();
  });

  it('should transfer on transfer()', (done) => {
    // arrange
    const mockStepFactory = () => {
      return {
        execute: (context) => {
          return of(context);
        }
      } as any;
    };
    (ValidateDestinationFolder as jest.Mock<ValidateDestinationFolder>).mockImplementation(mockStepFactory);
    (DeleteDestinationFolder as jest.Mock<DeleteDestinationFolder>).mockImplementation(mockStepFactory);
    (DeviceMemoryCheck as jest.Mock<DeviceMemoryCheck>).mockImplementation(mockStepFactory);
    (ValidateDestinationContent as jest.Mock<ValidateDestinationContent>).mockImplementation(mockStepFactory);
    (DuplicateContentCheck as jest.Mock<DuplicateContentCheck>).mockImplementation(mockStepFactory);
    (CopyContentFromSourceToDestination as jest.Mock<CopyContentFromSourceToDestination>).mockImplementation(mockStepFactory);
    (DeleteSourceFolder as jest.Mock<DeleteSourceFolder>).mockImplementation(mockStepFactory);
    (UpdateSourceContentPathInDb as jest.Mock<UpdateSourceContentPathInDb>).mockImplementation(mockStepFactory);
    (StoreDestinationContentInDb as jest.Mock<StoreDestinationContentInDb>).mockImplementation(mockStepFactory);

    transferContentHandler = new TransferContentHandler(
      mockSdkConfig,
      mockFileService,
      mockDbService,
      mockEventsBusService,
      mockDeviceInfo
    );

    // act
    transferContentHandler.transfer({
      contentIds: [],
      existingContentAction: ExistingContentAction.KEEP_DESTINATION,
      deleteDestination: true,
      destinationFolder: 'SAMPLE_DESTINATION_FOLDER',
      shouldMergeInDestination: true,
      sourceFolder: 'SOURCE_FOLDER'
    }).subscribe(() => {
      done();
    });
  });

  it('should cancel on cancel()', (done) => {
    // act
    transferContentHandler.cancel().subscribe(() => {
      done();
    });
  });
});
