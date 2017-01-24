/*
const connect = require('connect');
const serveStatic = require('serve-static');
const app = connect();
app.use(__dirname).listen(8080, function(){
    console.log('Server running on 8080...');
}); */

const express = require('express'), port = process.env.PORT || 3000,
    app = express(), path = require('path'),
    fs = require('fs'),
    ISATAB_INDEX_FILE = 'isatab-index.json';
app.use('/assets', express.static(`${__dirname}/assets`));
app.use('/data', express.static(`${__dirname}/data`));
app.use('/isatab-index.json', express.static(`${__dirname}/isatab-index.json`));

app.get('/study', function(req, res) {
    fs.readFile('isatab-index.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send({
                message: 'Some error happened while retrieving the file'
            });
        }
        const payload = JSON.parse(data);
        res.send(payload);
    });
});

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('*', function (req, res){
    res.sendFile(path.resolve(__dirname, 'assets', 'bundles', 'index.html'));
});

app.listen(port, () => {
    console.log(`ISA-explorer listening on port ${port}`);
});
