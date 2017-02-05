import React from 'react';
import { browserHistory } from 'react-router';
import FontAwesome from 'react-fontawesome';
import { Info } from './studies';
import { isObject } from 'lodash';
import {
    DOI_BASE_URL, STUDY_ASSAYS, STUDY_IDENTIFIER, METADATA_DOWNLOAD_LINK_POSTFIX, EXPERIMENTAL_METADATA_LICENCE,
    MANUSCRIPT_LICENCE, DATA_RECORDS, DATA_RECORD_ACCESSION, DATA_RECORD_URI, DATA_REPOSITORY,
    STUDY_ASSAY_MEASUREMENT_TYPE, STUDY_ASSAY_FILE_NAME, STUDY_ASSAY_TECHNOLOGY_TYPE, STUDY_TITLE,
    STUDY_FACTORS, STUDY_FACTOR_NAME, STUDY_PROTOCOLS, STUDY_PROTOCOL_NAME, STUDY_PROTOCOL_TYPE,
    STUDY_PUBLICATIONS, STUDY_PUBLICATION_DOI, STUDY_PUBLICATION_TITLE, STUDY_PUBLICATION_AUTHOR_LIST,
    STUDY_CONTACTS, STUDY_PERSON_FIRST_NAME, STUDY_PERSON_MID_INITIALS, STUDY_PERSON_LAST_NAME, STUDY_PERSON_AFFILIATION
 } from '../../utils/constants';

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
                <FontAwesome name='calendar-o' />
                {study.date}
                <Info text='Dataset publication date' />
            </span>
            <span className='meta__link'>
                <a href={`${DOI_BASE_URL}/${study[STUDY_IDENTIFIER]}`} target='_blank' rel='noopener noreferrer'>
                    <FontAwesome name='link' />
                    Data Descriptor Article
                    <Info text='Link to open the data descriptor article' />
                </a>
            </span>
            <span className='meta__link'>
                <a href={`/data/${metadataDownloadLink}`}>
                    <FontAwesome name='download' />
                    Download Metadata
                    <Info text='Download the data descriptor' />
                </a>
            </span>
            <span className='meta_date'>
                <FontAwesome name='copyright' />
                Dataset Metadata (in ISA format) License {study[EXPERIMENTAL_METADATA_LICENCE]}
                <span className='license-tag'></span><Info text='License for the metadata' />
            </span>
            <span className='meta_date'>
                <FontAwesome name='copyright' />
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
                <FontAwesome name='link' />
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
        const { assays = [] } = this.props, list = [];
        for (const assay of assays) {
            list.push(<li onClick=''>
                <div className="assay-information">
                    <p className="measurement-type">{assay[STUDY_ASSAY_MEASUREMENT_TYPE]}</p>

                    <p className="technology-type">{assay[STUDY_ASSAY_TECHNOLOGY_TYPE]}</p>

                    {/*}<p className="technology-platform">{null}</p> */}

                    <p className="assay-file-name">{assay[STUDY_ASSAY_FILE_NAME]}</p>
                </div>

                <div className="assay-count">
                    <span className="count-badge"><FontAwesome name="chevron-right" /></span>
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
        const { investigation: { studies = [] } = {} } = this.props, study = studies[0],
            assays = isObject(study) && study.hasOwnProperty(STUDY_ASSAYS) ? study[STUDY_ASSAYS] : [],
            dataRecords = isObject(study) && study.hasOwnProperty(DATA_RECORDS) ? study[DATA_RECORDS] : [];
        return <div className='sidebar'>
            <div className='logo'></div>
            <SidebarHeader study={study} />
            <div className='clearfix' />
            <LinkPanel data={dataRecords} />
            <div className='clearfix' />
            <AssayPanel assays={assays} />
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
 * @name SamplesView
 */
class SamplesView extends React.Component {

    render() {
        return <div id='samples'>
            <div className='section-header' >
                Sample Details
                <span className='btn btn-default' onClick={null} >
                    View samples
                </span>
            </div>
            <div className='clearfix' />
            <div id='sample-distribution'>
                <ul></ul>
            </div>
        </div>;
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
        list.push(<li key={protocol}>
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
        list.push(<li key={contact}>
            <p className='publication-title'>
                {`${contact[STUDY_PERSON_FIRST_NAME]} ${contact[STUDY_PERSON_MID_INITIALS]} ${contact[STUDY_PERSON_LAST_NAME]} `}
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
        const { study = {} } =this.props;
        return <div className='isa-main-view main'>
            <div className='isa-breadcrumbs'>
                <ul className='isa-breadcrumbs-items'>
                    <li className='active' onClick={() => { browserHistory.goBack();}}>
                        <FontAwesome name='chevron-left' />
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
                <SamplesView />
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
