const fs = require("fs");
const path = require("path");
const {v4: uuidv4} = require("uuid");

function handleBinary(req, res, next){
    var data = new Buffer.from("");
    req.on("data", function(chunk) {
        data = Buffer.concat([data, chunk]);
    });
    req.on("end", function() {
        req.rawBody = data;
        if(data.length > process.env.UPLOAD_LIMIT)
            return res.status(413).send(
                `File uploaded is too large! Upload limit is ${process.env.UPLOAD_LIMIT} bytes`
            );
        next();
    });
}

function storeBinary(data, ext, dest, callback){
    const file_name = `${uuidv4()}.${ext}`,
        target_dir = path.join(dest, file_name);
    if(!fs.existsSync(dest)) 
        fs.mkdirSync(dest, {recursive: true});    
    fs.writeFile(target_dir, data, (err) => {
        callback(err, file_name);
    });
}

module.exports = {handleBinary, storeBinary};