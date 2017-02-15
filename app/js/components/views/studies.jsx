/**
 * @author Massimiliano Izzo
 */

import 'font-awesome/scss/font-awesome.scss';

import { isEqual } from 'lodash';
import React from 'react';
import { browserHistory } from 'react-router';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';
import lunr from 'lunr';

import { guid } from '../../utils/helper-funcs';
import { DEFAULT_VISIBLE_ITEMS_PER_FACET, ITEMS_TO_ADD_PER_FACET } from '../../utils/constants';
import config from '../../config/base';



/**
 * @method
 * @name initialiseIndex
 * @param{Array} studies - an array of documents to be indexed
 * @return Lunr.Index - the index object
 */
function initialiseIndex(studies) {
    const index = new lunr(function() {
        this.ref('id');
        this.field('title', {boost: 10});
        this.field('authors');
        this.field('_keywords');
        this.field('affiliations');
        this.field('date');
        this.field('assays');
        this.field('repository');
        this.field('technologies');
        this.field('Characteristic[organism]');
        this.field('Characteristic[environment type]');
        this.field('Characteristic[geographical location]');
        this.field('factors');
    });
    for (const study of studies) {
        index.add(study);
    }
    return index;
}

/**
 * @class
 * @name Info
 * @description a help component containing a brief description of what is this component for:
 *              The info appears in a tooltip
 */
export class Info extends React.Component {

    static propTypes = {
        text: React.PropTypes.string.isRequired
    }

    render() {
        const { text } = this.props, tooltip = <Tooltip id={guid()}>{text}</Tooltip>;
        return (<OverlayTrigger overlay={tooltip} delayShow={300} delayHide={150}>
            <FontAwesome name="info-circle" className='fa-fw' />
        </OverlayTrigger>);
    }
}

/**
 * @class
 * @name SearchBox
 * @description container for the full text search box for ISA-explorer
 */
class SearchBox extends React.Component {

    constructor(props) {
        super(props);
        this.index = new lunr(() => {});
        this.onSearchBtnClick = this.onSearchBtnClick.bind(this);
        this.onResetBtnClick = this.onResetBtnClick.bind(this);
        this.onSearchKeyUp = this.onSearchKeyUp.bind(this);
    }

    componentDidMount() {
        this.index = initialiseIndex(this.props.studies);
    }

    componentDidUpdate(prevProps) {
        const { studies } = this.props;
        if (!isEqual(prevProps.studies.map(el => el.id), studies.map(el => el.id))) {
            this.index = initialiseIndex(studies);
        }
    }

    render() {
        const { q = {} } = this.refs, resetBtnClassNames = q.value ? null : 'hidden';
        return <div className='search'>
            <input id='search' name='q' ref='q' placeholder='Search' onKeyUp={this.onSearchKeyUp} />
            <span className='button' onClick={this.onSearchBtnClick}>
                <FontAwesome name='search' />
            </span>
            <div style={{marginTop: '10px'}}>
                <a href='#' id='reset-button' className={resetBtnClassNames} onClick={this.onResetBtnClick}>Reset</a>
            </div>
        </div>;
    }

    onSearchKeyUp(ev) {
        ev.preventDefault();
        if (ev.keyCode === 13) {
            this.onSearchBtnClick();
        }
    }

    onSearchBtnClick() {
        const { filterItemsFullText, resetFullTextSearch } = this.props, { q } = this.refs;
        if (!q.value) {
            resetFullTextSearch();
            return;
        }
        const hits = this.index.search(q.value);
        filterItemsFullText(hits);
    }

    onResetBtnClick() {
        this.refs.q.value = null;
        this.props.resetFullTextSearch();
    }

}

/**
 * @class
 * @name FacetingFilter
 * @description the component for the facet filtering in the sidebar
 */
class FacetingFilter extends React.Component {

    constructor(props) {
        super(props);
        this._generateControllers = this._generateControllers.bind(this);
        this.onShowAllClick = this.onShowAllClick.bind(this);
        this.onShowNextXOnClick = this.onShowNextXOnClick.bind(this);
        this.onResetClick = this.onResetClick.bind(this);
        this.onFacetItemClick = this.onFacetItemClick.bind(this);

        this.facetsMap = new Map(config.facets.map(facet => [facet.name, facet.display]));
    }

