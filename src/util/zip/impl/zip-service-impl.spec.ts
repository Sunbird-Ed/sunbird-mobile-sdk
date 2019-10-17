import {Container} from "inversify";
import {ZipService} from "../def/zip-service";
import {InjectionTokens} from "../../../injection-tokens";
import {ZipServiceImpl} from "./zip-service-impl";

describe('ZipServiceImpl', () => {
    let zipService: ZipService;
    const container = new Container();

    beforeAll(() => {
        container.bind<ZipService>(InjectionTokens.ZIP_SERVICE).to(ZipServiceImpl);

        zipService = container.get(InjectionTokens.ZIP_SERVICE);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    describe('unzip()', function () {
        it('should delegate to cordova JJzip.unzip', (done) => {
            // arrange
            spyOn(window['JJzip'], 'unzip').and.callFake((a, b, c, d) => {
                setTimeout(() => c(), 0)
            });

            // act
            zipService.unzip('SOME_ZIP', {}, () => {
                done()
            });
        });

        it('should delegate to cordova JJzip.unzip', (done) => {
            // arrange
            spyOn(window['JJzip'], 'unzip').and.callFake((a, b, c, d) => {
                setTimeout(() => d(), 0)
            });

            // act
            zipService.unzip('SOME_ZIP', {}, null, () => {
                done()
            });
        });
    });

    describe('zip()', function () {
        it('should delegate to cordova JJzip.zip', (done) => {
            // arrange
            spyOn(window['JJzip'], 'zip').and.callFake((a, b, c, d, e, f) => {
                setTimeout(() => e(), 0)
            });

            // act
            zipService.zip('SOME_ZIP', {}, [], [], () => {
                done()
            });
        });

        it('should delegate to cordova JJzip.zip', (done) => {
            // arrange
            spyOn(window['JJzip'], 'zip').and.callFake((a, b, c, d, e, f) => {
                setTimeout(() => f(), 0)
            });

            // act
            zipService.zip('SOME_ZIP', {}, [], [], null, () => {
                done()
            });
        });
    });
});
