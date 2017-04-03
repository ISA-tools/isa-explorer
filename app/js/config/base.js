const config = {};

config.facets = [
    {
        name: '_repositories',
        display: 'Data Repositories',
        info: 'Filter by repositories where the datasets can be found'
    },
    {
        name: '_designs',
        display: 'Designs',
        info: 'Filter by the designs of the studies that yielded the datasets'
    },
    {
        name: '_assays',
        display: 'Measurement Types',
        info: 'Filter by measurements used in the studies'
    },
    {
        name: '_technologies',
        display: 'Technology Types',
        info: 'Filter by technologies used in the studies'
    },
    {
        name: '_factors',
        display: 'Factor Types',
        info: 'Filter by experimental factors for the studies'
    },
    {
        name: '_organisms',
        display: 'Organisms',
        info: 'Filter by the organism used in the studies'
    },
    {
        name: '_environments',
        display: 'Environment Types',
        info: 'Filter by types of environments'
    },
    {
        name: '_locations',
        display: 'Geographic Locations',
        info: 'Filter by geographic location'
    }

];

export default config;
