import React from 'react';

class DataDescriptor extends React.Component {

    render() {
        const { params = {} } = this.props;
        return <div>
            <p>This is the data descriptor {`${params.dataDecriptorId}`}</p>
        </div>;
    }

}

export default DataDescriptor;
