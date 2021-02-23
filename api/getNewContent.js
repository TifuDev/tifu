function readFile(path) {
    return require('fs').readFileSync(path, 'utf-8')
}

module.exports = { readFile }