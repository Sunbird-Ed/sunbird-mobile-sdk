import {DbService} from '../../../../native/db';
import {ImportContentContext} from '../../index';
import {ContentEntry} from '../../db/schema';
import Queue from 'typescript-collections/dist/lib/Queue';
import {ContentUtil} from '../../util/content-util';
import {ImportNExportHandler} from '../import-n-export-handler';
import {DeviceInfo} from '../../../../native/device/def/device-info';
import {FileService} from '../../../../native/file/def/file-service';
import {Response} from '../../../../native/http';

export class CreateContentImportManifest {

    private readonly MANIFEST_FILE_NAME = 'manifest.json';
    private contentDataMap: { [key: string]: any } = {};

    constructor(private dbService: DbService,
                private deviceInfo: DeviceInfo,
                private fileService: FileService) {
    }

    async execute(importContentContext: ImportContentContext): Promise<Response> {
        const data = await this.fileService.readAsText(importContentContext.tmpLocation!, this.MANIFEST_FILE_NAME);
        const manifestJson = JSON.parse(data);
        const archive = manifestJson.archive;
        const items = archive.items;

        items.forEach((item) => {
            this.contentDataMap[item.identifier] = item;
        });

        const response: Response = new Response();
        try {
            await this.createnWriteManifest(importContentContext.identifiers!, importContentContext.destinationFolder);
            response.body = importContentContext;
            return Promise.resolve(response);
        } catch (e) {
            console.error(e);
            return Promise.reject(response);
        }
    }

    private async createnWriteManifest(identifiers: string[], destinationFolder: string) {
        const importnExportHandler = new ImportNExportHandler(this.deviceInfo);
        const fileMapList: { [key: string]: any }[] = [];

        for (const identifier of identifiers) {
            const item = this.contentDataMap[identifier];
            const queue: Queue<ContentEntry.SchemaMap> = new Queue();
            queue.add(item);
            let node: { [key: string]: any };
            let contentWithAllChildren: { [key: string]: any }[] = [];
            contentWithAllChildren.push(item);
            while (!queue.isEmpty()) {
                node = queue.dequeue()!;

                if (ContentUtil.hasChildren(node)) {
                    const childContentsIdentifiers: string[] = ContentUtil.getChildContentsIdentifiers(node);
                    if (childContentsIdentifiers && childContentsIdentifiers.length) {
                        const childItems: { [key: string]: any }[] = [];
                        childContentsIdentifiers.forEach((contentId) => {
                            const childItem = this.contentDataMap[contentId];
                            if (childItem) {
                                queue.add(childItem);
                                childItems.push(childItem);
                            }
                        });
                        contentWithAllChildren = contentWithAllChildren.concat(childItems);
                    }
                }
            }
            const items: any[] = importnExportHandler.populateItemList(contentWithAllChildren);
            const manifest: { [key: string]: any } = importnExportHandler.generateManifestForArchive(items);

            const fileMap: { [key: string]: any } = {};
            fileMap['path'] = ContentUtil.getBasePath(ContentUtil.getContentRootDir(destinationFolder).concat('/', identifier, '/'));
            fileMap['fileName'] = this.MANIFEST_FILE_NAME;
            fileMap['data'] = JSON.stringify(manifest);

            fileMapList.push(fileMap);
        }

        await this.writeFile(fileMapList);
    }

    // TODO: move this method to file-service
    private async writeFile(fileMapList: any[]) {
        return new Promise((resolve, reject) => {
            buildconfigreader.writeFile(fileMapList,
                (entry) => {
                    resolve();
                }, err => {
                    console.error(err);
                    reject(err);
                });
        });
    }
}
