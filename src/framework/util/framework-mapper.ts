import {CategoryAssociation, Framework, FrameworkCategory} from '..';

export class FrameworkMapper {
    public static prepareFrameworkCategoryAssociations(framework: Framework): Framework {
        if (!framework.categories) {
            return framework;
        }

        framework.categories = framework.categories.map((category: FrameworkCategory, categoryIndex: number) => {
            if (!category.terms) {
                return category;
            }

            return {
                ...category,
                terms: category.terms.map((term) => {
                    if (!term.associations) {
                        return term;
                    }
                    if (term.associations.length) {
                        term.associations = term.associations.filter((association: CategoryAssociation) => {
                            return (categoryIndex >= framework.categories!.length - 1)
                                || (association.category === framework.categories![categoryIndex + 1].code);
                        });
                    }

                    return term;
                })
            };
        });

        return {...framework};
    }

    public static prepareFrameworkTranslations(framework: Framework, language: string): Framework {
        framework.name = FrameworkMapper.getTranslatedValue(framework.translations, language, framework.name);

        if (framework.categories) {
            framework.categories = framework.categories
                .map((category: FrameworkCategory) => {
                    category.name = FrameworkMapper.getTranslatedValue(category.translations, language, category.name);

                    if (category.terms) {
                        category.terms = category.terms
                            .map((term) => {
                                term.name = FrameworkMapper.getTranslatedValue(term.translations, language, term.name);

                                return term;
                            });
                    }

                    return category;
                });

        }

        return framework;
    }

    public static prepareFrameworkCategoryTranslations(frameworkCategory: FrameworkCategory, language: string): FrameworkCategory {
        frameworkCategory.name = FrameworkMapper.getTranslatedValue(frameworkCategory.translations, language, frameworkCategory.name);

        if (frameworkCategory.terms) {
            frameworkCategory.terms = frameworkCategory.terms
                .map((term) => {
                    term.name = FrameworkMapper.getTranslatedValue(term.translations, language, term.name);

                    return term;
                });
        }

        return frameworkCategory;
    }

    private static getTranslatedValue(translations: string | undefined, language: string, defaultTranslation: string): string {
        if (!translations) {
            return defaultTranslation;
        }

        const translationsObj = JSON.parse(translations);

        return translationsObj[language] || defaultTranslation;
    }
}
