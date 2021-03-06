/**
 * @author Massimiliano Izzo
 */

import { isObject, countBy, isEmpty, omit, startCase, kebabCase } from 'lodash';
import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
import FontAwesome from 'react-fontawesome';
import { Doughnut as DoughnutChart } from 'react-chartjs-2';
import { Info } from './studies';
import { guid } from '../../utils/helper-funcs';
import {
    DOI_BASE_URL, STUDY_ASSAYS, STUDY_IDENTIFIER, METADATA_DOWNLOAD_LINK_POSTFIX, EXPERIMENTAL_METADATA_LICENCE,
    MANUSCRIPT_LICENCE, DATA_RECORDS, DATA_RECORD_ACCESSION, DATA_RECORD_URI, DATA_REPOSITORY,
    STUDY_ASSAY_MEASUREMENT_TYPE, STUDY_ASSAY_FILE_NAME, STUDY_ASSAY_TECHNOLOGY_TYPE, STUDY_TITLE, STUDY_FILE_NAME,
    STUDY_FACTORS, STUDY_FACTOR_NAME, STUDY_PROTOCOLS, STUDY_PROTOCOL_NAME, STUDY_PROTOCOL_TYPE,
    STUDY_DESIGN_DESCRIPTORS, STUDY_DESIGN_TYPE, STUDY_DESIGN_TYPE_TERM_ACCESSION_NUMBER, // STUDY_DESIGN_TYPE_TERM_SOURCE_REF,
    STUDY_PUBLICATIONS, STUDY_PUBLICATION_DOI, STUDY_PUBLICATION_TITLE, STUDY_PUBLICATION_AUTHOR_LIST,
    STUDY_CONTACTS, STUDY_PERSON_FIRST_NAME, STUDY_PERSON_MID_INITIALS, STUDY_PERSON_LAST_NAME, STUDY_PERSON_AFFILIATION,
    CHARACTERISTICS_PATTERN, COLORS, STUDY_PUBLIC_RELEASE_DATE, DEFAULT_STUDY_FILE_NAME,
    NATURE_SUBJECT_ONTOLOGY_ROOT_URL, SUBJECT_KEYWORDS
 } from '../../utils/constants';

// defaults.global.tooltips.enabled = false;

const doughnutOpts = {
    cutOutPercentage: 80,
    legend: {
        display: false
    },
    tooltips: {
        enabled: false,
        titleFontSize: 20,
        bodyFontSize: 12
    },
    elements: {
        arc: {
            borderWidth: 0
        }
    },
    maintainAspectRatio: false
};



export class SidebarHeader extends React.Component {

    constructor(props) {
        super(props);
        this._computeMetadataDownloadLink = this._computeMetadataDownloadLink.bind(this);
    }

    static propTypes = {
        study: PropTypes.object
    }

    /* TODO need to add endpoint to download file (?) */
    _computeMetadataDownloadLink() {
        const id = this.props.study[STUDY_IDENTIFIER];
        return `${id.substring(id.indexOf('/')).replace(/\./g, '')}${METADATA_DOWNLOAD_LINK_POSTFIX}`;
    }

    render() {
        const { study = {} } = this.props, studyId = study[STUDY_IDENTIFIER],
            metadataDownloadLink = studyId ? `${studyId.substring(studyId.indexOf('/')).replace(/\./g, '')}${METADATA_DOWNLOAD_LINK_POSTFIX}` : null;
        return <div id='meta_info'>
            <span className='meta_date'>
                <FontAwesome name='calendar-o' className='fa-fw' />
                {study[STUDY_PUBLIC_RELEASE_DATE]}
                <Info text='Dataset publication date' />
            </span>
            <span className='meta__link'>
                <a href={`${DOI_BASE_URL}/${study[STUDY_IDENTIFIER]}`} target='_blank' rel='noopener noreferrer'>
                    <FontAwesome name='link' className='fa-fw' />
                    Data Descriptor Article
                    <Info text='Link to open the data descriptor article' />
                </a>
            </span>
            <span className='meta__link'>
                <a href={`/data${metadataDownloadLink}`}>
                    <FontAwesome name='download' className='fa-fw' />
                    Download Metadata
                    <Info text='Download the data descriptor' />
                </a>
            </span>
            <span className='meta_date'>
                <FontAwesome name='copyright' className='fa-fw' />
                Dataset Metadata (in ISA format) License {study[EXPERIMENTAL_METADATA_LICENCE]}
                <span className='license-tag'></span><Info text='License for the metadata' />
            </span>
            <span className='meta_date'>
                <FontAwesome name='copyright' className='fa-fw' />
                Data Descriptor Article License {study[MANUSCRIPT_LICENCE]}
                <span className='license-tag'></span><Info text='License for the article' />
            </span>
        </div>;
    }

}

