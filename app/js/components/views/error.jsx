import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
import FontAwesome from 'react-fontawesome';
import { SERVER_ERROR, CLIENT_ERROR, NOT_FOUND_ERROR } from '../../utils/constants';

export const ServerErrorView = props => {
    const { error: { message = 'Server Error' } = {}} = props;
    return <div className='server-error'>
        <span>{message.toUpperCase()}</span>
        <div className='cf' />
        An unexpected error occurred. Sorry for the inconvenience.
        <div className='cf' />
        <button className='btn btn-default' onClick={() => browserHistory.push('/')} >
            <FontAwesome name='home' className='fa-fw' />
            Home
        </button>
    </div>;
};

export const NotFoundErrorView = props => {
    const { error: { message = 'Not Found' } = {}} = props;
    return <div className='not-found-error' >
        <span>{message.toUpperCase()}</span>
        <div className='cf' />
        The requested resource does not exist or cannot be found.
        <div className='cf' />
        <button className='btn btn-default' onClick={() => browserHistory.push('/')} >
            <FontAwesome name='home' className='fa-fw' />
            Home
        </button>
    </div>;
};

export const ClientErrorView = props => {
    const { error: { message = 'Client Error' } = {}} = props;
    return <div className='client-error'>
        <span>{message.toUpperCase()}</span>
        <div className='cf' />
        Your request could not be processed by the server.
        Please check it again.
        <div className='cf' />
        <button className='btn btn-default' onClick={() => browserHistory.push('/')} >
            <FontAwesome name='home' className='fa-fw' />
            Home
        </button>
    </div>;
};

const ErrorView = props => {
    let view;
    switch (props.error.message) {
        case SERVER_ERROR:
            view = <ServerErrorView {...props} />;
            break;
        case NOT_FOUND_ERROR:
            view = <NotFoundErrorView {...props} />;
            break;
        case CLIENT_ERROR:
            view = <ClientErrorView {...props} />;
            break;
        default:
            view = <ServerErrorView {...props} />;
    }
    return <div>
        <div className="container">
            <button id="menu-toggle" className="menu-toggle"><span>Menu</span></button>
            <div style={ {align: 'center'} }>
                <div style={ {margin: '0 auto', width: '600px'} }>
                    What is the ISA-explorer tool? It is a beta-version tool to discover datasets from <a href="http://www.nature.com/sdata/">NPG Scientific Data</a>. Learn more about it in the <a href="http://blogs.nature.com/scientificdata/2015/12/17/isa-explorer/">Scientific Data blog post</a>.
                    Do you have feedback? <a href="mailto:isatools@googlegroups.com?Subject=ISA-explorer">Write to us!</a>

                </div>
            </div>
            {view}
        </div>
    </div>;
};

ErrorView.propTypes = {
    error: PropTypes.object
};

export default ErrorView;
