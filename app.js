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
        // !HERE
        auth.login(req.body.username, req.body.passwd, (data) =>{
            if (data.status === "SUCC"){
                res.cookie('access', data.token)
                res.cookie('refresh', data.reftoken)


                res.redirect('/')
            } else res.render('login', { status: data.status });
        })
    })

app.get('/new/:new', (req, res) => {
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
    // !HERE
    notice.getNotice(req.params.new, (notice) => {
        if(notice.data === null){
            res.status(404).render('notice', {notice_not_found: true})
        }else {
            res.render('notice', {
                title: notice.data.title,
                desc: notice.data.desc,
                content: converter.makeHtml(notice.content),
                date: notice.data.date
            })
        }
    })
})

app.get('/editor', (req, res) => {
    res.render('editor')
})

app.get('/api/new/:new', (req, res) => {
    // !HERE
    notice.getNotice(req.params.new, (notice) => res.json(notice))
})

app.get('/api/get/access', (req, res) => {
    const authHeader = req.headers.authorization
    if(authHeader !== undefined){
        // !HERE
        auth.refreshAccess(authHeader.split(' ')[1], (data) => res.json(data))
    } else res.status(403);
})

app.post('/api/login', (req, res) => {
    // !HERE
    auth.login(req.body.username, req.body.passwd, (data) => res.json(data))
})

app.get('/api/catalog', (req, res) => {
    notice.seeCatolog((err, doc) => res.json(doc))
})

app.use(function (req, res){
	res.status(404).send('Unable to find the requested resource!');
});

app.listen(port, () => console.log(`Server on localhost:${port}`))

// TODO Implement error handler