import React from 'react';
import Study from '../views/study'
import index from '../../../../isatab-index.json';

class StudyContainer extends React.Component {

    render() {

        const { params = {} } = this.props;

        const study = _.find( index , {"dir": params.studyId});


        return <div>
            <div className="container">
                <button id="menu-toggle" class="menu-toggle"><span>Menu</span></button>
                <Study.Sidebar/>
                <Study.Details study={ study }/>
            </div>
        </div>;

    }

}

export default StudyContainer;