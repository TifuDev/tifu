const express = require("express"),
    notice = require("./api/notice"),
    compression = require("compression"),
    cookieParser = require("cookie-parser"),
    sec = require("./api/security"),
    upload = require("./api/upload"),
    path = require("path"),
    {Person} = require("./api/user"),
    swagger = require("swagger-ui-express"),
    fs = require("fs"),
    port = 3000;

var app = express();
app.use(compression());
app.use(express.urlencoded({
    extended: false
}));
app.use(express.json());
app.use(cookieParser());

app.set("view engine", "pug");
app.set("views", "public/views");
app.use(express.static("public"));

app.use("/", swagger.serve, swagger.setup(JSON.parse(fs.readFileSync("./docs.json"))));

app.get("/api/new/:path", (req, res, next) => {
    new notice.News(req.params.path).get()
        .then(([newObj]) => res.json({newObj}))
        .catch(err => next(err));
});

app.post("/api/login", (req, res, next) => {
    new Person(req.body.username).login(req.body.password)
        .then(([token, doc]) => {
            res.json(token);
        })
        .catch(err => next(err));
});

app.get("/api/new/:path/remove", sec.noticeOwner, (req, res) => {
    req.notice.remove(err => {
        if(err) return res.status(500).send("An error occurred! " + err);
        res.status(204);
    });
});

app.get("/api/catalog", (req, res) => {
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
});

app.get("/api/upload/image", upload.handleBinary, (req, res) => {
    const type = 
        /image\/(.*)/.exec(req.headers["content-type"])[1];
    if(["jpeg", "jpg"].indexOf(type) === -1) 
        return res.send("File extension not allowed");
    upload.storeBinary(req.rawBody, "jpg", path.join("public", "uploads", "images"),
        (err, file_name) => {
            if(err) return res.status(500).send("An error occured! "+ err);
            res.json({
                message: "Success",
                file_name: file_name
            });
        }
    );
});

app.get("/api/new/:path/write", sec.authMiddleware, (req, res, next) => {
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

app.get("/api/person/:username", (req, res, next) => {
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
