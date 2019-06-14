import {Observable} from 'rxjs';
import {FileService} from '../../util/file/def/file-service';
import {AppConfig} from '../../api/config/app-config';
import {Manifest, TransferContentContext} from './transfer-content-handler';
import {ContentUtil} from '../../content/util/content-util';
import {Entry} from '../../util/file';
import {Visibility} from '../../content';

export class ValidateDestinationContent {
    private static readonly MANIFEST_FILE_NAME = 'manifest.json';

    constructor(private fileService: FileService,
                private appConfig: AppConfig) {
    }

    execute(context: TransferContentContext): Observable<TransferContentContext> {
        return Observable.defer(async () => {
            context.validContentIdsInDestination =
                await this.getSubdirectoriesEntries(ContentUtil.getContentRootDir(context.destinationFolder!))
                    .then((entries) => this.extractValidContentIdsInDestination(entries));
            return context;
        });
    }

    private async getSubdirectoriesEntries(directoryPath: string): Promise<Entry[]> {
        return this.fileService.listDir(directoryPath)
            .then(entries => entries
                .filter(e => e.isDirectory)
            );
    }

    private async extractValidContentIdsInDestination(entries: Entry[]) {
        const validContentIdsInDestination: string[] = [];

        for (const entry of entries) {
            const manifest = await this.extractManifest(entry);
            if (this.validateManifest(manifest)) {
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


    private validateManifest(manifest: Manifest): boolean {
        return manifest.version !== '1.0' &&
            !!manifest['archive'] &&
            !!manifest['archive']['items'] &&
            !!manifest['archive']['items'].length &&
            this.validateItems(manifest['archive']['items']);
    }

    private validateItems(items: any[]): boolean {
        return items.every((item) =>
            ContentUtil.readVisibility(item) === Visibility.PARENT ||
            ContentUtil.isCompatible(this.appConfig, ContentUtil.readCompatibilityLevel(item))
        ) && items.every((item) => ContentUtil.isDraftContent(item.status) && ContentUtil.isExpired(item.expires));
    }
}
