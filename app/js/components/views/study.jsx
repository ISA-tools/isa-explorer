import React from 'react';
import FontAwesome from 'react-fontawesome';
import { Info } from './studies';
import {
    DOI_BASE_URL, STUDY_ASSAYS, STUDY_IDENTIFIER, METADATA_DOWNLOAD_LINK_POSTFIX, EXPERIMENTAL_METADATA_LICENCE,
    MANUSCRIPT_LICENCE
 } from '../../utils/constants';

class SidebarHeader extends React.Component {

    constructor(props) {
        super(props);
        this._computeMetadataDownloadLink = this._computeMetadataDownloadLink.bind(this);
    }

    /* TODO need to add endpoint to download file (?) */
    _computeMetadataDownloadLink() {
        const id = this.props.study[STUDY_IDENTIFIER];
        return `${id.substring(id.indexOf('/')).remove(/./g, '')}${METADATA_DOWNLOAD_LINK_POSTFIX}`;
    }

    render() {
        const { study } = this.props;
        return <div id='meta_info'>
            <span className='meta_date'>
                <FontAwesome name='calendar-o' />
                {study.date}
                <Info text='Dataset publication date' />
            </span>
            <span className='meta_link'>
                <a href={`${DOI_BASE_URL}/${study[STUDY_IDENTIFIER]}`} target='_blank' rel='noopener noreferrer'>
                    <FontAwesome name='link' />
                    Data Descriptor Article
                    <Info text='Link to open the data descriptor article' />
                </a>
            </span>
            <span className='meta_link'>
                <a href={this._computeMetadataDownloadLink}>
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
        const list = [];
        for (const datum of this.props.data) {
            list.push(<li>
                <FontAwesome name='link' />
                <a href={datum} target='_blank' rel='noopener noreferrer' style={{color: '#ffffff'}}>
                    {datum}
                </a>
            </li>);
        }
        return <div class="filter" id="data-link-panel">
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
                    <p className="measurement-type">{null}</p>

                    <p className="technology-type">{null}</p>

                    {/*}<p className="technology-platform">{null}</p> */}

                    <p className="assay-file-name">{null}</p>
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

    constructor(props) {
        super(props);
        this._generateHeaders = this._generateHeaders.bind(this);
    }

    render() {
        const { investigation: { studies = [] } } = this.props, study = studies[0];
        return <div className='meta meta-full'>
            <div className='logo'></div>
            <SidebarHeader study={study} />
            <div className='clearfix' />
            <LinkPanel data='' />
            <div className='clearfix' />
            <AssayPanel assays={study[STUDY_ASSAYS]} />
        </div>;
    }



}

/**
 * @class
 * @name Detail
 */
class Detail extends React.Component {

    render() {}

}

export default {
    Sidebar: Sidebar,
    Detail: Detail
};
