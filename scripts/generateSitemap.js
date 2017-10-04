const sm = require('sitemap');
const fs = require('fs'), path = require('path');

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};
var date = new Date();
date.yyyymmdd();


/**
 * @return{sitemap} sitemap object
 */
const generateSitemap = function generateSitemap({
    hostname = 'http://scientificdata.isa-explorer.org',
    cacheTime = 60000,
    dataDir = 'data',
    pattern = 'sdata'
} = {}) {

    const sitemap = sm.createSitemap({hostname, cacheTime, urls: [
        { url: '/', priority: 1, lastmod: date}
    ]});

    const srcPath = path.join(__dirname, '..', dataDir), files = fs.readdirSync(srcPath);

    for (const file of files) {
        if (fs.statSync(path.join(srcPath, file)).isDirectory() && file.startsWith(pattern)) {
            sitemap.add({url: `/${file}`, priority: 0.8, lastmod: date});
        }
    }
    // fs.writeFileSync(path.join('assets', 'sitemap.xml'), sitemap.toString());
    return sitemap;
};

module.exports = generateSitemap;
