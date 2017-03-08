import React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import Study from '../views/study';
import { getInvestigationFile } from '../../api';

class StudyContainer extends React.Component {

    componentDidMount() {
        const { dirName } = this.props.params;
        getInvestigationFile(dirName);
    }

    render() {
        const { investigation, jsonld = {}, params: { dirName } } = this.props, { studies: [study = {}, ...rest] = []} = investigation;
        return <div className='container' style={{float: 'left', clear: 'None'}}>
                <Helmet 
                    script={[
                        { type: 'application/ld+json', innerHTML: JSON.stringify(jsonld) }
                    ]}
                />
                <Study.Sidebar investigation={investigation} dirName={dirName} />
                <Study.Detail investigation={investigation} dirName={dirName} />
        </div>;
    }
}

function mapStateToProps(store) {
    return {
        investigation: store.studyState.investigation,
        jsonld: store.studyState.jsonld
    };
}

export default connect(mapStateToProps, null) (StudyContainer);
