const fs = require("fs"),
xml = require("xml2js");

var builder = new xml.Builder()

function sitemap2json(sitemap_path){
    const sitemap_content = fs.readFileSync(sitemap_path, "utf-8");
    let json_object;

    xml.parseString(sitemap_content, (err, result) => {
        if(err) return;
        json_object = result
    })

    return json_object
}

function addUrlInSet(object, loc, lastmod){
    let urlset = object.urlset.url
    urlset.push({
        loc: loc,
        lastmod: lastmod
    })

    return urlset
}

function writeSitemap(object, sitemap_path){
    fs.writeFileSync(sitemap_path, builder.buildObject(object))
}

module.exports = {sitemap2json, addUrlInSet, writeSitemap}

// URL to add sitemap in Google sitemap list
// https://www.google.com/ping?sitemap=<url_to_your_sitemap.xml>

// Sources
// https://kinsta.com/pt/blog/submeter-website-motores-busca/