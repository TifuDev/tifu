const {verify} = require('jsonwebtoken'), 
    {user} = require('../utils/db'), 
    {hashString} = require('../utils/hash'), 
    {signTokens} = require('../utils/signTokens'),
    {User} = require('./user');
require('dotenv').config();

async function loginToRefresh(username, passwd) {
    return await user.findOne({
        username: username,
        passwd: hashString(passwd)
    }, 'reftoken');
}

function authMiddleware(req, res, next) {
    if(!req.headers.authorization){
        return res.status(401).send("No token provided");
    }
    
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).send("No token provided");

    verify(token, process.env.ACCTOKEN_SECRET, (err, dec) => {
        if (err) return res.status(403).send('Failed to authenticate');
        req.username = dec.username;
        next();
    });
}

function webAuth(req, res, next) {
    const access = req.cookies.access,
        refresh = req.cookies.refresh;

    verify(access, process.env.ACCTOKEN_SECRET, (err, dec) => {
        if (err) {
            if (refresh) {
                refreshAccess(refresh, (err, data) => {
                    if (err) return res.status(403).send('Failed to authenticate');

                    res.cookie('access', data.token);
                    req.username = verify(refresh, process.env.REFTOKEN_SECRET).username;
                    next();
                });
            } else return res.status(401).send('No refresh provided');
        } else {
            req.username = dec.username;
            next();
        }
    });
}

async function noticeOwner(req, res, next){
    const access = req.cookies.access,
        refresh = req.cookies.refresh;

    verify(access, process.env.ACCTOKEN_SECRET, (err, dec) => {
        if (err) {
            if (refresh) {
                refreshAccess(refresh, (err, data) => {
                    if (err) return res.status(403).send('Failed to authenticate');

                    res.cookie('access', data.token);
                    req.username = verify(refresh, process.env.REFTOKEN_SECRET).username;
                });
            } else return res.status(401).send('No refresh provided');
        } else req.username = dec.username;
    });
    const account = new User(req.username);
    await account.getData();
    if(!account.noticeOwner(req.params.id)){
        return res.status(403).send('You are not the owner of notice');
    }
    next();
}

async function getTokens(username) {
    const query = await user.findOne({
        username: username
    }, 'reftoken');

    let status = 'UNOTF';
    let refresh;
    let token;

    if (query !== null) {
        status = 'SUCC';
        refresh = await signTokens({
            username: username
        }, 'refresh');
        token = await signTokens({
            username: username
        }, 'access');
    }
    return {
        status: status,
        token: token,
        refresh: refresh
    };
}

async function refreshAccess(refreshToken, callback) {
    const serverRefreshToken = await user.findOne({
        reftoken: refreshToken
    }, 'reftoken');

    let token,
        err;

    try {
        const dectoken = verify(serverRefreshToken.reftoken, process.env.REFTOKEN_SECRET);
        token = await signTokens({
            username: dectoken.username
        }, 'access');
    } catch (e) {
        err = e;
    }

    callback(err, {
        token: token
    });
}

async function newRefresh(username, passwd) {
    let status = 'FORB';

    let refreshToken;
    const serverRefreshToken = await loginToRefresh(username, passwd);

    if (serverRefreshToken !== null) {
        refreshToken = await signTokens({
            username: username
        }, 'refresh');

        await user.updateOne(
            filter = {
                username: username
            },
            update = {
                $set: {
                    reftoken: refreshToken
                }
            }
        );
        status = 'SUCC';
    }

    return {
        status: status,
        reftoken: refreshToken
    };
}

async function getRefresh(username, passwd) {
    let status = 'FORB',
        refreshToken;
    const serverRefreshToken = await loginToRefresh(username, passwd);

    if (serverRefreshToken !== null) {
        refreshToken = serverRefreshToken.reftoken;
        status = 'SUCC';
    }

    return {
        status: status,
        reftoken: refreshToken
    };
}

async function login(username, passwd, callback) {
    const matchedUser = await user.findOne({
        username: username,
        passwd: hashString(passwd)
    });

    let token,
        reftoken,
        err;

    try {
        const receivedTokens = await getTokens(matchedUser.username);
        token = receivedTokens.token;
        reftoken = receivedTokens.refresh;
    } catch (e) {
        err = e;
    }

    callback(err, {
        access: token,
        reftoken: reftoken
    });
}

async function generateToken(username) {
    const payload = {
        username: username
    };

    let token,
        reftoken,
        status = 'UNOTF';
    if (await user.findOne({
            username: username
        }) !== undefined) {
        token = await signTokens(payload, 'access');
        reftoken = await signTokens(payload, 'refresh');

        await user.updateOne({
            username: username
        }, {
            $set: {
                reftoken: reftoken
            }
        });

        status = 'SUCC';
    }

    return {
        status: status,
        token: token,
        reftoken: reftoken
    };
}

module.exports = {
    authMiddleware,
    login,
    getTokens,
    getRefresh,
    generateToken,
    newRefresh,
    refreshAccess,
    webAuth,
    noticeOwner
};