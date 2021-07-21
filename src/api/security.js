const {verify} = require("jsonwebtoken"),
    {User, Person} = require("./user"),
    {Notice} = require("./notice");
const { user } = require("../utils/db");

function errorHandler(err, req, res, next){
    if(err.name === "TokenExpiredError")
        return res.status(403).redirect(`/login?return_to=${req.originalUrl}`);
    
    if(err.name === "JsonWebTokenError")
        return res.status(405).redirect(`/login?return_to=${req.originalUrl}`);

    return res.send("An error occured");
}

async function authMiddleware(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(405).send("No authorization header provided");
    
    const access = authHeader.split("Bearer ")[1];
    if(!access) return res.status(405).send("No token provided");
    verify(access, process.env.ACCTOKEN_SECRET, (err, dec) => {
        if(err) return errorHandler(err, req, res, next);
        req.person = new Person(dec.username);
        req.person.get()
            .then(person => {
                next();
            })
            .catch(err => {
                res.status(404).send("User provided do not exists");
            });
        // const user = new User(dec.username);
        // user.get(err => {
        //     if(err){
        //         if(err.name === "UserNotFound") return res.status(404).send("User provided do not exists!");
        //     }
        //     req.user = user;
        //     next();
        // });
    });
}

function cookieMiddleware(req, res, next){
    req.headers.authorization = "Bearer " + req.cookies.access;
    authMiddleware(req, res, next);
}

function noticeOwnerCookie(req, res, next){
    req.headers.authorization = "Bearer " + req.cookies.access;
    noticeOwner(req, res, next);
}

function noticeOwner(req, res, next){
    const notice = new Notice(req.params.path);
    authMiddleware(req, res, async () => {
        if(!req.user.noticeOwner(await notice.get())) 
            return res.status(403).send("You are not the owner of " + req.params.path);
        req.notice = notice;
        next();
    });
}

module.exports = {authMiddleware, noticeOwner, cookieMiddleware, noticeOwnerCookie};
