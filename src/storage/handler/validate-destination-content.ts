import {Observable} from 'rxjs';
import {FileService} from '../../util/file/def/file-service';
import {AppConfig} from '../../api/config/app-config';
import {TransferContentContext} from './transfer-content-handler';
import {ContentUtil} from '../../content/util/content-util';
import {Entry} from '../../util/file';
import {Visibility} from '../../content';

interface Manifest {
    version: string;
    archive: {
        items: {
            status: string
            expires: string
        }[];
    };
}

export class ValidateDestinationContent {
    private static readonly MANIFEST_FILE_NAME = 'manifest.json';

    constructor(private fileService: FileService) {
    }

    execute(appConfig: AppConfig, context: TransferContentContext): Observable<TransferContentContext> {
        return Observable.defer(async () => {
            context.validContentIdsInDestination =
                await this.getSubdirectoriesEntries(ContentUtil.getContentRootDir(context.destinationFolder!))
                    .then((entries) => this.extractValidContentIdsInDestination(appConfig, entries));
            return context;
        });
    }

    private async getSubdirectoriesEntries(directoryPath: string): Promise<Entry[]> {
        return this.fileService.listDir(directoryPath)
            .then(entries => entries
                .filter(e => e.isDirectory)
            );
    }

    private async extractValidContentIdsInDestination(appConfig: AppConfig, entries: Entry[]) {
        const validContentIdsInDestination: string[] = [];

        for (const entry of entries) {
            const manifest = await this.extractManifest(entry);
            if (this.validateManifest(appConfig, manifest)) {
                validContentIdsInDestination.push(entry.name);
            }
        }

        return validContentIdsInDestination;
    }

    private async extractManifest(directoryEntry: Entry): Promise<Manifest> {
        const manifestStringified = await this.fileService.readAsText(
            directoryEntry.nativeURL, ValidateDestinationContent.MANIFEST_FILE_NAME);
        return JSON.parse(manifestStringified);
    }


    private validateManifest(appConfig, manifest: Manifest): boolean {
        return manifest.version !== '1.0' &&
            !!manifest['archive'] &&
            !!manifest['archive']['items'] &&
            !!manifest['archive']['items'].length &&
            this.validateItems(appConfig, manifest['archive']['items']);
    }

    private validateItems(appConfig: AppConfig, items: any[]): boolean {
        return items.every((item) =>
            ContentUtil.readVisibility(item) === Visibility.PARENT ||
            ContentUtil.isCompatible(appConfig, ContentUtil.readCompatibilityLevel(item))
        ) && items.every((item) => ContentUtil.isDraftContent(item.status) && ContentUtil.isExpired(item.expires));
    }
}
