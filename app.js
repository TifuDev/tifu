const express = require('express');
const notice = require('./api/notice')
const compression = require('compression')
const showdown = require('showdown')
const auth = require('./api/security')

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

app.route('/login')
    .get((req, res) => {
        res.render('login')
    })
    .post((req, res) => {
        auth.login(req.body.username, req.body.passwd).then(data => {
            if (data.status === "SUCC"){
                res.cookie('access', data.token)
                res.cookie('refresh', data.reftoken)

                res.render('index')
            } else {
                res.render('login', { status: data.status })
            }
        })
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

    notice.noticeData(req.params.new).then(data => {
        if(data !== null){
            res.render('notice', {
                title: data.title,
                desc: data.desc,
                content: converter.makeHtml(notice.noticeContent(data.path))
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
    notice.noticeContent(req.params.new).then(data => res.json(data))
})

app.get('/api/new/:new/content', (req, res) => {
    notice.noticeData(req.params.new, 'path').then(data => {
        res.send(notice.noticeContent(data.path))
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
