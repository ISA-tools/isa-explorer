// tests.webpack.js
var context = require.context(`${__dirname}/../assets/test`, true, /.+\.test\.jsx?$/);

require('core-js/es5');
require('core-js/es6');

context.keys().forEach(context);
module.exports = context;
