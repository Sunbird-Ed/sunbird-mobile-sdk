import {CategoryAssociation, Framework, FrameworkCategory} from '..';

export class FrameworkMapper {
    public static prepareCategoryAssociations(framework: Framework): Framework {
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

                    term.associations = term.associations.filter((association: CategoryAssociation) => {
                        return (categoryIndex >= framework.categories!.length - 1)
                            || (association.category === framework.categories![categoryIndex + 1].code);
                    });

                    return term;
                })
            };
        });

        return {...framework};
    }
}
