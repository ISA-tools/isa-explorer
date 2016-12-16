/*
const connect = require('connect');
const serveStatic = require('serve-static');
const app = connect();
app.use(__dirname).listen(8080, function(){
    console.log('Server running on 8080...');
}); */

const express = require('express'), port = process.env.PORT || 3000,
    app = express(), path = require('path');
app.use('/assets', express.static(`${__dirname}/assets`));
app.use('/data', express.static(`${__dirname}/data`));
app.use('/isatab-index.json', express.static(`${__dirname}/isatab-index.json`));

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('*', function (request, response){
    response.sendFile(path.resolve(__dirname, 'assets', 'bundles', 'index.html'));
});

app.listen(port);
