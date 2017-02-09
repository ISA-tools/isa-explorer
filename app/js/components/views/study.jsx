import { isObject, countBy, isEmpty, omit } from 'lodash';
import React from 'react';
import { browserHistory } from 'react-router';
import FontAwesome from 'react-fontawesome';
import { Doughnut as DoughnutChart } from 'react-chartjs-2';
import { Info } from './studies';
import {
    DOI_BASE_URL, STUDY_ASSAYS, STUDY_IDENTIFIER, METADATA_DOWNLOAD_LINK_POSTFIX, EXPERIMENTAL_METADATA_LICENCE,
    MANUSCRIPT_LICENCE, DATA_RECORDS, DATA_RECORD_ACCESSION, DATA_RECORD_URI, DATA_REPOSITORY,
    STUDY_ASSAY_MEASUREMENT_TYPE, STUDY_ASSAY_FILE_NAME, STUDY_ASSAY_TECHNOLOGY_TYPE, STUDY_TITLE, STUDY_FILE_NAME,
    STUDY_FACTORS, STUDY_FACTOR_NAME, STUDY_PROTOCOLS, STUDY_PROTOCOL_NAME, STUDY_PROTOCOL_TYPE,
    STUDY_PUBLICATIONS, STUDY_PUBLICATION_DOI, STUDY_PUBLICATION_TITLE, STUDY_PUBLICATION_AUTHOR_LIST,
    STUDY_CONTACTS, STUDY_PERSON_FIRST_NAME, STUDY_PERSON_MID_INITIALS, STUDY_PERSON_LAST_NAME, STUDY_PERSON_AFFILIATION,
    CHARACTERISTICS_PATTERN, COLORS, STUDY_PUBLIC_RELEASE_DATE, DEFAULT_STUDY_FILE_NAME
 } from '../../utils/constants';

const doughnutOpts = {
    cutOutPercentage: 65,
    legend: {
        display: false
    },
    maintainAspectRatio: false
};

class SidebarHeader extends React.Component {

