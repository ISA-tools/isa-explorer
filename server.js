/**
 * @author Massimiliano Izzo
 */

const express = require('express'), port = process.env.PORT || 3000,
    compression = require('compression'),
    app = express(), path = require('path'),
    fs = require('fs'),
    ISATAB_INDEX_FILE = 'isatab-index.json';

const indexHtmlFile = process.env.NODE_ENV === 'production' ? path.resolve(__dirname, 'assets', 'dist', 'prod', 'index.html') :
    path.resolve(__dirname, 'assets', 'bundles', 'index.html');

app.use(compression());

app.use('/assets', express.static(`${__dirname}/assets`));
app.use('/data', express.static(`${__dirname}/data`));
app.use('/isatab-index.json', express.static(`${__dirname}/isatab-index.json`));

app.get('/study', function(req, res) {
    fs.readFile(ISATAB_INDEX_FILE, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send({
                message: 'Some error happened while retrieving the file'
            });
        }
        const payload = JSON.parse(data);
        res.send(payload);
    });
});

app.get('/investigationFile/:id', function(req, res) {
    const filePath = path.resolve(__dirname, 'data', req.params.id, 'i_Investigation.txt'), options = null;
    res.sendFile(filePath, options, err => {
        if (err) {
            res.status(err.status).end();
        }
    });
});

app.get('/jsonld/:id', function(req, res) {
    const filePath = path.resolve(__dirname, 'data', 'jsonld', `${req.params.id}.json`), options = null;
    res.sendFile(filePath, options, err => {
        if (err) {
            res.status(200).json(null);
        }
    });
});

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('*', function (req, res){
    res.sendFile(indexHtmlFile);
});

app.listen(port, () => {
    console.log(`ISA-explorer listening on port ${port}`);
});
