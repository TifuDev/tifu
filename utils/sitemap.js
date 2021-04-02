const fs = require("fs"),
xml = require("xml2js"),
builder = new xml.Builder();

class Sitemap{
    constructor(sitemap_path){
        this.path = sitemap_path
    }
    read(){
        xml.parseString(fs.readFileSync(this.path, "utf-8"), (err, res) => {
            if(err) return new Error('An error occured when parsing: ' + err)
            this.obj = res
        })
    }
    addUrlToSet(loc, lastmod){
        let urlset = this.obj.urlset
        try {
            urlset.url.push({
                loc: loc,
                lastmod: lastmod
            })
        } catch {
            urlset.url = {
                loc: loc,
                lastmod: lastmod
            }
        }

        this.obj.urlset = urlset
    }
    removeUrlFromSet(loc){
        for (let i = 0; i < this.obj.urlset.url.length; i++) {
            let elem = this.obj.urlset.url[i];
            if(elem.loc[0] === loc){
                this.obj.urlset.url.splice(i, 1)
            };

        }
    }
    write(){
        fs.writeFileSync(this.path, builder.buildObject(this.obj))
    }
}

module.exports = {Sitemap}