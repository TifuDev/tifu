const express = require('express');
const newsData = require('./api/getNewData');

const port = 8080;
var app = express();

app.set('view engine', 'pug');
app.set('views', 'public/views');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/new/:new', (req, res) => {
    require('./api/getNew').getNew(req.params.new).then(news => {
        res.render('new', { 
            content: require('./api/getNewContent').readFile(news.path),
            title: news.title,
            desc: news.desc
        })
    })
})

app.get('/api/newsdata/:new', (req, res) => {
    newsData.getNews(req.params.new).then(data => res.json(data))
})

app.get('/api/newscontent/:new', (req, res) => {
    newsData.getNews(req.params.new, 'path').then(data => {
        console.log(data.path)
        res.send(newsData.getContent(data.path))
    })
})

app.listen(port, () => console.log(`Server on localhost:${port}`))