export class LinkPanel extends React.Component {

    static propTypes = {
        data: PropTypes.array
    }

    render() {
        const list = [], { data = []} = this.props;
        for (const datum of data) {
            list.push(<li key={datum[DATA_RECORD_URI]}>
                <FontAwesome name='link' className='fa-fw' />
                <a href={datum[DATA_RECORD_URI]} target='_blank' rel='noopener noreferrer' style={{color: '#ffffff'}}>
                    {`${datum[DATA_REPOSITORY]}: ${datum[DATA_RECORD_ACCESSION]}`}
                </a>
            </li>);
        }
        return <div className="filter" id="data-link-panel">
            <p>Data Repository Links <Info text='Links to data repositories where the data is stored' /></p>
            <ul id='data-list'>
                {list}
            </ul>
        </div>;
    }

}


/**
 * @class
 * @name Sidebar
 */
class Sidebar extends React.Component {
    /*
    constructor(props) {
        super(props);
        this._generateHeaders = this._generateHeaders.bind(this);
    } */

    static propTypes = {
        investigation: PropTypes.shape({
            studies: PropTypes.array
        })
    }

    render() {
        const { investigation: { studies = [] } = {} } = this.props, study = studies[0],
            // assays = isObject(study) && study.hasOwnProperty(STUDY_ASSAYS) ? study[STUDY_ASSAYS] : [],
            dataRecords = isObject(study) && study.hasOwnProperty(DATA_RECORDS) ? study[DATA_RECORDS] : [];
        return <div className='sidebar'>
            <div className='sidebar-top'>
                <div className='logo' onClick={() => { browserHistory.push('/'); }} />
            </div>
            <div className='sidebar-bottom'>
                <SidebarHeader study={study} />
                <div className='clearfix' />
                <LinkPanel data={dataRecords} />
                <div className='clearfix' />
            </div>
        </div>;
    }

}

/**
 * @method
 * @name Description
 */
function Descriptor(props) {
    const { descriptorLink } = props;
    return <div id='study-description'>
        <a href={descriptorLink} target='_blank' rel='noopener noreferrer'>
            <FontAwesome name='link' className='fa-fw' />
            Read the <b>data descriptor article</b>
        </a>
    </div>;
}

/**
 * @class
 * @name CharacteristicsBox
 **/
export class CharacteristicsBox extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { name, stats, colorIndex } = this.props, statsKeys = [], statsVals = [], backgroundColors = [], distributionList = [];
        let index = colorIndex;

        for (const key of Object.keys(stats)) {
            const color = COLORS[index++ % COLORS.length], value = stats[key];
            statsKeys.push(key);
            statsVals.push(value);
            backgroundColors.push(color);
            distributionList.push(<div key={key} className='distribution-group'>
                <div className='distribution' style={{color: color}}>{key}</div>
                <div className='distribution-value'>
                    <span>{value}</span>
                </div>
                <div className='cf' />
            </div>);
        }

        const data = {
            labels: statsKeys,
            datasets: [{
                data: statsVals,
                backgroundColor: backgroundColors
            }]
        };
        return <div style={{overflow: 'auto'}} >
            <p className='characteristic_type'>
                <b>{startCase(name.substring(name.indexOf('[') + 1, name.indexOf(']')))}</b>
            </p>
            <DoughnutChart data={data} options={doughnutOpts} width={120} height={120} />
            <div className='distribution-list' style={{height: '111px', overflowY: 'scroll'}} >
                <ul>
                    {distributionList}
                </ul>
            </div>
        </div>;

    }
}

/**
 * @class
 * @name SamplesView
 */
class SamplesView extends React.Component {

    constructor(props) {
        super(props);
        this._computeSampleStats = this._computeSampleStats.bind(this);
    }

    render() {
        const { dirName, fileName = DEFAULT_STUDY_FILE_NAME } = this.props, statsObj = this._computeSampleStats(), list = [];
        let colorIdx = 0;
        for (const statsKey of Object.keys(statsObj)) {
            const box = <CharacteristicsBox name={statsKey} stats={statsObj[statsKey]} colorIndex={colorIdx} />;
            list.push(<li key={statsKey} style={{overflow: 'auto'}}>
                {box}
            </li>);
            colorIdx += Object.keys(statsObj[statsKey]).length;
        }
        return <div id='samples'>
            <div className='section-header' >
                Samples Details
                <span className='btn btn-default' style={{marginLeft: '10px'}} onClick={() => { browserHistory.push(`/${dirName}/${fileName}`); } } >
                    View Samples
                </span>
            </div>
            <div className='clearfix' />
            <div id='sample-distribution'>
                <ul>{list}</ul>
            </div>
        </div>;
    }

