import React from 'react';
import { connect } from 'react-redux';
import Study from '../views/study';
import { getInvestigationFile } from '../../api';

class StudyContainer extends React.Component {

    componentDidMount() {
        const { dirName } = this.props.params;
        getInvestigationFile(dirName);
    }

    render() {
        const { investigation, params: { dirName } } = this.props, { studies: [study = {}, ...rest] = []} = investigation;
        return <div className='container' style={{float: 'left', clear: 'None'}}>
                <Study.Sidebar investigation={investigation} dirName={dirName} />
                <Study.Detail study={study} dirName={dirName} />

        </div>;
    }
}

function mapStateToProps(store) {
    return {
        investigation: store.studyState.investigation
    };
}

export default connect(mapStateToProps, null) (StudyContainer);