    constructor(props) {
        super(props);
        this._computeMetadataDownloadLink = this._computeMetadataDownloadLink.bind(this);
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
                <a href={`/data/${metadataDownloadLink}`}>
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

class LinkPanel extends React.Component {

    render() {
        const list = [], { data = []} = this.props;
        for (const datum of data) {
            list.push(<li>
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

class AssayPanel extends React.Component {

    render() {
        const { assays = [], dirName } = this.props, list = [];
        for (const assay of assays) {
            list.push(<li onClick={() => { browserHistory.push(`/${dirName}/${assay[STUDY_ASSAY_FILE_NAME]}`); }}>
                <div className="assay-information">
                    <p className="measurement-type">{assay[STUDY_ASSAY_MEASUREMENT_TYPE]}</p>

                    <p className="technology-type">{assay[STUDY_ASSAY_TECHNOLOGY_TYPE]}</p>

                    {/*}<p className="technology-platform">{null}</p> */}

                    <p className="assay-file-name">{assay[STUDY_ASSAY_FILE_NAME]}</p>
                </div>

                <div className="assay-count">
                    <span className="count-badge"><FontAwesome name="chevron-right" className='fa-fw' /></span>
                </div>

            </li>);
        }
        return <div className="filter" id="assay-panel">
            <p>{assays.length} Assays</p>
            <ul id="assay-list">
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

    render() {
        const { investigation: { studies = [] } = {}, dirName } = this.props, study = studies[0],
            assays = isObject(study) && study.hasOwnProperty(STUDY_ASSAYS) ? study[STUDY_ASSAYS] : [],
            dataRecords = isObject(study) && study.hasOwnProperty(DATA_RECORDS) ? study[DATA_RECORDS] : [];
        return <div className='sidebar'>
            <div className='logo'></div>
            <SidebarHeader study={study} />
            <div className='clearfix' />
            <LinkPanel data={dataRecords} />
            <div className='clearfix' />
            <AssayPanel assays={assays} dirName={dirName} />
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

function CharacteristicsBox(props) {
    const { name, stats } = props, statsKeys = [], statsVals = [], backgroundColors = [], distributionList = [];
    let index = 0;

    for (const key of Object.keys(stats)) {
        const color = COLORS[index++ % COLORS.length], value = stats[key];
        statsKeys.push(key);
        statsVals.push(value);
        backgroundColors.push(color);
        distributionList.push(<div className='distribution-list'>
            <div className='distribution' style={{color: color}}>{key}</div>
            <div className='distribution-value'>
                <span>{value}</span>
            </div>
        </div>);
    }

    const data = {
        labels: statsKeys,
        datasets: [{
            data: statsVals,
            backgroundColor: backgroundColors
        }]
    };

    return <div style={{overflow: 'auto'}}>
        <p className='characteristic-type'>{name}</p>
        <DoughnutChart data={data} options={doughnutOpts} width={120} height={120} />
        <div className='distribution-list' style={{height: '111px', overflowY: 'scroll'}} >
            <ul>
                {distributionList}
            </ul>
        </div>
    </div>;

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
        for (const statsKey of Object.keys(statsObj)) {
            list.push(<li key={statsKey} style={{overflow: 'auto'}}>
                <CharacteristicsBox name={statsKey} stats={statsObj[statsKey]} />
            </li>);
        }
        return <div id='samples'>
            <div className='section-header' >
                Sample Details
                <span className='btn btn-default' onClick={() => { browserHistory.push(`/${dirName}/${fileName}`); } } >
                    View samples
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
 * @name FactorsView
 */
function FactorsView(props) {
    const { factors = [] } = props, list = [];
    for (const factor of factors) {
        list.push(<li key={factor[STUDY_FACTOR_NAME]}>{factor[STUDY_FACTOR_NAME]}</li>);
    }
    return <div id='factors'>
        <span className='section-header'>Factors</span>
        <ul>{list}</ul>
    </div>;
}

/**
 * @method
 * @name ProtocolsView
 */
function ProtocolsView(props) {
    const { protocols = [] } = props, list = [];
    for (const protocol of protocols) {
        list.push(<li key={protocol[STUDY_PROTOCOL_NAME]}>
            <p className='protocol-name'>
                {`${protocol[STUDY_PROTOCOL_NAME]} `}
                <span className='type-tag'>{protocol[STUDY_PROTOCOL_TYPE]}</span>
            </p>
        </li>);
    }
    return <div id='factors'>
        <span className='section-header'>Methods Details</span>
        <ul>{list}</ul>
    </div>;
}

/**
 * @method
 * @name PublicationsView
 */
function PublicationsView(props) {
    const { publications = [] } = props, list = [];
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
}

/**
 * @method
 * @name PublicationsView
 */
function ContactsView(props) {
    const { contacts = [] } = props, list = [];
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
}

/**
 * @class
 * @name Detail
 */
class Detail extends React.Component {

    render() {
        const { study = {}, dirName } =this.props;
        return <div className='isa-main-view main'>
            <div className='isa-breadcrumbs'>
                <ul className='isa-breadcrumbs-items'>
                    <li className='active' onClick={() => { browserHistory.push('/');}}>
                        <FontAwesome name='chevron-left' className='fa-fw' />
                        Back to Datasets
                    </li>
                    <li>{study[STUDY_IDENTIFIER]}</li>
                </ul>
            </div>
            <div className='clearfix' />
            <div id='study-info' style={{height: '100%'}}>
                <div id='study-title'>{study[STUDY_TITLE]}</div>
                <Descriptor descriptorLink={`${DOI_BASE_URL}/${study[STUDY_IDENTIFIER]}`} />
                <div className='cf' />
                <br />
                <SamplesView samples={study.samples} dirName={dirName} fileName={study[STUDY_FILE_NAME]} />
                <div className='clearfix' />
                <FactorsView factors={study[STUDY_FACTORS]}/>
                <div className='clearfix' />
                <ProtocolsView protocols={study[STUDY_PROTOCOLS]}/>
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
