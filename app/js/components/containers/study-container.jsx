import React from 'react';
import { connect } from 'react-redux';
import Study from '../views/study';
import { find } from 'lodash';

class StudyContainer extends React.Component {
    render() {
        const study = find(this.props.study, { id: this.props.params.studyId });
        return <div>
            <Study.Sidebar study={study} />
            <Study.Detail study={study} />
        </div>;
    }
}

function mapStateToProps(store) {
    return {
        studies: store.studiesState.studies
    };
}

export default connect(mapStateToProps, null) (StudyContainer);
