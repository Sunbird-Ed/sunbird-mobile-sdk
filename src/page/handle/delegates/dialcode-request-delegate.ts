import {ApiRequestHandler} from '../../../api';
import {PageAssembleCriteria} from '../..';
import {PageAssemble} from '../..';
import {defer, Observable} from 'rxjs';
import {DefaultRequestDelegate} from './default-request-delegate';
import {ContentData} from '../../../content';
import {DbService} from '../../../db';
import {ContentEntry} from '../../../content/db/schema';
import {ContentMapper} from '../../../content/util/content-mapper';

export class DialcodeRequestDelegate implements ApiRequestHandler<PageAssembleCriteria, PageAssemble> {
    constructor(
        private defaultDelegate: DefaultRequestDelegate,
        private dbService: DbService
    ) {
    }

    handle(request: PageAssembleCriteria): Observable<PageAssemble> {
        return defer(async () => {
            let pageAssemble: PageAssemble | undefined;

            try {
                pageAssemble = await this.defaultDelegate.handle(request).toPromise();
            } catch (e) {
                console.error(e);
            }

            if (request.filters && request.filters.dialcodes) {
                const query = `SELECT c.* FROM content c WHERE ref_count > 0 AND dialcodes LIKE '%%~${request.filters.dialcodes}~%%'`;
                const localContents = ((await this.dbService.execute(query).toPromise()) as ContentEntry.SchemaMap[])
                    .map((e) => ContentMapper.mapContentDBEntryToContent(e).contentData);

                if (pageAssemble && pageAssemble.sections[0] && localContents.length) {
                    pageAssemble = await this.mergePageAssembleWithLocalContents(
                        pageAssemble,
                        localContents
                    );
                } else if (!pageAssemble && localContents.length) {
                    pageAssemble = await this.buildPageAssembleWithLocalContents(
                        localContents
                    );
                }
            }

            if (!pageAssemble) {
                throw new Error('NO_DATA');
            }

            return pageAssemble;
        });
    }

    private async buildPageAssembleWithLocalContents(
        localContents: ContentData[]
    ): Promise<PageAssemble | undefined> {
        const tempPageAssemble = {
            name: '',
            id: '',
            sections: [
                {
                    display: '',
                    count: 0,
                    index: 0,
                    sectionDataType: '',
                    resmsgId: '',
                    searchQuery: '',
                    name: '',
                    id: '',
                    apiId: '',
                    group: 0,
                    contents: localContents
                }
            ]
        } as Partial<PageAssemble>;

        return this.mergePageAssembleWithLocalCollections(
            tempPageAssemble as PageAssemble,
            localContents
        );
    }

    private async mergePageAssembleWithLocalContents(
        pageAssemble: PageAssemble,
        localContents: ContentData[]
    ): Promise<PageAssemble> {
        // dialcode to have utmost one section
        const section = pageAssemble.sections[0];

        if (section.contents && section.contents.length) {
            const localContentsDiff = localContents.filter((localContent) => {
                return !section.contents!.find(
                    responseContent => responseContent.identifier === localContent.identifier
                );
            });

            if (localContentsDiff.length) {
                section.contents = [
                    ...localContentsDiff,
                    ...section.contents
                ];

                pageAssemble = await this.mergePageAssembleWithLocalCollections(
                    pageAssemble,
                    localContentsDiff,
                );
            }
        } else {
            section.contents = localContents;

            pageAssemble = await this.mergePageAssembleWithLocalCollections(
                pageAssemble,
                localContents,
            );
        }

        return pageAssemble;
    }

    private async mergePageAssembleWithLocalCollections(
        pageAssemble: PageAssemble,
        localContents: ContentData[],
    ): Promise<PageAssemble> {
        // dialcode to have utmost one section
        const section = pageAssemble.sections[0];

        if (!section.collections) {
            section.collections = [];
        }

        for (const content of localContents) {
            const query = `SELECT c.* FROM content c WHERE c.visibility = 'Default' AND ref_count > 0 AND child_nodes LIKE '%%~${content.identifier}~%%'`;
            const localCollectionsContainingContent = ((await this.dbService.execute(query).toPromise()) as ContentEntry.SchemaMap[])
                .map((e) => ContentMapper.mapContentDBEntryToContent(e).contentData);

            if (localCollectionsContainingContent.length) {
                for (const localCollection of localCollectionsContainingContent) {
                    const existingResponseCollection: ContentData | undefined = section.collections!.find((responseCollection) => {
                        return responseCollection.identifier === localCollection.identifier;
                    });

                    if (existingResponseCollection) {
                        if (!(existingResponseCollection.childNodes.indexOf(content.identifier) >= 0)) {
                            existingResponseCollection.childNodes.push(content.identifier);
                        }
                    } else {
                        section.collections!.push({
                            ...localCollection,
                            childNodes: [content.identifier]
                        } as ContentData);
                    }
                }
            }
        }

        return pageAssemble;
    }
}
