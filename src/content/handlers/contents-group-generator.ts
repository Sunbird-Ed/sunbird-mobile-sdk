import {ContentData, ContentsGroupedByPageSection, ContentSortCriteria, PageSection, SortOrder} from '..';

export interface ContentPageSectionGroupingCriteria {
    groupBy: keyof ContentData;
    combination?: {
        [key in keyof ContentData]?: string[]
    };
    sortCriteria: ContentSortCriteria;
}

export class ContentsGroupGenerator {
    static generate(
        contents: ContentData[],
        criteria: ContentPageSectionGroupingCriteria
    ): ContentsGroupedByPageSection {
        ContentsGroupGenerator.sortItems(contents, criteria.sortCriteria);

        let combination: {
            [key in keyof ContentData]?: string
        } | undefined;

        if (criteria.combination) {
            combination = {};

            for (const attribute of Object.keys(criteria.combination)) {
                if (!criteria.combination[attribute]) {
                    continue;
                }

                for (const value of criteria.combination[attribute]!) {
                    if (combination![attribute]) {
                        continue;
                    }

                    const beforeFilterLength = contents.length;
                    const filteredContents = ContentsGroupGenerator.filterContents(contents, attribute, value);
                    const afterFilterLength = filteredContents.length;

                    if (afterFilterLength && afterFilterLength <= beforeFilterLength) {
                        combination![attribute] = value;
                        contents = filteredContents;
                    }
                }
            }
        }

        const sections = Array.from(
            contents
                .reduce<Map<string, ContentData[]>>((acc, content) => {
                    if (ContentsGroupGenerator.isMultiValueAttribute(content, criteria.groupBy)) {
                        content[criteria.groupBy].forEach((value) => {
                            const c = acc.get(value) || [];
                            c.push(content);
                            acc.set(value, c);
                        });
                    } else {
                        const c = acc.get(content[criteria.groupBy]) || [];
                        c.push(content);
                        acc.set(content[criteria.groupBy], c);
                    }

                    return acc;
                }, new Map<string, ContentData[]>())
                .entries()
        ).map<PageSection>(([groupBy, contentsList]) => {
            return {
                name: groupBy,
                count: contentsList.length,
                contents: contentsList
            };
        });

        ContentsGroupGenerator.sortItems(sections, criteria.sortCriteria);

        return {
            name: criteria.groupBy as string,
            sections,
            combination
        };
    }

    private static filterContents(contents: ContentData[], attribute: string, acceptedValue: string): ContentData[] {
        return contents.filter((content) => {
            if (ContentsGroupGenerator.isMultiValueAttribute(content, attribute)) {
                return content[attribute].map((c) => (c || '').toLowerCase()).includes((acceptedValue || '').toLowerCase());
            } else {
                return (acceptedValue || '').toLowerCase() === (content[attribute] || '').toLowerCase();
            }
        });
    }

    private static isMultiValueAttribute = (content, attr) => Array.isArray(content[attr]);

    private static uniquelyAddValue = (list: any[], value: any) => !(list.indexOf(value) >= 0) && list.push(value);

    private static sortItems<T>(items: T[], sortCriteria: ContentSortCriteria): void {
        items.sort((a, b) => {
            if (!a[sortCriteria.sortAttribute] || !b[sortCriteria.sortAttribute]) {
                return 0;
            }
            const comparison = String(a[sortCriteria.sortAttribute]).localeCompare(b[sortCriteria.sortAttribute]);

            return sortCriteria.sortOrder === SortOrder.ASC ? comparison : (comparison * -1);
        });
    }
}
