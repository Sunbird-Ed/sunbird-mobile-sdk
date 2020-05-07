import {ContentData, ContentGrouped, ContentGroupingCriteria, ContentSortCriteria, SortOrder} from '..';

export class ContentGroupGenerator {
    static generate(contents: ContentData[], criteria: ContentGroupingCriteria[], contentSortCriteria?: ContentSortCriteria): ContentGrouped[] | undefined {
        criteria = [...criteria];
        const currentGroupCriteria = criteria.shift();

        if (!currentGroupCriteria) {
            return undefined;
        }

        const currentGroupCriteriaValues = [...currentGroupCriteria.values];

        if (!currentGroupCriteriaValues.length) {
            contents.forEach((content) => {
                if (ContentGroupGenerator.isMultiValueAttribute(content, currentGroupCriteria.groupAttribute)) {
                    (content[currentGroupCriteria.groupAttribute] as string[]).forEach((attr) => {
                        ContentGroupGenerator.uniquelyAddValue(currentGroupCriteriaValues, attr);
                    });
                }

                ContentGroupGenerator.uniquelyAddValue(currentGroupCriteriaValues, content[currentGroupCriteria.groupAttribute]);
            });
        }

        const groups = currentGroupCriteriaValues.reduce<ContentGrouped[]>((acc: ContentGrouped[], acceptedValue: string) => {
            const newContentSlice = ContentGroupGenerator.filterContents(contents, currentGroupCriteria.groupAttribute, acceptedValue);

            if (!newContentSlice.length) {
                return acc;
            }

            acc.push({
                attribute: currentGroupCriteria.groupAttribute,
                name: acceptedValue,
                contents: (() => {
                    if (!criteria.length && contentSortCriteria) {
                        ContentGroupGenerator.sortItems(newContentSlice, contentSortCriteria);
                        return newContentSlice;
                    }
                })(),
                groups: ContentGroupGenerator.generate(newContentSlice, criteria, contentSortCriteria)
            } as ContentGrouped);

            return acc;
        }, []);

        if (currentGroupCriteria.sortCriteria) {
            ContentGroupGenerator.sortItems(groups, currentGroupCriteria.sortCriteria);
        }

        return groups;
    }

    static filterContents(contents: ContentData[], attribute: string, acceptedValue: string): ContentData[] {
        return contents.filter((content) => {
            if (ContentGroupGenerator.isMultiValueAttribute(content, attribute)) {
                return content[attribute].includes(acceptedValue);
            } else {
                return acceptedValue === content[attribute];
            }
        });
    }

    static isMultiValueAttribute = (content, attr) => Array.isArray(content[attr]);

    static uniquelyAddValue = (list: any[], value: any) => !(list.indexOf(value) > 0) && list.push(value);

    static sortItems<T>(items: T[], sortCriteria: ContentSortCriteria): void {
        items.sort((a, b) => {
            if (!a[sortCriteria.sortAttribute] || !b[sortCriteria.sortAttribute]) {
                return 0;
            }
            const comparison = String(a[sortCriteria.sortAttribute]).localeCompare(b[sortCriteria.sortAttribute]);

            return sortCriteria.sortOrder === SortOrder.ASC ? comparison : (comparison * -1);
        });
    }
}
