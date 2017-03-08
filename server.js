/**
 * @author Massimiliano Izzo
 */

const express = require('express'), port = process.env.PORT || 3000,
    compression = require('compression'),
    app = express(), path = require('path'),
    fs = require('fs'),
    Promise = require('bluebird'),
    readFile = Promise.promisify(require('fs').readFile),
    cheerio = require('cheerio'),
    ISATAB_INDEX_FILE = 'isatab-index.json',
    INVESTIGATIONS_ID_REGEX = /^sdata/;

const indexHtmlFile = process.env.NODE_ENV === 'production' ? path.resolve(__dirname, 'assets', 'dist', 'prod', 'index.html') :
    path.resolve(__dirname, 'assets', 'bundles', 'index.html');

/**
 * @description container for coroutines (async flow on the server-side)
 */
const co = {

    /**
     * @method
     * @name servePage
     * @description injects the proper JSON-LD structured object as a script, if an opportune JSON-LD file exists
     */
    servePage: Promise.coroutine(function* (req, res) {
        const html = yield readFile(indexHtmlFile, 'utf8');
        const $ = cheerio.load(html);
        console.log(`servePage() - request path: ${req.path}`);
        const id = req.path && req.path.split('/')[1];
        console.log(`servePage() - investigation ID: ${id}`);
        if (id.match(INVESTIGATIONS_ID_REGEX)) {
            const filePath = path.resolve(__dirname, 'data', 'jsonld', `${id}.json`);
            const jsonld = yield readFile(filePath, 'utf8');
            $('head').append(`<script type='application/ld+json' >${jsonld}</script>`);
        }
        console.log(`Resulting HTML is: ${$.html()}`);
        res.send($.html());
    })

};

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
    co.servePage(req, res)
    .catch(err => {
        // TODO implement stadardsed catch method
        console.error(err);
        res.status(500).send({
            message: err.message
        });
    });
});

app.listen(port, () => {
    console.log(`ISA-explorer listening on port ${port}`);
});
