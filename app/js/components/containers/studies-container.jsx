import React from 'react';
import Studies from '../views/studies'
import { getStudies } from '../../api';
import { connect } from 'react-redux';
import * as actions from '../../actions/study-actions';

class StudiesContainer extends React.Component {

    componentDidMount() {
        getStudies();
    }

    render() {

        const { studies = [], facets = {}, visibleItemsPerFacet = {},
            showAllItemsInFacet, showNextXItemsInFacet, resetItemsInFacet } = this.props;

        return <div>
            <div className="container">
                <button id="menu-toggle" className="menu-toggle"><span>Menu</span></button>
                <Studies.Sidebar facets={facets} visibleItemsPerFacet={visibleItemsPerFacet}
                    showAllItemsInFacet={showAllItemsInFacet} showNextXItemsInFacet={showNextXItemsInFacet} resetItemsInFacet={resetItemsInFacet} />
                <div style={ {align: 'center'} }>
                    <div style={ {margin: '0 auto', width: '600px'} }>
                        What is the ISA-explorer tool? It is a beta-version tool to discover datasets from <a href="http://www.nature.com/sdata/">NPG Scientific Data</a>. Learn more about it in the <a href="http://blogs.nature.com/scientificdata/2015/12/17/isa-explorer/">Scientific Data blog post</a>.
                        Do you have feedback? <a href="mailto:isatools@googlegroups.com?Subject=ISA-explorer">Write to us!</a>
                    </div>
                </div>
                <Studies.List studies={studies} />
            </div>
        </div>;

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
    return {
        studies: store.studyState.studies,
        facets: store.studyState.facets,
        visibleItemsPerFacet: store.studyState.visibleItemsPerFacet
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
        }
    };

};

export default connect(mapStateToProps, mapDispatchToProps)(StudiesContainer);