    render() {

        const {
            name, facetArr, visibleItems = DEFAULT_VISIBLE_ITEMS_PER_FACET,
            filteredItems = [], info = 'default info'
        } = this.props, list = [];
        let count = 0;

        for (const [item, studyIds] of facetArr) {
            if (count++ >= visibleItems) {
                break;
            }
            const className = filteredItems.indexOf(item) > -1 ? 'active' : false;
            list.push(<li key={item} className={className} data-id={item} onClick={this.onFacetItemClick} >
                <span className='value' >{item}</span>
                <span className='count-badge'>{studyIds.length}</span>
            </li>);
        }

        return <div className='filter'>
            <p>{this.facetsMap.get(name)}<Info text={info} /></p>
            <ul className='filter-list'>
                {list}
            </ul>
            { this._generateControllers() }
        </div>;
    }

    _generateControllers() {
        const { visibleItems = DEFAULT_VISIBLE_ITEMS_PER_FACET } = this.props;
        const resetCtr = visibleItems > DEFAULT_VISIBLE_ITEMS_PER_FACET ? <span ref='reset' className='reset' onClick={this.onResetClick}>Reset</span> : null,
            showAllCtr = visibleItems !== Infinity ? <span ref='showAll' className='show-all' onClick={this.onShowAllClick}>Show all</span> : null,
            showNextXCtr = visibleItems !== Infinity ? <span ref='showNextX' className='show-next-5' onClick={this.onShowNextXOnClick}>{`Show next ${ITEMS_TO_ADD_PER_FACET}`}</span> : null;
        const controllers = <div>{resetCtr}{showNextXCtr}{showAllCtr}</div>;
        return controllers;
    }

    onResetClick() {
        const { name, resetItemsInFacet } = this.props;
        resetItemsInFacet(name);
    }

    onShowAllClick() {
        const { name, showAllItemsInFacet } = this.props;
        showAllItemsInFacet(name);
    }

    onShowNextXOnClick() {
        const { name, showNextXItemsInFacet } = this.props;
        showNextXItemsInFacet(name);
    }

    /**
     * @method
     * @name onFacetItemClick
     * @description event handler for the selection/unselection of a specific facet item
     * @param{Event} ev - the underlying DOM event
     */
    onFacetItemClick(ev) {
        // read item name from data-id attribute
        const item = ev.currentTarget.dataset.id;
        const { name, toggleFacetItem } = this.props;
        toggleFacetItem(name, item);
    }

}

/**
 * @class
 * @name Sidebar
 * @description the sidebar class for the studies container
 */
class Sidebar extends React.Component {

    render() {

        const { studies = [], facets = {}, visibleItemsPerFacet = {}, showAllItemsInFacet, showNextXItemsInFacet,
            resetItemsInFacet, filteredFacetItems = {}, toggleFacetItem, index, filterItemsFullText,
            resetFullTextSearch } = this.props,
            filters = [];

        for (const key of Object.keys(facets)) {
            filters.push(<div key={`${key}-0`} className='clearfix' />);
            filters.push(<FacetingFilter key={key} name={key} facetArr={facets[key]}
                visibleItems={visibleItemsPerFacet[key]} info='default info'
                showAllItemsInFacet={showAllItemsInFacet} showNextXItemsInFacet={showNextXItemsInFacet}
                resetItemsInFacet={resetItemsInFacet}
                filteredItems={filteredFacetItems[key]} toggleFacetItem={toggleFacetItem}
            />);
        }

        return <div id="sidebar" className="sidebar">
            <button className="close-button fa fa-fw fa-close"></button>
            <div className='logo' onClick={() => { browserHistory.push('/'); }} />
            <SearchBox studies={studies} filterItemsFullText={filterItemsFullText} resetFullTextSearch={resetFullTextSearch} />
            <div className='clearfix' />
            <div id='filters'>
                {filters}
            </div>
            <div className='clearfix' />
            <div>
                <p>Part of
                    <a href='http://www.isa-tools.org'>
                        <img src="./assets/img/isatools-logo.png" alt="ISA-tools" height="20" width="70" />
                    </a>
                </p>
                <p>Developed and maintained by <a href="http://www.isa-tools.org/team/">the ISA-tools Team</a></p>
            </div>
        </div>;

    }
}