    _computeSampleStats() {
        const { samples } = this.props, statsObj = {};
        if (isEmpty(samples)) {
            return {};
        }
        // samples.map(sample => pickBy(sample, (value, key) => key.match(CHARACTERISTICS_PATTERN)));
        const characteristicsKeys = Object.keys(samples[0]).filter(key => key.match(CHARACTERISTICS_PATTERN));
        for (const key of characteristicsKeys) {
            statsObj[key] = omit(countBy(samples, key), ['undefined', '']);
        }
        return statsObj;
    }

}

/**
 * @method
 * @name AssaysView
 * @prop{Array} assays
 * @prop{String} dirName
 */
export const AssaysView = props => {
    const { assays = [], dirName } = props, list = [];
    for (const assay of assays) {
        list.push(<li key={assay[STUDY_ASSAY_FILE_NAME]} >
            <span>{`${assay[STUDY_ASSAY_MEASUREMENT_TYPE]}`}</span>
            {' measured by '}
            <span>{assay[STUDY_ASSAY_TECHNOLOGY_TYPE]}</span>
            <span className='btn btn-default' style={{marginLeft: '10px'}} onClick={() => { browserHistory.push(`/${dirName}/${assay[STUDY_ASSAY_FILE_NAME]}`); } } >
                View Assay
            </span>
        </li>);
    }
    return <div id='assays'>
        <div className='section-header'>Assays Details</div>
        <ul>{list}</ul>
    </div>;
};

AssaysView.propTypes = {
    assays: PropTypes.array,
    dirName: PropTypes.string.isRequired
};

/**
 * @method
 * @name FactorsView
 * @prop{Array} factors
 */
const FactorsView = props => {
    const { factors = [] } = props, list = [];
    if (isEmpty(factors)) {
        return null;
    }
    for (const factor of factors) {
        list.push(<li key={factor[STUDY_FACTOR_NAME]}>{factor[STUDY_FACTOR_NAME]}</li>);
    }
    return <div id='factors'>
        <span className='section-header'>Factors</span>
        <ul>{list}</ul>
    </div>;
};

/**
 * @method
 * @name ProtocolsView
 * @prop{Array} protocols
 */
const ProtocolsView = props => {
    const { protocols = [] } = props, list = [];
    if (isEmpty(protocols)) {
        return null;
    }
    for (const protocol of protocols) {
        list.push(<li key={protocol[STUDY_PROTOCOL_NAME]}>
            <p className='protocol-name'>
                {`${protocol[STUDY_PROTOCOL_NAME]} `}
                <span className='type-tag'>{protocol[STUDY_PROTOCOL_TYPE]}</span>
            </p>
        </li>);
    }
    return <div id='protocols'>
        <span className='section-header'>Methods Details</span>
        <ul>{list}</ul>
    </div>;
};

/**
 * @method
 * @name DesignsView
 * @prop{Array} designs
 */
export const DesignsView = props => {
    const { designs = [] } = props, list = [];
    if (isEmpty(designs)) {
        return null;
    }
    for (const design of designs) {
        const accessionNumber = design[STUDY_DESIGN_TYPE_TERM_ACCESSION_NUMBER],
            accessionNumberSpan = accessionNumber ? <span className='type-tag'>{design[STUDY_DESIGN_TYPE_TERM_ACCESSION_NUMBER]}</span> : null;
        list.push(<li key={design[STUDY_DESIGN_TYPE]}>
            <p className='design-name'>
                {`${design[STUDY_DESIGN_TYPE]} `}
                {accessionNumberSpan}
            </p>
        </li>);
    }
    return <div id='designs'>
        <span className='section-header'>Designs Details</span>
        <ul>{list}</ul>
    </div>;
};

/**
 * @method
 * @name PublicationsView
 * @prop{Array} publications
 */
const PublicationsView = props => {
    const { publications = [] } = props, list = [];
    if (isEmpty(publications)) {
        return null;
    }
    for (const publication of publications) {
        list.push(<li key={publication[STUDY_PUBLICATION_DOI]}>
            <p className='publication-title'>{publication[STUDY_PUBLICATION_TITLE]}</p>
            <p className='publication-authors'>{publication[STUDY_PUBLICATION_AUTHOR_LIST]}</p>
            <p className='publication-doi'>
                <FontAwesome name='link' className='fa-fw' />
                <a href={`${DOI_BASE_URL}/${publication[STUDY_PUBLICATION_DOI]}`} target='_blank' rel='noopener noreferrer' >
                {publication[STUDY_PUBLICATION_DOI]}
                </a>
            </p>
        </li>);
    }
    return <div id='publications'>
        <span className='section-header'>Related Publications using this Dataset</span>
        <ul>{list}</ul>
    </div>;
};

