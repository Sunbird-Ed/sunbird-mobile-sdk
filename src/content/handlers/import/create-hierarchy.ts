import {FileService} from '../../../util/file/def/file-service';
import {ChildContent, Content, ContentData, FileName, HierarchyInfo, ImportContentContext, Visibility} from '../..';
import {Response} from '../../../api';
import {ContentMapper} from '../../util/content-mapper';
import {ContentUtil} from '../../util/content-util';
import {GetContentDetailsHandler} from '../get-content-details-handler';
import {DbService} from '../../../db';
import {ContentEntry} from '../../db/schema';
import COLUMN_NAME_PATH = ContentEntry.COLUMN_NAME_PATH;

export class CreateHierarchy {

    private readonly HIERARCHY_FILE_NAME = 'hierarchy.json';
    private contentMap: { [key: string]: any } = {};

    constructor(private dbService: DbService,
                private fileService: FileService) {
    }

    public async execute(importContentContext: ImportContentContext): Promise<Response> {
        const data = await this.fileService.readAsText(importContentContext.tmpLocation!, FileName.MANIFEST.valueOf());
        const manifestJson = JSON.parse(data);
        const archive = manifestJson.archive;
        const items = archive.items;
        let rootContentId: string;

        items.forEach((item) => {
            const content: Content = ContentMapper.mapServerResponseToContent(item);
            const visibility = ContentUtil.readVisibility(item);

            if (!ContentUtil.isNotUnit(item.mimeType, visibility)) {
                content.isAvailableLocally = true;
            }

            if (visibility === Visibility.DEFAULT.valueOf()) {
                rootContentId = item.identifier;
            }
            this.contentMap[content.identifier] = content;
        });

        const hierarchyInfoList: HierarchyInfo[] = [];
        const rootContent: Content = this.contentMap[rootContentId!];
        this.createTextBookHierarchy(rootContent, hierarchyInfoList);

        const contentInDb = await this.dbService.read(GetContentDetailsHandler.getReadContentQuery(rootContentId!)).toPromise();
        await this.fileService.writeFile(ContentUtil.getBasePath(contentInDb[0][COLUMN_NAME_PATH]!),
            this.HIERARCHY_FILE_NAME,
            JSON.stringify(rootContent),
            {replace: true});

        const response: Response = new Response();
        response.body = importContentContext;
        return Promise.resolve(response);
    }

    /**
     * fetchChildrenOfContent()
     * @param content
     */
    private createTextBookHierarchy(content: Content, sourceInfoList?: HierarchyInfo[]): Content {
        // const childContentModels: ContentEntry.SchemaMap[] =
        //     await this.getSortedChildrenList(contentInDb[ContentEntry.COLUMN_NAME_LOCAL_DATA], ChildContents.ALL);

        const sortedChildContents: Content[] = this.getSortedChildrenList(content.contentData);

        if (sortedChildContents && sortedChildContents.length) {
            let hierarchyInfoList: HierarchyInfo[] = [];
            hierarchyInfoList = hierarchyInfoList.concat(sourceInfoList!);
            hierarchyInfoList.push({
                identifier: content.identifier,
                contentType: content.contentType
            });
            content.hierarchyInfo = hierarchyInfoList!;

            // if (level === -1 || currentLevel <= level) {
            const childContents: Content[] = [];
            for (const element of sortedChildContents) {
                const childContentModel = element as Content;
                const childContent: Content = this.createTextBookHierarchy(childContentModel,
                    // currentLevel + 1,
                    // level,
                    hierarchyInfoList);
                childContents.push(childContent);
            }
            content.children = childContents;
            // }
        } else {
            content.hierarchyInfo = sourceInfoList;
        }

        return content;
    }

    private getSortedChildrenList(localData: ContentData): Content[] {
        let childContents: ChildContent[] = localData['children'];
        if (!childContents || !childContents.length) {
            return [];
        }

        childContents = childContents.sort((childContent1, childContent2) => {
            return (childContent1.index - childContent2.index);
        });

        const sortedChildContents: Content[] = [];
        childContents.forEach(childContent => {
            const contentInMap = this.contentMap[childContent.identifier];
            if (contentInMap) {
                sortedChildContents.push(contentInMap);
            }
        });

        return sortedChildContents;
    }
}
