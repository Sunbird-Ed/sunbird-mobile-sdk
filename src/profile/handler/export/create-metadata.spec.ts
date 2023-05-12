import { CreateMetaData } from './create-metadata';
import { DbService, DeviceInfo } from '../../..';
import { FileService } from '../../../util/file/def/file-service';
import { ExportProfileContext } from '../../def/export-profile-context';
import { of } from 'rxjs';
import { UniqueId } from '../../../db/util/unique-id';

describe('CreateMetaData', () => {
    let createMetaData: CreateMetaData;
    const mockDbService: Partial<DbService> = {};
    const mockFileService: Partial<FileService> = {};
    const mockDeviceInfo: Partial<DeviceInfo> = {};

    beforeAll(() => {
        createMetaData = new CreateMetaData(
            mockDbService as DbService,
            mockFileService as FileService,
            mockDeviceInfo as DeviceInfo
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of CreateMetaData', () => {
        expect(createMetaData).toBeTruthy();
    });

    it('should generate metadata and populate metadata', () => {
        // arrange
        const request: ExportProfileContext = {
            userIds: ['sample-user-id'],
            groupIds: ['group-1', 'group-2'],
            destinationFolder: 'dest/folder/file',
            destinationDBFilePath: 'dest/db/file/path',
            size: '32MB'
        };
        mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => 'device-id');
        mockDbService.open = jest.fn().mockImplementation(() => Promise.resolve(undefined));
        mockDbService.execute = jest.fn().mockImplementation(() => of({}));
        mockDbService.insert = jest.fn().mockImplementation(() => of(1));
        jest.spyOn(UniqueId, 'generateUniqueId').mockImplementation(() => 'SECRET')
        // act
        createMetaData.execute(request).then(() => {
            // assert
            expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
            expect(mockDbService.open).toHaveBeenCalledWith(request.destinationDBFilePath);
            expect(mockDbService.execute).toHaveBeenCalled();
            expect(mockDbService.insert).toHaveBeenCalled();
        }).catch((e) => {
            console.error(e);
            fail(e);
        });
    });

    it('should generate metadata and populate metadata for error part', (done) => {
        // arrange
        const request: ExportProfileContext = {
            userIds: ['sample-user-id'],
            groupIds: ['group-1', 'group-2'],
            destinationFolder: 'dest/folder/file',
            destinationDBFilePath: 'dest/db/file/path',
            size: '32MB'
        };
        mockDeviceInfo.getDeviceID = jest.fn().mockImplementation(() => 'device-id');
        mockDbService.open = jest.fn().mockImplementation(() => Promise.reject(undefined));
        mockDbService.execute = jest.fn().mockImplementation(() => of({}));
        mockDbService.insert = jest.fn().mockImplementation(() => of(1));
        // act
        createMetaData.execute(request).catch((e) => {
            // assert
            expect(mockDeviceInfo.getDeviceID).toHaveBeenCalled();
            // expect(mockDbService.open).toHaveBeenCalledWith(request.destinationDBFilePath);
            done();
        });
    });
});
