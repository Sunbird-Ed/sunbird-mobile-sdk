import {Path} from './path';

describe('path', () => {
    it('should return dirPath from filePath', () => {
        expect(Path.dirPathFromFilePath('var/lib/telemetry.json')).toEqual('var/lib');
    });

    it('should return fileName from filePath', () => {
        expect(Path.fileNameFromFilePath('var/lib/telemetry.json')).toEqual('telemetry.json');
    });
});
