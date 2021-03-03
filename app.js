const express = require('express');
const newsData = require('./api/getNewData');
const compression = require('compression')
const showdown = require('showdown')
const auth = require('./api/auth2')

const port = 3000;
var app = express();

app.use(compression())
app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'pug');
app.set('views', 'public/views');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/new/:new', (req, res) => {
    const classMap = {
        h1: 'my-2 text-2xl underline font-semibold',
        p: 'my-2 font-light',
        strong: 'font-light',
        li:'list-disc'
    }

    const bindings = Object.keys(classMap)
        .map(key => ({
          type: 'output',
          regex: new RegExp(`<${key}(.*)>`, 'g'),
          replace: `<${key} class="${classMap[key]}" $1>`
        }));
    
    const converter = new showdown.Converter({
        noHeaderId: true,
        extensions: [bindings]
    })

    newsData.getNews(req.params.new).then(notice => {
        if(notice !== null){
            res.render('notice', {
                title: notice.title,
                desc: notice.desc,
                content: converter.makeHtml(newsData.getContent(notice.path))
            })
        }else{
            res.status(404).render('notice', {notice_not_found: true})
        }
    })
})

app.get('/editor', (req, res) => {
    res.render('new_notice')
})

app.get('/api/new/:new/data', (req, res) => {
    newsData.getNews(req.params.new).then(data => res.json(data))
})

app.get('/api/new/:new/content', (req, res) => {
    newsData.getNews(req.params.new, 'path').then(data => {
        res.send(newsData.getContent(data.path))
    })
})

app.get('/api/get/access', (req, res) => {
    const authHeader = req.headers.authorization
    if(authHeader !== undefined){
        auth.refreshAccess(authHeader.split(' ')[1]).then(data => {
            res.json(data)
        })
    } else{
        res.json({
            status: 'FORB',
            reftoken: undefined
        })
    }
})

app.post('/api/login', (req, res) => {
    const body = req.body
    auth.login(body.username, body.passwd).then(data => {
        res.json(data)
    })
})

app.listen(port, () => console.log(`Server on localhost:${port}`))
