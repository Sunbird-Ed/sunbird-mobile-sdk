import {DeleteTempDir} from './deletete-temp-dir';

declare const sbutility;

describe('DeleteTempDir', () => {
    let deleteTempDir: DeleteTempDir;

    beforeAll(() => {
        deleteTempDir = new DeleteTempDir();
    });

    it('should create a instance of DeleteTempDir', () => {
        expect(deleteTempDir).toBeTruthy();
    });

    it('should remove content from specific location', (done) => {
        const request = {
            destinationFolder: 'tmp/sample/location'
        } as any;
        sbutility.rm = jest.fn((_, __, cb, err) => cb({body: {id: 'do-123'}}));
        // act
        deleteTempDir.execute(request).then((data) => {
            expect(data.body).toStrictEqual({destinationFolder: 'tmp/sample/location'});
            done();
        });
    });

    it('should not remove content from specific location for error part', (done) => {
        const request = {
            destinationFolder: 'path-not-found'
        } as any;
        sbutility.rm = jest.fn((_, __, cb, err) => err({error: 'error'}));
        // act
        deleteTempDir.execute(request).then((e) => {
            expect(e.body).toStrictEqual({destinationFolder: 'path-not-found'});
            done();
        });
    });
});
