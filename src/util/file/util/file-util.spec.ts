import {FileUtil} from './file-util';

describe('fileUtil', () => {
    it('should return file extension', () => {
        expect(FileUtil.getFileExtension('var/lib/telemetry.json')).toEqual('json');
    });

    it('should return fileName from filePath', () => {
        expect(FileUtil.getFileName('var/lib/telemetry.json')).toEqual('telemetry.json');
    });

    it('should return parent directory', () => {
        expect(FileUtil.getParentDir('var/lib/telemetry.json')).toEqual('var/lib/');
    });

    it('should return directory name', () => {
        expect(FileUtil.getDirectoryName('var/lib/telemetry.json')).toEqual('lib');
    });

    it('should return temporary dir path', () => {
        expect(FileUtil.getTempDirPath('var/lib/telemetry.json')).toEqual('var/lib/telemetry.json/tmp');
    });

    it('should return free space is available or not', () => {
        expect(FileUtil.isFreeSpaceAvailable(1024, 256, 48)).toEqual(true);
    });

    it('should return directory', () => {
        expect(FileUtil.getDirecory('var/lib/telemetry.json')).toEqual('var/lib');
    });
});
