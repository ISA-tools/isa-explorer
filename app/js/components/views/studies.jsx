import 'font-awesome/scss/font-awesome.scss';

import React from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import FontAwesome from 'react-fontawesome';

/**
 * @class
 * @name Info
 * @description a help component containing a brief description of what is this component for:
 *              The info appears in a tooltip
 */
class Info extends React.Component {

    static propTypes = {
        text: React.PropTypes.string.isRequired
    }

    render() {
        const tooltip = <Tooltip>{this.props.text}</Tooltip>;
        return (<OverlayTrigger overlay={tooltip} delayShow={300} delayHide={150}>
            <FontAwesome name="info-circle" className='fa-fw' />
        </OverlayTrigger>);
    }
}

/**
 * @class
 * @name FacetingFilter
 * @description the component for the facet filtering in the sidebar
 */
class FacetingFilter extends React.Component {

    render() {

        const { name, facetsObj, info } = this.props, list = [];

        for (const facet of Object.keys(facetsObj)) {
            list.push(<li>
                <span className='value' >{facet}</span>
                <span className='count-badge'>{facetsObj[facet]}</span>
            </li>);
        }

        return <div className='filter'>
            <p>{name}<Info text={info} /></p>
            <ul>
                {list}
            </ul>
        </div>;
    }

}

/**
 * @class
 * @name Sidebar
 * @description the sidebar class for the studies container
 */
class Sidebar extends React.Component {

    render() {

        const { facets = {} } = this.props, filters = [];

        for (const key of Object.keys(facets)) {
            filters.push(<div className='clearfix' />);
            filters.push(<FacetingFilter name={key} facetsObj={facets[key]} info='default info' />);
        }

        return <div id="sidebar" className="sidebar">
            <button className="close-button fa fa-fw fa-close"></button>
            {filters}
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
        const { study = {} } = this.props,
            searchItemBlock = this._generateSearchItemBlock(),
            keywordList = this._generateKeywordList();

        return <div className='submission_item' >
            <div className='meta meta--preview'>
                <span className='meta_date' >
                    <FontAwesome name='calendar-o'/>
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
            keywList.push(<li>{keyword}</li>);
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
            items.push(<ItemOverview study={study} />);
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

}

export default {
    List: List,
    Sidebar: Sidebar
};
