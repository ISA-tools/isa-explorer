import React from 'react';
import { connect } from 'react-redux';
import Study from '../views/study';
import { getInvestigationFile } from '../../api';
import ISATab from '../../model/ISATab';

class StudyContainer extends React.Component {

    componentDidMount() {
        const { dirName } = this.props.params;
        getInvestigationFile(dirName);
    }

    render() {
        const { investigation } = this.props;
        return <div>
            <Study.Sidebar investigation={investigation} />
                        { /*
            <Study.Detail />
            */}
        </div>;
    }
}

function mapStateToProps(store) {
    return {
        investigation: store.studyState.investigation
    };
}

export default connect(mapStateToProps, null) (StudyContainer);
