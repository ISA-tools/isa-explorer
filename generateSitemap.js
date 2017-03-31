const sm = require('sitemap');
const fs = require('fs'), path = require('path');

/**
 * @return{sitemap} sitemap object
 */
const generateSitemap = function generateSitemap({
    hostname = 'http://toad.oerc.ox.ac.uk',
    cacheTime = 60000,
    dataDir = 'data',
    pattern = 'sdata'
} = {}) {

    const sitemap = sm.createSitemap({hostname, cacheTime, urls: [
        { url: '/', priority: 1}
    ]});

    const srcPath = path.join(__dirname, dataDir), files = fs.readdirSync(srcPath);

    for (const file of files) {
        if (fs.statSync(path.join(srcPath, file)).isDirectory() && file.startsWith(pattern)) {
            sitemap.add({url: `/${file}`, priority: 0.8});
        }
    }
    // fs.writeFileSync(path.join('assets', 'sitemap.xml'), sitemap.toString());
    return sitemap;
};

module.exports = generateSitemap;
