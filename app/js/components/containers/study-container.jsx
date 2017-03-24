import React from 'react';
import { connect } from 'react-redux';
// import Helmet from 'react-helmet';

import Study from '../views/study';
import { getInvestigationFile } from '../../api';

import ErrorView from '../views/error';

class StudyContainer extends React.Component {

    componentDidMount() {
        const { dirName } = this.props.params;
        getInvestigationFile(dirName);
    }

    render() {
        const { investigation, error, params: { dirName } } = this.props; // { studies: [study = {}, ...rest] = []} = investigation;
        if (error) {
            return <ErrorView error={error} />;
        }
        return <div className='container' style={{float: 'left', clear: 'None'}}>
                {/*
                <Helmet
                    script={[
                        { type: 'application/ld+json', innerHTML: JSON.stringify(jsonld) }
                    ]}
                />
                */}
                <Study.Sidebar investigation={investigation} dirName={dirName} />
                <Study.Detail investigation={investigation} dirName={dirName} />
        </div>;
    }
}

function mapStateToProps(store) {
    return {
        investigation: store.studyState.investigation,
        jsonld: store.studyState.jsonld,
        error: store.studyState.error
    };
}

export default connect(mapStateToProps, null) (StudyContainer);
