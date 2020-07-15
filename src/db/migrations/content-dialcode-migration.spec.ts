import {ContentDialcodeMigration} from './content-dialcode-migration';
import {DbService} from '..';
import {of, throwError} from 'rxjs';
import {mockContentsWithDialcodesAndChildNodes, mockContentsWithOnlyDialcodes, mockContentsWithOnlyChildNodes} from './content-dialcode-migration.spec.data';
import {ContentEntry} from '../../content/db/schema';

describe('ContentDialcodeMigration', () => {
    let contentDialcodeMigration: ContentDialcodeMigration;

    beforeAll(() => {
        contentDialcodeMigration = new ContentDialcodeMigration();
    });

    it('should be able to create an instance', () => {
        expect(contentDialcodeMigration).toBeTruthy();
    });

    describe('apply', () => {
        const mockDbService: Partial<DbService> = {};

        beforeEach(() => {
            mockDbService.beginTransaction = jest.fn().mockImplementation();
            mockDbService.endTransaction = jest.fn().mockImplementation();
            mockDbService.execute = jest.fn().mockImplementation(() => of([]));
        });

        it('should alter content table adding dialcodes, childNodes fields', (done) => {
            // arrange
            mockDbService.read = jest.fn().mockImplementation(() => of([]));

            contentDialcodeMigration.apply(mockDbService as DbService).then(() => {
                expect(mockDbService.execute).toHaveBeenCalledWith(
                    `ALTER TABLE ${ContentEntry.TABLE_NAME} ADD COLUMN ${ContentEntry.COLUMN_NAME_DIALCODES} TEXT DEFAULT ''`
                );
                expect(mockDbService.execute).toHaveBeenCalledWith(
                    `ALTER TABLE ${ContentEntry.TABLE_NAME} ADD COLUMN ${ContentEntry.COLUMN_NAME_CHILD_NODES} TEXT DEFAULT ''`
                );
                done();
            });
        });

        it('should alter content table adding only dialcodes if only dialcodes are present', (done) => {
            // arrange
            mockDbService.read = jest.fn().mockImplementation(() => of(mockContentsWithOnlyDialcodes));

            contentDialcodeMigration.apply(mockDbService as DbService).then(() => {
                expect(mockDbService.execute).toHaveBeenNthCalledWith(3, `UPDATE content SET  dialcodes = CASE identifier  WHEN 'do_31265486640564633624236' THEN '~6peljn~'  WHEN 'do_31265487059430604824244' THEN '~6pxdmy~'  WHEN 'do_31265489676498534424285' THEN '~6q79pl~'  WHEN 'do_31265489676503449624291' THEN '~6qg5r9~'  WHEN 'do_31265545857358233614426' THEN '~6qq1sw~'  WHEN 'do_31265486843274035224240' THEN '~6pnhlb~'  ELSE '' END    WHERE identifier IN('do_31265486640564633624236','do_31265487059430604824244','do_31265489676498534424285','do_31265489676503449624291','do_31265545857358233614426','do_31265486843274035224240');`);
                done();
            });
        });

        it('should alter content table adding only childNodes if only childNodes are present', (done) => {
            // arrange
            mockDbService.read = jest.fn().mockImplementation(() => of(mockContentsWithOnlyChildNodes));

            contentDialcodeMigration.apply(mockDbService as DbService).then(() => {
                expect(mockDbService.execute).toHaveBeenNthCalledWith(3, `UPDATE content SET    child_nodes = CASE identifier  WHEN 'do_31265486640564633624236' THEN '~do_312584802481479680214955~do_3126146956920504321673~do_3126151516209233922923~do_31261803523075276811260~do_31265486843274035224240~do_31265486843274854424241~do_31265486843275673624242~do_31265487059430604824244~do_31265489676498534424284~do_31265489676498534424285~do_31265489676499353624286~do_31265489676500172824287~do_31265489676500992024288~do_31265489676501811224289~do_31265489676502630424290~do_31265489676503449624291~do_31265545857354956814423~do_31265545857355776014424~do_31265545857357414414425~do_31265545857358233614426~do_31265545857359052814427~do_31265545857359872014428~do_31265545857360691214429~do_31265545857361510414430~do_31265545857361510414431~do_31265545857363148814432~do_31265547281579212824487~do_31265547281580851224488~do_31265547281581670424489~do_31265547281582489624490~do_31265547281583308824491~do_31265547281584128024492~do_31266041863930675211552~'  ELSE '' END  WHERE identifier IN('do_31265486640564633624236','do_31265487059430604824244','do_31265489676498534424285','do_31265489676503449624291','do_31265545857358233614426','do_31265486843274035224240');`);
                done();
            });
        });

        it('should update dialcode, childNodes fields of content table entries if any in ContentData', (done) => {
            // arrange
            mockDbService.read = jest.fn().mockImplementation(() => of(mockContentsWithDialcodesAndChildNodes));

            contentDialcodeMigration.apply(mockDbService as DbService).then(() => {
                expect(mockDbService.execute).toHaveBeenNthCalledWith(3, `UPDATE content SET  dialcodes = CASE identifier  WHEN 'do_31265486640564633624236' THEN '~6peljn~'  WHEN 'do_31265487059430604824244' THEN '~6pxdmy~'  WHEN 'do_31265489676498534424285' THEN '~6q79pl~'  WHEN 'do_31265489676503449624291' THEN '~6qg5r9~'  WHEN 'do_31265545857358233614426' THEN '~6qq1sw~'  WHEN 'do_31265486843274035224240' THEN '~6pnhlb~'  ELSE '' END  ,  child_nodes = CASE identifier  WHEN 'do_31265486640564633624236' THEN '~do_312584802481479680214955~do_3126146956920504321673~do_3126151516209233922923~do_31261803523075276811260~do_31265486843274035224240~do_31265486843274854424241~do_31265486843275673624242~do_31265487059430604824244~do_31265489676498534424284~do_31265489676498534424285~do_31265489676499353624286~do_31265489676500172824287~do_31265489676500992024288~do_31265489676501811224289~do_31265489676502630424290~do_31265489676503449624291~do_31265545857354956814423~do_31265545857355776014424~do_31265545857357414414425~do_31265545857358233614426~do_31265545857359052814427~do_31265545857359872014428~do_31265545857360691214429~do_31265545857361510414430~do_31265545857361510414431~do_31265545857363148814432~do_31265547281579212824487~do_31265547281580851224488~do_31265547281581670424489~do_31265547281582489624490~do_31265547281583308824491~do_31265547281584128024492~do_31266041863930675211552~'  ELSE '' END  WHERE identifier IN('do_31265486640564633624236','do_31265487059430604824244','do_31265489676498534424285','do_31265489676503449624291','do_31265545857358233614426','do_31265486843274035224240');`);
                done();
            });
        });

        it('should not update dialcode, childNodes fields of content table if neither dialcode, childNodes present', (done) => {
            // arrange
            mockDbService.read = jest.fn().mockImplementation(() => of([]));

            contentDialcodeMigration.apply(mockDbService as DbService).then(() => {
                expect(mockDbService.execute).not.toHaveBeenCalledTimes(3);
                done();
            });
        });

        it('should end transaction if any error occurs inbetween', (done) => {
            // arrange
            mockDbService.read = jest.fn().mockImplementation(() => throwError([]));

            contentDialcodeMigration.apply(mockDbService as DbService).then(() => {
            }).catch(() => {
                expect(mockDbService.endTransaction).toHaveBeenCalled();
                done();
            });
        });
    });
});
