import React from 'react';
import FontAwesome from 'react-fontawesome';
import { Info } from './studies';
import { DOI_BASE_URL } from '../../utils/constants';

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
        const { study } = this.props;
        return <div className='meta meta-full'>
            <div className='logo'></div>
            {this._generateHeaders()}
            <div className='clearfix' />
            <LinkPanel data='' />
            <div className='clearfix' />
            <AssayPanel assays={study._assays} />
        </div>;
    }

    _generateHeaders() {
        const { study } = this.props;
        return <div id='meta_info'>
            <span className='meta_date'>
                <FontAwesome name='calendar-o' />
                {study.date}
                <Info text='Dataset publication date' />
            </span>
            <span className='meta_link'>
                <a href={`${DOI_BASE_URL}/${study.id}`} target='_blank' rel='noopener noreferrer'>
                    <FontAwesome name='link' />
                    Data Descriptor Article
                    <Info text='Link to open the data descriptor article' />
                </a>
            </span>
            <span className='meta_link'>
                <a href='#'>
                    <FontAwesome name='download' />
                    Download Metadata
                    <Info text='Download the data descriptor' />
                </a>
            </span>
            <span className='meta_date'>
                <FontAwesome name='copyright' />
                Dataset Metadata (in ISA format) License
                <span className='license-tag'></span><Info text='License for the metadata' />
            </span>
            <span className='meta_date'>
                <FontAwesome name='copyright' />
                Data Descriptor Article License
                <span className='license-tag'></span><Info text='License for the article' />
            </span>
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
