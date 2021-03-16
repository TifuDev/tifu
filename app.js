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

app.route('/editor')
    .get((req, res) => {
        res.render('editor')
    })
    .post((req, res) => {
        console.log(req.body)
        res.send('A')
    })

app.get('/api/new/:new', (req, res, next) => {
    notice.getNotice(req.params.new, (err, notice) => {
        if(err) return next();
        res.json(notice)
    })
})

app.post('/api/get/access', auth.authMiddleware,(req, res) => {
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
    notice.seeCatolog((err, doc) => res.json(doc))
})

app.get('/api/middleware', auth.authMiddleware, (req, res) => {
    res.send(req.username)
})

app.use(function (req, res){
	res.status(404).send('Unable to find the requested resource!');
});

app.listen(port, () => console.log(`Server on localhost:${port}`))
