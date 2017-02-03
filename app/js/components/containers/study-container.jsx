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
        const { investigation } = this.props, { studies: [study = {}, ...rest] = []} = investigation;
        return <div className='container'>
                <Study.Sidebar investigation={investigation} />
                <Study.Detail study={study} />

        </div>;
    }
}

function mapStateToProps(store) {
    return {
        investigation: store.studyState.investigation
    };
}

export default connect(mapStateToProps, null) (StudyContainer);
