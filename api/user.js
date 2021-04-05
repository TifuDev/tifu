const db = require('../utils/db'),
    {
        hashString
    } = require('../utils/hash'),
    {
        generateToken
    } = require('./security');

class UsernameAlreadyUsed extends Error {
    constructor(msg) {
        super(msg);
        this.name = 'UsernameAlreadyUsed';
    }
}

class EmailAlreadyUsed extends Error {
    constructor(msg) {
        super(msg);
        this.name = "EmailAlreadyUsed";
    }
}

class UserNotFound{
    constructor(msg){
        super(msg);
        this.name = "UserNotFound";
    }
}
class User{
    constructor(username){
        super(username);
    }
    async getData(callback){
        let err;
        const req = await db.user.findOne({username: this.username});
        try {
            if(req === null) throw new UserNotFound(`The user ${this.username} can not be found!`);
            
            this.email = req.email;
            this.posts = req.posts;
            this.details = req.details;
        } catch (e) {
            err = e;
        }
        
        callback(err);
    }
    async create(email, password, callback, details = {bio: '', profile_pic: ''}){
        const users = await db.user.findOne({
            $or: [{
                    username: username
                },
                {
                    email: email
                }
            ]
        });

        let err,
            access,
            refresh;

        try {
            if (users !== null) {
                if (users.username === username) {
                    throw new UsernameAlreadyUsed('Username already used by another account');
                }
                throw new EmailAlreadyUsed('Email already used by another account');
            }
    
            db.user.create({
                username: username,
                email: email,
                passwd: hashString(password),
                details: details,
                posts: []
            });
    
            await generateToken(username).then(data => {
                access = data.token;
                refresh = data.reftoken;
            });
        } catch (e) {
            err = e;
        }
        
        this.email = email;
        this.details = details;
        this.posts = posts;
        callback(err, {
            token: access,
            reftoken: refresh
        });
    }
    async changeDetails(details, callback){
        let err;
        try {
            db.user.updateOne({username: username}, {
                $set: {details: details}
            });
            this.details = details;
        } catch (e) {
            err = e;
        }

        callback(err);
    }
    async changePass(password, callback){
        let err;
        try {
            db.user.updateOne({username: username}, {
                $set: {passwd: hashString(password)}
            });
        } catch (e) {
            err = e;
        }

        callback(err);
    }
    async changeEmail(email, callback){
        let err;
        try {
            db.user.updateOne({username: username}, {
                $set: {email: email}
            });
            this.email = email;
        } catch (e) {
            err = e;
        }

        callback(err);
    }
    noticeOwner(id){
        return (this.posts.indexOf(id) === -1) ? false : true;
    }
}

async function createUser(username, email, passwd, callback) {
    const users = await db.user.findOne({
        $or: [{
                username: username
            },
            {
                email: email
            }
        ]
    });

    let token,
        reftoken,
        err;

    try {
        if (users !== null) {
            if (users.username === username) {
                throw new UsernameAlreadyUsed('Username already used by another account');
            }
            throw new EmailAlreadyUsed('Email already used by another account');
        }

        db.user.create({
            username: username,
            email: email,
            passwd: hashString(passwd),
            details: {
                bio: ""
            },
            posts: []
        });

        await generateToken(username).then(data => {
            token = data.token;
            reftoken = data.reftoken;
        });
    } catch (e) {
        err = e;
    }

    callback(err, {
        token: token,
        reftoken: reftoken
    });
}

module.exports = {
    createUser
};