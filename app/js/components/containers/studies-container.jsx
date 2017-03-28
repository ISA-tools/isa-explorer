import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';

import { intersection, intersectionBy, isEqual, isEmpty } from 'lodash';

import config from '../../config/base';
import Studies from '../views/studies';
import ErrorView from '../views/error';
import { getStudies } from '../../api';
import * as actions from '../../actions/studies-actions';
import { computeVisibleStudies } from '../../utils/study-utils';

/**
 * @class
 * @name StudiesContainer
 * @description the top-level container class for the studies page in ISA-explorer
 */
export class StudiesContainer extends React.Component {

    constructor(props) {
        super(props);
        this._filterStudies = this._filterStudies.bind(this);
        this._parseFilteredFacetItems = this._parseFilteredFacetItems.bind(this);
    }

    static propTypes = {
        studies: PropTypes.array,
        queryText: PropTypes.string.isRequired,
        facets: PropTypes.object,
        visibleItemsPerFacet: PropTypes.object,
        showAllItemsInFacet: PropTypes.func.isRequired,
        showNextXItemsInFacet: PropTypes.func.isRequired,
        resetItemsInFacet: PropTypes.func.isRequired,
        filteredFacetItems: PropTypes.object,
        toggleFacetItem: PropTypes.func.isRequired,
        filterItemsFullText: PropTypes.func.isRequired,
        resetFullTextSearch: PropTypes.func.isRequired,
        isFetching: PropTypes.bool,
        error: PropTypes.object
    }

    /**
     * @description retrieve studies from the back-end, filter through facets if specified in
     *              in query string
     */
    componentDidMount() {
        // console.log('StudiesContainer.componentDidMount() - mounted!!');
        const { location: { query: { queryText, facets = '' } = {} } } = this.props,
            facetsObj = facets ? JSON.parse(facets) : undefined;
        getStudies({
            queryText,
            filteredFacetItems: facetsObj
        });
    }

    /**
     * @description update query string if the active faceting filters have been modified
     *
    shouldComponentUpdate(nextProps) {
        const { filteredFacetItems, location: { action, query: { queryText, facets = '' } = {} } } = nextProps, facetsJson = {};
        const facetsObj = facets ? JSON.parse(facets) : undefined;
        if (isEqual(filteredFacetItems, this.props.filteredFacetItems)) {
            return true;
        }
        for (const key of Object.keys(filteredFacetItems)) {
            if (!isEmpty(filteredFacetItems[key])) {
                facetsJson[key] = filteredFacetItems[key];
            }
        }
        const query = isEmpty(facetsJson) ? null : { facets: JSON.stringify(facetsJson) };
        browserHistory.push({
            pathname: '/',
            query: query
        });
        return false;

    }
    */

    render() {

        const { studies = [], queryText, facets = {}, visibleItemsPerFacet = {},
            showAllItemsInFacet, showNextXItemsInFacet, resetItemsInFacet,
            // filteredFacetItems = {},
            toggleFacetItem, filterItemsFullText, resetFullTextSearch, error
            // location: { query }
        } = this.props;

        if (error) {
            return <ErrorView error={error} />;
        }

        const filteredFacetItems = this._parseFilteredFacetItems();

        return <div>
            <div className="container">
                <div className='menu-cnt'>
                    <div className='logo' style={{'width': '222px'}} onClick={() => { browserHistory.push('/'); }} />
                    <button id='menu-toggle' className='menu-toggle'><span>Menu</span></button>
                </div>
                <Studies.Sidebar facets={facets} visibleItemsPerFacet={visibleItemsPerFacet}
                    showAllItemsInFacet={showAllItemsInFacet} showNextXItemsInFacet={showNextXItemsInFacet} resetItemsInFacet={resetItemsInFacet}
                    filteredFacetItems={filteredFacetItems} toggleFacetItem={toggleFacetItem}
                    studies={studies} filterItemsFullText={filterItemsFullText} resetFullTextSearch={resetFullTextSearch}
                />
                <Studies.List studies={this._filterStudies(filteredFacetItems)} queryText={queryText} />
            </div>
        </div>;

    }

    /**
     * @description filter the list of studies according to facets and sctive items
     * @return{Array}
     */
    _filterStudies(filteredFacetItems) {
        const { studies = [], facets = {}, activeStudies = [] } = this.props,
            visibleStudies = computeVisibleStudies(studies, facets, filteredFacetItems),
            visibleItems = intersection(activeStudies, visibleStudies);
        return intersectionBy(studies, visibleItems.map(id => { return {id: id}; }), 'id');
    }

    /**
     * @private
     * @description parce the facets from the query string
     * @return{Object} filteredFacetItems
     */
    _parseFilteredFacetItems() {
        const { location: { query: { facets = '' } } } = this.props;
        const filteredFacetItems = facets ? JSON.parse(facets) : {};
        const facetKeys = config.facets.map(el => el.name);
        for (const key of facetKeys) {
            if (isEmpty(filteredFacetItems[key])) {
                filteredFacetItems[key] = [];
            }
        }
        return filteredFacetItems;
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
        queryText: state.queryText,
        activeStudies: state.activeStudies,
        visibleStudies: state.visibleStudies,
        facets: state.facets,
        visibleItemsPerFacet: state.visibleItemsPerFacet,
        filteredFacetItems: state.filteredFacetItems,
        error: state.error,
        isFetching: state.isFetching
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

        filterItemsFullText: (textToMatch, matchedElements) => {
            dispatch(actions.updateActiveStudies(textToMatch, matchedElements));
        },

        resetFullTextSearch: () => {
            dispatch(actions.resetActiveStudies());
        }
    };

};

export default connect(mapStateToProps, mapDispatchToProps)(StudiesContainer);
