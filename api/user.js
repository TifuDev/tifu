const {user} = require("../utils/db"),
    {hashString} = require("../utils/hash"),
    {sign} = require("jsonwebtoken");
class UsernameAlreadyUsed extends Error {
    constructor(msg) {
        if(msg === null)
            msg = "Username already in use";
        super(msg);
        this.name = "UsernameAlreadyUsed";
    }
}

class PersonalDataAlreadyUsed extends Error {
    constructor(msg){
        if(msg === null)
            msg = "Username already in use";
        super(msg);
        this.name = "PersonalDataAlreadyUsed";
    }
}

class UsernameOrPasswordWrong extends Error{
    constructor(msg){
        if(msg === null)
            msg = "Username or password wrong";
        super(msg);
        this.name = "UserNotFound";
    }
}

class Person{
    constructor(username){
        this.username = username;
    }
    create(firstName, familyName, email, details, password){
        const hashedPwd = hashString(password),
            personObj = {
                firstName,
                familyName,
                username: this.username,
                email,
                details,
                password: hashedPwd
            };

        return new Promise((resolve, reject) => {
            user.findOne({
                $or: [
                    {username: this.username}, {firstName, familyName}, {email}
                ]
            }, (err, doc) => {
                if(err)
                    reject(err);
                if(doc === null)
                    reject(new PersonalDataAlreadyUsed());
            });
            user.create(personObj, (err) => {
                if(err)
                    reject(err);
                resolve(personObj);
            });
        });
    }
    get(){
        return new Promise((resolve, reject) => {
            user.findOne({username: this.username}, (err, doc) => {
                if(err)
                    reject(err);
                resolve(doc);
            });
        });
    }
    login(password){
        const username = this.username;
        let token;

        return new Promise((resolve, reject) => {
            user.findOne({
                username,
                password: hashString(password)
            }, (err, doc) => {
                if (err)
                    reject(err);
                else if (doc === null)
                    reject(new UsernameOrPasswordWrong());

                token = sign({username}, process.env.ACCTOKEN_SECRET, {
                    expiresIn: process.env.ACCTOKEN_LIFE    
                });
                
                resolve([token, doc]);
            });
        });
    }
    change(field, value){
        return new Promise((resolve, reject) => {
            user.updateOne({
                username: this.username
            }, {
                $set: {
                    [field]: value
                }
            }, (err, res) => {
                if(err)
                    reject(err);
                resolve(res);
            });
        });
    }
}

module.exports = {
    Person
};
