import React from 'react';
import DataDescriptor from '../views/data-descriptor'
import index from '../../../../isatab-index.json';

class DataDescriptorContainer extends React.Component {

    render() {

        const { params = {} } = this.props;

        const dataDescriptor = _.find( index , {"dir": params.dataDecriptorId});


        return <div>
            <div className="container">
                <button id="menu-toggle" class="menu-toggle"><span>Menu</span></button>
                <DataDescriptor.Sidebar/>
                <DataDescriptor.Main dataDescriptor={ dataDescriptor }/>
            </div>
        </div>;

    }

}

export default DataDescriptorContainer;