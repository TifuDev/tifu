const fs = require('fs');
const path = require('path');
const {v4: uuidv4} = require('uuid');

function handleBinary(req, res, next){
    var data = new Buffer.from('');
    req.on('data', function(chunk) {
        data = Buffer.concat([data, chunk]);
    });
    req.on('end', function() {
      req.rawBody = data;
      next();
    });
}

function storeBinary(data, ext, dest){
    const file_name = uuidv4();
    let target_dir = path.join(dest, `${file_name}.${ext}`);

    if(!fs.existsSync(dest)) fs.mkdirSync(dest, {recursive: true});
    fs.mkdirSync(dest, {recursive: true});
    
    fs.writeFileSync(target_dir, data);   
}

module.exports = {handleBinary, storeBinary};