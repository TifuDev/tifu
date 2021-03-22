const express = require('express'),
notice = require('./api/notice'),
compression = require('compression'),
cookieParser = require('cookie-parser'),
showdown = require('showdown'),
auth = require('./api/security'),
port = 3000;

var app = express();

app.use(compression())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());

app.set('view engine', 'pug');
app.set('views', 'public/views');
app.use(express.static('public'));

app.get('/', (req, res) => {
    notice.seeCatolog((err, doc) => res.render('index', {data: doc}))
})

app.route('/login')
    .get((req, res) => {
        res.render('login')
    })
    .post((req, res) => {
        auth.login(req.body.username, req.body.passwd, (err, data) => {
            if(err) return res.render('login', {credential_not_valid: true})
            
            res.cookie('access', data.access)
            res.cookie('refresh', data.reftoken)
            res.redirect('/')
        })
    })

app.get('/new/:new', (req, res, next) => {
    const classMap = {
        h1: 'my-2 text-2xl underline font-semibold',
        p: 'my-2 font-light',
        strong: 'font-light',
        li:'list-disc'
    },

    bindings = Object.keys(classMap)
        .map(key => ({
          type: 'output',
          regex: new RegExp(`<${key}(.*)>`, 'g'),
          replace: `<${key} class="${classMap[key]}" $1>`
        })),
    
    converter = new showdown.Converter({
        noHeaderId: true,
        extensions: [bindings]
    })

    notice.getNotice(req.params.new, (err, notice) => {
        if(err) return next(err);
        res.render('notice', {
            title: notice.data.title,
            desc: notice.data.desc,
            content: converter.makeHtml(notice.content),
            date: notice.data.date
        })
    })
})

app.get('/editor', auth.webAuth, (req, res) => {
    res.render('editor')
})
app.post('/editor', auth.webAuth, (req, res) => {
    notice.createPost(req.body.title, req.body.desc, req.body.id, req.username, req.body.content, function(err){
        if(err){
            if(err.name === 'NoticeExists'){
                return res.status(409).send('Notice already exists')    
            }else{
                return res.status(500).send('An error occured')
            }
        }
        res.send(`/new/${req.body.id}`)
    })
})

app.get('/api/new/:new', (req, res, next) => {
    notice.getNotice(req.params.new, (err, notice) => {
        if(err) return next();
        res.json(notice)
    })
})

app.post('/api/get/access', (req, res) => {
    const authHeader = req.headers.authorization
    if(authHeader !== undefined){
        auth.refreshAccess(authHeader.split(' ')[1], (err, data) => {
            if(err) return res.status(403).send('Token is not valid')
            res.json(data)
        })
    } else res.status(401);
})

app.post('/api/login', (req, res) => {
    auth.login(req.body.username, req.body.passwd, (err, data) => {
        if(err) return res.status(401).send('Credentials not valid');
        res.json(data)
    })
})

app.get('/api/catalog', (req, res) => {
    let filters = {},
    limit = 0,
    sort = {}
    if(req.query){
        if(req.query.q){
            filters = {
                title: {$regex: new RegExp(req.query.q)}
            }
        }
        if(req.query.author){
            filters = {
                author: req.query.author
            }
        }
        if(req.query.lim){
            limit = Number(req.query.lim)
        }
        if(req.query.highest){
            sort = {
                downloads: -1
            }
        }
    }
    notice.seeCatalog((err, doc) => {
        if(err) return res.status(500);
        res.json(doc)
    }, filters, sort, limit)
})

app.use(function (req, res){
	res.status(404).send('Unable to find the requested resource!');
});

app.listen(port, () => console.log(`Server on localhost:${port}`))