/**
 * @method
 * @name ContactsView
 * @prop{Array} contacts
 */
const ContactsView = props => {
    const { contacts = [] } = props, list = [];
    if (isEmpty(contacts)) {
        return null;
    }
    for (const contact of contacts) {
        const fullName = `${contact[STUDY_PERSON_FIRST_NAME]} ${contact[STUDY_PERSON_MID_INITIALS]} ${contact[STUDY_PERSON_LAST_NAME]} `;
        list.push(<li key={fullName}>
            <p className='publication-title'>
                {fullName}
                <span className='publication-pubmed-id' >{contact[STUDY_PERSON_AFFILIATION]}</span>
            </p>
        </li>);
    }
    return <div id='contacts'>
        <span className='section-header'>Contacts</span>
        <ul>{list}</ul>
    </div>;
};

/**
 * @method
 * @name KeywordsView
 * @prop{String} keywords - a semicolon-separated (;) string of items (keywords)
 */
const KeywordsView = props => {
    if (!props.keywords) return null;
    const keywords = props.keywords.split(';'), keywList = [];
    for (const keywordPath of keywords) {
        const fragments = keywordPath.split('/').filter(Boolean), fragList = [];
        for (const fragment of fragments) {
            fragList.push(<a key={fragment} target='_blank' rel='noopener noreferrer' href={`${NATURE_SUBJECT_ONTOLOGY_ROOT_URL}/${kebabCase(fragment.toLowerCase())}`}>
                {fragment}
            </a>);
            fragList.push(<p key={`__${fragment}-p__`}> > </p>);
        }
        if (!isEmpty(fragList)) {
            fragList.pop();
            keywList.push(<h3 className='inline-block' key={guid()}>{fragList}</h3>);
            keywList.push(<br key={guid()} />);
        }
    }
    return isEmpty(keywList) ? null : <div>
        <span className='section-header'>Keywords</span>
        <div>
            {keywList}
        </div>
    </div>;
};

/**
 * @class
 * @name Detail
 * @prop{Object} investigation - contains an array of studies
 * @prop{String} dirName
 */
class Detail extends React.Component {

    render() {
        const { investigation: { studies: [study = {}] = [] } = {}, dirName } =this.props,
            assays = isObject(study) && study.hasOwnProperty(STUDY_ASSAYS) ? study[STUDY_ASSAYS] : [];
        var studyIdentifier = study[STUDY_IDENTIFIER]
        var datasetIdentifier = studyIdentifier ? studyIdentifier.substring( studyIdentifier.indexOf('/')+1 ) : study[STUDY_IDENTIFIER]

        return <div className='isa-main-view main'>
            <div>
                <ul className='isaex-breadcrumb'>
                    <li className='active' >
                        <a href='' onClick={ev => { browserHistory.push('/'); ev.preventDefault(); }} >
                            <FontAwesome name='home' className='fa-fw' />
                            All Datasets
                        </a>
                    </li>
                    <li>
                        <a href='' onClick={ev => { ev.preventDefault(); }} >
                            Dataset: { datasetIdentifier }
                        </a>
                    </li>
                </ul>
            </div>
            <div className='clearfix' />
            <div id='study-info' style={{height: '100%'}}>
                <div id='study-title'>{study[STUDY_TITLE]}</div>
                <Descriptor descriptorLink={`${DOI_BASE_URL}/${study[STUDY_IDENTIFIER]}`} />
                <div className='cf' />
                <br />
                <KeywordsView keywords={study[SUBJECT_KEYWORDS]} />
                <div className='cf' />
                <br />
                <SamplesView samples={study.samples} dirName={dirName} fileName={study[STUDY_FILE_NAME]} />
                <div className='clearfix' />
                <AssaysView assays={assays} dirName={dirName} />
                <div className='clearfix' />
                <FactorsView factors={study[STUDY_FACTORS]}/>
                <div className='clearfix' />
                <ProtocolsView protocols={study[STUDY_PROTOCOLS]} />
                <div className='clearfix' />
                <DesignsView designs={study[STUDY_DESIGN_DESCRIPTORS]} />
                <div className='clearfix' />
                <PublicationsView publications={study[STUDY_PUBLICATIONS]}/>
                <div className='cf' />
                <br />
                <br />
                <ContactsView contacts={study[STUDY_CONTACTS]} />
                <div className='clearfix' />
            </div>
        </div>;
    }

}

export default {
    Sidebar: Sidebar,
    Detail: Detail
};
