import React from 'react';
import { intersection, intersectionBy } from 'lodash';

import Studies from '../views/studies';
import { getStudies } from '../../api';
import { connect } from 'react-redux';
import * as actions from '../../actions/studies-actions';

/**
 * @class
 * @name StudiesContainer
 * @description the top-level container class for the studies page in ISA-explorer
 */
class StudiesContainer extends React.Component {

    constructor(props) {
        super(props);
        this._filterStudies = this._filterStudies.bind(this);
    }

    componentDidMount() {
        getStudies();
    }

    render() {

        const { studies = [], facets = {}, visibleItemsPerFacet = {},
            showAllItemsInFacet, showNextXItemsInFacet, resetItemsInFacet,
            filteredFacetItems = {}, toggleFacetItem, filterItemsFullText, resetFullTextSearch
         } = this.props;

        return <div>
            <div className="container">
                <button id="menu-toggle" className="menu-toggle"><span>Menu</span></button>
                <Studies.Sidebar facets={facets} visibleItemsPerFacet={visibleItemsPerFacet}
                    showAllItemsInFacet={showAllItemsInFacet} showNextXItemsInFacet={showNextXItemsInFacet} resetItemsInFacet={resetItemsInFacet}
                    filteredFacetItems={filteredFacetItems} toggleFacetItem={toggleFacetItem}
                    studies={studies} filterItemsFullText={filterItemsFullText} resetFullTextSearch={resetFullTextSearch}
                />
                <div style={ {align: 'center'} }>
                    <div style={ {margin: '0 auto', width: '600px'} }>
                        What is the ISA-explorer tool? It is a beta-version tool to discover datasets from <a href="http://www.nature.com/sdata/">NPG Scientific Data</a>. Learn more about it in the <a href="http://blogs.nature.com/scientificdata/2015/12/17/isa-explorer/">Scientific Data blog post</a>.
                        Do you have feedback? <a href="mailto:isatools@googlegroups.com?Subject=ISA-explorer">Write to us!</a>
                    </div>
                </div>
                <Studies.List studies={this._filterStudies()} />
            </div>
        </div>;

    }

    _filterStudies() {
        const { studies, activeStudies, visibleStudies } = this.props,
            visibleItems = intersection(activeStudies, visibleStudies);
        return intersectionBy(studies, visibleItems.map(id => { return {id: id}; }), 'id');
    }

}

/**
 * @method mapStateToProps
 * @description maps certain parts of the state (as stored in Redux) to properties of the GraphContainer class.
 *              Everytime the state is altered the properties are overwritten
 * @param{Object} store - the Redux store
 * @return{Object} all the mapped properties
 */
const mapStateToProps = function(store) {
    const state = store.studiesState;
    return {
        studies: state.studies,
        activeStudies: state.activeStudies,
        visibleStudies: state.visibleStudies,
        // index: state.index,
        facets: state.facets,
        visibleItemsPerFacet: state.visibleItemsPerFacet,
        filteredFacetItems: state.filteredFacetItems
    };
};

/**
 * @method
 * @name mapDispatchToProps
 * @description maps a number of functions used to dispatch actions for the Reduce to the props of the StudiesContainer class
 * @param{function} redux dispatch method
 * @returns Object {...functions...}
 */
const mapDispatchToProps = function(dispatch) {

    return {

        showAllItemsInFacet: facetName => {
            dispatch(actions.showAllItemsInFacet(facetName));
        },

        showNextXItemsInFacet: facetName => {
            dispatch(actions.showNextXItemsInFacet(facetName));
        },

        resetItemsInFacet: facetName => {
            dispatch(actions.resetItemsInFacet(facetName));
        },

        toggleFacetItem: (facetName, facetItem) => {
            dispatch(actions.toggleFacetItem(facetName, facetItem));
        },

        filterItemsFullText: matchedElements => {
            dispatch(actions.updateActiveStudies(matchedElements));
        },

        resetFullTextSearch: () => {
            dispatch(actions.resetActiveStudies());
        }
    };

};

export default connect(mapStateToProps, mapDispatchToProps)(StudiesContainer);
