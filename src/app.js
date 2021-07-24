const express = require("express"),
    notice = require("./api/notice"),
    sec = require("./api/security"),
    {Person} = require("./api/user"),
    swagger = require("swagger-ui-express"),
    port = process.env.PORT || 3000;

var app = express();
app.use(express.urlencoded({
    extended: false
}));
app.use(express.json());


app.use("/docs", swagger.serve, swagger.setup(
    JSON.parse(require("fs").readFileSync(
        require("path").join("src", "docs.json")
    )))
);

app.get("/new/:path", (req, res, next) => {
    new notice.News(req.params.path).get()
        .then(([newObj]) => res.json({newObj}))
        .catch(err => next(err));
});

app.post("/login", (req, res, next) => {
    new Person(req.body.username).login(req.body.password)
        .then(([token]) => {
            res.json(token);
        })
        .catch(err => next(err));
});

app.get("/new/:path/remove", sec.noticeOwner, (req, res) => {
    req.notice.remove(err => {
        if(err) return res.status(500).send("An error occurred! " + err);
        res.status(204);
    });
});

app.get("/catalog", (req, res) => {
    let filters = {},
        limit = 0,
        sort = {};
    if (req.query) {
        if (req.query.q)
            filters = {
                title: {
                    $regex: new RegExp(req.query.q)
                }
            };
        if (req.query.author)
            filters = {
                author: req.query.author
            };
        if (req.query.lim)
            limit = Number(req.query.lim);
        if (req.query.highest)
            sort = {downloads: -1};
    }
    notice.seeCatalog((err, doc) => {
        if (err) return res.status(500);
        res.json(doc);
    }, filters, sort, limit);
})

app.get("/new/:path/write", sec.authMiddleware, (req, res, next) => {
    const body = req.body;
    req.person.get()
        .then((person) => {
            new notice.News(req.params.path).write(
                body.title,
                body.content,
                body.desc,
                person,
                body.metadata
            ).then(newObj => res.json(newObj))
            .catch(err => next(err));
        })
        .catch(err => next(err));
});

app.get("/person/:username", (req, res, next) => {
    const person = new Person(req.params.username);
    person.get()
        .then(person => {
            res.send(person);
        })
        .catch(err => {
            next(err);
        });
});

app.use(function (req, res) {
    res.status(404).send("Unable to find the requested resource!");
});

app.listen(port, () => console.log(`Server on localhost:${port}`));
