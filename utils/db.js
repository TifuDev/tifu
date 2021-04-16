require('dotenv').config();
const mongoose = require('mongoose');

const uri =
    `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/tifu`;
var news = mongoose.model('new', mongoose.Schema({
    title: String,
    desc: String,
    path: String,
    id: String,
    author: String,
    date: Date,
    downloads: Number
}, {
    versionKey: false
}));

var user = mongoose.model('user', mongoose.Schema({
    username: String,
    email: String,
    details: Object,
    posts: Array,
    reftoken: String,
    passwd: String
}, {
    versionKey: false
}));

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

module.exports = {
    mongoose,
    news,
    user
};