/**
 * @class
 * @name ItemOverview
 * @description a component for the basic overview of a single study within the study list/grid view
 */
class ItemOverview extends React.Component {

    constructor(props) {
        super(props);
        this._generateAuthorsHeader = this._generateAuthorsHeader.bind(this);
        this._generateKeywordList = this._generateKeywordList.bind(this);
        this._generateSearchItemBlock = this._generateSearchItemBlock.bind(this);
    }

    render() {
        const { study = {}, onClick } = this.props,
            searchItemBlock = this._generateSearchItemBlock(),
            keywordList = this._generateKeywordList();

        return <div className='submission_item' onClick={onClick} >
            <div className='meta meta--preview'>
                <span className='meta_date' >
                    <FontAwesome name='calendar-o' className='fa-fw' />
                    {study.date}
                    <Info text='Data descriptor article publication date' />
                    <p className="hidden pub_assays">{study.assays}</p>
                    <p className="hidden pub_environments">{study.environments}</p>
                    <p className="hidden pub_organisms">{study.organism}</p>
                    <p className="hidden pub_factors">{study.factors}</p>
                    <p className="hidden pub_repositories">{study.repository}</p>
                    <p className="hidden pub_technologies">{study.technologies}</p>
                    <p className="hidden pub_designs">{study.designs}</p>
                    <p className="hidden pub_locations">{study.locations}</p>
                </span>
            </div>

            {this._generateAuthorsHeader()}

            <h2 className='title title--preview' itemProp='name'>
                {study.title}
                <Info text='Data descriptor article title' />
            </h2>

            {searchItemBlock}
            {keywordList}

            <div className='loader' />

        </div>;
    }

    _generateAuthorsHeader() {
        const { study: { authors = '' } = {} } = this.props;
        const authArr = authors.trim().split(','), formattedAuthors = !authArr.length ? '' : authArr.length <= 2 ?
            authArr.concat(' and ') : `${authArr[0]} et al`;

        return <h4 className='authors' itemProp='creator'>
            {formattedAuthors}
            <Info text='Data descriptor article authors' />
        </h4>;

    }

    _generateSearchItemBlock() {
        const { study = {} } = this.props, { id, repository_count } = study;
        const inlineStyle = {
            marginTop: '15px',
            marginBottom: '10px'
        };
        return <div id={`filter-${id}`} className='search-item-block' style={inlineStyle} >
            <div className='search-item-details'>
                <div className="clearfix" />
                <div className='bio-icon-systen pull-left' style={{fontSize: '1.9em'}} />
                <div className='pull-left' style={{marginTop: '4px'}} >
                    Data repositories
                    <Info text='Number of data repositories hosting the data underlying this data descriptor article.' />
                </div>
                <span className='counter counter-blue'>{repository_count}</span>
            </div>
        </div>;
    }

    _generateKeywordList() {
        const { study = {} } = this.props, { keywords } = study, keywList = [],
            keywordSeparatorRegex = /;|\//;
        for (const keyword of keywords.split(keywordSeparatorRegex)) {
            keywList.push(<li key={guid()} >{keyword}</li>);
        }
        return <ul className='keywords' itemProp='keywords'>
            {keywList}
            <Info text='keywords' />
        </ul>;
    }

}

/**
 * @class
 * @name List
 * @description the view class for a list (more properly a grid) of studies
 */
class List extends React.Component {

    constructor(props) {
        super(props);
    }

    static propTypes = {
        studies: React.PropTypes.array
    }

    render() {
        const { studies = [] } = this.props, items = [];
        for (const study of studies) {
            items.push(<ItemOverview key={study.id} study={study} onClick={this.onItemOverviewClick(study.dir)} />);
        }

        return <div id='isatab_list' className='main'>
            <div className="clearfix" />
            <section className='grid'>
                <header className="top-bar">{`${studies.length} Data Descriptor Articles Displayed`}</header>
                {items}
            </section>
            <section className="content">
                <div className="scroll-wrap" id="isa-content" >
                </div>
            </section>
        </div>;
    }

    onItemOverviewClick(dirName) {
        return function() {
            browserHistory.push(`/${dirName}`);
        };
    }

}

export default {
    List: List,
    Sidebar: Sidebar
};
