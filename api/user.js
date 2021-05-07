const {user} = require('../utils/db'),
    {hashString} = require('../utils/hash'),
    {sign} = require('jsonwebtoken');
require('dotenv').config()
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

class UserNotFound extends Error{
    constructor(msg){
        super(msg);
        this.name = "UserNotFound";
    }
}

class LoginFailed extends Error{
    constructor(msg){
        this.msg ='Login failed! Username or Password incorrect!';
        if(msg !== null) this.msg = msg;
        
        this.name = "LoginFailed";
    }
}
class User{
    constructor(username){
        this.username = username;
        this.login = async (password, callback) => {
            let token,
                err;
            const userMatched = await user.findOne({
                username: this.username,
                passwd: hashString(password)
            });
            try {
                if(userMatched == null) throw new LoginFailed();
                token = sign({
                        username: this.username
                    }, process.env.ACCTOKEN_SECRET, 
                    {
                        expiresIn: process.env.ACCTOKEN_LIFE
                    });
            } catch (e) {err = e;}

            callback(err, token);
        };
    }
    async get(callback){
        let err;
        const req = await user.findOne({username: this.username});
        const data = {};
        try {
            if(req === null) throw new UserNotFound(`The user ${this.username} can not be found!`);
            
            this.email = req.email;
            this.posts = req.posts;
            this.details = req.details;

            data.email = req.email;
            data.posts = req.posts;
            data.details = req.details;
            // data.refresh = req.reftoken;

        } catch (e) {
            err = e;
        }

        if(callback === undefined) return data;
        callback(err, data);
    }
    async create(email, password, callback, details = {bio: '', profile_pic: ''}){
        const users = await user.findOne({
            $or: [{
                    username: this.username
                },
                {
                    email: email
                }
            ]
        });

        let err;

        try {
            if (users !== null) {
                if (users.username === username) {
                    throw new UsernameAlreadyUsed('Username already used by another account');
                }
                throw new EmailAlreadyUsed('Email already used by another account');
            }
    
            user.create({
                username: this.username,
                email: email,
                passwd: hashString(password),
                details: details,
                noticeCollection: []
            });
    
        } catch (e) {
            err = e;
        }
        
        this.email = email;
        this.details = details;
        this.posts = [];
        callback(err);
    }

    async changeDetails(details, callback){
        let err;
        try {
            user.updateOne({username: username}, {
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
            user.updateOne({username: username}, {
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
            user.updateOne({username: username}, {
                $set: {email: email}
            });
            this.email = email;
        } catch (e) {
            err = e;
        }

        callback(err);
    }
    noticeOwner(path){
        return (this.posts.indexOf(path) === -1) ? false : true;
    }
}

module.exports = {
    User, UserNotFound, UsernameAlreadyUsed, EmailAlreadyUsed
};