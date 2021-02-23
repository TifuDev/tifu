const express = require('express');
var request = require('request');

const port = 3000;
var app = express();

app.set('view engine', 'pug');
app.set('views', 'public/views');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/new/:new', (req, res) => {
    
})

app.get('/api/newcontent/:new', (req, res) => {
    require('./api/getNew').getNew(req.params.new).then(data => {
        res.send(require('./api/getNewContent').readFile(data.path))
    })
})

app.get('/api/getnew/:new', (req, res) => {
    require('./api/getNew').getNew(req.params.new).then(news => {
        res.json(news)
    })
})

app.listen(port, () => console.log(`Server on localhost:${port}`))