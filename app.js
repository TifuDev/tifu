const express = require('express'),
    notice = require('./api/notice'),
    compression = require('compression'),
    cookieParser = require('cookie-parser'),
    showdown = require('showdown'),
    sec = require('./api/securityv2'),
    upload = require('./api/upload'),
    path = require('path'),
    user = require('./api/user'),
    port = 3000;

var app = express();
app.use(compression());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());

app.set('view engine', 'pug');
app.set('views', 'public/views');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.route('/login')
    .get((req, res) => {
        res.render('login');
    })
    .post((req, res) => {
        new user.User(req.body.username).login(req.body.passwd, (err, token) => {
            if (err) 
                return res.render('login', {
                    credential_not_valid: true
                });
            res.cookie('access', token);

            if(req.query.return_to)
                return res.redirect(req.query.return_to);
            res.redirect('/');
        });
    });

app.get('/new/:path', (req, res, next) => {
    const classMap = {
            h1: 'my-2 text-2xl underline font-semibold',
            p: 'my-2 font-light',
            strong: 'font-light',
            li: 'list-disc'
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
        });
    new notice.Notice(req.params.path).get((err, notice) => {
        if (err) return next();
        res.render('notice', {
            title: notice.data.title,
            desc: notice.data.desc,
            content: converter.makeHtml(notice.content),
            date: notice.data.date
        });
    });
});

app.get('/editor', sec.cookieMiddleware, (req, res) => {
    res.render('editor');
});

app.post('/editor', sec.cookieMiddleware, (req, res) => {
    const body = req.body;
    new notice.Notice(body.id).createPost(body.title, body.desc, req.user.username, body.content, function (err) {
        if (err) {
            if (err.name === 'NoticeExists') {
                return res.status(409).send('Notice already exists');
            } else {
                return res.status(500).send('An error occured!' + err);
            }
        }
        res.send(`/new/${req.body.id}`);
    });
});

app.get('/api/new/:id', (req, res, next) => {
    new notice.Notice(req.params.id).get((err, notice) => {
        if (err) return next();
        res.json(notice);
    });
});

app.get('/new/:path/modify', sec.noticeOwnerCookie, (req, res) => {
    req.notice.get((err, notice) => {
        if(err) return res.status(404).send('Notice Not Found');
        res.render('modify', {
            title: notice.data.title,
            desc: notice.data.desc,
            content: notice.content
        });
    });
});

app.post('/api/login', (req, res) => {
    new user.User(req.body.username).login(req.body.passwd, (err, token) => {
        if (err) return res.status(401).send('Credentials not valid');
        res.json(token);
    });
});

app.get('/api/new/:path/remove', sec.noticeOwner, (req, res) => {
    req.notice.remove(err => {
        if(err) return res.status(500).send('An error occurred! ' + err);
        res.json({
            message: 'Success'
        });
    });
});

app.get('/api/catalog', (req, res) => {
    let filters = {},
        limit = 0,
        sort = {};
    if (req.query) {
        if (req.query.q) {
            filters = {
                title: {
                    $regex: new RegExp(req.query.q)
                }
            };
        }
        if (req.query.author) {
            filters = {
                author: req.query.author
            };
        }
        if (req.query.lim) {
            limit = Number(req.query.lim);
        }
        if (req.query.highest) {
            sort = {
                downloads: -1
            };
        }
    }
    notice.seeCatalog((err, doc) => {
        if (err) return res.status(500);
        res.json(doc);
    }, filters, sort, limit);
});

app.get('/api/new/:path/modify', sec.noticeOwner, (req, res) => {    
    if(req.body.title) req.notice.modifyNoticeTitle(req.body.title);
    if(req.body.desc) req.notice.modifyNoticeDesc(req.body.desc);
    if(req.body.content) req.notice.modifyNoticeContent(req.body.content);

    res.json({
        message: 'Success'
    });
});

app.get('/api/upload/image', upload.handleBinary, (req, res) => {
    const type = 
        /image\/(.*)/.exec(req.headers['content-type'])[1];
    if(['jpeg', 'jpg'].indexOf(type) === -1) 
        return res.send('File extension not allowed');
    upload.storeBinary(req.rawBody, 'jpg', path.join('public', 'uploads', 'images'),
        (err, file_name) => {
            if(err) return res.status(500).send('An error occured! '+ err);
            res.json({
                message: 'Success',
                file_name: file_name
            });
        }
    );
});

app.use(function (req, res) {
    res.status(404).send('Unable to find the requested resource!');
});

app.listen(port, () => console.log(`Server on localhost:${port}`));