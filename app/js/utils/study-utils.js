import { intersection, find } from 'lodash';

/**
 * @method
 * @name computeVisibleStudies
 * @param{Array} studies
 * @param{Array} facets
 * @param {Object} filteredFacetItemsObj
 * @return{Array} visibleStudies
 * @description given a list of studies it filters them on the basis of the filtered facets as specified in filteredFacetItemsObj
 */
export function computeVisibleStudies(studies, facets, filteredFacetItemsObj) {
    let visibleStudies = studies.map(study => study.id);
    for (const facetName of Object.keys(filteredFacetItemsObj)) {
        for (const item of filteredFacetItemsObj[facetName]) {
            const listToIntersect = find(facets[facetName], el => el[0] === item);
            visibleStudies = intersection(visibleStudies, listToIntersect[1]);
        }
    }
    return visibleStudies;
}
