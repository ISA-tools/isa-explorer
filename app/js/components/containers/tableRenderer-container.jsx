// import 'react-bootstrap-table/css/toastr.css';
// import 'react-bootstrap-table/css/react-bootstrap-table.css';
import 'handsontable/src/css/handsontable.css';

import { isEmpty, isArray, zipObject } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import FontAwesome from 'react-fontawesome';

// ... Handsontable with its main dependencies...
import moment from 'moment';
import numbro from 'numbro';
import pikaday from 'pikaday';
import Zeroclipboard from 'zeroclipboard';
import Handsontable from 'handsontable';

import HotTable from 'react-handsontable';
// import { BootstrapTable as Table, TableHeaderColumn as HeaderCol } from 'react-bootstrap-table';

import Study from '../views/study';
import { getTableFile } from '../../api';


class TableRenderer extends React.Component {

    constructor(props) {
        super(props);
        this.settingsObj = {
            fillHandle: false,
            contextMenu: false,
            manualColumnMove: false,
            manualColumnResize: true,
            manualRowResize: true,
            manualRowMove: false,
            columnSorting: true,
            sortIndicator: true,
            fixedColumnsLeft: 1,
            width: '100%',
            height: 800
        };
    }

    render() {
        const { data = [], dirName } = this.props, headerCols =[];
        if (isEmpty(data) || !isArray(data[0])) {
            return null;
        }
        this.settingsObj.colHeaders = data[0];
        this.settingsObj.data = data.slice(1);

        return <div className='isa-table-main'>
            <div style={{width: 'auto'}}>
                <div className='isa-breadcrumbs'>
                    <ul id='isa-breadcrumb-items'>
                        <li className='active' onClick={() => { browserHistory.push('/'); }}>
                            <FontAwesome name='chevron-left' className='fa-fw' />
                            Back to Datasets
                        </li>
                        <li className='active' onClick={() => { browserHistory.push(`/${dirName}`); }}>
                            <FontAwesome name='align-justify' className='fa-fw' />
                            Dataset Details
                        </li>
                    </ul>
                </div>
                <div className='clearfix' />
                <div id='study-info'>
                    <HotTable root='hot' settings={this.settingsObj} />
                </div>
            </div>
        </div>;
    }

}

class TableRendererContainer extends React.Component {

    componentDidMount() {
        const { dirName, fileName } = this.props.params;
        getTableFile(dirName, fileName);
    }

    render() {
        const { investigation = {}, tableData = [], params: { dirName } } = this.props;
        return <div style={{overflow: 'auto', width: '100vw', height: '100vh'}}>
            <Study.Sidebar investigation={investigation} />
            <TableRenderer data={tableData} dirName={dirName} />
        </div>;
    }

}

function mapStateToProps(store) {
    return {
        investigation: store.studyState.investigation,
        tableData: store.tableRendererState.tableData
    };
}

export default connect(mapStateToProps, null) (TableRendererContainer);
